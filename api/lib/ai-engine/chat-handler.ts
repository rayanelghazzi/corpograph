import { openai } from "./openai";
import { CanonicalRecord, PatchOperation } from "@/lib/types";
import { getCurrentPhase } from "@/lib/case-orchestrator/state-machine";
import { CaseStatus } from "@/lib/types";

const APPLY_PATCHES_TOOL = {
  type: "function" as const,
  function: {
    name: "apply_patches",
    description:
      "Apply structured changes to the onboarding case data based on the analyst's instructions. Only call this when the user is asking to modify, add, or remove data.",
    parameters: {
      type: "object",
      properties: {
        patches: {
          type: "array",
          items: {
            type: "object",
            properties: {
              op: { type: "string", enum: ["add", "update", "remove"] },
              path: { type: "string" },
              value: {},
              index: { type: "number" },
            },
            required: ["op", "path"],
          },
        },
        resolve_issue_ids: {
          type: "array",
          items: { type: "string" },
          description: "IDs of issues that this change resolves",
        },
      },
      required: ["patches"],
    },
  },
};

function buildSystemPrompt(
  status: CaseStatus,
  canonicalRecord: CanonicalRecord
): string {
  const currentPhase = getCurrentPhase(status);
  return `You are an AI compliance assistant for corporate onboarding at Wealthsimple.

Current case status: ${status}
Current phase: ${currentPhase}

You help the analyst review and correct the onboarding data. You can:
1. Answer questions about the case data
2. Apply patches to correct or add information using the apply_patches tool
3. Explain discrepancies or issues

When the analyst asks you to modify data, use the apply_patches tool with appropriate patch operations:
- "add": Add a new item to an array field (path = array field name, value = new item)
- "update": Update a scalar field (path = dot-notation path, value = new value)
- "remove": Remove an item from an array (path = array field name, index = array index)

Available canonical record fields:
${JSON.stringify(Object.keys(canonicalRecord), null, 2)}

Only modify fields relevant to the current and prior phases. Do not modify future phase data.
Be concise and professional in your responses.`;
}

export interface ChatStreamCallbacks {
  onMessageStart: (messageId: string) => void;
  onTextDelta: (delta: string) => void;
  onToolCall: (patches: PatchOperation[], resolveIssueIds: string[]) => void;
  onPatchesApplied: (result: {
    patches_count: number;
    resolved_issue_ids: string[];
    new_issue_ids: string[];
    regenerated_artifacts: string[];
  }) => void;
  onMessageEnd: (messageId: string) => void;
  onError: (code: string, message: string) => void;
}

export async function handleChatMessage(
  status: CaseStatus,
  canonicalRecord: CanonicalRecord,
  issues: Array<{ id: string; type: string; severity: string; title: string; description: string; resolved: boolean }>,
  chatHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  callbacks: ChatStreamCallbacks
): Promise<{ fullText: string; patches?: PatchOperation[]; resolveIssueIds?: string[] }> {
  const systemPrompt = buildSystemPrompt(status, canonicalRecord);

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content: `Current canonical record:\n${JSON.stringify(canonicalRecord, null, 2)}`,
    },
    {
      role: "system",
      content: `Unresolved issues:\n${JSON.stringify(issues.filter((i) => !i.resolved), null, 2)}`,
    },
  ];

  const recentHistory = chatHistory.slice(-20);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    });
  }

  messages.push({ role: "user", content: userMessage });

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools: [APPLY_PATCHES_TOOL],
    stream: true,
    temperature: 0.3,
  });

  let fullText = "";
  const toolCalls = new Map<number, { id: string; args: string }>();

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (!delta) continue;

    if (delta.content) {
      fullText += delta.content;
      callbacks.onTextDelta(delta.content);
    }

    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        const idx = tc.index ?? 0;
        if (!toolCalls.has(idx)) {
          toolCalls.set(idx, { id: "", args: "" });
        }
        const entry = toolCalls.get(idx)!;
        if (tc.id) entry.id = tc.id;
        if (tc.function?.arguments) entry.args += tc.function.arguments;
      }
    }
  }

  if (toolCalls.size > 0) {
    const allPatches: PatchOperation[] = [];
    const allResolveIds: string[] = [];

    for (const [, entry] of toolCalls) {
      try {
        const parsed = JSON.parse(entry.args);
        if (parsed.patches) allPatches.push(...parsed.patches);
        if (parsed.resolve_issue_ids) allResolveIds.push(...parsed.resolve_issue_ids);
      } catch {
        console.error("Failed to parse tool call arguments:", entry.args);
      }
    }

    if (allPatches.length > 0 || allResolveIds.length > 0) {
      callbacks.onToolCall(allPatches, allResolveIds);
      return { fullText, patches: allPatches, resolveIssueIds: allResolveIds };
    }
  }

  return { fullText };
}

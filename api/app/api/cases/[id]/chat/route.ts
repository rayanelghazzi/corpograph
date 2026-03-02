import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/errors";
import { CanonicalRecord, CaseStatus } from "@/lib/types";
import { getCurrentPhase } from "@/lib/case-orchestrator/state-machine";
import { handleChatMessage } from "@/lib/ai-engine/chat-handler";
import { applyPatches } from "@/lib/patches/apply";
import { generateArtifacts } from "@/lib/artifacts/renderer";
import { PHASE_ARTIFACT_MAP } from "@/lib/artifacts/phase-map";
import { detectOwnershipGaps } from "@/lib/graph-engine/detect-gaps";
import { identifyBeneficialOwners } from "@/lib/graph-engine/identify-ubos";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    const messages = await prisma.chatMessage.findMany({
      where: { caseId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        created_at: m.createdAt.toISOString(),
        metadata: m.metadata,
      })),
    });
  } catch (err) {
    console.error("GET /api/cases/:id/chat error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to get chat history");
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    const status = caseData.status as CaseStatus;
    if (!status.startsWith("IN_REVIEW_")) {
      return errorResponse("INVALID_STATE", "Chat is only available during review phases");
    }

    const activeJob = await prisma.job.findFirst({
      where: { caseId: id, status: { in: ["queued", "running"] } },
    });
    if (activeJob) {
      return errorResponse("JOB_ACTIVE", "Cannot chat while a phase job is running");
    }

    const body = await request.json();
    const userContent = body.content as string;
    if (!userContent?.trim()) {
      return errorResponse("VALIDATION_ERROR", "Message content is required");
    }

    const userMessage = await prisma.chatMessage.create({
      data: { caseId: id, role: "user", content: userContent },
    });

    const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;
    const currentPhase = getCurrentPhase(status);

    const issues = await prisma.issue.findMany({
      where: { caseId: id },
      select: { id: true, type: true, severity: true, title: true, description: true, resolved: true },
    });

    const chatHistory = await prisma.chatMessage.findMany({
      where: { caseId: id },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { role: true, content: true },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: object) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        const assistantMessageId = `msg-${Date.now()}`;
        send("message_start", { message_id: assistantMessageId });

        try {
          const result = await handleChatMessage(
            status,
            canonicalRecord,
            issues,
            chatHistory,
            userContent,
            {
              onMessageStart: () => {},
              onTextDelta: (delta) => {
                send("text_delta", { delta });
              },
              onToolCall: (patches, resolveIssueIds) => {
                send("tool_call", {
                  tool: "apply_patches",
                  patches,
                  resolve_issue_ids: resolveIssueIds,
                });
              },
              onPatchesApplied: (patchResult) => {
                send("patches_applied", patchResult);
              },
              onMessageEnd: () => {},
              onError: (code, message) => {
                send("error", { code, message });
              },
            }
          );

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const metadata: any = {};

          if (result.patches && result.patches.length > 0) {
            const snapshotBefore = structuredClone(canonicalRecord);
            const patched = applyPatches(canonicalRecord, result.patches);

            if (currentPhase >= 2) {
              patched.ownership_gaps = detectOwnershipGaps(patched);
              patched.beneficial_owners = identifyBeneficialOwners(patched);
            }

            await prisma.case.update({
              where: { id },
              data: { canonicalRecord: patched as object },
            });

            if (result.resolveIssueIds && result.resolveIssueIds.length > 0) {
              await prisma.issue.updateMany({
                where: { id: { in: result.resolveIssueIds } },
                data: { resolved: true, resolvedAt: new Date() },
              });
            }

            const artifactCodes = PHASE_ARTIFACT_MAP[currentPhase] ?? [];
            const regenerated = await generateArtifacts(id, currentPhase, artifactCodes, patched);

            const assistantMsg = await prisma.chatMessage.create({
              data: {
                caseId: id,
                role: "assistant",
                content: result.fullText,
                metadata: {
                  patches_applied: result.patches.length,
                  artifacts_regenerated: regenerated,
                  issues_resolved: result.resolveIssueIds ?? [],
                },
              },
            });

            await prisma.patchLog.create({
              data: {
                caseId: id,
                chatMessageId: assistantMsg.id,
                patches: result.patches as object[],
                canonicalSnapshotBefore: snapshotBefore as object,
              },
            });

            metadata.patches_applied = result.patches.length;
            metadata.artifacts_regenerated = regenerated;
            metadata.issues_resolved = result.resolveIssueIds ?? [];

            send("patches_applied", {
              patches_count: result.patches.length,
              patched_paths: result.patches.map((p) => p.path),
              resolved_issue_ids: result.resolveIssueIds ?? [],
              new_issue_ids: [],
              regenerated_artifacts: regenerated,
            });
          } else {
            await prisma.chatMessage.create({
              data: {
                caseId: id,
                role: "assistant",
                content: result.fullText,
              },
            });
          }

          send("message_end", { message_id: assistantMessageId });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          send("error", { code: "LLM_ERROR", message });
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("POST /api/cases/:id/chat error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to process chat message");
  }
}

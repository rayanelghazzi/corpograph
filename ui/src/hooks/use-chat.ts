import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getChatHistory, streamChat } from "@/api/chat";
import { usePatchHighlight } from "@/hooks/use-patch-highlight";
import type { ChatMessage, SSEEvent } from "@/api/types";

export function useChat(caseId: string) {
  const queryClient = useQueryClient();
  const { addPaths } = usePatchHighlight();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: history } = useQuery({
    queryKey: ["case", caseId, "chat"],
    queryFn: () => getChatHistory(caseId),
    enabled: !!caseId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (history?.messages) {
      setLocalMessages(history.messages);
    }
  }, [history]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming) return;
      setError(null);

      const userMsg: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content,
        created_at: new Date().toISOString(),
        metadata: null,
      };
      setLocalMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      let assistantContent = "";
      const assistantMsg: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        metadata: null,
      };
      setLocalMessages((prev) => [...prev, assistantMsg]);

      try {
        for await (const event of streamChat(caseId, content)) {
          switch (event.type) {
            case "message_start":
              assistantMsg.id = event.message_id;
              break;
            case "text_delta":
              assistantContent += event.delta;
              setLocalMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: assistantContent,
                  };
                }
                return updated;
              });
              break;
            case "tool_call":
              assistantContent += "\n\n*Modifying case data...*";
              setLocalMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: assistantContent,
                  };
                }
                return updated;
              });
              break;
            case "patches_applied":
              handlePatchesApplied(event);
              break;
            case "message_end":
              break;
            case "error":
              setError(event.message);
              break;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setIsStreaming(false);
        queryClient.invalidateQueries({ queryKey: ["case", caseId, "chat"] });
      }
    },
    [caseId, isStreaming, queryClient]
  );

  function handlePatchesApplied(event: Extract<SSEEvent, { type: "patches_applied" }>) {
    queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    queryClient.invalidateQueries({ queryKey: ["case", caseId, "issues"] });
    queryClient.invalidateQueries({ queryKey: ["case", caseId, "artifacts"] });
    queryClient.invalidateQueries({ queryKey: ["case", caseId, "graph"] });

    if (event.patched_paths?.length) {
      addPaths(event.patched_paths);
    }

    const parts: string[] = [];
    if (event.patches_count) parts.push(`${event.patches_count} field(s) updated`);
    if (event.resolved_issue_ids?.length) parts.push(`${event.resolved_issue_ids.length} issue(s) resolved`);
    if (event.regenerated_artifacts?.length) parts.push(`${event.regenerated_artifacts.join(", ")} regenerated`);

    toast.success("Case data updated", {
      description: parts.join(" · ") || "Patches applied successfully",
    });
  }

  return {
    messages: localMessages,
    isStreaming,
    error,
    sendMessage,
  };
}

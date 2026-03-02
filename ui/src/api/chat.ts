import { apiFetch, ApiRequestError } from "./client";
import type { ChatMessage, SSEEvent } from "./types";

export function getChatHistory(caseId: string) {
  return apiFetch<{ messages: ChatMessage[] }>(`/cases/${caseId}/chat`);
}

export async function* streamChat(
  caseId: string,
  content: string
): AsyncGenerator<SSEEvent> {
  const res = await fetch(`/api/cases/${caseId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = body.error ?? {};
    throw new ApiRequestError(
      res.status,
      err.code ?? "UNKNOWN",
      err.message ?? res.statusText,
      err.details
    );
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split("\n\n");
    buffer = frames.pop()!;

    for (const frame of frames) {
      if (!frame.trim()) continue;
      const eventLine = frame.match(/^event:\s*(.+)$/m);
      const dataLine = frame.match(/^data:\s*(.+)$/m);
      if (!eventLine || !dataLine) continue;

      const eventType = eventLine[1].trim();
      try {
        const data = JSON.parse(dataLine[1].trim());
        yield { type: eventType, ...data } as SSEEvent;
      } catch {
        // skip malformed frames
      }
    }
  }
}

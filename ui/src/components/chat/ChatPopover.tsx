import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/api/types";

interface ChatPopoverProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  isJobActive: boolean;
  error: string | null;
  onSend: (content: string) => void;
}

export function ChatPopover({
  messages,
  isStreaming,
  isJobActive,
  error,
  onSend,
}: ChatPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim() || isStreaming || isJobActive) return;
    onSend(input.trim());
    setInput("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg hover:bg-foreground/90"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[480px] w-[400px] flex-col rounded-xl border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Analyst Assistant</h3>
          <p className="text-xs text-muted-foreground">Request updates or ask clarifications about the case</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
              msg.role === "user"
                ? "ml-auto bg-foreground text-background"
                : msg.role === "system"
                  ? "bg-muted text-muted-foreground"
                  : "bg-muted"
            )}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            {msg.role === "assistant" && msg.metadata?.patches_applied && (
              <p className="mt-1 text-xs opacity-70">
                Updated {msg.metadata.patches_applied} fields
                {msg.metadata.artifacts_regenerated?.length
                  ? `, regenerated ${msg.metadata.artifacts_regenerated.join(", ")}`
                  : ""}
              </p>
            )}
          </div>
        ))}
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}
      </div>

      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input
            placeholder={isJobActive ? "Chat unavailable while phase is processing..." : "Ask the AI assistant..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={isStreaming || isJobActive}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming || isJobActive}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime } from "@/lib/format";
import { useArtifact } from "@/hooks/use-artifacts";

interface ArtifactModalProps {
  caseId: string;
  code: string;
  onClose: () => void;
}

const MIN_LOADING_MS = 500;

export function ArtifactModal({ caseId, code, onClose }: ArtifactModalProps) {
  const { data: artifact, isLoading, error } = useArtifact(caseId, code);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), MIN_LOADING_MS);
    return () => clearTimeout(timer);
  }, []);

  const effectiveLoading = isLoading || showLoading;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl sm:max-w-3xl min-h-[50vh] max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          {artifact && !effectiveLoading ? (
            <>
              <DialogTitle>{artifact.code} — {artifact.name}</DialogTitle>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="secondary">Phase {artifact.phase}</Badge>
                <span className="text-xs text-muted-foreground">
                  Generated: {formatDateTime(artifact.generated_at)}
                </span>
              </div>
              {artifact.source_documents.length > 0 && (
                <div className="flex gap-1 pt-1 flex-wrap">
                  {artifact.source_documents.map((doc) => (
                    <Badge key={doc} variant="outline" className="text-xs">{doc}</Badge>
                  ))}
                </div>
              )}
            </>
          ) : (
            <DialogTitle>{code}</DialogTitle>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 overflow-auto">
          <div className="pr-4">
            {effectiveLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!effectiveLoading && error && (
              <p className="text-sm text-red-600 py-4">This artifact has not been generated yet.</p>
            )}
            {!effectiveLoading && artifact?.markdown && (
              <article className="prose prose-sm prose-stone max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/80 prose-td:text-sm prose-th:text-sm prose-th:font-medium prose-table:border-collapse prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-1.5 prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-1.5 prose-th:bg-muted prose-li:text-foreground/80 prose-strong:text-foreground prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {artifact.markdown}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

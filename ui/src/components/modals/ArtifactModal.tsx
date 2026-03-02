import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

export function ArtifactModal({ caseId, code, onClose }: ArtifactModalProps) {
  const { data: artifact, isLoading, error } = useArtifact(caseId, code);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          {artifact ? (
            <>
              <DialogTitle>{artifact.code} — {artifact.name}</DialogTitle>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="secondary">Phase {artifact.phase}</Badge>
                <span className="text-xs text-muted-foreground">
                  Generated: {formatDateTime(artifact.generated_at)}
                </span>
              </div>
              {artifact.source_documents.length > 0 && (
                <div className="flex gap-1 pt-1">
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

        <ScrollArea className="flex-1 min-h-0">
          <div className="pr-4">
            {isLoading && <p className="text-sm text-muted-foreground py-4">Loading artifact...</p>}
            {error && <p className="text-sm text-red-600 py-4">This artifact has not been generated yet.</p>}
            {artifact?.markdown && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {artifact.markdown}
                </ReactMarkdown>
              </div>
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

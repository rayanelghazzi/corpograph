import { useState } from "react";
import { ChevronDown, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ArtifactListItem, IssueSummary } from "@/api/types";

interface ArtifactsPanelProps {
  artifacts: ArtifactListItem[];
  currentPhase: number;
  issueSummary: IssueSummary;
  onViewArtifact: (code: string) => void;
}

export function ArtifactsPanel({
  artifacts,
  currentPhase,
  issueSummary,
  onViewArtifact,
}: ArtifactsPanelProps) {
  const [open, setOpen] = useState(true);

  function getIcon(artifact: ArtifactListItem) {
    if (artifact.phase === currentPhase) {
      if (issueSummary.blocking > 0) {
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      }
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
        <div className="text-left">
          <h3 className="text-[20px] font-bold leading-tight">Artifacts</h3>
          <p className="text-xs text-muted-foreground">View and manage case artifacts</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-3">
        {artifacts.map((artifact) => (
          <button
            key={artifact.code}
            type="button"
            onClick={() => onViewArtifact(artifact.code)}
            className={cn(
              "w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/60",
              artifact.phase === currentPhase && "bg-amber-50/60 hover:bg-amber-50"
            )}
          >
            <div className="flex items-start gap-2">
              {getIcon(artifact)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{artifact.code}</p>
                <p className="text-xs text-muted-foreground truncate">{artifact.name}</p>
              </div>
            </div>
          </button>
        ))}
        {artifacts.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">No artifacts generated yet.</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

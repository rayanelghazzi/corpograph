import { ArrowLeft, GitFork } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CaseHeaderProps {
  corporationName: string | null;
  caseId: string;
  currentPhase: number;
  onViewGraph: () => void;
}

export function CaseHeader({
  corporationName,
  caseId,
  currentPhase,
  onViewGraph,
}: CaseHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-medium">
            {corporationName ?? "Unnamed Case"}
          </h1>
          <p className="text-sm text-muted-foreground">Case ID: {caseId}</p>
        </div>
      </div>
      {currentPhase >= 2 && (
        <Button variant="outline" onClick={onViewGraph}>
          <GitFork className="mr-2 h-4 w-4" />
          View Graph
        </Button>
      )}
    </div>
  );
}

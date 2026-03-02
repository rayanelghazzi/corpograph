import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import type { CaseDetail } from "@/api/types";

export function TerminalStateView({ caseData }: { caseData: CaseDetail }) {
  const cr = caseData.canonical_record;
  const status = caseData.status;

  const lastPhaseWithDecision = Object.entries(cr.phase_decisions ?? {})
    .sort(([a], [b]) => Number(b) - Number(a))[0];
  const rationale = lastPhaseWithDecision?.[1]?.rationale;
  const decidedAt = lastPhaseWithDecision?.[1]?.decided_at;

  const configs = {
    APPROVED: {
      icon: CheckCircle2,
      bg: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      title: "Case Approved",
    },
    REJECTED: {
      icon: XCircle,
      bg: "bg-red-50 border-red-200",
      iconColor: "text-red-600",
      title: "Case Rejected",
    },
    ESCALATED: {
      icon: AlertTriangle,
      bg: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-600",
      title: "Case Escalated",
    },
  } as const;

  const config = configs[status as keyof typeof configs];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <div className={cn("flex items-center gap-4 rounded-lg border p-6", config.bg)}>
        <Icon className={cn("h-8 w-8", config.iconColor)} />
        <div>
          <h2 className="text-lg font-semibold">{config.title}</h2>
          {decidedAt && (
            <p className="text-sm text-muted-foreground">{formatDateTime(decidedAt)}</p>
          )}
        </div>
      </div>

      {rationale && (
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium mb-1">Rationale</p>
          <p className="text-sm text-muted-foreground">{rationale}</p>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium mb-3">Case Summary</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Corporation</p>
            <p>{caseData.corporation_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phase at Decision</p>
            <p>Phase {caseData.current_phase}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Artifacts</p>
            <p>{caseData.artifact_codes.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Issues Resolved</p>
            <p>{caseData.issue_summary.resolved} / {caseData.issue_summary.total}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

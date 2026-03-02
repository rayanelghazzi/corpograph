import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ContentCard } from "./ContentCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useIssues } from "@/hooks/use-issues";
import { formatPercent } from "@/lib/format";
import type { CaseDetail } from "@/api/types";

export function Phase2Content({ caseData }: { caseData: CaseDetail }) {
  const cr = caseData.canonical_record;
  const { data: issuesData } = useIssues(caseData.id, { phase: 2 });
  const gaps = cr.ownership_gaps ?? [];
  const hasBlockingIssues = caseData.issue_summary.blocking > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Phase 2: Ownership and Beneficial Ownership Graph</h2>
        <p className="text-sm text-muted-foreground">
          Review ownership structure and identify beneficial owners
        </p>
      </div>

      {/* Ownership Gaps */}
      <ContentCard
        title="Ownership Gap & Discrepancy Report"
        subtitle="ART-8"
        variant={gaps.length > 0 ? "error" : "default"}
        assistiveText={
          gaps.length > 0
            ? "Use the AI chat to help resolve ownership gaps. Ask questions about the entity structure or request assistance in tracing ownership chains."
            : undefined
        }
      >
        {gaps.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            No ownership gaps identified.
          </div>
        )}
        {gaps.map((gap) => {
          const issue = issuesData?.issues.find(
            (i) => i.type === "graph_gap" && i.field_path?.includes(gap.entity_id)
          );
          return (
            <div key={gap.entity_id} className="space-y-2 rounded-lg border border-red-200 bg-red-50/50 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="font-semibold text-sm">{gap.entity_name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{gap.details}</p>
              {issue && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                  {issue.severity}
                </Badge>
              )}
              <div className="rounded-md bg-muted p-3 text-sm">
                <span className="font-medium">Recommendation: </span>
                {issue?.description ?? `Request shareholder register for ${gap.entity_name}`}
              </div>
            </div>
          );
        })}
      </ContentCard>

      {/* Ownership Graph preview */}
      <ContentCard title="Ownership Graph" subtitle="ART-6">
        {hasBlockingIssues ? (
          <EmptyState message="Please resolve ownership gaps before viewing the complete graph" />
        ) : (
          <div className="rounded-lg bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Use the "View Graph" button in the header to see the full ownership visualization.
          </div>
        )}
      </ContentCard>

      {/* Beneficial Owners */}
      <ContentCard title="Beneficial Ownership Summary" subtitle="ART-7">
        {hasBlockingIssues ? (
          <EmptyState message="Please resolve ownership gaps to identify all beneficial owners" />
        ) : (cr.beneficial_owners?.length ?? 0) > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Effective Ownership</TableHead>
                  <TableHead>Control Reasons</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cr.beneficial_owners!.map((bo) => (
                  <TableRow key={bo.entity_id}>
                    <TableCell className="font-medium">{bo.name}</TableCell>
                    <TableCell>{formatPercent(bo.effective_ownership_pct)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {bo.control_reasons.map((r) => (
                          <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {cr.ownership_narrative && (
              <p className="mt-4 text-sm text-muted-foreground">{cr.ownership_narrative}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No beneficial owners identified yet.</p>
        )}
      </ContentCard>
    </div>
  );
}

import { useMemo } from "react";
import { AlertCircle, CheckCircle2, Maximize2 } from "lucide-react";
import { ReactFlow, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ContentCard } from "./ContentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useIssues } from "@/hooks/use-issues";
import { useFlashClass } from "@/hooks/use-patch-highlight";
import { formatPercent } from "@/lib/format";
import { computeLayout } from "@/lib/graph-layout";
import { graphNodeTypes } from "@/components/modals/GraphModal";
import type { CaseDetail, GraphResponse } from "@/api/types";

interface Phase2ContentProps {
  caseData: CaseDetail;
  graphData?: GraphResponse | null;
  onOpenGraph?: () => void;
}

export function Phase2Content({ caseData, graphData, onOpenGraph }: Phase2ContentProps) {
  const cr = caseData.canonical_record;
  const { data: issuesData } = useIssues(caseData.id, { phase: 2 });
  const gaps = cr.ownership_gaps ?? [];

  const layout = useMemo(
    () => (graphData ? computeLayout(graphData) : null),
    [graphData]
  );

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
        variant={gaps.length > 0 ? "error" : "success"}
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

      {/* Ownership Graph inline preview */}
      <ContentCard
        title="Ownership Graph"
        subtitle="ART-6"
        action={
          onOpenGraph && graphData ? (
            <Button variant="outline" size="sm" onClick={onOpenGraph}>
              <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
              Expand
            </Button>
          ) : undefined
        }
      >
        {layout ? (
          <div className="h-[350px] rounded-lg border bg-muted/30">
            <ReactFlow
              nodes={layout.nodes}
              edges={layout.edges}
              nodeTypes={graphNodeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              fitView
              fitViewOptions={{ padding: 0.3 }}
            >
              <Background />
            </ReactFlow>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Graph data not available yet.
          </p>
        )}
      </ContentCard>

      {/* Beneficial Owners */}
      <ContentCard title="Beneficial Ownership Summary" subtitle="ART-7">
        {(cr.beneficial_owners?.length ?? 0) > 0 ? (
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
                {cr.beneficial_owners!.map((bo, i) => (
                  <FlashRow key={bo.entity_id} path={`beneficial_owners[${i}]`}>
                    <TableCell className="font-medium">{bo.name}</TableCell>
                    <TableCell>{formatPercent(bo.effective_ownership_pct)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {bo.control_reasons.map((r) => (
                          <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                        ))}
                      </div>
                    </TableCell>
                  </FlashRow>
                ))}
              </TableBody>
            </Table>
            {cr.ownership_narrative && (
              <FlashBlock path="ownership_narrative">
                <p className="mt-4 text-sm text-muted-foreground">{cr.ownership_narrative}</p>
              </FlashBlock>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No beneficial owners identified yet.</p>
        )}
      </ContentCard>
    </div>
  );
}

function FlashRow({ path, children }: { path: string; children: React.ReactNode }) {
  const flash = useFlashClass(path);
  return <TableRow className={flash}>{children}</TableRow>;
}

function FlashBlock({ path, children }: { path: string; children: React.ReactNode }) {
  const flash = useFlashClass(path);
  return <div className={flash}>{children}</div>;
}

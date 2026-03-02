import { AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { ContentCard } from "./ContentCard";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useArtifact } from "@/hooks/use-artifacts";
import type { CaseDetail } from "@/api/types";

interface ScreeningAlert {
  entity_name: string;
  matches?: Array<{ list: string; score: number; details: string }>;
}

export function Phase4Content({ caseData }: { caseData: CaseDetail }) {
  const { data: art11 } = useArtifact(caseData.id, "ART-11");
  const { data: art15 } = useArtifact(caseData.id, "ART-15");
  const { data: art16 } = useArtifact(caseData.id, "ART-16");

  const alerts = (art11?.data?.alerts as ScreeningAlert[] | undefined) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Phase 4: Sanctions Screening and Tax Consistency</h2>
        <p className="text-sm text-muted-foreground">
          Review screening results and tax compliance
        </p>
      </div>

      {/* Screening Alerts */}
      <ContentCard
        title="Screening Alerts"
        variant={alerts.length > 0 ? "error" : "default"}
        assistiveText={
          alerts.length > 0
            ? "Review each potential match and determine whether it is a true positive or false positive before proceeding."
            : undefined
        }
      >
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            All entities cleared — no screening alerts.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const match = alert.matches?.[0];
              return (
                <div key={alert.entity_name} className="space-y-2 rounded-lg border border-orange-200 bg-orange-50/50 p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold text-sm">{alert.entity_name}</span>
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                      Potential Match
                    </Badge>
                  </div>
                  {match && (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">List</p>
                        <p className="font-medium">{match.list}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="font-medium">{match.score}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Details</p>
                        <p>{match.details}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ContentCard>

      {/* Sanctions Screening Summary */}
      <ContentCard title="Sanctions Screening Log" subtitle="ART-11">
        {art11?.data ? (
          <>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Entities Screened</p>
                <p className="font-medium">{(art11.data.total_screened as number) ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Result</p>
                <Badge
                  variant="secondary"
                  className={
                    art11.data.result === "clear"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }
                >
                  {art11.data.result === "clear" ? "All Clear" : `${art11.data.total_flagged} Flagged`}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lists Used</p>
                <p>{Array.isArray(art11.data.lists_used) ? (art11.data.lists_used as string[]).join(", ") : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Screened At</p>
                <p>{(art11.data.screened_at as string) ?? "—"}</p>
              </div>
            </div>
            {Array.isArray(art11.data.subjects_screened) && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(art11.data.subjects_screened as string[]).map((name) => {
                    const isFlagged = alerts.some((a) => a.entity_name === name);
                    return (
                      <TableRow key={name}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>
                          {isFlagged ? (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Potential Match
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                              <Shield className="mr-1 h-3 w-3" />
                              Clear
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
      </ContentCard>

      {/* Tax Self-Certification */}
      <ContentCard title="Tax Self-Certification" subtitle="ART-15">
        {art15?.data ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Entity Classification</p>
              <p>{(art15.data.entity_classification as string) ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tax Residencies</p>
              <p>{Array.isArray(art15.data.tax_residencies) ? (art15.data.tax_residencies as string[]).join(", ") : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Entity TIN</p>
              <p>{Array.isArray(art15.data.entity_TINs) ? (art15.data.entity_TINs as string[]).join(", ") : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Signed At</p>
              <p>{(art15.data.signed_at as string) ?? "—"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
      </ContentCard>

      {/* Corporate KYC Profile */}
      <ContentCard title="Corporate KYC Profile" subtitle="ART-16">
        {art16?.data ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Nature of Business</p>
              <p>{(art16.data.nature_of_business as string) ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Risk Tolerance</p>
              <p>{(art16.data.risk_tolerance as string) ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Investment Objectives</p>
              <p>{(art16.data.investment_objectives as string) ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Financial Circumstances</p>
              <p>{(art16.data.financial_circumstances as string) ?? "—"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
      </ContentCard>
    </div>
  );
}

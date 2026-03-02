import { ContentCard } from "./ContentCard";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useArtifact } from "@/hooks/use-artifacts";
import type { CaseDetail } from "@/api/types";

function StubBanner() {
  return (
    <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-700 mb-3">
      This is simulated data for prototype purposes.
    </div>
  );
}

export function Phase4Content({ caseData }: { caseData: CaseDetail }) {
  const { data: art11 } = useArtifact(caseData.id, "ART-11");
  const { data: art15 } = useArtifact(caseData.id, "ART-15");
  const { data: art16 } = useArtifact(caseData.id, "ART-16");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Phase 4: Sanctions Screening and Tax Consistency</h2>
        <p className="text-sm text-muted-foreground">
          Review screening results and tax compliance
        </p>
      </div>

      {/* Sanctions Screening */}
      <ContentCard title="Sanctions Screening" subtitle="ART-11">
        <StubBanner />
        {art11?.data ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Subjects Screened</p>
              <p>{Array.isArray(art11.data.subjects_screened) ? (art11.data.subjects_screened as string[]).join(", ") : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lists Used</p>
              <p>{Array.isArray(art11.data.lists_used) ? (art11.data.lists_used as string[]).join(", ") : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Screened At</p>
              <p>{(art11.data.screened_at as string) ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Result</p>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {(art11.data.result as string) ?? "clear"}
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
      </ContentCard>

      {/* Tax Self-Certification */}
      <ContentCard title="Tax Self-Certification" subtitle="ART-15">
        <StubBanner />
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
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
      </ContentCard>

      {/* Corporate KYC Profile */}
      <ContentCard title="Corporate KYC Profile" subtitle="ART-16">
        <StubBanner />
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

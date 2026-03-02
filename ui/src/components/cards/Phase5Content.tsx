import { ContentCard } from "./ContentCard";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useArtifacts } from "@/hooks/use-artifacts";
import { formatDateTime } from "@/lib/format";
import type { CaseDetail } from "@/api/types";

export function Phase5Content({ caseData }: { caseData: CaseDetail }) {
  const cr = caseData.canonical_record;
  const { data: artifactsData } = useArtifacts(caseData.id);
  const artifacts = artifactsData?.artifacts ?? [];
  const phaseDecisions = cr.phase_decisions ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Phase 5: Finalization and Audit Package</h2>
        <p className="text-sm text-muted-foreground">
          Review final decision and export audit package
        </p>
      </div>

      {/* Case Summary */}
      <ContentCard title="Case Summary" subtitle="ART-23">
        <p className="font-semibold text-sm mb-3">Decision History</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phase</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead>Decided At</TableHead>
              <TableHead>Rationale</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4].map((p) => {
              const dec = phaseDecisions[p];
              const phaseInfo = caseData.phases[String(p)];
              return (
                <TableRow key={p}>
                  <TableCell>Phase {p}</TableCell>
                  <TableCell className="capitalize">{dec?.decision ?? phaseInfo?.decision ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    {dec?.decided_at ? formatDateTime(dec.decided_at) : phaseInfo?.decided_at ? formatDateTime(phaseInfo.decided_at) : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {dec?.rationale ?? "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Corporation</p>
            <p className="font-medium">{caseData.corporation_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Jurisdiction</p>
            <p>{cr.subject_corporation?.jurisdiction ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Risk Level</p>
            <Badge variant="secondary" className="capitalize">{cr.risk_assessment?.risk_level ?? "—"}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Beneficial Owners</p>
            <p>{cr.beneficial_owners?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Artifacts</p>
            <p>{caseData.artifact_codes.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Issues Resolved</p>
            <p>{caseData.issue_summary.resolved}</p>
          </div>
        </div>
      </ContentCard>

      {/* Audit Package Manifest */}
      <ContentCard title="Account Opening Package" subtitle="ART-23">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Generated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artifacts.map((art) => (
              <TableRow key={art.code}>
                <TableCell className="font-medium">{art.code}</TableCell>
                <TableCell className="text-sm">{art.name}</TableCell>
                <TableCell className="text-sm">Phase {art.phase}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(art.generated_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ContentCard>
    </div>
  );
}

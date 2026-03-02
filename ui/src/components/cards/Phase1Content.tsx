import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ContentCard } from "./ContentCard";
import { useIssues } from "@/hooks/use-issues";
import { useFlashClass } from "@/hooks/use-patch-highlight";
import { formatRole } from "@/lib/format";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { CaseDetail } from "@/api/types";

export function Phase1Content({ caseData }: { caseData: CaseDetail }) {
  const cr = caseData.canonical_record;
  const { data: issuesData } = useIssues(caseData.id, { phase: 1 });
  const discrepancies = cr.registry_crosscheck?.discrepancies ?? [];
  const hasUnresolved = discrepancies.some((d) => !d.resolved);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Phase 1: Entity Verification and Authority</h2>
        <p className="text-sm text-muted-foreground">
          Review corporate identity, registry records, and signing authority
        </p>
      </div>

      {/* Discrepancies Card */}
      <ContentCard
        title="Discrepancies in Cross-Check with Registry Records"
        subtitle="ART-5"
        variant={hasUnresolved ? "error" : "default"}
        assistiveText={
          hasUnresolved
            ? 'Use the AI chat to help resolve discrepancies. You can ask questions like "Are these the same address?" or request clarification on specific fields.'
            : undefined
        }
      >
        {cr.registry_crosscheck?.performed === false && (
          <p className="text-sm text-muted-foreground">Registry cross-check was not performed.</p>
        )}
        {discrepancies.length === 0 && cr.registry_crosscheck?.performed !== false && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            No discrepancies found.
          </div>
        )}
        {discrepancies.map((d) => (
          <div key={d.id} className="space-y-2 rounded-lg border border-red-200 bg-red-50/50 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="font-semibold text-sm">{d.field}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Board Resolution</p>
                <p className="font-medium">{d.extracted_value}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registry Record</p>
                <p className="font-medium">{d.registry_value}</p>
              </div>
            </div>
          </div>
        ))}
      </ContentCard>

      {/* Corporation Identity */}
      <ContentCard title="Corporation Identity Data" subtitle="ART-2">
        {cr.subject_corporation ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {[
              ["Legal Name", cr.subject_corporation.legal_name, "subject_corporation.legal_name"],
              ["Jurisdiction", cr.subject_corporation.jurisdiction, "subject_corporation.jurisdiction"],
              ["Registration Number", cr.subject_corporation.registration_number, "subject_corporation.registration_number"],
              ["Incorporation Date", cr.subject_corporation.incorporation_date, "subject_corporation.incorporation_date"],
              ["Registered Address", cr.subject_corporation.registered_address, "subject_corporation.registered_address"],
              ...(cr.subject_corporation.business_number ? [["Business Number", cr.subject_corporation.business_number, "subject_corporation.business_number"]] : []),
              ...(cr.subject_corporation.corporate_status ? [["Corporate Status", cr.subject_corporation.corporate_status, "subject_corporation.corporate_status"]] : []),
            ].map(([label, value, path]) => (
              <FlashField key={label} label={label} value={value ?? "—"} path={path} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </ContentCard>

      {/* Directors */}
      <ContentCard title="Directors and Officers" subtitle="ART-3">
        {(cr.directors?.length ?? 0) > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Appointment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cr.directors!.map((d, i) => (
                <FlashRow key={d.id} path={`directors[${i}]`}>
                  <TableCell className="font-medium">{d.full_name}</TableCell>
                  <TableCell>{formatRole(d.role)}</TableCell>
                  <TableCell className="text-sm">{d.address ?? "—"}</TableCell>
                  <TableCell className="text-sm">{d.appointment_date ?? "—"}</TableCell>
                </FlashRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </ContentCard>

      {/* Signing Authority */}
      <ContentCard title="Signing Authority" subtitle="ART-4">
        {cr.authority_to_bind && (
          <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground mb-3">
            Board resolution and corporate authority documents have been verified.
            Authorized signers have been identified and documented.
          </div>
        )}
        {(cr.authorized_signatories?.length ?? 0) > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Authority Limits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cr.authorized_signatories!.map((s, i) => (
                <FlashRow key={s.id} path={`authorized_signatories[${i}]`}>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell className="text-sm">{s.residential_address}</TableCell>
                  <TableCell className="text-sm">{s.occupation ?? "—"}</TableCell>
                  <TableCell className="text-sm">{s.authority_limits}</TableCell>
                </FlashRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No signing authority data available</p>
        )}
      </ContentCard>
    </div>
  );
}

function FlashField({ label, value, path }: { label: string; value: string; path: string }) {
  const flash = useFlashClass(path);
  return (
    <div className={flash}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function FlashRow({ path, children }: { path: string; children: React.ReactNode }) {
  const flash = useFlashClass(path);
  return <TableRow className={flash}>{children}</TableRow>;
}

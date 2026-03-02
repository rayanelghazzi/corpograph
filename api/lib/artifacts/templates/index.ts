import { CanonicalRecord } from "@/lib/types";

export interface ArtifactOutput {
  data: Record<string, unknown>;
  markdown: string;
  source_documents: string[];
}

type RenderFn = (cr: CanonicalRecord) => ArtifactOutput;

function renderArt1(cr: CanonicalRecord): ArtifactOutput {
  const sc = cr.subject_corporation;
  const data = {
    legal_name: sc?.legal_name ?? "",
    jurisdiction: sc?.jurisdiction ?? "",
    registration_number: sc?.registration_number ?? "",
    registered_address: sc?.registered_address ?? "",
    incorporation_date: sc?.incorporation_date ?? "",
    verification_source: cr.registry_crosscheck?.source ?? "Document extraction",
    verified_at: new Date().toISOString(),
    document_hash: "sha256:auto-generated",
    business_number: sc?.business_number,
    corporate_status: sc?.corporate_status,
  };
  const markdown = `# ART-1 — Corporate Identity Snapshot

| Field | Value |
|---|---|
| Legal Name | ${data.legal_name} |
| Jurisdiction | ${data.jurisdiction} |
| Registration Number | ${data.registration_number} |
| Registered Address | ${data.registered_address} |
| Incorporation Date | ${data.incorporation_date} |
| Business Number | ${data.business_number ?? "N/A"} |
| Corporate Status | ${data.corporate_status ?? "N/A"} |
| Verification Source | ${data.verification_source} |
| Verified At | ${data.verified_at} |`;

  return { data, markdown, source_documents: [] };
}

function renderArt2(cr: CanonicalRecord): ArtifactOutput {
  const data = {
    legal_name: cr.subject_corporation?.legal_name ?? "",
    attestation_statement:
      "The information contained in the corporate registry filings is current and accurate as of the date of this attestation.",
    signatory_name: cr.authorized_signatories?.[0]?.full_name ?? "N/A",
    signed_at: new Date().toISOString(),
    signature: "[Electronic signature — prototype]",
  };
  const markdown = `# ART-2 — Registry Accuracy Attestation

| Field | Value |
|---|---|
| Legal Name | ${data.legal_name} |
| Attestation | ${data.attestation_statement} |
| Signatory | ${data.signatory_name} |
| Signed At | ${data.signed_at} |`;

  return { data, markdown, source_documents: [] };
}

function renderArt3(cr: CanonicalRecord): ArtifactOutput {
  const directors = cr.directors ?? [];
  const data = {
    directors: directors.map((d) => ({
      full_name: d.full_name,
      role: d.role,
      address: d.address,
      date_of_birth: d.date_of_birth,
      appointment_date: d.appointment_date,
    })),
    generated_at: new Date().toISOString(),
  };
  const rows = directors
    .map(
      (d) =>
        `| ${d.full_name} | ${d.role} | ${d.address ?? "N/A"} | ${d.appointment_date ?? "N/A"} |`
    )
    .join("\n");
  const markdown = `# ART-3 — Director / Officer List

| Name | Role | Address | Appointment Date |
|---|---|---|---|
${rows}

Generated at: ${data.generated_at}`;

  return { data, markdown, source_documents: [] };
}

function renderArt4(cr: CanonicalRecord): ArtifactOutput {
  const atb = cr.authority_to_bind;
  const signatories = cr.authorized_signatories ?? [];
  const authorizedPersons = signatories.filter((s) =>
    atb?.authorized_person_ids?.includes(s.id)
  );
  const data = {
    corporation_name: cr.subject_corporation?.legal_name ?? "",
    authorized_persons: authorizedPersons.map((p) => ({
      full_name: p.full_name,
      authority_limits: p.authority_limits,
    })),
    scope_of_authority: atb?.scope_of_authority ?? "N/A",
    resolution_date: atb?.resolution_date ?? "N/A",
    document_ref: atb?.document_ref ?? "N/A",
  };
  const personRows = authorizedPersons
    .map((p) => `| ${p.full_name} | ${p.authority_limits} |`)
    .join("\n");
  const markdown = `# ART-4 — Corporate Authority to Bind

**Corporation**: ${data.corporation_name}
**Resolution Date**: ${data.resolution_date}
**Scope**: ${data.scope_of_authority}

## Authorized Persons

| Name | Authority Limits |
|---|---|
${personRows}`;

  return { data, markdown, source_documents: [] };
}

function renderArt5(cr: CanonicalRecord): ArtifactOutput {
  const sigs = cr.authorized_signatories ?? [];
  const data = {
    signatories: sigs.map((s) => ({
      full_name: s.full_name,
      residential_address: s.residential_address,
      date_of_birth: s.date_of_birth,
      occupation: s.occupation,
      authority_limits: s.authority_limits,
      verification_method: s.verification_method ?? "document_verification",
      verified_at: new Date().toISOString(),
    })),
  };
  const rows = sigs
    .map(
      (s) =>
        `| ${s.full_name} | ${s.residential_address} | ${s.occupation ?? "N/A"} | ${s.authority_limits} |`
    )
    .join("\n");
  const markdown = `# ART-5 — Authorized Signatory Record

| Name | Address | Occupation | Authority |
|---|---|---|---|
${rows}`;

  return { data, markdown, source_documents: [] };
}

function renderArt6(cr: CanonicalRecord): ArtifactOutput {
  const sigs = cr.authorized_signatories ?? [];
  const data = {
    specimens: sigs.map((s) => ({
      signatory_name: s.full_name,
      signature_image: "[Stub — no real signatures in prototype]",
      captured_at: new Date().toISOString(),
    })),
  };
  const markdown = `# ART-6 — Signature Specimen

${sigs.map((s) => `- **${s.full_name}**: [Signature specimen not available in prototype]`).join("\n")}

*Note: Signature specimens are not captured in this prototype.*`;

  return { data, markdown, source_documents: [] };
}

function renderArt7(cr: CanonicalRecord): ArtifactOutput {
  const ai = cr.account_intent;
  const data = {
    account_purpose: ai?.account_purpose ?? "",
    expected_monthly_volume: ai?.expected_monthly_volume ?? 0,
    expected_transaction_types: ai?.expected_transaction_types ?? [],
    funding_sources: ai?.funding_sources ?? [],
    counterparty_geographies: ai?.counterparty_geographies ?? [],
  };
  const markdown = `# ART-7 — Account Intended Use Record

| Field | Value |
|---|---|
| Purpose | ${data.account_purpose} |
| Expected Monthly Volume | $${data.expected_monthly_volume?.toLocaleString()} |
| Transaction Types | ${data.expected_transaction_types.join(", ")} |
| Funding Sources | ${data.funding_sources.join(", ")} |
| Counterparty Geographies | ${data.counterparty_geographies.join(", ")} |`;

  return { data, markdown, source_documents: [] };
}

function renderArt8(cr: CanonicalRecord): ArtifactOutput {
  const bos = cr.beneficial_owners ?? [];
  const entities = cr.entities ?? [];
  const intermediates = entities.filter((e) => !e.is_subject && e.type !== "individual");
  const data = {
    directors: (cr.directors ?? []).map((d) => ({
      full_name: d.full_name,
      role: d.role,
    })),
    beneficial_owners: bos.map((bo) => ({
      name: bo.name,
      effective_ownership_pct: bo.effective_ownership_pct,
      control_reasons: bo.control_reasons,
    })),
    intermediate_entities: intermediates.map((e) => ({
      name: e.name,
      type: e.type,
      jurisdiction: e.jurisdiction,
    })),
    ownership_graph: {
      entities: entities.length,
      relationships: (cr.ownership_relationships ?? []).length,
    },
    ownership_narrative: cr.ownership_narrative ?? "",
    created_at: new Date().toISOString(),
  };

  const boRows = bos
    .map(
      (bo) =>
        `| ${bo.name} | ${bo.effective_ownership_pct}% | ${bo.control_reasons.join(", ")} |`
    )
    .join("\n");

  const gapSection =
    (cr.ownership_gaps ?? []).length > 0
      ? `\n## Ownership Gaps\n\n${cr.ownership_gaps!.map((g) => `- **${g.entity_name}**: ${g.details} (${g.gap_type})`).join("\n")}`
      : "";

  const markdown = `# ART-8 — Beneficial Ownership & Structure

## Ownership Narrative

${cr.ownership_narrative ?? "No narrative generated."}

## Beneficial Owners

| Name | Effective Ownership | Control Reasons |
|---|---|---|
${boRows || "| No beneficial owners identified | — | — |"}
${gapSection}

Generated at: ${data.created_at}`;

  return { data, markdown, source_documents: [] };
}

function renderArt9(cr: CanonicalRecord): ArtifactOutput {
  const measures = cr.confirmation_measures ?? [];
  const data = {
    confirmation_measures: measures.map((m) => m.measure),
    reviewer_name: "AI-Assisted Review",
    reviewed_at: new Date().toISOString(),
    outcome: "confirmed",
  };
  const rows = measures
    .map((m) => `| ${m.measure} | ${m.source} | ${m.result} |`)
    .join("\n");
  const markdown = `# ART-9 — Beneficial Ownership Confirmation Evidence

## Confirmation Measures

| Measure | Source | Result |
|---|---|---|
${rows || "| No measures recorded | — | — |"}

**Reviewer**: ${data.reviewer_name}
**Reviewed At**: ${data.reviewed_at}`;

  return { data, markdown, source_documents: [] };
}

function renderArt10(cr: CanonicalRecord): ArtifactOutput {
  const tpd = cr.third_party_determination;
  const data = {
    acting_on_behalf: tpd?.acting_on_behalf ?? false,
    determination_date: new Date().toISOString(),
    determination_rationale: tpd?.determination_rationale ?? "",
    third_party_details: tpd?.third_party_details,
    grounds_for_suspicion: tpd?.grounds_for_suspicion,
  };
  const markdown = `# ART-10 — Third Party Determination Record

| Field | Value |
|---|---|
| Acting on Behalf of Third Party | ${data.acting_on_behalf ? "Yes" : "No"} |
| Determination Date | ${data.determination_date} |
| Rationale | ${data.determination_rationale} |
${data.third_party_details ? `| Third Party Name | ${data.third_party_details.name} |\n| Relationship | ${data.third_party_details.relationship} |` : ""}
${data.grounds_for_suspicion ? `| Grounds for Suspicion | ${data.grounds_for_suspicion} |` : ""}`;

  return { data, markdown, source_documents: [] };
}

function renderArt12(cr: CanonicalRecord): ArtifactOutput {
  const ra = cr.risk_assessment;
  const data = {
    risk_score: ra?.risk_score ?? 0,
    risk_level: ra?.risk_level ?? "low",
    risk_factors: ra?.risk_factors ?? [],
    rationale: ra?.rationale ?? "",
    enhanced_measures_required: ra?.enhanced_measures_required ?? false,
    assessed_at: new Date().toISOString(),
  };
  const markdown = `# ART-12 — AML Risk Assessment

| Field | Value |
|---|---|
| Risk Score | ${data.risk_score}/100 |
| Risk Level | ${data.risk_level.toUpperCase()} |
| Enhanced Measures Required | ${data.enhanced_measures_required ? "Yes" : "No"} |

## Risk Factors

${data.risk_factors.map((f) => `- ${f}`).join("\n") || "- None identified"}

## Rationale

${data.rationale}

${ra?.ai_recommendation ? `## AI Recommendation\n\n${ra.ai_recommendation}` : ""}`;

  return { data, markdown, source_documents: [] };
}

function renderArt13(cr: CanonicalRecord): ArtifactOutput {
  const consent = cr.consent;
  const data = {
    notice_version: consent?.privacy_notice_version ?? "",
    consent_timestamp: consent?.consented_at ?? new Date().toISOString(),
    acknowledgement: consent?.acknowledged ?? false,
  };
  const markdown = `# ART-13 — Privacy Consent Record

| Field | Value |
|---|---|
| Notice Version | ${data.notice_version} |
| Consent Timestamp | ${data.consent_timestamp} |
| Acknowledged | ${data.acknowledgement ? "Yes" : "No"} |`;

  return { data, markdown, source_documents: [] };
}

function renderArt14(cr: CanonicalRecord): ArtifactOutput {
  const discrepancies = cr.registry_crosscheck?.discrepancies ?? [];
  const data = {
    discrepancies: discrepancies.map((d) => ({
      field: d.field,
      extracted_value: d.extracted_value,
      registry_value: d.registry_value,
      resolved: d.resolved,
    })),
    identified_at: new Date().toISOString(),
    reported_at: new Date().toISOString(),
    acknowledgement_ref: "[Auto-generated — prototype]",
  };
  const rows = discrepancies
    .map(
      (d) =>
        `| ${d.field} | ${d.extracted_value} | ${d.registry_value} | ${d.resolved ? "Resolved" : "Unresolved"} |`
    )
    .join("\n");
  const markdown = `# ART-14 — CBCA Discrepancy Report

## Discrepancies Found

| Field | Extracted | Registry | Status |
|---|---|---|---|
${rows || "| None | — | — | — |"}

**Identified At**: ${data.identified_at}`;

  return { data, markdown, source_documents: [] };
}

function stubArtifact(code: string, name: string): ArtifactOutput {
  const now = new Date().toISOString();
  return {
    data: { stub: true, generated_at: now, disclaimer: "[STUB — not implemented for prototype]" },
    markdown: `# ${code} — ${name}\n\n> **[STUB — not implemented for prototype]**\n\nThis artifact would contain ${name.toLowerCase()} data in a production implementation.\n\nGenerated at: ${now}`,
    source_documents: [],
  };
}

const RENDER_MAP: Record<string, RenderFn> = {
  "ART-1": renderArt1,
  "ART-2": renderArt2,
  "ART-3": renderArt3,
  "ART-4": renderArt4,
  "ART-5": renderArt5,
  "ART-6": renderArt6,
  "ART-7": renderArt7,
  "ART-8": renderArt8,
  "ART-9": renderArt9,
  "ART-10": renderArt10,
  "ART-12": renderArt12,
  "ART-13": renderArt13,
  "ART-14": renderArt14,
};

const STUB_ARTIFACTS = [
  "ART-11",
  "ART-15",
  "ART-16",
  "ART-17",
  "ART-18",
  "ART-19",
  "ART-21",
  "ART-22",
  "ART-23",
];

export function renderArtifact(
  code: string,
  name: string,
  cr: CanonicalRecord
): ArtifactOutput {
  const fn = RENDER_MAP[code];
  if (fn) return fn(cr);
  if (STUB_ARTIFACTS.includes(code)) return stubArtifact(code, name);
  return stubArtifact(code, name);
}

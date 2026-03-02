import { prisma } from "@/lib/prisma";
import { CanonicalRecord } from "@/lib/types";
import { extractPhase1Data } from "@/lib/ai-engine/phase1-extract";
import { generateArtifacts } from "@/lib/artifacts/renderer";
import { PHASE_ARTIFACT_MAP } from "@/lib/artifacts/phase-map";
import fs from "fs/promises";

const MOCK_REGISTRY: Record<string, Record<string, string>> = {
  default: {
    corporate_status: "active",
  },
};

export async function runPhase1(caseId: string, _jobId: string) {
  const caseData = await prisma.case.findUniqueOrThrow({
    where: { id: caseId },
    include: { documents: { orderBy: { uploadedAt: "asc" } } },
  });

  const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;

  // P1.1 — Build document context pack
  const documentTexts: Array<{ label: string; text: string; filename: string }> = [];

  for (let i = 0; i < caseData.documents.length; i++) {
    const doc = caseData.documents[i];
    try {
      const buffer = await fs.readFile(doc.storagePath);
      const pdfParse = (await import("pdf-parse")).default;
      const parsed = await pdfParse(buffer);
      documentTexts.push({
        label: `DOC-${i + 1}`,
        text: parsed.text,
        filename: doc.filename,
      });
    } catch (err) {
      console.error(`Failed to parse PDF ${doc.filename}:`, err);
      documentTexts.push({
        label: `DOC-${i + 1}`,
        text: `[Failed to extract text from ${doc.filename}]`,
        filename: doc.filename,
      });
    }
  }

  // P1.2 — LLM extraction
  const extracted = await extractPhase1Data(documentTexts, canonicalRecord);

  const updatedRecord: CanonicalRecord = {
    ...canonicalRecord,
    subject_corporation: extracted.subject_corporation ?? canonicalRecord.subject_corporation,
    directors: extracted.directors ?? canonicalRecord.directors,
    authorized_signatories: extracted.authorized_signatories ?? canonicalRecord.authorized_signatories,
    authority_to_bind: extracted.authority_to_bind ?? canonicalRecord.authority_to_bind,
    entities: extracted.entities ?? canonicalRecord.entities,
    ownership_relationships: extracted.ownership_relationships ?? canonicalRecord.ownership_relationships,
  };

  if (extracted.account_intent) {
    updatedRecord.account_intent = {
      ...canonicalRecord.account_intent,
      ...extracted.account_intent,
    };
  }

  // P1.3 — Registry cross-check (simulated)
  const discrepancies: NonNullable<CanonicalRecord["registry_crosscheck"]>["discrepancies"] = [];
  const sc = updatedRecord.subject_corporation;

  if (sc) {
    const registry = MOCK_REGISTRY.default;
    if (registry.corporate_status && sc.corporate_status && sc.corporate_status !== registry.corporate_status) {
      discrepancies.push({
        id: `disc-${discrepancies.length + 1}`,
        field: "corporate_status",
        extracted_value: sc.corporate_status,
        registry_value: registry.corporate_status,
        resolved: false,
      });
    }
  }

  updatedRecord.registry_crosscheck = {
    performed: true,
    source: "Mock Corporate Registry",
    discrepancies,
  };

  for (const disc of discrepancies) {
    await prisma.issue.create({
      data: {
        caseId,
        phase: 1,
        type: "registry_discrepancy",
        severity: "error",
        title: `Registry discrepancy: ${disc.field}`,
        description: `Extracted "${disc.extracted_value}" but registry shows "${disc.registry_value}"`,
        fieldPath: `subject_corporation.${disc.field}`,
      },
    });
  }

  // P1.4 — Issue detection
  if (!updatedRecord.subject_corporation?.legal_name) {
    await prisma.issue.create({
      data: {
        caseId,
        phase: 1,
        type: "missing_field",
        severity: "error",
        title: "Missing legal name",
        description: "The corporation's legal name could not be extracted from the documents",
        fieldPath: "subject_corporation.legal_name",
      },
    });
  }
  if (!updatedRecord.directors || updatedRecord.directors.length === 0) {
    await prisma.issue.create({
      data: {
        caseId,
        phase: 1,
        type: "missing_field",
        severity: "warning",
        title: "No directors found",
        description: "No directors were extracted from the documents",
        fieldPath: "directors",
      },
    });
  }
  if (!updatedRecord.authorized_signatories || updatedRecord.authorized_signatories.length === 0) {
    await prisma.issue.create({
      data: {
        caseId,
        phase: 1,
        type: "missing_field",
        severity: "warning",
        title: "No authorized signatories found",
        description: "No authorized signatories were extracted from the documents",
        fieldPath: "authorized_signatories",
      },
    });
  }

  // P1.5 — Artifact generation
  const artifactCodes = [...PHASE_ARTIFACT_MAP[1]];
  if (discrepancies.length > 0) {
    artifactCodes.push("ART-14");
  }
  await generateArtifacts(caseId, 1, artifactCodes, updatedRecord);

  // P1.6 — Status transition
  const corpName = updatedRecord.subject_corporation?.legal_name ?? null;

  await prisma.case.update({
    where: { id: caseId },
    data: {
      status: "IN_REVIEW_1",
      corporationName: corpName,
      canonicalRecord: updatedRecord as object,
    },
  });

  const issueCount = await prisma.issue.count({
    where: { caseId, phase: 1 },
  });

  await prisma.chatMessage.create({
    data: {
      caseId,
      role: "system",
      content: `Phase 1 extraction complete. Extracted data from ${documentTexts.length} document(s). Corporation identified: ${corpName ?? "Unknown"}. ${issueCount} issue(s) found${discrepancies.length > 0 ? `, including ${discrepancies.length} registry discrepancy(ies)` : ""}. Please review the extracted data and resolve any issues before proceeding.`,
    },
  });
}

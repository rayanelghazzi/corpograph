import { prisma } from "@/lib/prisma";
import { CanonicalRecord } from "@/lib/types";
import { generateArtifacts } from "@/lib/artifacts/renderer";
import { PHASE_ARTIFACT_MAP } from "@/lib/artifacts/phase-map";

const SANCTIONS_LISTS = [
  "OFAC SDN",
  "UN Security Council",
  "EU Consolidated",
  "OSFI Listed Entities",
  "FINTRAC PEP/HIO",
];

const FLAGGED_NAMES: Record<string, { list: string; score: number; details: string }> = {
  "michael chen": {
    list: "OFAC SDN",
    score: 72,
    details: "Partial name match against 'Chen, Michael Wei' (SDN Entry 38214). Different date of birth. Likely false positive but requires analyst review.",
  },
  "redstone capital corp.": {
    list: "FINTRAC PEP/HIO",
    score: 65,
    details: "Entity name closely resembles 'RedStone Capital Holdings Ltd.' flagged for association with a Politically Exposed Person (PEP). Jurisdictional overlap noted.",
  },
  "redstone capital corp": {
    list: "FINTRAC PEP/HIO",
    score: 65,
    details: "Entity name closely resembles 'RedStone Capital Holdings Ltd.' flagged for association with a Politically Exposed Person (PEP). Jurisdictional overlap noted.",
  },
};

export async function runPhase4Stub(caseId: string, _jobId: string) {
  const caseData = await prisma.case.findUniqueOrThrow({
    where: { id: caseId },
  });

  const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;
  const entities = canonicalRecord.entities ?? [];
  const now = new Date().toISOString();

  const screeningResults: NonNullable<CanonicalRecord["screening_results"]> = entities.map((entity) => {
    const key = entity.name.toLowerCase();
    const flag = FLAGGED_NAMES[key];

    if (flag) {
      return {
        entity_id: entity.id,
        entity_name: entity.name,
        screening_status: "potential_match" as const,
        lists_checked: SANCTIONS_LISTS,
        matches: [flag],
        screened_at: now,
      };
    }

    return {
      entity_id: entity.id,
      entity_name: entity.name,
      screening_status: "clear" as const,
      lists_checked: SANCTIONS_LISTS,
      screened_at: now,
    };
  });

  const updatedRecord: CanonicalRecord = {
    ...canonicalRecord,
    screening_results: screeningResults,
  };

  await prisma.case.update({
    where: { id: caseId },
    data: { canonicalRecord: updatedRecord as object },
  });

  await generateArtifacts(caseId, 4, PHASE_ARTIFACT_MAP[4], updatedRecord);

  const alerts = screeningResults.filter((r) => r.screening_status !== "clear");
  for (const alert of alerts) {
    const match = alert.matches?.[0];
    await prisma.issue.create({
      data: {
        caseId,
        phase: 4,
        type: "other",
        severity: "warning",
        title: `Potential screening match: ${alert.entity_name}`,
        description: match
          ? `${match.list} — ${match.details} (${match.score}% confidence)`
          : `Screening flag on ${alert.entity_name}`,
        fieldPath: `screening_results`,
      },
    });
  }

  await prisma.case.update({
    where: { id: caseId },
    data: { status: "IN_REVIEW_4" },
  });

  const alertCount = alerts.length;
  const clearCount = screeningResults.length - alertCount;

  await prisma.chatMessage.create({
    data: {
      caseId,
      role: "system",
      content: `Phase 4 (Sanctions Screening & Tax) complete. Screened ${screeningResults.length} entities against ${SANCTIONS_LISTS.length} sanctions lists. ${clearCount} cleared, ${alertCount} potential match(es) flagged for review. Please review the screening alerts before proceeding.`,
    },
  });
}

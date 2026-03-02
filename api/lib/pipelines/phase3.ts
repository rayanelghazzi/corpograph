import { prisma } from "@/lib/prisma";
import { CanonicalRecord } from "@/lib/types";
import { assessPhase3 } from "@/lib/ai-engine/phase3-assess";
import { generateArtifacts } from "@/lib/artifacts/renderer";
import { PHASE_ARTIFACT_MAP } from "@/lib/artifacts/phase-map";

export async function runPhase3(caseId: string, _jobId: string) {
  const caseData = await prisma.case.findUniqueOrThrow({
    where: { id: caseId },
  });

  const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;

  // P3.1 — Build decision context
  const issues = await prisma.issue.findMany({
    where: { caseId },
    select: { type: true, severity: true, resolved: true, title: true, description: true },
  });

  const artifacts = await prisma.artifact.findMany({
    where: { caseId },
    select: { artifactCode: true },
  });
  const artifactCodes = artifacts.map((a) => a.artifactCode);

  // P3.2 — LLM assessment
  const assessment = await assessPhase3(canonicalRecord, issues, artifactCodes);

  const updatedRecord: CanonicalRecord = {
    ...canonicalRecord,
    confirmation_measures: assessment.confirmation_measures,
    third_party_determination: assessment.third_party_determination,
    risk_assessment: assessment.risk_assessment,
  };

  // P3.3 — Artifact generation
  await generateArtifacts(caseId, 3, PHASE_ARTIFACT_MAP[3], updatedRecord);

  // P3.4 — Status transition
  await prisma.case.update({
    where: { id: caseId },
    data: {
      status: "IN_REVIEW_3",
      canonicalRecord: updatedRecord as object,
    },
  });

  const riskLevel = updatedRecord.risk_assessment?.risk_level ?? "unknown";
  const recommendation = updatedRecord.risk_assessment?.ai_recommendation ?? "";

  await prisma.chatMessage.create({
    data: {
      caseId,
      role: "system",
      content: `Phase 3 assessment complete. Risk level: ${riskLevel.toUpperCase()}. ${recommendation ? `AI Recommendation: ${recommendation}` : ""} Please review the risk assessment and make your decision.`,
    },
  });
}

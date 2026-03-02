import { prisma } from "@/lib/prisma";
import { CanonicalRecord } from "@/lib/types";
import { generateArtifacts } from "@/lib/artifacts/renderer";
import { PHASE_ARTIFACT_MAP } from "@/lib/artifacts/phase-map";

export async function runPhase5Stub(caseId: string, _jobId: string) {
  const caseData = await prisma.case.findUniqueOrThrow({
    where: { id: caseId },
  });

  const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;

  await generateArtifacts(caseId, 5, PHASE_ARTIFACT_MAP[5], canonicalRecord);

  await prisma.case.update({
    where: { id: caseId },
    data: { status: "IN_REVIEW_5" },
  });

  await prisma.chatMessage.create({
    data: {
      caseId,
      role: "system",
      content: "Phase 5 (Finalization) complete. [STUB — not implemented for prototype]. All stub artifacts generated. You may now approve, escalate, or reject the case.",
    },
  });
}

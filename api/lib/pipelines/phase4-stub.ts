import { prisma } from "@/lib/prisma";
import { CanonicalRecord } from "@/lib/types";
import { generateArtifacts } from "@/lib/artifacts/renderer";
import { PHASE_ARTIFACT_MAP } from "@/lib/artifacts/phase-map";

export async function runPhase4Stub(caseId: string, _jobId: string) {
  const caseData = await prisma.case.findUniqueOrThrow({
    where: { id: caseId },
  });

  const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;

  await generateArtifacts(caseId, 4, PHASE_ARTIFACT_MAP[4], canonicalRecord);

  await prisma.case.update({
    where: { id: caseId },
    data: { status: "IN_REVIEW_4" },
  });

  await prisma.chatMessage.create({
    data: {
      caseId,
      role: "system",
      content: "Phase 4 (Sanctions & Tax) complete. [STUB — not implemented for prototype]. Stub artifacts generated. You may proceed to the next phase.",
    },
  });
}

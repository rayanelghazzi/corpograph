import { prisma } from "@/lib/prisma";
import { CanonicalRecord, CaseStatus } from "@/lib/types";

export interface PreconditionResult {
  ok: boolean;
  errorCode?: string;
  message?: string;
}

export async function checkPhase1Preconditions(
  caseId: string,
  status: CaseStatus,
  canonicalRecord: CanonicalRecord
): Promise<PreconditionResult> {
  if (status !== "DRAFT_INPUT") {
    return {
      ok: false,
      errorCode: "INVALID_STATE",
      message: "Phase 1 can only be triggered from DRAFT_INPUT status",
    };
  }

  const docCount = await prisma.document.count({ where: { caseId } });
  if (docCount === 0) {
    return {
      ok: false,
      errorCode: "VALIDATION_ERROR",
      message: "At least one document must be uploaded before running Phase 1",
    };
  }

  if (!canonicalRecord.intake) {
    return {
      ok: false,
      errorCode: "VALIDATION_ERROR",
      message: "Intake fields must be set before running Phase 1",
    };
  }

  if (!canonicalRecord.account_intent) {
    return {
      ok: false,
      errorCode: "VALIDATION_ERROR",
      message: "Account intent fields must be set before running Phase 1",
    };
  }

  if (!canonicalRecord.consent) {
    return {
      ok: false,
      errorCode: "VALIDATION_ERROR",
      message: "Consent must be provided before running Phase 1",
    };
  }

  return { ok: true };
}

export async function checkActiveJob(
  caseId: string
): Promise<PreconditionResult> {
  const activeJob = await prisma.job.findFirst({
    where: {
      caseId,
      status: { in: ["queued", "running"] },
    },
  });

  if (activeJob) {
    return {
      ok: false,
      errorCode: "JOB_ACTIVE",
      message: "A phase job is already running for this case",
    };
  }

  return { ok: true };
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/errors";
import { CanonicalRecord, CaseStatus } from "@/lib/types";
import { checkPhase1Preconditions, checkActiveJob } from "@/lib/case-orchestrator/phases";
import { enqueueJob } from "@/lib/case-orchestrator/job-runner";
import { getJobType } from "@/lib/case-orchestrator/state-machine";

type RouteContext = { params: Promise<{ id: string; phase: string }> };

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id, phase: phaseStr } = await context.params;
    const phase = parseInt(phaseStr);

    if (isNaN(phase) || phase < 1 || phase > 5) {
      return errorResponse("VALIDATION_ERROR", "Phase must be between 1 and 5");
    }

    if (phase >= 2) {
      return errorResponse(
        "INVALID_STATE",
        `Phase ${phase} cannot be triggered directly. Use the decision endpoint on the previous phase to proceed.`
      );
    }

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    const activeJobCheck = await checkActiveJob(id);
    if (!activeJobCheck.ok) {
      return errorResponse(
        activeJobCheck.errorCode as "JOB_ACTIVE",
        activeJobCheck.message!
      );
    }

    const status = caseData.status as CaseStatus;
    const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;

    const preconditionCheck = await checkPhase1Preconditions(id, status, canonicalRecord);
    if (!preconditionCheck.ok) {
      return errorResponse(
        preconditionCheck.errorCode as "VALIDATION_ERROR",
        preconditionCheck.message!
      );
    }

    const jobType = getJobType(phase);
    const job = await enqueueJob(id, jobType);

    return NextResponse.json(
      {
        job: {
          id: job.id,
          type: job.type,
          status: job.status,
          created_at: job.createdAt.toISOString(),
        },
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("POST /api/cases/:id/phases/:phase/run error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to trigger phase");
  }
}

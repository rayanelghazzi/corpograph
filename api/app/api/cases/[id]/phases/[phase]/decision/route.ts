import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/errors";
import { CanonicalRecord, CaseStatus, Decision } from "@/lib/types";
import { checkActiveJob } from "@/lib/case-orchestrator/phases";
import {
  validateDecision,
  getStatusAfterDecision,
  getJobType,
} from "@/lib/case-orchestrator/state-machine";
import { enqueueJob } from "@/lib/case-orchestrator/job-runner";

type RouteContext = { params: Promise<{ id: string; phase: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id, phase: phaseStr } = await context.params;
    const phase = parseInt(phaseStr);

    if (isNaN(phase) || phase < 1 || phase > 5) {
      return errorResponse("VALIDATION_ERROR", "Phase must be between 1 and 5");
    }

    const body = await request.json();
    const decision = body.decision as Decision;
    const rationale = body.rationale as string | undefined;

    if (!decision || !["proceed", "escalate", "reject", "approve"].includes(decision)) {
      return errorResponse("VALIDATION_ERROR", "Valid decision required: proceed, escalate, reject, approve");
    }

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    const activeJobCheck = await checkActiveJob(id);
    if (!activeJobCheck.ok) {
      return errorResponse("JOB_ACTIVE", activeJobCheck.message!);
    }

    const status = caseData.status as CaseStatus;

    const hasBlockingIssues = (await prisma.issue.count({
      where: { caseId: id, resolved: false, severity: "error" },
    })) > 0;

    const validationError = validateDecision(phase, decision, status, hasBlockingIssues);
    if (validationError) {
      return errorResponse(
        validationError.errorCode as "INVALID_STATE",
        validationError.message
      );
    }

    const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;
    const phaseDecisions = canonicalRecord.phase_decisions ?? {};
    phaseDecisions[phase] = {
      decision,
      decided_at: new Date().toISOString(),
      rationale,
    };
    canonicalRecord.phase_decisions = phaseDecisions;

    if (decision === "proceed") {
      const nextPhase = phase + 1;
      if (nextPhase <= 5) {
        await prisma.case.update({
          where: { id },
          data: { canonicalRecord: canonicalRecord as object },
        });

        const jobType = getJobType(nextPhase);
        const job = await enqueueJob(id, jobType);

        return NextResponse.json({
          case_status: caseData.status,
          decision_recorded: true,
          next_job: {
            id: job.id,
            type: job.type,
            status: job.status,
          },
        });
      }
    }

    const newStatus = getStatusAfterDecision(decision, phase);

    await prisma.case.update({
      where: { id },
      data: {
        status: newStatus,
        canonicalRecord: canonicalRecord as object,
      },
    });

    return NextResponse.json({
      case_status: newStatus,
      decision_recorded: true,
      next_job: null,
    });
  } catch (err) {
    console.error("POST /api/cases/:id/phases/:phase/decision error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to record decision");
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/errors";
import { CanonicalRecord, CaseStatus } from "@/lib/types";
import { getCurrentPhase } from "@/lib/case-orchestrator/state-machine";
import { generateArtifacts } from "@/lib/artifacts/renderer";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        artifacts: { select: { artifactCode: true } },
        issues: { select: { id: true, resolved: true, severity: true } },
        jobs: {
          where: { status: { in: ["queued", "running"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { documents: true } },
      },
    });

    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    const status = caseData.status as CaseStatus;
    const currentPhase = getCurrentPhase(status);

    const allJobs = await prisma.job.findMany({
      where: { caseId: id },
      orderBy: { createdAt: "asc" },
    });

    const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;
    const phaseDecisions = canonicalRecord.phase_decisions ?? {};

    const phases: Record<string, object> = {};
    for (let p = 1; p <= 5; p++) {
      const phaseJobs = allJobs.filter((j) => j.type === `PHASE_${p}_RUN`);
      const successJob = phaseJobs.find((j) => j.status === "succeeded");
      const activeJob = phaseJobs.find((j) => j.status === "queued" || j.status === "running");
      const decision = phaseDecisions[p];

      let phaseStatus: string;
      if (decision) {
        phaseStatus = "completed";
      } else if (currentPhase === p) {
        phaseStatus = "in_review";
      } else if (activeJob) {
        phaseStatus = "processing";
      } else if (successJob) {
        phaseStatus = "in_review";
      } else {
        phaseStatus = "not_started";
      }

      phases[String(p)] = {
        status: phaseStatus,
        ...(successJob?.startedAt && { started_at: successJob.startedAt.toISOString() }),
        ...(successJob?.completedAt && { completed_at: successJob.completedAt.toISOString() }),
        ...(decision && {
          decision: decision.decision,
          decided_at: decision.decided_at,
        }),
      };
    }

    const unresolvedIssues = caseData.issues.filter((i) => !i.resolved);
    const blockingIssues = unresolvedIssues.filter((i) => i.severity === "error");

    const activeJob = caseData.jobs[0] ?? null;

    return NextResponse.json({
      id: caseData.id,
      status: caseData.status,
      corporation_name: caseData.corporationName,
      created_at: caseData.createdAt.toISOString(),
      updated_at: caseData.updatedAt.toISOString(),
      current_phase: currentPhase,
      canonical_record: caseData.canonicalRecord,
      active_job: activeJob
        ? {
            id: activeJob.id,
            type: activeJob.type,
            status: activeJob.status,
            created_at: activeJob.createdAt.toISOString(),
            ...(activeJob.error && { error: activeJob.error }),
          }
        : null,
      phases,
      document_count: caseData._count.documents,
      artifact_codes: caseData.artifacts.map((a) => a.artifactCode),
      issue_summary: {
        total: caseData.issues.length,
        resolved: caseData.issues.length - unresolvedIssues.length,
        unresolved: unresolvedIssues.length,
        blocking: blockingIssues.length,
      },
    });
  } catch (err) {
    console.error("GET /api/cases/:id error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to get case");
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    await prisma.case.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/cases/:id error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to delete case");
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    if (caseData.status !== "DRAFT_INPUT") {
      return errorResponse("INVALID_STATE", "Can only update intake fields in DRAFT_INPUT status");
    }

    const body = await request.json();
    const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;

    if (body.intake) {
      canonicalRecord.intake = { ...canonicalRecord.intake, ...body.intake };
    }
    if (body.account_intent) {
      canonicalRecord.account_intent = {
        ...canonicalRecord.account_intent,
        ...body.account_intent,
      };
    }
    if (body.consent) {
      canonicalRecord.consent = {
        ...canonicalRecord.consent,
        privacy_notice_version: body.consent.privacy_notice_version ?? canonicalRecord.consent?.privacy_notice_version ?? "1.0",
        consented_at: body.consent.consented_at ?? canonicalRecord.consent?.consented_at ?? new Date().toISOString(),
        acknowledged: body.consent.acknowledged ?? canonicalRecord.consent?.acknowledged ?? false,
      };
    }

    const updated = await prisma.case.update({
      where: { id },
      data: { canonicalRecord: canonicalRecord as object },
    });

    if (canonicalRecord.consent?.acknowledged) {
      await generateArtifacts(id, 0, ["ART-13"], canonicalRecord);
    }

    const allIssues = await prisma.issue.findMany({ where: { caseId: id } });
    const unresolvedIssues = allIssues.filter((i) => !i.resolved);
    const blockingIssues = unresolvedIssues.filter((i) => i.severity === "error");

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      corporation_name: updated.corporationName,
      created_at: updated.createdAt.toISOString(),
      updated_at: updated.updatedAt.toISOString(),
      current_phase: getCurrentPhase(updated.status as CaseStatus),
      canonical_record: updated.canonicalRecord,
      active_job: null,
      phases: { "1": { status: "not_started" }, "2": { status: "not_started" }, "3": { status: "not_started" }, "4": { status: "not_started" }, "5": { status: "not_started" } },
      document_count: 0,
      artifact_codes: [],
      issue_summary: {
        total: allIssues.length,
        resolved: allIssues.length - unresolvedIssues.length,
        unresolved: unresolvedIssues.length,
        blocking: blockingIssues.length,
      },
    });
  } catch (err) {
    console.error("PATCH /api/cases/:id error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to update case");
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    const { searchParams } = new URL(request.url);
    const phaseFilter = searchParams.get("phase");
    const resolvedFilter = searchParams.get("resolved");
    const severityFilter = searchParams.get("severity");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { caseId: id };
    if (phaseFilter) where.phase = parseInt(phaseFilter);
    if (resolvedFilter !== null && resolvedFilter !== undefined) {
      where.resolved = resolvedFilter === "true";
    }
    if (severityFilter) where.severity = severityFilter;

    const issues = await prisma.issue.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    const allIssues = await prisma.issue.findMany({
      where: { caseId: id },
    });
    const resolved = allIssues.filter((i) => i.resolved).length;
    const unresolved = allIssues.filter((i) => !i.resolved).length;
    const blocking = allIssues.filter(
      (i) => !i.resolved && i.severity === "error"
    ).length;

    return NextResponse.json({
      issues: issues.map((i) => ({
        id: i.id,
        phase: i.phase,
        type: i.type,
        severity: i.severity,
        title: i.title,
        description: i.description,
        field_path: i.fieldPath,
        resolved: i.resolved,
        resolved_at: i.resolvedAt?.toISOString() ?? null,
        resolution_note: i.resolutionNote,
        created_at: i.createdAt.toISOString(),
      })),
      summary: {
        total: allIssues.length,
        resolved,
        unresolved,
        blocking,
      },
    });
  } catch (err) {
    console.error("GET /api/cases/:id/issues error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to list issues");
  }
}

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { caseId: id };
    if (phaseFilter) where.phase = parseInt(phaseFilter);

    const artifacts = await prisma.artifact.findMany({
      where,
      orderBy: { artifactCode: "asc" },
    });

    return NextResponse.json({
      artifacts: artifacts.map((a) => ({
        code: a.artifactCode,
        name: a.name,
        phase: a.phase,
        generated_at: a.generatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("GET /api/cases/:id/artifacts error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to list artifacts");
  }
}

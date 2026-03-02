import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/errors";

type RouteContext = { params: Promise<{ id: string; code: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id, code } = await context.params;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    const artifact = await prisma.artifact.findUnique({
      where: {
        caseId_artifactCode: { caseId: id, artifactCode: code },
      },
    });

    if (!artifact) {
      return errorResponse("NOT_FOUND", `Artifact ${code} has not been generated yet`);
    }

    return NextResponse.json({
      code: artifact.artifactCode,
      name: artifact.name,
      phase: artifact.phase,
      data: artifact.data,
      markdown: artifact.markdown,
      source_documents: artifact.sourceDocuments,
      generated_at: artifact.generatedAt.toISOString(),
    });
  } catch (err) {
    console.error("GET /api/cases/:id/artifacts/:code error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to get artifact");
  }
}

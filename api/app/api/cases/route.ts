import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/errors";
import { CanonicalRecord } from "@/lib/types";
import { generateArtifacts } from "@/lib/artifacts/renderer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intake, account_intent, consent } = body;

    if (!intake || !intake.account_type || !intake.entity_type) {
      return errorResponse("VALIDATION_ERROR", "intake.account_type and intake.entity_type are required");
    }

    const canonicalRecord: CanonicalRecord = {};

    if (intake) canonicalRecord.intake = intake;
    if (account_intent) canonicalRecord.account_intent = account_intent;

    if (consent) {
      canonicalRecord.consent = {
        privacy_notice_version: consent.privacy_notice_version ?? "1.0",
        consented_at: consent.consented_at ?? new Date().toISOString(),
        acknowledged: consent.acknowledged ?? false,
      };

      if (canonicalRecord.consent.acknowledged) {
        await generateConsentArtifact(null, canonicalRecord);
      }
    }

    const newCase = await prisma.case.create({
      data: {
        status: "DRAFT_INPUT",
        canonicalRecord: canonicalRecord as object,
      },
    });

    if (canonicalRecord.consent?.acknowledged) {
      await generateArtifacts(newCase.id, 0, ["ART-13"], canonicalRecord);
    }

    return NextResponse.json(
      {
        id: newCase.id,
        status: newCase.status,
        corporation_name: newCase.corporationName,
        created_at: newCase.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/cases error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to create case");
  }
}

async function generateConsentArtifact(
  _caseId: string | null,
  _canonicalRecord: CanonicalRecord
) {
  // Artifact generated after case creation with the case ID
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (statusFilter) where.status = statusFilter;
    if (searchQuery) {
      where.corporationName = { contains: searchQuery, mode: "insensitive" };
    }

    const cases = await prisma.case.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { documents: true, artifacts: true },
        },
        issues: {
          where: { resolved: false },
          select: { id: true },
        },
      },
    });

    const allCases = await prisma.case.groupBy({
      by: ["status"],
      _count: true,
    });

    const statusCounts: Record<string, number> = {};
    let total = 0;
    for (const group of allCases) {
      statusCounts[group.status] = group._count;
      total += group._count;
    }

    const getCurrentPhase = (status: string): number => {
      if (status === "DRAFT_INPUT") return 0;
      const match = status.match(/IN_REVIEW_(\d)/);
      if (match) return parseInt(match[1]);
      return -1;
    };

    return NextResponse.json({
      cases: cases.map((c) => ({
        id: c.id,
        status: c.status,
        corporation_name: c.corporationName,
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
        current_phase: getCurrentPhase(c.status),
        document_count: c._count.documents,
        artifact_count: c._count.artifacts,
        unresolved_issue_count: c.issues.length,
      })),
      counts: {
        total,
        draft: statusCounts["DRAFT_INPUT"] ?? 0,
        in_review:
          (statusCounts["IN_REVIEW_1"] ?? 0) +
          (statusCounts["IN_REVIEW_2"] ?? 0) +
          (statusCounts["IN_REVIEW_3"] ?? 0) +
          (statusCounts["IN_REVIEW_4"] ?? 0) +
          (statusCounts["IN_REVIEW_5"] ?? 0),
        escalated: statusCounts["ESCALATED"] ?? 0,
        approved: statusCounts["APPROVED"] ?? 0,
        rejected: statusCounts["REJECTED"] ?? 0,
      },
    });
  } catch (err) {
    console.error("GET /api/cases error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to list cases");
  }
}

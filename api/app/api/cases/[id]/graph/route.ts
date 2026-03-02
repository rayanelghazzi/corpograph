import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/errors";
import { CanonicalRecord, CaseStatus } from "@/lib/types";
import { getCurrentPhase } from "@/lib/case-orchestrator/state-machine";
import { computeEffectiveOwnership } from "@/lib/graph-engine/compute-ownership";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    const status = caseData.status as CaseStatus;
    const currentPhase = getCurrentPhase(status);

    if (currentPhase < 1 && status === "DRAFT_INPUT") {
      return errorResponse("NOT_FOUND", "Graph has not been computed yet (Phase 1 not complete)");
    }

    const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;
    const entities = canonicalRecord.entities ?? [];
    const ownershipRels = canonicalRecord.ownership_relationships ?? [];
    const controlRels = canonicalRecord.control_relationships ?? [];
    const beneficialOwners = canonicalRecord.beneficial_owners ?? [];

    const boEntityIds = new Set(beneficialOwners.map((bo) => bo.entity_id));
    const ownershipMap = computeEffectiveOwnership(canonicalRecord);

    const nodes = entities.map((e) => ({
      id: e.id,
      label: e.name,
      type: e.type,
      is_subject: e.is_subject,
      is_beneficial_owner: boEntityIds.has(e.id),
      effective_ownership_pct: ownershipMap.get(e.id)?.effective_pct ?? null,
      jurisdiction: e.jurisdiction ?? null,
    }));

    const edges = [
      ...ownershipRels.map((r) => ({
        id: r.id,
        source: r.owner_entity_id,
        target: r.owned_entity_id,
        type: "ownership" as const,
        ownership_pct: r.ownership_pct,
        control_type: null,
        label: r.ownership_pct != null ? `${r.ownership_pct}%` : "unknown",
      })),
      ...controlRels.map((r) => ({
        id: r.id,
        source: r.controller_entity_id,
        target: r.controlled_entity_id,
        type: "control" as const,
        ownership_pct: null,
        control_type: r.control_type,
        label: r.control_type,
      })),
    ];

    return NextResponse.json({
      nodes,
      edges,
      metadata: {
        total_entities: entities.length,
        total_relationships: ownershipRels.length + controlRels.length,
        beneficial_owner_count: beneficialOwners.length,
        has_gaps: (canonicalRecord.ownership_gaps ?? []).length > 0,
      },
    });
  } catch (err) {
    console.error("GET /api/cases/:id/graph error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to get graph data");
  }
}

import { prisma } from "@/lib/prisma";
import { CanonicalRecord } from "@/lib/types";
import { buildGraph } from "@/lib/graph-engine/build-graph";
import { identifyBeneficialOwners } from "@/lib/graph-engine/identify-ubos";
import { detectOwnershipGaps } from "@/lib/graph-engine/detect-gaps";
import { generateOwnershipNarrative } from "@/lib/ai-engine/phase2-narrative";
import { generateArtifacts } from "@/lib/artifacts/renderer";
import { PHASE_ARTIFACT_MAP } from "@/lib/artifacts/phase-map";

export async function runPhase2(caseId: string, _jobId: string) {
  const caseData = await prisma.case.findUniqueOrThrow({
    where: { id: caseId },
  });

  const canonicalRecord = caseData.canonicalRecord as CanonicalRecord;

  // P2.1 — Build graph
  const graph = buildGraph(canonicalRecord);
  console.log(`Phase 2: Built graph with ${graph.nodes.length} nodes, ${graph.edges.length} edges`);

  // P2.2 + P2.3 — Compute effective ownership & identify UBOs
  const beneficialOwners = identifyBeneficialOwners(canonicalRecord);

  // P2.4 — Detect gaps
  const gaps = detectOwnershipGaps(canonicalRecord);

  const updatedRecord: CanonicalRecord = {
    ...canonicalRecord,
    beneficial_owners: beneficialOwners,
    ownership_gaps: gaps,
  };

  // Create issues for gaps
  for (const gap of gaps) {
    await prisma.issue.create({
      data: {
        caseId,
        phase: 2,
        type: "graph_gap",
        severity: "error",
        title: `Ownership gap: ${gap.gap_type} for ${gap.entity_name}`,
        description: gap.details,
        fieldPath: `ownership_gaps`,
      },
    });
  }

  // P2.5 — Generate ownership narrative
  const narrative = await generateOwnershipNarrative(updatedRecord);
  updatedRecord.ownership_narrative = narrative;

  // P2.6 — Artifact generation
  const artifactCodes = [...PHASE_ARTIFACT_MAP[2]];
  await generateArtifacts(caseId, 2, artifactCodes, updatedRecord);

  // P2.7 — Status transition
  await prisma.case.update({
    where: { id: caseId },
    data: {
      status: "IN_REVIEW_2",
      canonicalRecord: updatedRecord as object,
    },
  });

  await prisma.chatMessage.create({
    data: {
      caseId,
      role: "system",
      content: `Phase 2 analysis complete. Ownership graph: ${graph.nodes.length} entities, ${graph.edges.length} relationships. Identified ${beneficialOwners.length} beneficial owner(s). ${gaps.length > 0 ? `Found ${gaps.length} ownership gap(s) that need resolution.` : "No ownership gaps detected."} Please review the ownership structure and resolve any issues before proceeding.`,
    },
  });
}

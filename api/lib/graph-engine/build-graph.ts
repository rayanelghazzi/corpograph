import { CanonicalRecord } from "@/lib/types";

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  is_subject: boolean;
  jurisdiction?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "ownership" | "control";
  ownership_pct: number | null;
  control_type: string | null;
}

export interface OwnershipGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildGraph(canonicalRecord: CanonicalRecord): OwnershipGraph {
  const entities = canonicalRecord.entities || [];
  const ownershipRels = canonicalRecord.ownership_relationships || [];
  const controlRels = canonicalRecord.control_relationships || [];

  const nodes: GraphNode[] = entities.map((e) => ({
    id: e.id,
    label: e.name,
    type: e.type,
    is_subject: e.is_subject,
    jurisdiction: e.jurisdiction,
  }));

  const edges: GraphEdge[] = [];

  for (const rel of ownershipRels) {
    edges.push({
      id: rel.id,
      source: rel.owner_entity_id,
      target: rel.owned_entity_id,
      type: "ownership",
      ownership_pct: rel.ownership_pct,
      control_type: null,
    });
  }

  for (const rel of controlRels) {
    edges.push({
      id: rel.id,
      source: rel.controller_entity_id,
      target: rel.controlled_entity_id,
      type: "control",
      ownership_pct: null,
      control_type: rel.control_type,
    });
  }

  return { nodes, edges };
}

import { CanonicalRecord } from "@/lib/types";

interface OwnershipEdge {
  owner_entity_id: string;
  owned_entity_id: string;
  ownership_pct: number | null;
}

interface EntityOwnership {
  entity_id: string;
  effective_pct: number;
  paths: string[][];
}

export function computeEffectiveOwnership(
  canonicalRecord: CanonicalRecord
): Map<string, EntityOwnership> {
  const entities = canonicalRecord.entities || [];
  const relationships = canonicalRecord.ownership_relationships || [];

  const subjectEntity = entities.find((e) => e.is_subject);
  if (!subjectEntity) return new Map();

  const individuals = entities.filter((e) => e.type === "individual");
  const adjList = new Map<string, OwnershipEdge[]>();

  for (const rel of relationships) {
    const list = adjList.get(rel.owned_entity_id) || [];
    list.push(rel);
    adjList.set(rel.owned_entity_id, list);
  }

  const result = new Map<string, EntityOwnership>();

  for (const individual of individuals) {
    const paths: string[][] = [];
    let totalEffective = 0;

    findPaths(
      individual.id,
      subjectEntity.id,
      relationships,
      [],
      1,
      (path, pct) => {
        paths.push(path);
        totalEffective += pct;
      }
    );

    if (totalEffective > 0 || paths.length > 0) {
      result.set(individual.id, {
        entity_id: individual.id,
        effective_pct: Math.round(totalEffective * 100) / 100,
        paths,
      });
    }
  }

  return result;
}

function findPaths(
  fromId: string,
  toId: string,
  relationships: OwnershipEdge[],
  currentPath: string[],
  currentPct: number,
  onPathFound: (path: string[], pct: number) => void,
  visited: Set<string> = new Set()
) {
  if (visited.has(fromId)) return;
  visited.add(fromId);

  const path = [...currentPath, fromId];

  const outgoing = relationships.filter((r) => r.owner_entity_id === fromId);

  for (const edge of outgoing) {
    const edgePct = edge.ownership_pct != null ? edge.ownership_pct / 100 : 0;
    const newPct = currentPct * edgePct;

    if (edge.owned_entity_id === toId) {
      onPathFound([...path, toId], newPct * 100);
    } else {
      findPaths(
        edge.owned_entity_id,
        toId,
        relationships,
        path,
        newPct > 0 ? currentPct * edgePct : currentPct,
        onPathFound,
        new Set(visited)
      );
    }
  }
}

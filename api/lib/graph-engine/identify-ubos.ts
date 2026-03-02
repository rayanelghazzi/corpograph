import { CanonicalRecord } from "@/lib/types";
import { computeEffectiveOwnership } from "./compute-ownership";

const UBO_THRESHOLD = 25;

export function identifyBeneficialOwners(
  canonicalRecord: CanonicalRecord
): NonNullable<CanonicalRecord["beneficial_owners"]> {
  const entities = canonicalRecord.entities || [];
  const controlRels = canonicalRecord.control_relationships || [];
  const ownershipMap = computeEffectiveOwnership(canonicalRecord);

  const ubos: NonNullable<CanonicalRecord["beneficial_owners"]> = [];
  const seenIds = new Set<string>();

  for (const [entityId, ownership] of ownershipMap) {
    if (ownership.effective_pct >= UBO_THRESHOLD) {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity || entity.type !== "individual") continue;

      const controlReasons: string[] = [`ownership >= ${UBO_THRESHOLD}%`];
      seenIds.add(entityId);

      ubos.push({
        entity_id: entityId,
        name: entity.name,
        effective_ownership_pct: ownership.effective_pct,
        control_reasons: controlReasons,
        ownership_paths: ownership.paths,
      });
    }
  }

  for (const rel of controlRels) {
    if (seenIds.has(rel.controller_entity_id)) continue;
    const entity = entities.find((e) => e.id === rel.controller_entity_id);
    if (!entity || entity.type !== "individual") continue;

    const ownership = ownershipMap.get(rel.controller_entity_id);
    seenIds.add(rel.controller_entity_id);

    ubos.push({
      entity_id: rel.controller_entity_id,
      name: entity.name,
      effective_ownership_pct: ownership?.effective_pct ?? 0,
      control_reasons: [rel.control_type],
      ownership_paths: ownership?.paths ?? [],
    });
  }

  return ubos;
}

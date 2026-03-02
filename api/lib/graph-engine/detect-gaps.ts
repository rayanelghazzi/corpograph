import { CanonicalRecord } from "@/lib/types";

export function detectOwnershipGaps(
  canonicalRecord: CanonicalRecord
): NonNullable<CanonicalRecord["ownership_gaps"]> {
  const entities = canonicalRecord.entities || [];
  const relationships = canonicalRecord.ownership_relationships || [];
  const gaps: NonNullable<CanonicalRecord["ownership_gaps"]> = [];

  const ownedEntities = new Set(relationships.map((r) => r.owned_entity_id));

  for (const entityId of ownedEntities) {
    const entity = entities.find((e) => e.id === entityId);
    if (!entity) continue;

    const owners = relationships.filter((r) => r.owned_entity_id === entityId);

    const hasNullPct = owners.some((o) => o.ownership_pct === null);
    if (hasNullPct) {
      for (const owner of owners) {
        if (owner.ownership_pct === null) {
          const ownerEntity = entities.find(
            (e) => e.id === owner.owner_entity_id
          );
          gaps.push({
            entity_id: entityId,
            entity_name: entity.name,
            gap_type: "missing_pct",
            details: `Ownership percentage unknown for relationship from ${ownerEntity?.name ?? owner.owner_entity_id} to ${entity.name}`,
          });
        }
      }
    }

    const knownPcts = owners
      .filter((o) => o.ownership_pct !== null)
      .map((o) => o.ownership_pct as number);

    if (knownPcts.length > 0) {
      const total = knownPcts.reduce((a, b) => a + b, 0);
      if (Math.abs(total - 100) > 0.01) {
        gaps.push({
          entity_id: entityId,
          entity_name: entity.name,
          gap_type: "sum_not_100",
          details: `Total known ownership is ${total}% (expected 100%)`,
          total_known_pct: total,
        });
      }
    }
  }

  for (const entity of entities) {
    if (entity.is_subject) continue;
    if (entity.type === "individual") continue;

    const hasOwners = relationships.some(
      (r) => r.owned_entity_id === entity.id
    );
    const isOwner = relationships.some(
      (r) => r.owner_entity_id === entity.id
    );

    if (isOwner && !hasOwners) {
      gaps.push({
        entity_id: entity.id,
        entity_name: entity.name,
        gap_type: "unknown_owner",
        details: `No ownership information found for ${entity.name} — who owns this entity?`,
      });
    }
  }

  return gaps;
}

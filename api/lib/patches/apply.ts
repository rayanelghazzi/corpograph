import { PatchOperation, CanonicalRecord } from "@/lib/types";

export function applyPatches(
  record: CanonicalRecord,
  patches: PatchOperation[]
): CanonicalRecord {
  let result = structuredClone(record);

  for (const patch of patches) {
    result = applySinglePatch(result, patch);
  }

  return result;
}

/**
 * Parse a path like "ownership_relationships[3].ownership_pct" into
 * segments: ["ownership_relationships", 3, "ownership_pct"]
 */
function parsePath(path: string): (string | number)[] {
  const segments: (string | number)[] = [];
  const re = /([^.[]+)|\[(\d+)\]/g;
  let match;
  while ((match = re.exec(path)) !== null) {
    if (match[1] !== undefined) {
      segments.push(match[1]);
    } else if (match[2] !== undefined) {
      segments.push(parseInt(match[2]));
    }
  }
  return segments;
}

function applySinglePatch(
  record: CanonicalRecord,
  patch: PatchOperation
): CanonicalRecord {
  const segments = parsePath(patch.path);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = record;

  if (patch.op === "update") {
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      if (current[seg] === undefined) {
        current[seg] = typeof segments[i + 1] === "number" ? [] : {};
      }
      current = current[seg];
    }
    const lastKey = segments[segments.length - 1];
    current[lastKey] = patch.value;
    return record;
  }

  if (patch.op === "add") {
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      if (current[seg] === undefined) {
        current[seg] = typeof segments[i + 1] === "number" ? [] : {};
      }
      current = current[seg];
    }
    const lastKey = segments[segments.length - 1];
    const target = current[lastKey];

    if (Array.isArray(target)) {
      target.push(patch.value);
    } else {
      current[lastKey] = patch.value;
    }
    return record;
  }

  if (patch.op === "remove") {
    for (let i = 0; i < segments.length - 1; i++) {
      current = current[segments[i]];
      if (current === undefined) return record;
    }
    const lastKey = segments[segments.length - 1];
    const target = current[lastKey];

    if (Array.isArray(target) && patch.index !== undefined) {
      target.splice(patch.index, 1);
    } else if (typeof lastKey === "number" && Array.isArray(current)) {
      current.splice(lastKey, 1);
    } else {
      delete current[lastKey];
    }
    return record;
  }

  return record;
}

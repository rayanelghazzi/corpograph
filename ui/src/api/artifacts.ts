import { apiFetch } from "./client";
import type { ArtifactListItem, ArtifactDetail } from "./types";

export function listArtifacts(caseId: string, phase?: number) {
  const qs = phase != null ? `?phase=${phase}` : "";
  return apiFetch<{ artifacts: ArtifactListItem[] }>(
    `/cases/${caseId}/artifacts${qs}`
  );
}

export function getArtifact(caseId: string, code: string) {
  return apiFetch<ArtifactDetail>(`/cases/${caseId}/artifacts/${code}`);
}

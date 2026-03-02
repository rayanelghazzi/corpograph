import { apiFetch } from "./client";
import type { GraphResponse } from "./types";

export function getGraph(caseId: string) {
  return apiFetch<GraphResponse>(`/cases/${caseId}/graph`);
}

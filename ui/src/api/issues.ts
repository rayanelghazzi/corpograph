import { apiFetch } from "./client";
import type { IssueListResponse } from "./types";

export function listIssues(
  caseId: string,
  params?: { phase?: number; resolved?: boolean; severity?: string }
) {
  const query = new URLSearchParams();
  if (params?.phase != null) query.set("phase", String(params.phase));
  if (params?.resolved != null) query.set("resolved", String(params.resolved));
  if (params?.severity) query.set("severity", params.severity);
  const qs = query.toString();
  return apiFetch<IssueListResponse>(`/cases/${caseId}/issues${qs ? `?${qs}` : ""}`);
}

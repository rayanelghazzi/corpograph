import { apiFetch } from "./client";
import type { CaseListResponse, CaseDetail, CreateCaseRequest, CaseStatus } from "./types";

export function createCase(body: CreateCaseRequest) {
  return apiFetch<{ id: string; status: CaseStatus; corporation_name: string | null; created_at: string }>(
    "/cases",
    { method: "POST", body: JSON.stringify(body) }
  );
}

export function listCases(params?: { status?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();
  return apiFetch<CaseListResponse>(`/cases${qs ? `?${qs}` : ""}`);
}

export function getCase(id: string) {
  return apiFetch<CaseDetail>(`/cases/${id}`);
}

export function updateCase(id: string, body: Partial<CreateCaseRequest>) {
  return apiFetch<CaseDetail>(`/cases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

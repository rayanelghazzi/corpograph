import { apiUpload, apiFetch } from "./client";
import type { DocumentItem } from "./types";

export function uploadDocuments(caseId: string, files: File[]) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  return apiUpload<{ documents: DocumentItem[] }>(
    `/cases/${caseId}/documents`,
    formData
  );
}

export function listDocuments(caseId: string) {
  return apiFetch<{ documents: DocumentItem[] }>(`/cases/${caseId}/documents`);
}

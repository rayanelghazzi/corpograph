import { apiFetch } from "./client";
import type { JobSummary, Decision, DecisionResponse } from "./types";

export function runPhase(caseId: string, phase: number) {
  return apiFetch<{ job: JobSummary }>(`/cases/${caseId}/phases/${phase}/run`, {
    method: "POST",
  });
}

export function submitDecision(
  caseId: string,
  phase: number,
  body: { decision: Decision; rationale?: string }
) {
  return apiFetch<DecisionResponse>(
    `/cases/${caseId}/phases/${phase}/decision`,
    { method: "POST", body: JSON.stringify(body) }
  );
}

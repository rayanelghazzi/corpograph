import { CaseStatus, Decision } from "@/lib/types";

export function getCurrentPhase(status: CaseStatus): number {
  switch (status) {
    case "DRAFT_INPUT":
      return 0;
    case "IN_REVIEW_1":
      return 1;
    case "IN_REVIEW_2":
      return 2;
    case "IN_REVIEW_3":
      return 3;
    case "IN_REVIEW_4":
      return 4;
    case "IN_REVIEW_5":
      return 5;
    case "ESCALATED":
    case "APPROVED":
    case "REJECTED":
      return -1;
    default:
      return 0;
  }
}

export function getExpectedStatusForPhase(phase: number): CaseStatus | null {
  const map: Record<number, CaseStatus> = {
    1: "IN_REVIEW_1",
    2: "IN_REVIEW_2",
    3: "IN_REVIEW_3",
    4: "IN_REVIEW_4",
    5: "IN_REVIEW_5",
  };
  return map[phase] ?? null;
}

export function getNextStatus(phase: number): CaseStatus {
  const map: Record<number, CaseStatus> = {
    1: "IN_REVIEW_1",
    2: "IN_REVIEW_2",
    3: "IN_REVIEW_3",
    4: "IN_REVIEW_4",
    5: "IN_REVIEW_5",
  };
  return map[phase] ?? "DRAFT_INPUT";
}

export function getJobType(phase: number): string {
  return `PHASE_${phase}_RUN`;
}

export function isTerminal(status: CaseStatus): boolean {
  return (
    status === "ESCALATED" || status === "APPROVED" || status === "REJECTED"
  );
}

export function validateDecision(
  phase: number,
  decision: Decision,
  status: CaseStatus,
  hasBlockingIssues: boolean
): { valid: boolean; errorCode: string; message: string } | null {
  const expectedStatus = getExpectedStatusForPhase(phase);
  if (status !== expectedStatus) {
    return {
      valid: false,
      errorCode: "INVALID_STATE",
      message: `Case is not in the correct state for phase ${phase} decision. Expected ${expectedStatus}, got ${status}`,
    };
  }

  if (decision === "proceed" && hasBlockingIssues) {
    return {
      valid: false,
      errorCode: "PRECONDITION_FAILED",
      message:
        "Cannot proceed with unresolved error-severity issues. Resolve all blocking issues first.",
    };
  }

  if (decision === "reject" && phase < 3) {
    return {
      valid: false,
      errorCode: "VALIDATION_ERROR",
      message: "Reject is only available from Phase 3 onwards",
    };
  }

  if (decision === "approve" && phase !== 5) {
    return {
      valid: false,
      errorCode: "VALIDATION_ERROR",
      message: "Approve is only available at Phase 5",
    };
  }

  return null;
}

export function getStatusAfterDecision(
  decision: Decision,
  currentPhase: number
): CaseStatus {
  switch (decision) {
    case "escalate":
      return "ESCALATED";
    case "reject":
      return "REJECTED";
    case "approve":
      return "APPROVED";
    case "proceed":
      return getNextStatus(currentPhase + 1);
  }
}

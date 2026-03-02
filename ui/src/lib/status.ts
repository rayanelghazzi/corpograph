import type { CaseStatus } from "@/api/types";

interface StatusDisplay {
  label: string;
  className: string;
}

const STATUS_MAP: Record<CaseStatus, StatusDisplay> = {
  DRAFT_INPUT: { label: "Ready for Review", className: "bg-blue-100 text-blue-700 border-blue-300" },
  IN_REVIEW_1: { label: "In Review", className: "bg-[#ecd06f]/30 text-[#32302f] border-[#ecd06f]" },
  IN_REVIEW_2: { label: "In Review", className: "bg-[#ecd06f]/30 text-[#32302f] border-[#ecd06f]" },
  IN_REVIEW_3: { label: "In Review", className: "bg-[#ecd06f]/30 text-[#32302f] border-[#ecd06f]" },
  IN_REVIEW_4: { label: "In Review", className: "bg-[#ecd06f]/30 text-[#32302f] border-[#ecd06f]" },
  IN_REVIEW_5: { label: "In Review", className: "bg-[#ecd06f]/30 text-[#32302f] border-[#ecd06f]" },
  ESCALATED: { label: "Escalated", className: "bg-[#ffedd4] text-[#ca3500] border-[#ca3500]/30" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-300" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700 border-green-300" },
};

export function getStatusDisplay(status: CaseStatus): StatusDisplay {
  return STATUS_MAP[status] ?? { label: status, className: "" };
}

export function getCurrentPhase(status: CaseStatus): number {
  if (status === "DRAFT_INPUT") return 0;
  const match = status.match(/^IN_REVIEW_(\d)$/);
  if (match) return parseInt(match[1]);
  return 0;
}

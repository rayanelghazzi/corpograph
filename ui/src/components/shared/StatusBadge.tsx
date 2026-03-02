import { cn } from "@/lib/utils";
import { getStatusDisplay } from "@/lib/status";
import type { CaseStatus } from "@/api/types";

export function StatusBadge({ status }: { status: CaseStatus }) {
  const { label, className } = getStatusDisplay(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-normal",
        className
      )}
    >
      {label}
    </span>
  );
}

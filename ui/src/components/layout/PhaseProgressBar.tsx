import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PHASE_LABELS } from "@/lib/constants";
import type { PhaseInfo } from "@/api/types";

interface PhaseProgressBarProps {
  phases: Record<string, PhaseInfo>;
  currentPhase: number;
  viewingPhase: number;
  isJobActive: boolean;
  onStepClick: (phase: number) => void;
}

type StepState = "completed" | "processing" | "current" | "upcoming";

export function PhaseProgressBar({ phases, currentPhase, viewingPhase, isJobActive, onStepClick }: PhaseProgressBarProps) {
  const steps = [1, 2, 3, 4, 5];

  function getStepState(n: number): StepState {
    const info = phases[String(n)];
    if (info?.status === "completed") return "completed";
    if (info?.status === "processing") return "processing";
    if (n === currentPhase && isJobActive) return "processing";
    if (info?.status === "in_review" || n === currentPhase) return "current";
    return "upcoming";
  }

  function isClickable(n: number): boolean {
    const state = getStepState(n);
    return state === "completed" || state === "current" || state === "processing";
  }

  function getFillPercent(): number {
    let completed = 0;
    for (const n of steps) {
      if (getStepState(n) === "completed") completed++;
      else break;
    }
    if (completed === 0) return 0;
    const transitions = steps.length - 1;
    return Math.min((completed / transitions) * 100, 100);
  }

  return (
    <div className="border-b border-foreground/20 px-6 py-6">
      <div className="relative flex items-start justify-between">
        {/* Background track */}
        <div className="absolute inset-x-0 top-[18px] -translate-y-1/2">
          <div className="h-1 w-full rounded-full bg-muted-foreground/15" />
        </div>
        {/* Fill track */}
        <div
          className="absolute left-0 top-[18px] h-1 -translate-y-1/2 rounded-full bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${getFillPercent()}%` }}
        />

        {/* Step nodes + labels */}
        {steps.map((n) => {
          const state = getStepState(n);
          const clickable = isClickable(n);
          const isViewing = n === viewingPhase && viewingPhase !== currentPhase;

          return (
            <button
              key={n}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(n)}
              className={cn(
                "relative z-10 flex flex-col items-center w-20",
                clickable ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-[3px] text-sm font-bold transition-all duration-300",
                  state === "completed" &&
                    "border-foreground bg-foreground text-background",
                  state === "processing" &&
                    "border-foreground bg-background text-foreground ring-4 ring-foreground/10",
                  state === "current" &&
                    "border-foreground bg-background text-foreground ring-4 ring-foreground/10",
                  state === "upcoming" &&
                    "border-muted-foreground/30 bg-background text-muted-foreground",
                  isViewing && "ring-4 ring-foreground/20"
                )}
              >
                {state === "completed" ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : state === "processing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  n
                )}
              </div>
              <span
                className={cn(
                  "mt-2.5 text-center text-xs leading-tight",
                  isViewing
                    ? "font-semibold text-foreground"
                    : state === "current" || state === "processing"
                      ? "font-semibold text-foreground"
                      : state === "completed"
                        ? "text-foreground"
                        : "text-muted-foreground"
                )}
              >
                {PHASE_LABELS[n]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

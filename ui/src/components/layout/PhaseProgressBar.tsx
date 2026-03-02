import { cn } from "@/lib/utils";
import { PHASE_LABELS } from "@/lib/constants";
import type { PhaseInfo } from "@/api/types";

interface PhaseProgressBarProps {
  phases: Record<string, PhaseInfo>;
  currentPhase: number;
}

export function PhaseProgressBar({ phases, currentPhase }: PhaseProgressBarProps) {
  const phaseNumbers = [1, 2, 3, 4, 5];

  function getStepState(n: number): "completed" | "current" | "upcoming" {
    const info = phases[String(n)];
    if (info?.status === "completed") return "completed";
    if (n === currentPhase) return "current";
    return "upcoming";
  }

  return (
    <div className="border-b px-6 py-5">
      <div className="flex items-start">
        {phaseNumbers.map((n, i) => {
          const state = getStepState(n);
          const isLast = i === phaseNumbers.length - 1;
          const isGap = n === 3;

          return (
            <div key={n} className="flex items-start flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                    state === "completed" && "bg-foreground text-background",
                    state === "current" && "bg-foreground text-background",
                    state === "upcoming" && "border-2 border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {n}
                </div>
                <span
                  className={cn(
                    "mt-2 text-center text-xs leading-tight",
                    state === "current" ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {PHASE_LABELS[n]}
                </span>
              </div>
              {!isLast && (
                <div className={cn("mt-4 flex-1", isGap ? "mx-4" : "mx-1")}>
                  <div
                    className={cn(
                      "h-[2px] w-full",
                      isGap
                        ? "bg-transparent"
                        : state === "completed" || (state === "current" && getStepState(n + 1) !== "upcoming")
                          ? "bg-foreground"
                          : "bg-muted-foreground/20"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RationaleDialog } from "@/components/modals/RationaleDialog";
import type { Decision, IssueSummary } from "@/api/types";

interface DecisionButton {
  label: string;
  description: string;
  decision: Decision;
  variant: "primary" | "secondary" | "destructive";
}

interface HumanDecisionPanelProps {
  phase: number;
  issueSummary: IssueSummary;
  isTerminal: boolean;
  isViewingPast: boolean;
  isLoading: boolean;
  onDecision: (decision: Decision, rationale?: string) => void;
}

function getButtons(phase: number): DecisionButton[] {
  switch (phase) {
    case 1:
      return [
        { label: "Proceed to Beneficial Ownership", description: "All artifacts are accurate and complete", decision: "proceed", variant: "primary" },
        { label: "Escalate to Compliance", description: "Significant issues require senior review", decision: "escalate", variant: "secondary" },
      ];
    case 2:
      return [
        { label: "Proceed to Reasonable Measures", description: "All artifacts are accurate and complete", decision: "proceed", variant: "primary" },
        { label: "Escalate to Compliance", description: "Significant issues require senior review", decision: "escalate", variant: "secondary" },
      ];
    case 3:
      return [
        { label: "Proceed to Sanctions Screening", description: "Measures are sufficient, artifacts are accurate", decision: "proceed", variant: "primary" },
        { label: "Escalate to Compliance", description: "Discrepancy is material, requires deeper examination", decision: "escalate", variant: "secondary" },
        { label: "Reject Onboarding", description: "Close case and reject onboarding", decision: "reject", variant: "destructive" },
      ];
    case 4:
      return [
        { label: "Proceed to Finalization", description: "All screening and tax items cleared", decision: "proceed", variant: "primary" },
        { label: "Escalate to Compliance", description: "Screening match or tax inconsistency requires review", decision: "escalate", variant: "secondary" },
        { label: "Reject Onboarding", description: "Close case and reject onboarding", decision: "reject", variant: "destructive" },
      ];
    case 5:
      return [
        { label: "Approve & Close", description: "Approve onboarding, lock audit package", decision: "approve", variant: "primary" },
        { label: "Escalate to Compliance", description: "Route to senior review", decision: "escalate", variant: "secondary" },
        { label: "Reject Onboarding", description: "Close case and reject onboarding", decision: "reject", variant: "destructive" },
      ];
    default:
      return [];
  }
}

export function HumanDecisionPanel({
  phase,
  issueSummary,
  isTerminal,
  isViewingPast,
  isLoading,
  onDecision,
}: HumanDecisionPanelProps) {
  const [open, setOpen] = useState(true);
  const [rationaleFor, setRationaleFor] = useState<Decision | null>(null);
  const buttons = getButtons(phase);
  const hasBlocking = issueSummary.blocking > 0;

  if (isTerminal || isViewingPast) return null;

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <div className="text-left">
            <h3 className="text-[20px] font-bold leading-tight">Decision Panel</h3>
            <p className="text-xs text-muted-foreground">Approve or escalate at decision gates</p>
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          {buttons.map((btn) => {
            const isProceed = btn.decision === "proceed" || btn.decision === "approve";
            const disabled = isLoading || (isProceed && hasBlocking);
            const needsRationale = btn.decision === "escalate" || btn.decision === "reject";

            const button = (
              <div key={btn.decision} className="space-y-1">
                <Button
                  className="w-full"
                  variant={
                    btn.variant === "primary" ? "default" :
                    btn.variant === "destructive" ? "destructive" : "outline"
                  }
                  disabled={disabled}
                  onClick={() => {
                    if (needsRationale) {
                      setRationaleFor(btn.decision);
                    } else {
                      onDecision(btn.decision);
                    }
                  }}
                >
                  {btn.label}
                </Button>
                <p className="text-xs text-muted-foreground">{btn.description}</p>
              </div>
            );

            if (isProceed && hasBlocking) {
              return (
                <Tooltip key={btn.decision}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent>Resolve blocking issues before proceeding.</TooltipContent>
                </Tooltip>
              );
            }
            return button;
          })}
        </CollapsibleContent>
      </Collapsible>

      {rationaleFor && (
        <RationaleDialog
          action={rationaleFor as "escalate" | "reject"}
          onConfirm={(rationale) => {
            onDecision(rationaleFor, rationale);
            setRationaleFor(null);
          }}
          onCancel={() => setRationaleFor(null)}
        />
      )}
    </>
  );
}

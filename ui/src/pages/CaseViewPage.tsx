import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCaseWithPolling } from "@/hooks/use-case";
import { useArtifacts } from "@/hooks/use-artifacts";
import { useChat } from "@/hooks/use-chat";
import { useGraph } from "@/hooks/use-graph";
import { submitDecision } from "@/api/phases";
import { useQueryClient } from "@tanstack/react-query";
import { CaseHeader } from "@/components/layout/CaseHeader";
import { PhaseProgressBar } from "@/components/layout/PhaseProgressBar";
import { CaseViewLayout } from "@/components/layout/CaseViewLayout";
import { HumanDecisionPanel } from "@/components/sidebar/HumanDecisionPanel";
import { ArtifactsPanel } from "@/components/sidebar/ArtifactsPanel";
import { ChatPopover } from "@/components/chat/ChatPopover";
import { GraphModal } from "@/components/modals/GraphModal";
import { ArtifactModal } from "@/components/modals/ArtifactModal";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import { Phase1Content } from "@/components/cards/Phase1Content";
import { Phase2Content } from "@/components/cards/Phase2Content";
import { Phase3Content } from "@/components/cards/Phase3Content";
import { Phase4Content } from "@/components/cards/Phase4Content";
import { Phase5Content } from "@/components/cards/Phase5Content";
import { TerminalStateView } from "@/components/cards/TerminalStateView";
import { Separator } from "@/components/ui/separator";
import type { Decision, CaseDetail } from "@/api/types";

export function CaseViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: caseData, isLoading } = useCaseWithPolling(id!);
  const { data: artifactsData } = useArtifacts(id!);
  const chat = useChat(id!);
  const [graphOpen, setGraphOpen] = useState(false);
  const [artifactCode, setArtifactCode] = useState<string | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);

  const isTerminal = caseData
    ? ["ESCALATED", "REJECTED", "APPROVED"].includes(caseData.status)
    : false;

  const graphEnabled = (caseData?.current_phase ?? 0) >= 2 && !isTerminal;
  const { data: graphData } = useGraph(id!, graphEnabled);

  const handleDecision = useCallback(
    async (decision: Decision, rationale?: string) => {
      if (!caseData) return;
      setIsDeciding(true);
      try {
        const res = await submitDecision(caseData.id, caseData.current_phase, {
          decision,
          rationale,
        });
        queryClient.invalidateQueries({ queryKey: ["case", id] });
        queryClient.invalidateQueries({ queryKey: ["cases"] });

        if (decision === "escalate") {
          toast.success("Case escalated");
          navigate("/dashboard");
        } else if (decision === "reject") {
          toast.success("Case rejected");
          navigate("/dashboard");
        } else if (decision === "approve") {
          toast.success("Case approved");
        }
        // proceed: polling will pick up the new state
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Decision failed");
      } finally {
        setIsDeciding(false);
      }
    },
    [caseData, id, navigate, queryClient]
  );

  if (isLoading || !caseData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingOverlay />
      </div>
    );
  }

  const sidebar = (
    <div className="space-y-4">
      <HumanDecisionPanel
        phase={caseData.current_phase}
        issueSummary={caseData.issue_summary}
        isTerminal={isTerminal}
        isLoading={isDeciding}
        onDecision={handleDecision}
      />
      <Separator />
      <ArtifactsPanel
        artifacts={artifactsData?.artifacts ?? []}
        currentPhase={caseData.current_phase}
        issueSummary={caseData.issue_summary}
        onViewArtifact={setArtifactCode}
      />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <CaseHeader
        corporationName={caseData.corporation_name}
        caseId={caseData.id}
        currentPhase={caseData.current_phase}
        onViewGraph={() => setGraphOpen(true)}
      />
      <PhaseProgressBar phases={caseData.phases} currentPhase={caseData.current_phase} />

      <CaseViewLayout sidebar={sidebar}>
        {caseData.active_job ? (
          <LoadingOverlay phase={caseData.current_phase} />
        ) : isTerminal ? (
          <TerminalStateView caseData={caseData} />
        ) : (
          <PhaseContent phase={caseData.current_phase} caseData={caseData} />
        )}
      </CaseViewLayout>

      {!isTerminal && (
        <ChatPopover
          messages={chat.messages}
          isStreaming={chat.isStreaming}
          isJobActive={!!caseData.active_job}
          error={chat.error}
          onSend={chat.sendMessage}
        />
      )}

      {graphOpen && graphData && (
        <GraphModal graphData={graphData} onClose={() => setGraphOpen(false)} />
      )}

      {artifactCode && (
        <ArtifactModal
          caseId={caseData.id}
          code={artifactCode}
          onClose={() => setArtifactCode(null)}
        />
      )}
    </div>
  );
}

function PhaseContent({ phase, caseData }: { phase: number; caseData: CaseDetail }) {
  switch (phase) {
    case 1: return <Phase1Content caseData={caseData} />;
    case 2: return <Phase2Content caseData={caseData} />;
    case 3: return <Phase3Content caseData={caseData} />;
    case 4: return <Phase4Content caseData={caseData} />;
    case 5: return <Phase5Content caseData={caseData} />;
    default: return <div className="py-8 text-center text-muted-foreground">Unknown phase</div>;
  }
}

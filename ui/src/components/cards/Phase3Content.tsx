import { CheckCircle2, Sparkles } from "lucide-react";
import { ContentCard } from "./ContentCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useIssues } from "@/hooks/use-issues";
import { useFlashClass } from "@/hooks/use-patch-highlight";
import { REGULATORY_TEXT } from "@/lib/constants";
import type { CaseDetail } from "@/api/types";

export function Phase3Content({ caseData }: { caseData: CaseDetail }) {
  const cr = caseData.canonical_record;
  const { data: resolvedErrorsData } = useIssues(caseData.id, { resolved: true, severity: "error" });
  const resolvedErrors = resolvedErrorsData?.issues ?? [];

  const complexityScore = cr.risk_assessment?.complexity_score ?? 0;
  const aiRecommendation = cr.risk_assessment?.ai_recommendation;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Phase 3: Reasonable Measures and Discrepancy Determination</h2>
        <p className="text-sm text-muted-foreground">
          Assess verification measures and determine materiality of discrepancies
        </p>
      </div>

      {/* Complexity & Material Discrepancy */}
      <ContentCard title="Case Complexity & Material Discrepancy" subtitle="ART-9, ART-10">
        {/* Complexity Score */}
        <FlashBlock path="risk_assessment">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Complexity Score</p>
              <p className="text-lg font-semibold">{complexityScore}/10</p>
            </div>
            <Progress value={complexityScore * 10} className="h-2" />
            {cr.risk_assessment?.rationale && (
              <p className="text-xs text-muted-foreground">{cr.risk_assessment.rationale}</p>
            )}
          </div>
        </FlashBlock>

        {/* Material Discrepancies Resolved */}
        <div className="space-y-2 pt-4">
          <p className="font-semibold text-sm">Material Discrepancies Resolved</p>
          {resolvedErrors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No material discrepancies were identified.</p>
          ) : (
            <div className="space-y-2">
              {resolvedErrors.map((issue) => (
                <div key={issue.id} className="flex items-start gap-2 rounded-md bg-green-50 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm">{issue.title || issue.description}</p>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">Low Materiality</Badge>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">Resolved</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendation */}
        <div className="mt-4 rounded-lg bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <p className="font-semibold text-sm">AI Recommendation</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {aiRecommendation ?? "No recommendation generated."}
          </p>
        </div>
      </ContentCard>

      {/* Confirmation Steps */}
      <ContentCard title="Confirmation Steps" subtitle="ART-9">
        <p className="text-sm text-muted-foreground mb-3">
          Reasonable measures taken to confirm beneficial ownership accuracy
        </p>
        {(cr.confirmation_measures?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            {cr.confirmation_measures!.map((m, i) => (
              <FlashBlock key={i} path={`confirmation_measures[${i}]`}>
                <div className="flex items-start gap-2 rounded-md border p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <p className="text-sm">{m.measure}</p>
                </div>
              </FlashBlock>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No confirmation measures generated.</p>
        )}
      </ContentCard>

      {/* Third-Party Determination */}
      {cr.third_party_determination && (
        <ContentCard
          title="Third-Party Determination"
          subtitle="ART-10"
          variant={
            cr.third_party_determination.acting_on_behalf && cr.third_party_determination.grounds_for_suspicion
              ? "error"
              : "default"
          }
        >
          <FlashBlock path="third_party_determination">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Acting on Behalf</p>
                <Badge variant={cr.third_party_determination.acting_on_behalf ? "destructive" : "secondary"}>
                  {cr.third_party_determination.acting_on_behalf ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rationale</p>
                <p>{cr.third_party_determination.determination_rationale}</p>
              </div>
            {cr.third_party_determination.third_party_details && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Third Party Name</p>
                  <p>{cr.third_party_determination.third_party_details.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Relationship</p>
                  <p>{cr.third_party_determination.third_party_details.relationship}</p>
                </div>
              </>
            )}
              {cr.third_party_determination.grounds_for_suspicion && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Grounds for Suspicion</p>
                  <p className="text-red-600">{cr.third_party_determination.grounds_for_suspicion}</p>
                </div>
              )}
            </div>
          </FlashBlock>
        </ContentCard>
      )}

      {/* Regulatory Context */}
      <ContentCard title="Regulatory Context" variant="info">
        <p className="text-sm text-blue-700">{REGULATORY_TEXT}</p>
      </ContentCard>
    </div>
  );
}

function FlashBlock({ path, children }: { path: string; children: React.ReactNode }) {
  const flash = useFlashClass(path);
  return <div className={flash}>{children}</div>;
}

import { openai } from "./openai";
import { CanonicalRecord } from "@/lib/types";

const ASSESSMENT_SYSTEM_PROMPT = `You are a compliance risk assessment AI for corporate onboarding.

Given the full case data (canonical record, issues, and artifacts), generate:

1. confirmation_measures: array of { measure, source, result } - specific steps taken to confirm beneficial ownership accuracy
2. third_party_determination: { acting_on_behalf (boolean), determination_rationale, third_party_details (if applicable), grounds_for_suspicion (if any) }
3. risk_assessment: { complexity_score (1-10), risk_score (1-100), risk_level (low/medium/high), risk_factors (array of strings), rationale, enhanced_measures_required (boolean), ai_recommendation (recommendation for the analyst's Phase 3 decision) }

Base your assessment on:
- Number of ownership layers and entities
- Geographic jurisdictions involved
- Any unresolved or previously resolved discrepancies
- Completeness of beneficial ownership information
- Industry risk factors from account intent

Return ONLY valid JSON. No markdown, no explanation.`;

export async function assessPhase3(
  canonicalRecord: CanonicalRecord,
  issues: Array<{ type: string; severity: string; resolved: boolean; title: string; description: string }>,
  artifactCodes: string[]
): Promise<{
  confirmation_measures: CanonicalRecord["confirmation_measures"];
  third_party_determination: CanonicalRecord["third_party_determination"];
  risk_assessment: CanonicalRecord["risk_assessment"];
}> {
  const POLICY_SNIPPET = `
Reasonable Measures Guidance:
- Confirm BO information through at least 2 independent sources
- Check consistency of ownership declarations across submitted documents
- Verify that total ownership percentages sum to 100% for each entity
- Confirm directors/officers match registry records
- Assess whether the declared business purpose aligns with the entity structure
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: ASSESSMENT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Assess this case:\n\nCanonical Record:\n${JSON.stringify(canonicalRecord, null, 2)}\n\nIssues:\n${JSON.stringify(issues, null, 2)}\n\nArtifacts generated: ${artifactCodes.join(", ")}\n\nPolicy Guidance:\n${POLICY_SNIPPET}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("LLM returned empty response for Phase 3 assessment");

  return JSON.parse(content);
}

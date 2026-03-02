import { openai } from "./openai";
import { CanonicalRecord } from "@/lib/types";

const NARRATIVE_SYSTEM_PROMPT = `You are a compliance analyst AI. Generate a clear, professional narrative describing the ownership structure of a corporation.

The narrative should:
1. Start with the subject corporation's identity
2. Describe the ownership chain from top to bottom
3. Identify all beneficial owners (>= 25% effective ownership)
4. Note any gaps or missing information
5. Summarize control relationships if any exist
6. Be written in formal compliance language suitable for regulatory review

Keep it concise but thorough — typically 2-4 paragraphs.`;

export async function generateOwnershipNarrative(
  canonicalRecord: CanonicalRecord
): Promise<string> {
  const context = {
    subject_corporation: canonicalRecord.subject_corporation,
    entities: canonicalRecord.entities,
    ownership_relationships: canonicalRecord.ownership_relationships,
    control_relationships: canonicalRecord.control_relationships,
    beneficial_owners: canonicalRecord.beneficial_owners,
    ownership_gaps: canonicalRecord.ownership_gaps,
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: NARRATIVE_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate an ownership narrative for this corporation:\n\n${JSON.stringify(context, null, 2)}`,
      },
    ],
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || "Unable to generate narrative.";
}

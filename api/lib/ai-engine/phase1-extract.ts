import { openai } from "./openai";
import { CanonicalRecord } from "@/lib/types";

const EXTRACTION_SYSTEM_PROMPT = `You are a document extraction engine for corporate onboarding compliance.
You will receive text extracted from PDF documents (labeled DOC-1, DOC-2, etc.) and questionnaire answers.

Extract the following data as structured JSON:
- subject_corporation: legal_name, jurisdiction, registration_number, registered_address, incorporation_date, business_number (if present), corporate_status
- directors: array of { id (generate as "d-1", "d-2", etc.), full_name, role (director/officer/director_and_officer), address, date_of_birth, appointment_date }
- authorized_signatories: array of { id (generate as "as-1", "as-2", etc.), full_name, residential_address, date_of_birth, occupation, authority_limits, verification_method }
- authority_to_bind: { resolution_date, scope_of_authority, authorized_person_ids (referencing signatory ids), document_ref }
- entities: array of { id (generate as "e-1", "e-2", etc.), type (corporation/individual/trust/partnership/other), name, jurisdiction, is_subject (true for the main corporation) }
- ownership_relationships: array of { id (generate as "or-1", "or-2", etc.), owner_entity_id, owned_entity_id, ownership_pct (number or null if unknown), source }

IMPORTANT:
- Include the subject corporation as the first entity with is_subject: true
- Include ALL individuals mentioned as owners, directors, or signatories as entities of type "individual"
- Create ownership_relationships based on any shareholding or ownership information found
- Each extracted value should reference its source document (DOC-N)
- Use ISO date format (YYYY-MM-DD) for dates
- If information is not found in the documents, omit the field rather than guessing

Return ONLY valid JSON matching this structure. No markdown, no explanation.`;

export async function extractPhase1Data(
  documentTexts: Array<{ label: string; text: string; filename: string }>,
  canonicalRecord: CanonicalRecord
): Promise<Partial<CanonicalRecord>> {
  const contextPack = documentTexts
    .map(
      (doc) =>
        `=== ${doc.label} (${doc.filename}) ===\n${doc.text.slice(0, 15000)}`
    )
    .join("\n\n");

  const questionnaireContext = canonicalRecord.account_intent
    ? `\n\n=== QUESTIONNAIRE ANSWERS ===\n${JSON.stringify(canonicalRecord.account_intent, null, 2)}`
    : "";

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Extract structured data from these documents:\n\n${contextPack}${questionnaireContext}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("LLM returned empty response");

  const extracted = JSON.parse(content);
  return extracted as Partial<CanonicalRecord>;
}

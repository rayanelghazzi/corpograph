# AI-Native Corporate Onboarding Workflow Specification (Workflow v3)

> **Hackathon constraint:** all user-provided documents and questionnaire responses are collected **once in Phase 0**. After Phase 0, the workflow runs with **no further user input**.

---

# PHASE 0 — Intake, Consent, and Single Upload Packet  
**Maps to:** STEP-I-1  

## Goal  
Create an onboarding case, collect required disclosures and consent, and collect the complete onboarding input packet (documents + questionnaires) needed for Phases 1–4.

## Preconditions  
None.

## Inputs  

1. Product selection  
   - Controls:
     - Corporate investment account
     - Corporate cash account
     - Both
   - Collected during: Intake Form (Phase 0)  
   - Source: User interface  
   - Validation: Required selection  

2. Basic corporation details  
   - Controls:
     - Legal name
     - Jurisdiction of incorporation
     - Corporation number (if known)
   - Collected during: Intake Form (Phase 0)  
   - Source: User interface  
   - Validation: Legal name and jurisdiction required  

3. Consent to disclosures, privacy, and data use  
   - Collected during: Intake Form (Phase 0)  
   - Source: User interface  
   - Validation: All mandatory checkboxes must be accepted  

4. **Onboarding document packet (single upload)**  
   - Collected during: Upload Packet Step (Phase 0)  
   - Source: User upload  
   - Validation: Packet must include at minimum:
     - Incorporation document(s): Certificate and/or Articles
     - Authority evidence: board resolution or equivalent signing authority document
     - Ownership evidence: shareholder/securities register (or equivalent)
     - Tax self-certification form(s) (CRS/FATCA as applicable)
     - Identification for authorized signers (and, if provided, key controllers/UBOs)
   - Optional inside packet:
     - Organizational chart
     - Registry record extract (if user has it; otherwise registry connector may retrieve later)

5. **Onboarding questionnaire bundle (completed once)**  
   - Collected during: Questionnaire Step (Phase 0)  
   - Source: User interface  
   - Validation: Must include:
     - Ownership attestation answers (e.g., structure declarations, completeness claims)
     - Tax self-certification answers (if not provided as a form)
     - Any additional declarations needed for later checks (e.g., “are there trusts/nominees”)

## Processing  

- Create onboarding case record  
- Assign workflow state  
- Store consent version and timestamp  
- Store uploaded packet and questionnaire bundle for downstream phases  

## Outputs (Artifacts Generated)

- **ART-0-CaseRecord**
- **ART-1-ConsentRecord**
- (Internal) Stored onboarding packet + questionnaire bundle for downstream phases (no separate task list)

## HITL  
No HITL. Automatically proceeds to Phase 1.

## Subsystems  

1. Intake and Upload UI  
   - Uses AI: No  
   - Input: Forms + upload packet  
   - Output: Collected data available to workflow  

2. **Artifact Generator: Case + Consent** (generates ART-0, ART-1)  
   - Uses AI: Yes  
   - Input: Phase 0 collected data (forms + consent)  
   - Output: **ART-0-CaseRecord**, **ART-1-ConsentRecord**

---

# PHASE 1 — Entity Verification and Authority  
**Maps to:** STEP-I-2 + STEP-I-3 (+ optionally STEP-C-2 + STEP-C-3)

## Goal  
Verify legal existence of the corporation and determine authorized signers.

## Preconditions  

- **ART-0-CaseRecord** exists  
- **ART-1-ConsentRecord** exists  
- Onboarding packet and questionnaire bundle collected in Phase 0

## Inputs  

1. Certificate and/or Articles of Incorporation  
   - Collected during: Upload Packet Step (Phase 0)  
   - Source: Phase 0 upload packet  

2. Registry record (retrieved via registry API where supported, otherwise provided as official government-issued extract)  
   - Collected during: Upload Packet Step (Phase 0) **if provided**, otherwise retrieved during Phase 1  
   - Source: Phase 0 upload packet **OR** Registry connector  

3. Board resolution or signing authority document  
   - Collected during: Upload Packet Step (Phase 0)  
   - Source: Phase 0 upload packet  

4. Identification documents for authorized signers  
   - Collected during: Upload Packet Step (Phase 0)  
   - Source: Phase 0 upload packet  

## Processing  

- Extract corporation identity data
- Extract directors and officers
- Extract signing authority
- Cross-check incorporation documents against registry record  
- Identify discrepancies

AI is used for document extraction and discrepancy detection.

## Outputs (Artifacts Generated)

- **ART-2-EntitySnapshot**
- **ART-3-AuthoritySummary**
- **ART-4-RegistryEvidence**
- **ART-5-DiscrepancyReport** (if applicable)

## HITL  

Triggered when discrepancies or low-confidence fields exist.

Options:

1. Accept extracted data → Proceed to Phase 2  
2. Edit and confirm → Store updated artifacts and proceed  
3. Escalate → Route to compliance  

*(No “request additional documentation” option in later phases, due to Phase 0 single-input constraint.)*

## Subsystems  

1. Registry Connector  
   - Uses AI: No  
   - Input: Corporation identifiers (from Phase 0)  
   - Output: Registry record (if available)  

2. **Artifact Generator: Entity + Authority** (generates ART-2, ART-3, ART-4, ART-5)  
   - Uses AI: Yes  
   - Input: Phase 0 packet + (optional) registry record from connector  
   - Output: **ART-2-EntitySnapshot**, **ART-3-AuthoritySummary**, **ART-4-RegistryEvidence**, **ART-5-DiscrepancyReport**

---

# PHASE 2 — Ownership and Beneficial Ownership Graph  
**Maps to:** STEP-I-4 + STEP-I-6  

## Goal
Construct full ownership and control structure down to natural persons and identify beneficial owners.

## Preconditions  

- **ART-2-EntitySnapshot** confirmed  
- **ART-3-AuthoritySummary** recorded  
- Ownership evidence collected in Phase 0

## Inputs  

1. Shareholder register or securities register  
   - Collected during: Upload Packet Step (Phase 0)  
   - Source: Phase 0 upload packet  

2. Organizational chart (if available)  
   - Collected during: Upload Packet Step (Phase 0)  
   - Source: Phase 0 upload packet  

3. Ownership-related registry filings (if available in jurisdiction), including:
   - Registered shareholder list (if publicly accessible)
   - Registered directors list
   - Registered officers list
   - Ultimate beneficial ownership (UBO) register (where applicable)
   - Corporate structure filings
   - Annual return filings containing ownership disclosures
   - Trust declarations (if filed with registry)
   - Collected during: Phase 2 via registry integration (no user input)
   - Source: Registry connector  

4. Ownership attestation answers  
   - Collected during: Questionnaire Step (Phase 0)  
   - Source: Phase 0 questionnaire bundle  

## Processing  

- Extract ownership relationships  
- Identify entities vs natural persons  
- Build ownership/control graph  
- Trace ownership chains to natural persons  
- Detect missing links  
- Detect conflicting ownership percentages  

AI is heavily used for extraction, graph construction, entity resolution, and gap detection.

## Outputs (Artifacts Generated)

- **ART-6-OwnershipGraphRecord**
- **ART-7-BeneficialOwnerSummary**
- **ART-8-OwnershipGapReport**
- Updated **ART-5-DiscrepancyReport** (if applicable)

## HITL  

Triggered when:

- Ownership chains do not reach natural persons  
- Conflicting percentages exist
- Trust or nominee complexity detected  

Options:

1. Confirm structure as accurate → Proceed to Phase 3  
2. Edit structure → Store updated artifacts and proceed  
3. Escalate → Route to compliance

*(No “request additional information” option, due to Phase 0 single-input constraint.)*

## Subsystems

1. Registry Connector  
   - Uses AI: No  
   - Input: Corporation identifiers (from Phase 0 / ART-2)  
   - Output: Ownership-related registry filings (where available)  

2. **Artifact Generator: Ownership + UBO** (generates ART-6, ART-7, ART-8, updates ART-5)  
   - Uses AI: Yes  
   - Input: Phase 0 packet + Phase 0 questionnaire bundle + (optional) registry filings  
   - Output: **ART-6-OwnershipGraphRecord**, **ART-7-BeneficialOwnerSummary**, **ART-8-OwnershipGapReport**, updated **ART-5-DiscrepancyReport**

---

# PHASE 3 — Reasonable Measures and Discrepancy Determination  
**Maps to:** STEP-I-6 + STEP-I-7  

## Goal  
Determine whether sufficient steps were taken to confirm beneficial ownership and whether discrepancies are material.

## Preconditions  

- **ART-6-OwnershipGraphRecord** exists  
- **ART-7-BeneficialOwnerSummary** exists  

## Inputs  

1. **ART-6-OwnershipGraphRecord**  
2. **ART-7-BeneficialOwnerSummary**  
3. **ART-5-DiscrepancyReport**  
4. Evidence documents collected in prior phases (from Phase 0 packet + registry evidence)  
5. Jurisdictional policy configuration  
   - Source: Internal compliance rule engine  

## Processing  

- Assess structure complexity  
- Generate checklist of reasonable confirmation steps  
- Draft discrepancy summary  
- Draft recommendation  

AI is used for complexity scoring, checklist generation, and drafting review summary.  
AI does NOT determine materiality.

## Outputs (Artifacts Generated)

- **ART-9-ReasonableMeasuresChecklist**
- **ART-10-DiscrepancyMaterialityAssessmentDraft**
- Updated **ART-5-DiscrepancyReport**

## HITL (Critical Human Decision)

Human must determine:

- Whether reasonable measures are sufficient  
- Whether discrepancies are material  

Options:

1. Approve measures → Proceed to Phase 4  
2. Mark discrepancy as material → Escalate  
3. Reject onboarding  

## Subsystems  

1. **Artifact Generator: Reasonable Measures** (generates ART-9, ART-10, updates ART-5)  
   - Uses AI: Yes  
   - Input: ART-6, ART-7, ART-5 + policy configuration  
   - Output: **ART-9-ReasonableMeasuresChecklist**, **ART-10-DiscrepancyMaterialityAssessmentDraft**, updated **ART-5-DiscrepancyReport**

---

# PHASE 4 — Sanctions Screening and Tax Consistency  
**Maps to:** STEP-I-8 + STEP-I-9  

## Goal  
Screen all relevant parties and verify consistency of tax self-certifications.

## Preconditions  

- **ART-9-ReasonableMeasuresChecklist** approved  
- **ART-7-BeneficialOwnerSummary** confirmed  

## Inputs  

1. Parties list derived from:
   - **ART-2-EntitySnapshot**
   - **ART-7-BeneficialOwnerSummary**

2. Tax self-certification forms / answers  
   - Collected during: Upload Packet Step (Phase 0) and/or Questionnaire Step (Phase 0)  
   - Source: Phase 0 packet and Phase 0 questionnaire bundle  

3. Screening provider data  
   - Source: Sanctions/PEP/adverse media provider  

4. Known attributes from prior artifacts (**ART-2**, **ART-6**, **ART-7**)  

## Processing  

- Submit parties to screening provider  
- Analyze potential matches  
- Cross-check declared tax residency and classification against ownership structure and known data  
- Identify contradictions such as:
  - Declared no controlling persons but ownership shows >25% owner
  - Tax residency inconsistent with recorded addresses
  - FATCA classification inconsistent with entity structure  

AI assists in match explanation and contradiction detection.

## Outputs (Artifacts Generated)

- **ART-11-ScreeningResultsRecord**
- **ART-12-TaxConsistencyReport**
- Updated **ART-5-DiscrepancyReport** (if applicable)

## HITL  

Triggered for:

- Potential sanctions matches  
- Tax inconsistencies  

Options:

1. Confirm false positive → Update ART-11 and proceed  
2. Escalate → Route to compliance  
3. Reject  

## Subsystems  

1. Screening Connector  
   - Uses AI: No  
   - Input: Parties list  
   - Output: Raw screening results  

2. **Artifact Generator: Screening + Tax** (generates ART-11, ART-12, updates ART-5)  
   - Uses AI: Yes  
   - Input: Raw screening results + Phase 0 tax self-cert + ART-2/6/7  
   - Output: **ART-11-ScreeningResultsRecord**, **ART-12-TaxConsistencyReport**, updated **ART-5-DiscrepancyReport**

---

# PHASE 5 — Final Decision and Audit Package  
**Maps to:** STEP-I-13 + ART-23 Manifest  

## Goal  
Finalize onboarding outcome and generate audit-ready package.

## Preconditions  

- Phases 0–4 completed or escalated  

## Inputs  

- **ART-0** through **ART-12**  
- Final human decisions from Phases 3 and 4  

## Processing  

- Validate required artifacts exist  
- Generate final decision  
- Compile manifest of artifacts with timestamps and references  
- Generate export package  

AI may generate a narrative audit summary.

## Outputs (Artifacts Generated)

- **ART-13-FinalDecisionRecord**
- **ART-23-ManifestRecord**
- Complete onboarding export package  

## HITL  

Final approval required.

Options:

1. Approve → Ready for provisioning  
2. Escalate  
3. Reject  

## Subsystems  

1. Completeness Validator  
   - Uses AI: No  
   - Input: ART-0 through ART-12  
   - Output: Validation result  

2. Manifest Builder  
   - Uses AI: No  
   - Input: All artifact records  
   - Output: **ART-23-ManifestRecord**  

3. Audit Narrative Generator  
   - Uses AI: Yes  
   - Input: Full case history  
   - Output: Audit summary  

4. Export Service  
   - Uses AI: No  
   - Input: All artifacts  
   - Output: Final onboarding package  

---

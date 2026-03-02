# AI-Native Corporate Onboarding Workflow Specification (Workflow v2)

------------------------------------------------------------------------

# PHASE 0 --- Intake and Consent

**Maps to:** STEP-I-1

## Goal

Create an onboarding case, collect required disclosures and consent, and capture foundational corporation details.

## Preconditions

None.

## Inputs

1.  Product selection
    -   Controls:
        -   Corporate investment account
        -   Corporate cash account
        -   Both
    -   Collected during: Intake Form (Phase 0)
    -   Source: User interface
    -   Validation: Required selection
2.  Basic corporation details
    -   Controls:
        -   Legal name
        -   Jurisdiction of incorporation
        -   Corporation number (if known)
    -   Collected during: Intake Form (Phase 0)
    -   Source: User interface
    -   Validation: Legal name and jurisdiction required
3.  Consent to disclosures, privacy, and data use
    -   Collected during: Intake Form (Phase 0)
    -   Source: User interface
    -   Validation: All mandatory checkboxes must be accepted

## Processing

-   Create onboarding case record
-   Assign workflow state
-   Store consent version and timestamp

## Outputs (Artifacts Generated)

-   **ART-0-CaseRecord**
-   **ART-1-ConsentRecord**

## HITL

No HITL. Automatically proceeds to Phase 1.

## Subsystems

1.  Case Management Service
    -   Uses AI: No
    -   Input: Intake form data
    -   Output: ART-0-CaseRecord
2.  Consent Logging Service
    -   Uses AI: No
    -   Input: Consent confirmations
    -   Output: ART-1-ConsentRecord

------------------------------------------------------------------------

# PHASE 1 --- Entity Verification and Authority

**Maps to:** STEP-I-2 + STEP-I-3 (+ optionally STEP-C-2 + STEP-C-3)

## Goal

Verify legal existence of the corporation and determine authorized
signers.

## Preconditions

-   ART-0-CaseRecord exists
-   ART-1-ConsentRecord exists

## Inputs

1.  Certificate and/or Articles of Incorporation
    -   Requirement: At least one official incorporation document
        required
    -   Collected during: Entity Verification Upload Step (Phase 1)
    -   Source: User upload
2.  Registry record (retrieved via registry API where supported,
    otherwise uploaded as official government-issued extract)
    -   Collected during: Entity Verification Step (Phase 1)
    -   Source: Registry connector OR user upload
3.  Board resolution or signing authority document
    -   Requirement: Required if authority not evident in registry
    -   Collected during: Authority Verification Upload Step (Phase 1)
    -   Source: User upload
4.  Identification documents for authorized signers
    -   Collected during: Authority Verification Step (Phase 1)
    -   Source: User upload

## Processing

-   Extract corporation identity data
-   Extract directors and officers
-   Extract signing authority
-   Cross-check incorporation documents against registry record
-   Identify discrepancies

AI is used for document extraction and discrepancy detection.

## Outputs (Artifacts Generated)

-   **ART-2-EntitySnapshot**
-   **ART-3-AuthoritySummary**
-   **ART-4-RegistryEvidence**
-   **ART-5-DiscrepancyReport** (if applicable)

## HITL

Triggered when discrepancies or low-confidence fields exist.

Options:

1.  Accept extracted data → Proceed to Phase 2
2.  Edit and confirm → Store updated artifacts and proceed
3.  Request additional documentation → Pause workflow
4.  Escalate → Route to compliance

All actions logged.

## Subsystems

1.  Document Ingestion Service
    -   Uses AI: No
    -   Input: Uploaded documents
    -   Output: Normalized documents
2.  Document Extraction Engine
    -   Uses AI: Yes
    -   Input: Document text
    -   Output: Structured data for ART-2 and ART-3
3.  Registry Connector
    -   Uses AI: No
    -   Input: Corporation identifiers
    -   Output: Registry record
4.  Reconciliation Engine
    -   Uses AI: Yes
    -   Input: Extracted data + registry record
    -   Output: ART-5-DiscrepancyReport

------------------------------------------------------------------------

# PHASE 2 --- Ownership and Beneficial Ownership Graph

**Maps to:** STEP-I-4 + STEP-I-6

## Goal

Construct full ownership and control structure down to natural persons
and identify beneficial owners.

## Preconditions

-   ART-2-EntitySnapshot confirmed
-   ART-3-AuthoritySummary recorded

## Inputs

1.  Shareholder register or securities register
    -   Collected during: Ownership Disclosure Step (Phase 2)
    -   Source: User upload
2.  Organizational chart (if available)
    -   Collected during: Ownership Disclosure Step (Phase 2)
    -   Source: User upload
3.  Ownership-related registry filings (if available in jurisdiction),
    including:
    -   Registered shareholder list (if publicly accessible)
    -   Registered directors list
    -   Registered officers list
    -   Ultimate beneficial ownership (UBO) register (where applicable)
    -   Corporate structure filings
    -   Annual return filings containing ownership disclosures
    -   Trust declarations (if filed with registry)
    -   Collected during: Registry integration in Phase 2
    -   Source: Registry connector
4.  Ownership attestation answers
    -   Collected during: Ownership Questionnaire (Phase 2)
    -   Source: User questionnaire

## Processing

-   Extract ownership relationships
-   Identify entities vs natural persons
-   Build ownership/control graph
-   Trace ownership chains to natural persons
-   Detect missing links
-   Detect conflicting ownership percentages

AI is heavily used for extraction, graph construction, entity
resolution, and gap detection.

## Outputs (Artifacts Generated)

-   **ART-6-OwnershipGraphRecord**
-   **ART-7-BeneficialOwnerSummary**
-   **ART-8-OwnershipGapReport**
-   Updated **ART-5-DiscrepancyReport** (if applicable)

## HITL

Triggered when:

-   Ownership chains do not reach natural persons
-   Conflicting percentages exist
-   Trust or nominee complexity detected

Options:

1.  Confirm structure as accurate → Proceed to Phase 3
2.  Edit structure → Store updated ART-6 and proceed
3.  Request additional information → Pause workflow
4.  Escalate → Route to compliance

## Subsystems

1.  Ownership Extraction Engine
    -   Uses AI: Yes
    -   Input: Registers, org charts, registry filings
    -   Output: Structured ownership relationships
2.  Ownership Intelligence Engine
    -   Uses AI: Yes
    -   Input: Structured ownership relationships
    -   Output: ART-6-OwnershipGraphRecord, ART-8-OwnershipGapReport

------------------------------------------------------------------------

# PHASE 3 --- Reasonable Measures and Discrepancy Determination

**Maps to:** STEP-I-6 + STEP-I-7

## Goal

Determine whether sufficient steps were taken to confirm beneficial
ownership and whether discrepancies are material.

## Preconditions

-   ART-6-OwnershipGraphRecord exists
-   ART-7-BeneficialOwnerSummary exists

## Inputs

1.  ART-6-OwnershipGraphRecord
2.  ART-7-BeneficialOwnerSummary
3.  ART-5-DiscrepancyReport
4.  Evidence documents collected in prior phases
5.  Jurisdictional policy configuration
    -   Source: Internal compliance rule engine

## Processing

-   Assess structure complexity
-   Generate checklist of reasonable confirmation steps
-   Draft discrepancy summary
-   Draft recommendation

AI is used for complexity scoring, checklist generation, and drafting
review summary.
AI does NOT determine materiality.

## Outputs (Artifacts Generated)

-   **ART-9-ReasonableMeasuresChecklist**
-   **ART-10-DiscrepancyMaterialityAssessmentDraft**
-   Updated **ART-5-DiscrepancyReport**

## HITL (Critical Human Decision)

Human must determine:

-   Whether reasonable measures are sufficient
-   Whether discrepancies are material

Options:

1.  Approve measures → Proceed to Phase 4
2.  Request additional ownership information → Return to Phase 2
3.  Request additional confirmation evidence → Remain in Phase 3
4.  Mark discrepancy as material → Escalate
5.  Reject onboarding

## Subsystems

1.  Complexity Scoring Engine
    -   Uses AI: Yes
    -   Input: ART-6-OwnershipGraphRecord
    -   Output: Complexity rating
2.  Measures Planning Engine
    -   Uses AI: Yes
    -   Input: Ownership graph + jurisdictional policy
    -   Output: ART-9-ReasonableMeasuresChecklist
3.  Review Summary Generator
    -   Uses AI: Yes
    -   Input: Evidence + discrepancies
    -   Output: ART-10-DiscrepancyMaterialityAssessmentDraft

------------------------------------------------------------------------

# PHASE 4 --- Sanctions Screening and Tax Consistency

**Maps to:** STEP-I-8 + STEP-I-9

## Goal

Screen all relevant parties and verify consistency of tax
self-certifications.

## Preconditions

-   ART-9-ReasonableMeasuresChecklist approved
-   ART-7-BeneficialOwnerSummary confirmed

## Inputs

1.  Parties list derived from:
    -   ART-2-EntitySnapshot
    -   ART-7-BeneficialOwnerSummary
2.  Tax self-certification forms
    -   Collected during: Tax Questionnaire Step (Phase 4)
    -   Source: User questionnaire
3.  Screening provider data
    -   Source: Sanctions/PEP/adverse media provider
4.  Known attributes from prior artifacts (ART-2, ART-6, ART-7)

## Processing

-   Submit parties to screening provider
-   Analyze potential matches
-   Cross-check declared tax residency and classification against
    ownership structure and known data
-   Identify contradictions such as:
    -   Declared no controlling persons but ownership shows >25% owner
    -   Tax residency inconsistent with recorded addresses
    -   FATCA classification inconsistent with entity structure

AI assists in match explanation and contradiction detection.

## Outputs (Artifacts Generated)

-   **ART-11-ScreeningResultsRecord**
-   **ART-12-TaxConsistencyReport**
-   Updated **ART-5-DiscrepancyReport** (if applicable)

## HITL

Triggered for:

-   Potential sanctions matches
-   Tax inconsistencies

Options:

1.  Confirm false positive → Update ART-11 and proceed
2.  Request additional documentation → Remain in Phase 4
3.  Escalate → Route to compliance
4.  Reject

## Subsystems

1.  Party Expansion Service
    -   Uses AI: No
    -   Input: ART-2 and ART-7
    -   Output: Complete parties list
2.  Screening Connector
    -   Uses AI: No
    -   Input: Parties list
    -   Output: Raw screening results
3.  Match Explanation Engine
    -   Uses AI: Yes
    -   Input: Screening results + party attributes
    -   Output: Explained match assessment
4.  Tax Consistency Engine
    -   Uses AI: Yes
    -   Input: Tax self-cert data + ART-6 + ART-7
    -   Output: Updated ART-12-TaxConsistencyReport

------------------------------------------------------------------------

# PHASE 5 --- Final Decision and Audit Package

**Maps to:** STEP-I-13 + ART-23 Manifest

## Goal

Finalize onboarding outcome and generate audit-ready package.

## Preconditions

-   Phases 0--4 completed or escalated

## Inputs

-   ART-0 through ART-12
-   Final human decisions from Phases 3 and 4

## Processing

-   Validate required artifacts exist
-   Generate final decision
-   Compile manifest of artifacts with timestamps and references
-   Generate export package

AI may generate a narrative audit summary.

## Outputs (Artifacts Generated)

-   **ART-13-FinalDecisionRecord**
-   **ART-23-ManifestRecord**
-   Complete onboarding export package

## HITL

Final approval required.

Options:

1.  Approve → Ready for provisioning
2.  Escalate
3.  Reject

## Subsystems

1.  Completeness Validator
    -   Uses AI: No
    -   Input: ART-0 through ART-12
    -   Output: Validation result
2.  Manifest Builder
    -   Uses AI: No
    -   Input: All artifact records
    -   Output: ART-23-ManifestRecord
3.  Audit Narrative Generator
    -   Uses AI: Yes
    -   Input: Full case history
    -   Output: Audit summary
4.  Export Service
    -   Uses AI: No
    -   Input: All artifacts
    -   Output: Final onboarding package

------------------------------------------------------------------------

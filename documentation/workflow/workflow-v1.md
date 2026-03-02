# AI-Native Corporate Onboarding Workflow Specification

------------------------------------------------------------------------

# PHASE 0 --- Intake and Consent

**Maps to:** STEP-I-1

## Goal

Create an onboarding case, capture product intent, and collect required
disclosures and consent.

## Preconditions

None.

## Inputs

1.  Product selection:
    - Controls:
        - Account type:
            - Corporate investment account
            - Corporate cash account
            - Both
    -   Source: User interface
    -   Validation: Required selection
2.  Basic corporation details:
    - Controls:
        - Legal name 
        - Jurisdiction
        - Corporation number if known
    -   Source: User interface
    -   Validation: Legal name + jurisdiction required
3.  Consent to disclosures, privacy, data use
    -   Source: User interface
    -   Validation: All required checkboxes must be accepted

## Processing

-   Create onboarding case record
-   Assign workflow state
-   Store consent version and timestamp

## Outputs (Artifacts Generated)

-   **ART-0-CaseRecord**
-   **ART-1-ConsentRecord**
<!-- TODO-question: what is the point below for? -->
-   Initial task list (internal system record) Note

## HITL

No HITL, move directly to PHASE 1

## Subsystems

1.  Case Management Service
    -   Input: Form data
    -   Output: Case record (ART-0)
2.  Consent Logging Service
    -   Input: Consent confirmations
    -   Output: Consent artifact (ART-1)

------------------------------------------------------------------------

# PHASE 1 --- Entity Verification and Authority

**Maps to:** STEP-I-2 + STEP-I-3 (+ optionally STEP-C-2 + STEP-C-3)

## Goal

Verify that the corporation exists and determine who has authority to
bind and operate the account.

## Preconditions

-   Case created
-   Consent recorded

## Inputs

<!-- TODO-note: Input 1. below has "Source: User upload", but are not mentioned in inputs of PHASE 1, also "/" is ambiguous, we should use AND or OR and be more precise in our input requirements  -->
1.  Certificate / Articles of Incorporation
    -   Source: User upload
<!-- TODO-question: This is ambiguous, what's the difference between the two -->
2.  Registry profile or official registry result
    -   Source: Registry API or uploaded document
<!-- TODO-note: Input 3. below has "Source: User upload", but are not mentioned in inputs of PHASE 1, also "/" is ambiguous, we should use AND or OR and be more precise in our input requirements  -->
3.  Board resolution / mandate / signing authority document
    -   Source: User upload
<!-- TODO-note: Input 4. below has "Source: User upload", but are not mentioned in inputs of PHASE 1, also "/" is ambiguous, we should use AND or OR and be more precise in our input requirements  -->
4.  Identification for authorized signers
    -   Source: User upload

## Processing

-   Extract corporation identity data
-   Extract directors and officers
-   Extract signing authority information
-   Cross-check registry information against incorporation documents
-   Identify discrepancies

AI is used for document extraction and discrepancy detection.

## Outputs (Artifacts Generated)

-   **ART-2-EntitySnapshot**
-   **ART-3-AuthoritySummary**
-   **ART-4-RegistryEvidence**
-   **ART-5-DiscrepancyReport**

## HITL

Triggered when discrepancies or low-confidence fields exist.

Options:

1.  Accept extracted data → Proceed to Phase 2
2.  Edit and confirm → Store edited version; proceed
3.  Request additional documentation → Pause workflow
4.  Escalate to compliance → Route to analyst review

All human edits and approvals are logged.

## Subsystems

1.  Document Ingestion Service
    -   Input: Uploaded files
    -   Output: Normalized documents
2.  Document Extraction Engine
    -   Uses AI
    -   Input: Document text
    -   Output: Structured entity and authority data
3.  Registry Connector
    -   Input: Corporation identifiers
    -   Output: Official registry data
4.  Reconciliation Engine
    -   Uses AI
    -   Input: Extracted data + registry data
    -   Output: Discrepancy report (ART-5)

------------------------------------------------------------------------

# PHASE 2 --- Ownership and Beneficial Ownership Graph

**Maps to:** STEP-I-4 + STEP-I-6

## Goal

Construct a full ownership and control structure down to natural persons
and identify beneficial owners.

## Preconditions

-   Entity details verified
-   Authority summary recorded

## Inputs

<!-- TODO-note: Input 1. below has "Source: User upload", but are not mentioned in inputs of PHASE 1 + "/" is vague -->
1.  Shareholder register / securities register
    -   Source: User upload
<!-- TODO-note: Input 2. below has "Source: User upload", but are not mentioned in inputs of PHASE 1 -->
2.  Organizational chart (if available)
    -   Source: User upload
<!-- TODO-note: Input 3. below is vague as to what the details contain -->
3.  Registry ownership details (if available)
    -   Source: Registry connector
<!-- TODO-note: Input 2. below has "Source: User questionnaire", but are not mentioned in inputs of PHASE 1 -->
4.  Ownership attestation answers
    -   Source: User questionnaire

## Processing

-   Extract ownership relationships
-   Identify entities vs natural persons
-   Build ownership/control graph
-   Trace chains to natural persons
-   Detect missing links
-   Detect conflicting ownership percentages
-   Identify potential beneficial owners

AI is heavily used for extraction, graph construction, entity resolution, and gap detection.

## Outputs (Artifacts Generated)

-   **ART-6-OwnershipGraphRecord**\
-   **ART-7-BeneficialOwnerSummary**\
-   **ART-8-OwnershipGapReport**\
-   **ART-5-DiscrepancyReport**

## HITL

Triggered when:

-   Ownership chains do not reach natural persons
-   Conflicting percentages exist
-   Trust/nominee complexity detected

Options:

1.  Confirm structure as accurate → Proceed to Phase 3
2.  Edit structure → Updated graph stored; proceed
3.  Request additional information → Pause
4.  Escalate → Route to compliance

## Subsystems

1.  Ownership Extraction Engine
    -   Uses AI
    -   Input: Registers and org charts
    -   Output: Structured ownership relationships
<!-- TODO-note: 2, 3, and 4 can be under the same subsystem -->
<!-- TODO-note: we're missing complexity analysis here -->
2.  Graph Construction Service
    -   Uses AI
    -   Input: Ownership relationships
    -   Output: Ownership graph
3.  Completeness Analyzer
    -   Uses AI
    -   Input: Graph
    -   Output: Gap report (ART-8)
4.  Document Request Generator
    -   Uses AI
    -   Input: Gap analysis
    -   Output: Targeted document request list

------------------------------------------------------------------------

# PHASE 3 --- Reasonable Measures and Discrepancy Determination

**Maps to:** STEP-I-6 + STEP-I-7

## Goal

Determine whether sufficient steps were taken to confirm beneficial ownership and whether discrepancies are material.

## Preconditions

-   Ownership graph exists
-   Beneficial owner summary generated

## Inputs

1.  Ownership graph
2.  Beneficial owner summary
3.  Discrepancy report
4.  Evidence documents collected so far
<!-- TODO-question: what is the input below? -->
5.  Jurisdictional policy configuration

## Processing

-   Assess complexity of structure
-   Generate checklist of reasonable confirmation steps
-   Draft summary of discrepancies
-   Draft recommended course of action

AI is used for complexity scoring, checklist generation, and drafting a
review summary.

AI does NOT make the final materiality determination.

## Outputs (Artifacts Generated)

-   **ART-9-ReasonableMeasuresChecklist**\
-   **ART-10-DiscrepancyMaterialityAssessmentDraft**\
-   Updated **ART-5-DiscrepancyReport**

## HITL (Critical Human Decision)

Human must determine:

-   Whether reasonable measures are sufficient
-   Whether discrepancies are material

Options:

1.  Approve measures → Proceed to Phase 4
<!-- TODO-questions: Option 2 below should be more specific. Aren't all graph related requests handled in Phase 2? If so why do we need to route back there? Remaining in Phase 3 makes more sense to ask for documents unrelated to the graph sepcifically but related to complexity etc. Might make sense to split. -->
2.  Request additional measures → Return to Phase 2 or remain in Phase 3
3.  Mark discrepancy as material → Escalate
4.  Reject onboarding

## Subsystems

1.  Complexity Scoring Engine
    -   Uses AI
    -   Input: Ownership graph
    -   Output: Structure complexity rating
<!-- TODO-question: Not sure what susbsystem 2 does. What is the policy? What is the checklist like? Is it like a score of reasonable measure confident?-->
2.  Measures Planning Engine
    -   Uses AI: Yes
    -   Input: Graph + policy
    -   Output: Reasonable measures checklist
3.  Review Summary Generator
    -   Uses AI: Yes
    -   Input: Evidence + discrepancies
    -   Output: Draft assessment (ART-10)

------------------------------------------------------------------------

# PHASE 4 --- Sanctions Screening and Tax Consistency

**Maps to:** STEP-I-8 + STEP-I-9

## Goal

Screen all relevant parties and verify consistency of tax self-certifications.

## Preconditions

-   Reasonable measures approved
-   Beneficial owners identified

## Inputs

<!-- TODO-note: All inputs here and in all other steps should be normalized (added with the same name) and clearly mention the source AND mentioned in the source (e.g. PHASE 0 inputs, or PHASE 1 outputs) -->
1.  All parties list (entity, directors, officers, beneficial owners)
2.  Sanctions screening provider results
<!-- TODO-note: Where does this come from? -->
3.  Tax self-certification forms
<!-- TODO-note: this is too vague -->
4.  Known attributes from earlier phases

## Processing

-   Submit all parties to screening provider (outputs sanctions check, PEP screening, adverse media)
-   Analyze potential matches
<!-- TODO-question: Where do the tax claims come from, and what is the collected data and where does it come from? -->
-   Cross-check tax claims against collected data
<!-- TODO-note: we should be more specific about what contradictions there are -->
-   Identify contradictions

AI assists in match explanation and contradiction detection.

## Outputs (Artifacts Generated)

-   **ART-11-ScreeningResultsRecord**
-   **ART-12-TaxConsistencyReport**
-   Updated **ART-5-DiscrepancyReport**

## HITL

Triggered for:

-   Potential sanctions matches
-   Tax contradictions

Options:

1.  Confirm false positive and proceed
<!-- TODO-question: Where does this go back to? Or does it remain in same step? -->
2.  Request more documentation
3.  Escalate
4.  Reject

## Subsystems

1.  Party Expansion Service
    -   Input: Ownership graph
    -   Output: Full party list
2.  Screening Connector
    -   Input: Party list
    -   Output: Raw screening results
<!-- TODO-question: What is this? Why is it needed? -->
3.  Match Explanation Engine
    -   Uses AI
    -   Input: Screening results
    -   Output: Explained matches + confidence
4.  Tax Consistency Engine
    -   Uses AI
    -   Input: Self-cert data + known attributes
    <!-- TODO-note: In ALL outputs or inputs that reference an artifact, let's use the code e.g. "Update ART-*-XYZ" -->
    -   Output: Inconsistency report

------------------------------------------------------------------------

# PHASE 5 --- Final Decision and Audit Package

**Maps to:** STEP-I-13 + ART-23 Manifest

## Goal

Finalize onboarding outcome and generate an audit-ready package of all
steps and artifacts.

## Preconditions

-   All prior phases completed or escalated

## Inputs

<!-- TODO-note: let's be more specific here and specify the actual artifacts -->
-   All artifacts generated in Phases 0--4
-   Final human decisions

## Processing

-   Validate required artifacts exist
-   Generate final decision
-   Compile manifest of artifacts with timestamps and references
-   Generate export package

AI may generate a narrative audit summary.

## Outputs (Artifacts Generated)

-   **ART-23-ManifestRecord**
-   **ART-13-FinalDecisionRecord**
-   Complete onboarding package (export bundle)

## HITL

Final approval required.

Options:

1.  Approve → Ready for provisioning
<!-- TODO-question: this option is not very clear. what are the conditions? -->
2.  Approve with conditions
3.  Escalate
4.  Reject

## Subsystems

1.  Completeness Validator
    -   Uses AI: No
    -   Input: Artifact inventory
    -   Output: Missing artifact report
2.  Manifest Builder
    -   Uses AI: No
    -   Input: All artifact records
    -   Output: ART-23 manifest
3.  Audit Narrative Generator
    -   Uses AI: Yes
    -   Input: Entire case history
    -   Output: Plain-language audit summary
4.  Export Service
    -   Uses AI: No
    -   Input: All artifacts
    -   Output: Final onboarding package

------------------------------------------------------------------------

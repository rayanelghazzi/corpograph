# UI Flow Specification (ui-flow-v1)

> **Scope:** UI-only flow for a **two-role system**:
> - **Role A — Input Provider (external/user):** completes **Phase 0** only (single-step upload + questionnaires).
> - **Role B — Compliance Analyst (internal):** executes **Phases 1–5** inside an AI-native orchestration tool.
>
> **Design rule:** Mirror **Phases 0–5** exactly.  
> **Canonical fields:** Always refer to **PHASE X** names and **ART-* artifact codes** exactly.

---

## Shared Concepts (UI-Level)

### Case
A “Case” is the unit of work that moves through PHASE 0 → PHASE 5.

### Artifact Visibility
Artifacts (ART-*) are presented as:
- **Generated** (exists and viewable)
- **Generated with flags** (exists, but has warnings/discrepancies)
- **Missing** (expected but not available)

### Case Status (UI State)
- **DRAFT_INPUT** (Phase 0 not submitted)
- **READY_FOR_REVIEW** (Phase 0 submitted; analyst can start)
- **IN_REVIEW_PHASE_[1..5]**
- **BLOCKED_HITL** (awaiting analyst decision in current phase)
- **ESCALATED** (routed out of standard path)
- **REJECTED**
- **APPROVED**

### Standard UI Panels (conceptual, not components)
- **Case Header:** Case ID, current PHASE, status, last updated, assigned analyst
- **Artifact Index:** ART list with status (Generated/Flags/Missing), click to open
- **Evidence Viewer:** shows uploaded documents + extracted highlights (read-only to keep UI spec simple)
- **Decision Console:** shows decision options for HITL steps + required rationale text

---

# ROLE A — Input Provider Flow (External/User)

## PHASE 0 — Intake, Consent, and Single Upload Packet  
**Goal (UI):** Collect *all* inputs in a single submission so the analyst can complete PHASE 1–5 without requesting additional user input.

### Screen: “Submit Onboarding Packet” (Single Step)
**Entry condition:** User starts a new case OR returns to an existing DRAFT_INPUT case.  
**Primary action:** Submit once.

#### Required Sections (all completed in this screen)
1) **Intake Form**
- Product selection (Corporate investment / Corporate cash / Both)
- Basic corporation details (legal name, jurisdiction, corporation number if known)

2) **Consent**
- Disclosures + privacy + data use consent (must accept all required)

3) **Upload Packet**
Must include minimum:
- Incorporation doc(s): Certificate and/or Articles
- Authority evidence: Board resolution or signing authority doc
- Ownership evidence: Shareholder/securities register (or equivalent)
- Tax self-certification forms (CRS/FATCA as applicable)
- Identification for authorized signers
Optional:
- Organizational chart
- Registry record extract (if available)

4) **Questionnaire Bundle**
Must include:
- Ownership attestation answers
- Tax self-cert answers (if not provided as form)
- Additional declarations needed for later checks (e.g., trusts/nominees)

#### Validation (blocking)
- Missing any mandatory section → “Cannot submit” + show missing items list.

#### Submission Result (terminal for Role A)
On submit:
- Case transitions to **READY_FOR_REVIEW**
- User sees confirmation: “Submitted. No further action required unless contacted.”

### Loading / Error States (PHASE 0)
- **Uploading…** (progress indicator)
- **Submission failed** (retry)
- **File rejected** (unsupported type/too large) → user can remove/replace before resubmitting
- **Session expired** → save draft, re-authenticate, continue

---

# ROLE B — Compliance Analyst Flow (Internal)

> Analyst operates in an orchestration tool that mirrors PHASE 1–5.  
> Analyst never requests new user input inside this UI-flow version; if missing docs, the case is escalated/rejected rather than requesting more.

## Analyst Home
### Screen: “Case Queue”
Lists cases with:
- Status = READY_FOR_REVIEW / IN_REVIEW / BLOCKED_HITL / ESCALATED
- Current PHASE
- Priority / SLA (optional)
Analyst actions:
- Open case
- Assign to self
- Filter by PHASE / status

### Screen: “Case Overview”
Shows:
- Current PHASE and progress (0–5)
- Artifact Index (ART-0..ART-23 relevant subset)
- High-level flags (discrepancies, missing artifacts, potential matches)

Primary actions:
- “Start PHASE 1” (if READY_FOR_REVIEW)
- “Continue” (if already in review)
- “Escalate” (available at all times with rationale)
- “Reject” (available at all times with rationale)

---

# PHASE 1 — Entity Verification and Authority  
**Artifacts:** ART-2, ART-3, ART-4, ART-5

### Screen: “PHASE 1 — Entity & Authority Review”
**Entry condition:** Case is READY_FOR_REVIEW or coming from prior phase completion.  
**Auto-load (read-only):**
- Input packet (Phase 0 uploads + questionnaire)
- Registry record if available

**UI sections**
1) **Entity Summary (ART-2)**
- Display extracted entity data
- Show confidence flags and source references

2) **Authority Summary (ART-3)**
- Display authorized signers + authority basis

3) **Registry Evidence (ART-4)**
- Display registry record and key fields used

4) **Discrepancy Report (ART-5)**
- Shown only if discrepancies exist (or always shown as “none found”)

### HITL — Analyst Decision Console (PHASE 1)
Triggered when:
- Discrepancies exist OR key fields show low confidence

**Required input:** rationale text for non-trivial decisions (edit/esc/override).

Options:
1) **Accept extracted data**
- Effect: Lock PHASE 1 as complete → advance to PHASE 2

2) **Edit and confirm**
- Effect: Analyst edits displayed fields (inline edits) → lock updates → advance to PHASE 2  
- Audit note (UI-level): store “edited by analyst” + rationale

3) **Escalate**
- Effect: Case status → ESCALATED (terminal path in standard flow)
- Requires escalation reason

### Loading / Error States (PHASE 1)
- **Generating artifacts…** (ART-2/3/4/5 pending)
- **Registry unavailable** (treated as error): show banner; allow proceed only if Phase 0 included registry extract; otherwise force Escalate/Reject

---

# PHASE 2 — Ownership and Beneficial Ownership Graph  
**Artifacts:** ART-6, ART-7, ART-8, ART-5 (update)

### Screen: “PHASE 2 — Ownership Graph Review”
**Entry condition:** PHASE 1 complete.

**UI sections**
1) **Ownership Graph (ART-6)**
- Visual + list view (nodes/edges)
- Highlight:
  - Unknown owners
  - Unresolved chains to natural persons
  - Conflicting ownership percentages

2) **Beneficial Owner Summary (ART-7)**
- List of identified beneficial owners with rationale links into graph

3) **Ownership Gap Report (ART-8)**
- Explicit list of missing links / unresolved items

4) **Discrepancy Report (ART-5)**
- Updated with ownership-related discrepancies, if any

### HITL — Analyst Decision Console (PHASE 2)
Triggered when:
- ART-8 indicates gaps OR graph does not reach natural persons OR conflicts exist

Options:
1) **Confirm structure as accurate**
- Effect: Lock PHASE 2 complete → advance to PHASE 3

2) **Edit structure**
- Effect: Analyst edits graph elements (add/remove node/edge; adjust %; mark “unknown”) → re-render → lock → advance to PHASE 3  
- Requires rationale for structural edits

3) **Escalate**
- Effect: Case status → ESCALATED (terminal path in standard flow)

### Loading / Error States (PHASE 2)
- **Graph generating…** (ART-6 pending)
- **Graph failed to generate** → error banner + allow retry; if persistent, Escalate/Reject

---

# PHASE 3 — Reasonable Measures and Discrepancy Determination  
**Artifacts:** ART-9, ART-10, ART-5 (update)

### Screen: “PHASE 3 — Reasonable Measures Review”
**Entry condition:** PHASE 2 complete.

**UI sections**
1) **Reasonable Measures Checklist (ART-9)**
- Checklist items with status:
  - satisfied / not satisfied / not applicable
- Each item links to evidence references

2) **Materiality Assessment Draft (ART-10)**
- Draft summary of discrepancies and recommended action

3) **Discrepancy Report (ART-5)**
- Consolidated view across phases (entity + ownership + screening prep)

### HITL (Critical Human Decision) — Analyst Decision Console (PHASE 3)
Always required (this is the mandatory human gate).

Options:
1) **Approve measures**
- Effect: Lock PHASE 3 complete → advance to PHASE 4

2) **Mark discrepancy as material → Escalate**
- Effect: Case status → ESCALATED  
- Requires explanation of materiality

3) **Reject onboarding**
- Effect: Case status → REJECTED  
- Requires rejection reason (internal)

### Loading / Error States (PHASE 3)
- **Generating checklist…** (ART-9 pending)
- **Policy configuration missing** → error; Escalate (cannot proceed)

---

# PHASE 4 — Sanctions Screening and Tax Consistency  
**Artifacts:** ART-11, ART-12, ART-5 (update)

### Screen: “PHASE 4 — Screening & Tax Review”
**Entry condition:** PHASE 3 approved.

**UI sections**
1) **Screening Results (ART-11)**
- Per-party results:
  - clear / potential match / match
- Each party shows: match explanation summary + evidence references

2) **Tax Consistency Report (ART-12)**
- Flags and contradictions list
- Each item links to:
  - self-cert answers (Phase 0)
  - relevant ownership graph portions (ART-6/7)

3) **Discrepancy Report (ART-5)**
- Updated with screening/tax issues if applicable

### HITL — Analyst Decision Console (PHASE 4)
Triggered when:
- Any potential match / match exists OR tax inconsistencies exist

Options:
1) **Confirm false positive**
- Effect: Update ART-11 party status to “cleared by analyst” + rationale → remain in PHASE 4 until all issues cleared  
- When no remaining flags → allow “Complete PHASE 4” → advance to PHASE 5

2) **Escalate**
- Effect: Case status → ESCALATED

3) **Reject**
- Effect: Case status → REJECTED

### Loading / Error States (PHASE 4)
- **Screening in progress…** (ART-11 pending)
- **Provider error / timeout** → error banner + retry; if persistent, Escalate/Reject

---

# PHASE 5 — Final Decision and Audit Package  
**Artifacts:** ART-13, ART-23

### Screen: “PHASE 5 — Finalize & Export”
**Entry condition:** PHASE 4 complete (all flags cleared OR case escalated/rejected earlier).

**UI sections**
1) **Final Decision (ART-13) — Draft**
- Summary of outcome recommended by system (if any) and current state

2) **Manifest Preview (ART-23)**
- List of artifacts included:
  - ART-0, ART-1, ART-2, ART-3, ART-4, ART-5, ART-6, ART-7, ART-8, ART-9, ART-10, ART-11, ART-12, ART-13
- Each item clickable for review

3) **Export Package**
- “Generate export” / “Download export” actions

### HITL — Analyst Decision Console (PHASE 5)
Final approval required.

Options:
1) **Approve**
- Effect: Case status → APPROVED  
- Locks ART-13 and ART-23  
- Enables export download

2) **Escalate**
- Effect: Case status → ESCALATED

3) **Reject**
- Effect: Case status → REJECTED

### Loading / Error States (PHASE 5)
- **Generating manifest…** (ART-23 pending)
- **Export generation failed** → retry; if persistent, Escalate

---

## Terminal States (UI)
- **APPROVED** (export available)
- **REJECTED** (case closed; export availability depends on policy, but UI should show “internal record only”)
- **ESCALATED** (case handed off; standard phase flow stops)

---

## Notes on Normalization (UI)
- Always label phases as **PHASE 0..5** with the exact titles from the workflow doc.
- Always refer to artifacts as **ART-* codes** (never “the graph”, always “ART-6-OwnershipGraphRecord”).
- If an artifact is updated, label explicitly: “Updated ART-5-DiscrepancyReport”.

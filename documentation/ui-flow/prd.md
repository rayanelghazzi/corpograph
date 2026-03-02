# CorpGraph UI — Product Requirements Document

> **Version**: 2.0  
> **Scope**: Complete UI specification for the CorpGraph corporate onboarding orchestrator.  
> **Audience**: Implementation agent / frontend developer.  
> **Backend reference**: `documentation/system-design/backend-tdd.md` — all API endpoints, response shapes, and SSE protocol are defined there.  
> **Design reference**: Figma file `PUE7rLRT6eLxvSsczEONi6` — visual layout, component styling, and design system.

---

## 1. Overview

### 1.1 Product Summary

CorpGraph is an AI-native compliance workflow tool that enables analysts to onboard complex, multi-layered corporations. The UI has two roles:

- **Role A — Input Provider**: Submits a case with corporate documents and questionnaire answers (Phase 0 only).
- **Role B — Compliance Analyst**: Reviews AI-generated artifacts, resolves issues via chat, and makes human-gate decisions across Phases 1–5.

### 1.2 Design Principles

| Principle | Implication |
|-----------|-------------|
| Phase-driven navigation | The UI mirrors Phases 0–5 exactly. The analyst advances linearly. |
| Artifact-centric | Every piece of generated data is traceable to an ART-* code. |
| Chat as the edit surface | The analyst never edits data inline. All corrections go through the AI chat, which applies structured patches and regenerates artifacts. |
| API-annotated interactions | Every user action maps to a specific API call. This document annotates them. |
| Blocking issues gate progress | Proceed buttons are disabled when unresolved `error`-severity issues exist. |

### 1.3 Case Statuses (aligned with backend)

| Backend Status | Display Label | Badge Color |
|---------------|--------------|-------------|
| `DRAFT_INPUT` | Ready for Review | Yellow/Amber |
| `IN_REVIEW_1` | In Review | Yellow |
| `IN_REVIEW_2` | In Review | Yellow |
| `IN_REVIEW_3` | In Review | Yellow |
| `IN_REVIEW_4` | In Review | Yellow |
| `IN_REVIEW_5` | In Review | Yellow |
| `ESCALATED` | Escalated | Red |
| `REJECTED` | Rejected | Red |
| `APPROVED` | Approved | Green |

All status badges throughout the UI use the "Display Label" and "Badge Color" above. The raw backend enum is never shown to the user.

**Derived `current_phase`**: `DRAFT_INPUT` → 0, `IN_REVIEW_N` → N, terminal states → last active phase.

### 1.4 Phase Summary

| Phase | Name | Progress Bar Label | Key Artifacts | Human Gate |
|-------|------|--------------------|---------------|------------|
| 0 | Intake & Upload | — | ART-13 | None (submit only) |
| 1 | Entity Verification & Authority | Entity Verification | ART-1 through ART-7, ART-14* | Conditional (if discrepancies) |
| 2 | Ownership & Beneficial Ownership | Ownership Graph | ART-8, ART-14* | Conditional (if gaps/conflicts) |
| 3 | Reasonable Measures & Risk | Reasonable Measures | ART-9, ART-10, ART-12 | **Always required** (mandatory human gate) |
| 4 | Sanctions & Tax (stub) | Screening & Tax | ART-11, ART-15, ART-16 | Conditional |
| 5 | Finalization (stub) | Final Decision | ART-17–19, ART-21–23 | **Always required** (final approval) |

---

## 2. Information Architecture

### 2.1 Application Routes

| Route | Screen | Role |
|-------|--------|------|
| `/` | Landing / role selector | Both |
| `/submit` | Case submission form | Role A |
| `/submit/confirmation` | Submission confirmation | Role A |
| `/dashboard` | Case queue (analyst home) | Role B |
| `/cases/:id` | Case view (phase-driven) | Role B |

### 2.2 Artifact Visibility Model

Artifacts in the Artifacts Panel display one of three visual states via a status icon:

| State | Icon | Condition |
|-------|------|-----------|
| **Generated (clean)** | Green checkmark | Artifact exists, no related issues |
| **Generated (has issues)** | Red exclamation | Artifact exists but has related `error`-severity issues |
| **Current phase / pending** | Blue clock | Artifact belongs to the current phase and is being actively reviewed |

Current-phase artifacts also have a highlighted background (light amber/beige) to distinguish them from prior-phase artifacts.

---

## 3. Shared UI Framework

### 3.1 Case View Layout (Role B)

All Phase 1–5 screens share this layout. The content view changes per phase; the right sidebar and floating chat persist.

```
┌──────────────────────────────────────────────────────────────────┐
│  Case Header                                                     │
│  [← Back]  [Corp Name / Case ID]              [View Graph btn]  │
├──────────────────────────────────────────────────────────────────┤
│  Phase Progress Bar                                              │
│  (1)───(2)───(3)        (4)───(5)                               │
│  Entity    Ownership  Reasonable   Screening  Final              │
│  Verification  Graph  Measures     & Tax      Decision           │
├────────────────────────────────────┬─────────────────────────────┤
│                                    │                             │
│  Content View                      │  Right Sidebar              │
│  (scrollable, phase-specific       │                             │
│   content cards)                   │  ┌───────────────────────┐  │
│                                    │  │ Human Decision    [v] │  │
│                                    │  │ (collapsible section) │  │
│                                    │  │ action buttons +      │  │
│                                    │  │ descriptions          │  │
│                                    │  └───────────────────────┘  │
│                                    │  ┌───────────────────────┐  │
│                                    │  │ Artifacts         [v] │  │
│                                    │  │ (collapsible section) │  │
│                                    │  │ artifact list with    │  │
│                                    │  │ status icons + View   │  │
│                                    │  └───────────────────────┘  │
│                                    │                             │
└────────────────────────────────────┴─────────────────────────────┘
                                              ┌─────┐
                                              │ 💬  │  ← Chat FAB
                                              └─────┘
```

**Key layout points**:
- The right sidebar contains two **collapsible sections**: Human Decision and Artifacts (both with chevron toggles).
- Chat is NOT in the sidebar. It is a **floating popover** triggered by a FAB (floating action button) in the bottom-right corner.
- The "View Graph" button is in the **case header** (top-right), not in the Artifacts panel. Visible only when `current_phase >= 2`.
- The back arrow (←) in the case header navigates to `/dashboard`.

### 3.2 Case Header Component

| Element | Source | Notes |
|---------|--------|-------|
| Back arrow (←) | — | Navigates to `/dashboard` |
| Corporation name | `corporation_name` (or "Unnamed Case" if null) | Large, bold title |
| Case ID | `id` | Shown as subtitle, e.g. "Case ID: case-001" |
| View Graph button | — | Top-right. Visible only when `current_phase >= 2`. Opens Graph Visualization Modal (§7). |

### 3.3 Phase Progress Bar Component

Horizontal stepper showing phases 1–5. Each step shows:
- A numbered circle (filled/highlighted/dimmed based on state)
- A label below the number

| Phase | Label |
|-------|-------|
| 1 | Entity Verification |
| 2 | Ownership Graph |
| 3 | Reasonable Measures |
| 4 | Screening & Tax |
| 5 | Final Decision |

**Visual states**:
- **Completed**: Filled circle (dark). Connected to next step with a solid line.
- **Current**: Filled circle (dark), visually highlighted. Label is bold.
- **Not started**: Outlined circle (grey), dimmed label. Connected with a grey line.

**Visual grouping**: Phases 1–3 are visually grouped (connected line), then a gap, then phases 4–5 are grouped (connected line). This reflects the transition from full AI processing (1–3) to stub phases (4–5).

Populates from the `phases` object in `GET /api/cases/:id`.

### 3.4 Content Card Component

All content view cards follow a uniform structure:

| Element | Description |
|---------|-------------|
| **Title** | Card name as specified in each phase's Content View section |
| **Subtitle** | Artifact code the card represents, e.g. "ART-5" |
| **Body** | Structured data display (key-value pairs, lists, tables) |
| **Border** | Default: neutral (light grey). Error-severity issues: red dashed border. |
| **Assistive text** | Shown at bottom of cards with issues. Amber/yellow background. Explains how to use chat to resolve. |
| **Empty state** | Shown when data is absent or blocked. Orange exclamation icon + explanatory text. |

### 3.5 Decision Panel Component (Sidebar Section)

Collapsible section in the right sidebar, titled "Human Decision" with subtitle "Approve or escalate at decision gates".

| Element | Description |
|---------|-------------|
| **Action buttons** | Phase-specific (see each phase section). Primary button is filled/dark. Secondary is outlined. Destructive (Reject) is red filled. |
| **Button descriptions** | Each button has a brief description text below it explaining the action. |
| **Disabled state** | Proceed/Approve buttons are disabled when `issue_summary.blocking > 0` from `GET /api/cases/:id`. Show tooltip: "Resolve blocking issues before proceeding." |
| **Loading state** | After clicking an action, disable all buttons and show spinner until API responds. |

**Rationale input**: Not shown inline. When the analyst clicks Escalate or Reject, a **confirmation dialog** appears with:
- A textarea for rationale (required for Escalate and Reject, optional for Proceed and Approve).
- Confirm and Cancel buttons.
- For Reject: additional warning text "This action cannot be undone."

**API call for all decisions**: `POST /api/cases/:id/phases/:phase/decision`

```
Request:  { "decision": "<proceed|escalate|reject|approve>", "rationale": "<string>" }
Response: { "case_status": "<new_status>", "decision_recorded": true, "next_job": <JobSummary|null> }
```

**Post-decision behavior**:
- `proceed` → If `next_job` is returned, enter **Phase Processing** loading state (poll `GET /api/cases/:id` every 2s until `active_job` is null and status changes). Then load the new phase view.
- `escalate` / `reject` → Navigate to `/dashboard`. Show toast: "Case escalated" / "Case rejected".
- `approve` (Phase 5 only) → Stay on case view, show Approved terminal state.

### 3.6 Chat Floating Popover

The chat is a **floating popover panel** anchored to the bottom-right of the viewport. It is toggled by a circular FAB (chat icon).

**Closed state**: A circular FAB button with a chat/speech-bubble icon is fixed in the bottom-right corner of the case view.

**Open state**: Clicking the FAB opens a floating panel (roughly 400px wide × 450px tall) above the FAB position. The FAB icon changes to an X (close) icon.

**Popover layout**:
- **Header**: "AI Agent Chat" (title), "Ask questions or request clarifications" (subtitle), X close button.
- **Message area**: Scrollable list of messages, ordered chronologically.
- **Input area**: Fixed at bottom. Text input with placeholder "Ask the AI assistant..." and a send button (arrow icon).

**Message types**:

| Role | Visual |
|------|--------|
| `system` | Left-aligned, muted background. Auto-generated when phases complete. |
| `user` | Right-aligned, distinct "analyst" style. |
| `assistant` | Left-aligned. Shows timestamp below message. May contain patch metadata indicator. |

**Persistence**: The chat thread is per-case and persists across phases. Opening the popover always loads the full history.

**Loading chat history on popover open**:
```
GET /api/cases/:id/chat
→ { messages: [...] }
```

**Sending a message** (SSE streaming):
```
POST /api/cases/:id/chat
Request:  { "content": "<message text>" }
Response: SSE stream (Content-Type: text/event-stream)
```

**SSE event handling** (see backend-tdd.md §8 for full protocol):

| Event | UI Behavior |
|-------|-------------|
| `message_start` | Create a new assistant message bubble with empty content. Disable chat input. |
| `text_delta` | Append `delta` text to the assistant message bubble (streaming display). |
| `tool_call` | Show inline indicator in the message: "Modifying case data..." |
| `patches_applied` | **Refetch case data**: `GET /api/cases/:id`. Update all content cards, issue counts, and artifact list. Show inline indicator: "Updated [N] fields, regenerated [artifact codes]." |
| `message_end` | Finalize the message. Re-enable chat input. |
| `error` | Show error message in chat. Re-enable chat input. Allow retry. |

**Blocked state**: When `active_job` is not null (a phase job is running), disable chat input with placeholder text: "Chat unavailable while phase is processing..."

**Error from API** (409 `JOB_ACTIVE` or 409 `INVALID_STATE`): Show error toast; do not add a failed message to the chat.

### 3.7 Artifacts Panel Component (Sidebar Section)

Collapsible section in the right sidebar, titled "Artifacts" with subtitle "View and manage case artifacts".

**Data source on mount and after updates**:
```
GET /api/cases/:id/artifacts
→ { artifacts: [{ code, name, phase, generated_at }] }
```

**Layout**:
- Vertical list of artifact items, ordered by artifact code.
- Each item displays:
  - **Status icon** (left): green checkmark / blue clock / red exclamation (see §2.2)
  - **Artifact code** (bold, e.g. "ART-1")
  - **Artifact name** (below code, smaller text, e.g. "Corporate Identity Snapshot")
  - **"View" link** (right-aligned) → opens **Artifact Detail Modal** (§8)
- **Current-phase artifacts** have a highlighted background (light amber/beige) to distinguish them from completed prior-phase artifacts.
- Artifacts not yet generated are not shown in the list.

### 3.8 Phase Processing Loading State

Shown when a phase job is running (`active_job` is not null on `GET /api/cases/:id`).

**Behavior**:
1. Display a full-content-area loading overlay with spinner and message: "Processing Phase [N]... This may take a minute."
2. Poll `GET /api/cases/:id` every 2 seconds.
3. When `active_job` becomes null:
   - If case `status` has advanced (e.g. `IN_REVIEW_1` → `IN_REVIEW_2`): load the new phase's content view.
   - If job failed (check `active_job` was present then disappeared but status unchanged): show error banner with retry option.

### 3.9 Error Banner Component

Displayed at the top of the content view when an API error occurs.

| Error Code | Message | Action |
|------------|---------|--------|
| `JOB_ACTIVE` | "A phase job is currently running." | Wait / poll |
| `PRECONDITION_FAILED` | "Unresolved blocking issues prevent this action." | Highlight unresolved issues |
| `LLM_ERROR` | "AI processing failed. Please retry." | Retry button |
| `INTERNAL_ERROR` | "Something went wrong." | Retry button |

---

## 4. Role A — Input Provider Flow

### 4.1 Screen: Landing Page

**Route**: `/`

**Purpose**: Entry point. Allows the user to select their role.

**Layout**:
- App branding / logo
- Two cards:
  - "Submit Onboarding Packet" → navigates to `/submit`
  - "Analyst Dashboard" → navigates to `/dashboard`

No API calls on this screen.

---

### 4.2 Screen: Case Submission Form

**Route**: `/submit`

**Purpose**: Collect all Phase 0 inputs in a single multi-section form and submit the case.

**Layout**: Single-page form with the following sections, all visible (no wizard/stepper needed for hackathon scope):

#### Section 1: Intake Information

| Field | Type | Required | Maps to |
|-------|------|----------|---------|
| Account Type | Select: `corporate_chequing` / `corporate_investing` | Yes | `intake.account_type` |
| Entity Type | Select: `corporation` / `trust` / `partnership` | Yes | `intake.entity_type` |
| Service Model | Select: `OEO` / `managed` | No | `intake.service_model` |

#### Section 2: Account Intent

| Field | Type | Required | Maps to |
|-------|------|----------|---------|
| Account Purpose | Textarea | Yes | `account_intent.account_purpose` |
| Expected Monthly Volume | Number input | Yes | `account_intent.expected_monthly_volume` |
| Expected Transaction Types | Multi-select: `wire`, `eft`, `cheque`, `ach` | Yes | `account_intent.expected_transaction_types` |
| Funding Sources | Multi-select: `revenue`, `investment`, `loan`, `other` | Yes | `account_intent.funding_sources` |
| Counterparty Geographies | Multi-select / tag input (country codes) | Yes | `account_intent.counterparty_geographies` |

#### Section 3: Consent

| Field | Type | Required | Maps to |
|-------|------|----------|---------|
| Privacy Notice (read-only text block) | Display | — | — |
| I acknowledge and consent | Checkbox | Yes | `consent.acknowledged` |

`consent.privacy_notice_version` is hardcoded to `"1.0"` by the frontend.
`consent.consented_at` is set to the current ISO datetime at submission time.

#### Section 4: Document Upload

| Field | Type | Required |
|-------|------|----------|
| Upload area | Drag-and-drop or file picker. Accepts PDF only. Multiple files. Max 15 files. | At least 1 file required. |

Each uploaded file shows: filename, size, remove button.

**Client-side validation** (must pass before the upload step):
- File type must be PDF (`application/pdf`)
- At least 1 file present
- Max 15 files

#### Submission Flow (API sequence)

Submission is a multi-step API sequence triggered by the "Submit Case" button:

**Step 1 — Create Case**:
```
POST /api/cases
Body: {
  "intake": { ... },
  "account_intent": { ... },
  "consent": { "privacy_notice_version": "1.0", "acknowledged": true, "consented_at": "<ISO datetime>" }
}
→ 201: { "id": "<case_id>", "status": "DRAFT_INPUT", ... }
```
Store the returned `case_id` for subsequent calls.

**Step 2 — Upload Documents**:
```
POST /api/cases/:id/documents
Content-Type: multipart/form-data
Body: files=<File[]>
→ 201: { "documents": [...] }
```

**Step 3 — Trigger Phase 1 Processing**:
```
POST /api/cases/:id/phases/1/run
→ 202: { "job": { "id": "...", "type": "PHASE_1_RUN", "status": "queued" } }
```

**UI during submission**:
1. Disable the submit button, show progress indicator.
2. Execute Steps 1–3 sequentially.
3. If any step fails: show error message, allow retry. If Step 1 succeeded but Step 2/3 fails, store case_id and retry from the failed step.
4. On success of all steps: navigate to `/submit/confirmation`.

**Validation errors**:
- 422 from `POST /api/cases` → display field-level errors.
- 400 `UPLOAD_ERROR` from document upload → display "File upload failed" with reason.
- 422 from Phase 1 run (missing docs/fields) → should not happen if frontend validates, but display error if it does.

---

### 4.3 Screen: Submission Confirmation

**Route**: `/submit/confirmation`

**Purpose**: Confirm successful submission. Terminal screen for Role A.

**Layout**:
- Success icon / illustration
- Heading: "Onboarding Packet Submitted"
- Body: "Your case has been submitted for review. No further action is required unless you are contacted by the compliance team."
- Case reference number (the case ID, or a shortened version)
- Button: "Submit Another" → navigates back to `/submit`

No API calls on this screen.

---

## 5. Role B — Analyst Flow

### 5.1 Screen: Dashboard (Case Queue)

**Route**: `/dashboard`

**Purpose**: The analyst's home screen. Lists all cases in a table for review.

**Data source on mount**:
```
GET /api/cases
→ {
    cases: [{
      id, status, corporation_name, created_at, updated_at,
      current_phase, document_count, artifact_count, unresolved_issue_count
    }],
    counts: { total, draft, in_review, escalated, approved, rejected }
  }
```

#### Layout

**Header**:
- "CorpGraph" (title) / "AI-Native Corporate Onboarding Orchestrator" (subtitle)
- No action buttons in the header.

**Section title**: "Active Cases" / "Review and manage corporate onboarding cases"

**Case table**:

| Column | Source | Notes |
|--------|--------|-------|
| Company Name | `corporation_name` | Bold text. Show "Unnamed Case" if null. |
| Case ID | `id` | Monospace / grey text, truncated (e.g. first 8 chars or a short alias). |
| Product Type | `canonical_record.intake.account_type` | Mapped: `corporate_chequing` → "Cash", `corporate_investing` → "Investment". Note: the list endpoint does not return this directly; use "—" if unavailable from the list response, or extend the API. |
| Current Phase | `current_phase` | Display as "Phase N". |
| Status | `status` | Rendered as a colored badge per §1.3 mapping. |
| Last Updated | `updated_at` | Formatted date (e.g. "3/1/2026"). |
| Action | — | "Review →" button for all cases. Navigates to `/cases/:id`. |

**Summary counters** (displayed **below** the table as a row of cards):

| Counter | Source | Visual |
|---------|--------|--------|
| Total Cases | `counts.total` | Default |
| In Review | `counts.in_review` | — |
| Escalated | `counts.escalated` | — |
| Approved | `counts.approved` | — |

Each counter is a compact card showing the number (large) and label (small text below).

---

### 5.2 Screen: Case View

**Route**: `/cases/:id`

**Purpose**: The main analyst workspace. Renders the shared Case View Layout (§3.1) with phase-specific content.

**Data source on mount**:
```
GET /api/cases/:id
→ {
    id, status, corporation_name, created_at, updated_at, current_phase,
    canonical_record, active_job, phases, document_count, artifact_codes,
    issue_summary: { total, resolved, unresolved, blocking }
  }
```

**Routing logic on mount**:

1. If `active_job` is not null → show Phase Processing Loading State (§3.8). Poll until complete.
2. If `status` is terminal (`ESCALATED` / `REJECTED` / `APPROVED`) → render Terminal State View (§6).
3. Otherwise → render the phase-specific content view for `current_phase`.

**Case Header**: See §3.2.

**Phase Progress Bar**: See §3.3. Populates from `phases` object.

**Sidebar sections** load their data:
- Artifacts Panel: `GET /api/cases/:id/artifacts`
- Decision Panel: derived from `status`, `current_phase`, and `issue_summary`

**Chat popover**: Loads history from `GET /api/cases/:id/chat` when opened.

---

### 5.3 Phase 1 — Entity Verification & Authority

**Entry condition**: `status === "IN_REVIEW_1"`

**Phase title**: "Phase 1: Entity Verification and Authority"
**Phase subtitle**: "Review corporate identity, registry records, and signing authority"

**Additional data to fetch on mount**:
```
GET /api/cases/:id/issues?phase=1
→ { issues: [...], summary: { total, resolved, unresolved, blocking } }
```

#### Content View Cards

**Card 1: Discrepancies in Cross-Check with Registry Records**

| Property | Value |
|----------|-------|
| Title | "Discrepancies in Cross-Check with Registry Records" |
| Subtitle | "ART-5" |
| Border | Red dashed border if unresolved discrepancies exist, neutral otherwise |
| Visibility | Always shown |

**Data source**: `canonical_record.registry_crosscheck` from the case response.

**Body content**:
- If `registry_crosscheck.performed === false`: show message "Registry cross-check was not performed."
- If `registry_crosscheck.discrepancies` is empty: show "No discrepancies found." with a green checkmark.
- If discrepancies exist: for each discrepancy, render an **issue item** with:
  - Red exclamation icon (left)
  - **Field name** (bold, e.g. "Director name")
  - **Side-by-side comparison**:

    | Left Column Header | Right Column Header |
    |---|---|
    | Board Resolution | Registry Record |
    | `discrepancies[].extracted_value` | `discrepancies[].registry_value` |

  Each comparison is displayed in a two-column layout showing the conflicting values.

**Assistive text** (amber/yellow background, at bottom of card): "Use the AI chat to help resolve discrepancies. You can ask questions like 'Are these the same address?' or request clarification on specific fields."

---

**Card 2: Corporation Identity Data**

| Property | Value |
|----------|-------|
| Title | "Corporation Identity Data" |
| Subtitle | "ART-2" |
| Border | Default |

**Data source**: `canonical_record.subject_corporation`

**Body content** — two-column key-value grid:

| Label | Source |
|-------|--------|
| Legal Name | `subject_corporation.legal_name` |
| Jurisdiction | `subject_corporation.jurisdiction` |
| Registration Number | `subject_corporation.registration_number` |
| Incorporation Date | `subject_corporation.incorporation_date` |
| Registered Address | `subject_corporation.registered_address` |

Additional fields (`business_number`, `corporate_status`) shown if present.

---

**Card 3: Directors and Officers**

| Property | Value |
|----------|-------|
| Title | "Directors and Officers" |
| Subtitle | "ART-3" |
| Border | Default |

**Data source**: `canonical_record.directors`

**Body content** — table:

| Column | Source |
|--------|--------|
| Name | `directors[].full_name` |
| Role | `directors[].role` (formatted: "Director", "Officer", "Director & Officer") |
| Address | `directors[].address` (or "—") |
| Appointment Date | `directors[].appointment_date` (or "—") |

If the array is empty, show: "No data available"

---

**Card 4: Signing Authority**

| Property | Value |
|----------|-------|
| Title | "Signing Authority" |
| Subtitle | "ART-4" |
| Border | Default |

**Data source**: `canonical_record.authorized_signatories` + `canonical_record.authority_to_bind`

**Body content**:
- Text summary of authority status (e.g. "Board resolution and corporate authority documents have been verified. Authorized signers have been identified and documented.")
- If `authorized_signatories` is non-empty, render a table:

| Column | Source |
|--------|--------|
| Name | `authorized_signatories[].full_name` |
| Address | `authorized_signatories[].residential_address` |
| Occupation | `authorized_signatories[].occupation` (or "—") |
| Authority Limits | `authorized_signatories[].authority_limits` |

---

#### Decision Panel (Phase 1)

| Button | Style | Label | Description | Decision Value |
|--------|-------|-------|-------------|---------------|
| Primary | Filled dark | "Proceed to Beneficial Ownership" | "All artifacts are accurate and complete" | `proceed` |
| Secondary | Outlined | "Escalate to Compliance" | "Significant issues require senior review" | `escalate` |

Proceed is disabled when `issue_summary.blocking > 0`.

**API call**:
```
POST /api/cases/:id/phases/1/decision
Body: { "decision": "proceed", "rationale": "..." }
→ 200: { "case_status": "IN_REVIEW_2", "next_job": { ... } }
```

On `proceed`: the response includes `next_job` (Phase 2 job). Enter Phase Processing Loading State → poll until `IN_REVIEW_2` → load Phase 2 content.

On `escalate`: case becomes `ESCALATED`. Navigate to `/dashboard`.

---

### 5.4 Phase 2 — Ownership & Beneficial Ownership Graph

**Entry condition**: `status === "IN_REVIEW_2"`

**Phase title**: "Phase 2: Ownership and Beneficial Ownership Graph"
**Phase subtitle**: "Review ownership structure and identify beneficial owners"

**Additional data to fetch on mount**:
```
GET /api/cases/:id/issues?phase=2
GET /api/cases/:id/graph
```

#### Content View Cards

**Card 1: Ownership Gap & Discrepancy Report**

| Property | Value |
|----------|-------|
| Title | "Ownership Gap & Discrepancy Report" |
| Subtitle | "ART-8" |
| Border | Red dashed border if unresolved gaps or `error`-severity issues exist |
| Visibility | Always shown (if no gaps/issues, show "No ownership gaps identified" with green checkmark) |

**Data source**: `canonical_record.ownership_gaps` + issues from `GET /api/cases/:id/issues?phase=2`

**Body content** — for each ownership gap, render an **issue item**:

| Element | Source |
|---------|--------|
| Icon | Red/orange exclamation (left) |
| Entity name | `ownership_gaps[].entity_name` (bold) |
| Description | `ownership_gaps[].details` |
| Severity badge | Derived from matching issue's `severity` — displayed as a colored tag (e.g., "medium" in amber) |
| Recommendation box | Grey inset box with **"Recommendation:"** prefix and actionable suggestion text (e.g., "Request shareholder register for [Entity]"). Source: `issues[].description` or generated from gap data. |

**Assistive text** (amber background): "Use the AI chat to help resolve ownership gaps. Ask questions about the entity structure or request assistance in tracing ownership chains."

---

**Card 2: Ownership Graph**

| Property | Value |
|----------|-------|
| Title | "Ownership Graph" |
| Subtitle | "ART-6" |
| Border | Default |

**Data source**: `GET /api/cases/:id/graph`

**Body content**:
- If unresolved `error`-severity issues exist in Phase 2: show **empty/warning state** — orange exclamation icon centered, with text: "Please resolve ownership gaps before viewing the complete graph"
- If no blocking issues: render a compact preview of the graph (simplified node-edge diagram). The "View Graph" button in the case header opens the full **Graph Visualization Modal** (§7).
- If the graph endpoint returns 404: show "Ownership graph not yet generated."

---

**Card 3: Beneficial Ownership Summary**

| Property | Value |
|----------|-------|
| Title | "Beneficial Ownership Summary" |
| Subtitle | "ART-7" |
| Border | Default |

**Data source**: `canonical_record.beneficial_owners`

**Body content**:
- If unresolved `error`-severity issues exist in Phase 2: show **empty/warning state** — orange exclamation icon centered, with text: "Please resolve ownership gaps to identify all beneficial owners"
- If no blocking issues, render a table:

| Column | Source |
|--------|--------|
| Name | `beneficial_owners[].name` |
| Effective Ownership | `beneficial_owners[].effective_ownership_pct` (formatted as percentage) |
| Control Reasons | `beneficial_owners[].control_reasons` (as tag list) |

Below the table, show the ownership narrative:
- `canonical_record.ownership_narrative` — rendered as a paragraph of text.

---

#### Decision Panel (Phase 2)

| Button | Style | Label | Description | Decision Value |
|--------|-------|-------|-------------|---------------|
| Primary | Filled dark | "Proceed to Reasonable Measures" | "All artifacts are accurate and complete" | `proceed` |
| Secondary | Outlined | "Escalate to Compliance" | "Significant issues require senior review" | `escalate` |

Proceed is disabled when `issue_summary.blocking > 0`.

**API call**: `POST /api/cases/:id/phases/2/decision`

On `proceed`: response triggers Phase 3 job → Phase Processing Loading State → poll → `IN_REVIEW_3`.

On `escalate`: → `ESCALATED`, navigate to `/dashboard`.

---

### 5.5 Phase 3 — Reasonable Measures & Discrepancy Determination

**Entry condition**: `status === "IN_REVIEW_3"`

**Phase title**: "Phase 3: Reasonable Measures and Discrepancy Determination"
**Phase subtitle**: "Assess verification measures and determine materiality of discrepancies"

This is the **mandatory human gate**. The analyst must always make an explicit decision.

**Additional data to fetch on mount**:
```
GET /api/cases/:id/issues?resolved=true&severity=error
→ Resolved error-severity issues for the "Material Discrepancies Resolved" section
```

#### Content View Cards

**Card 1: Case Complexity & Material Discrepancy**

| Property | Value |
|----------|-------|
| Title | "Case Complexity & Material Discrepancy" |
| Subtitle | "ART-9, ART-10" |
| Border | Default |

**Data source**: `canonical_record.risk_assessment` + resolved error-severity issues + `canonical_record.risk_assessment.ai_recommendation`

**Body content** — this card contains three sub-sections:

*Sub-section 1: Complexity Score*
- Display prominently: `risk_assessment.complexity_score` as "N/10" with a progress bar visual.
- Below: explanatory text from `risk_assessment.rationale` (e.g. "Based on ownership layers, number of beneficial owners, and cross-jurisdictional elements").

*Sub-section 2: Material Discrepancies Resolved*
- Header: "Material Discrepancies Resolved"
- List of previously resolved `error`-severity issues. Each item shows:
  - Green checkmark icon (left)
  - Issue description text (`issues[].title` or `issues[].description`)
  - Two tags:
    - Materiality level tag (e.g. "Low Materiality" in yellow)
    - Status tag ("Resolved" in green)
- If no resolved errors: "No material discrepancies were identified."

*Sub-section 3: AI Recommendation*
- Distinct visual block (amber/yellow background with a sparkle/AI icon).
- Bold header: "AI Recommendation"
- Body: `risk_assessment.ai_recommendation` rendered as paragraph text.
- If `ai_recommendation` is null: "No recommendation generated."

---

**Card 2: Confirmation Steps**

| Property | Value |
|----------|-------|
| Title | "Confirmation Steps" |
| Subtitle | "ART-9" |
| Border | Default |

**Data source**: `canonical_record.confirmation_measures`

**Body content**:
- Header text: "Reasonable measures taken to confirm beneficial ownership accuracy"
- Checklist-style list. Each item displays:
  - Green checkmark icon (left)
  - Measure description: `confirmation_measures[].measure`
- Items are read-only (these are AI-generated confirmation steps, not interactive checkboxes).

---

**Card 3: Third-Party Determination**

| Property | Value |
|----------|-------|
| Title | "Third-Party Determination" |
| Subtitle | "ART-10" |
| Border | Red if `acting_on_behalf === true` and `grounds_for_suspicion` is present |

**Data source**: `canonical_record.third_party_determination`

**Body content**:

| Label | Source |
|-------|--------|
| Acting on Behalf | `third_party_determination.acting_on_behalf` (Yes/No badge) |
| Rationale | `third_party_determination.determination_rationale` |
| Third Party Name | `third_party_determination.third_party_details.name` (if applicable) |
| Relationship | `third_party_determination.third_party_details.relationship` (if applicable) |
| Grounds for Suspicion | `third_party_determination.grounds_for_suspicion` (if present, highlighted in red) |

---

**Card 4: Regulatory Context**

| Property | Value |
|----------|-------|
| Title | "Regulatory Context" |
| Subtitle | — |
| Border | Blue/indigo left border or full blue-tinted background |

**Data source**: Static content (hardcoded in the frontend).

**Body content** (blue-styled text):
> Under PCMLTFR s.138(2), reasonable measures to confirm beneficial ownership accuracy must be different from the measures used to obtain the information initially, and must scale with the complexity and assessed risk of the corporate structure.

This card provides regulatory context for the analyst's Phase 3 decision. The text is static and does not change per case.

---

#### Decision Panel (Phase 3)

This is the critical human gate. All three options are always available.

| Button | Style | Label | Description | Decision Value |
|--------|-------|-------|-------------|---------------|
| Primary | Filled dark | "Proceed to Sanctions Screening" | "Measures are sufficient, artifacts are accurate" | `proceed` |
| Secondary | Outlined | "Escalate to Compliance" | "Discrepancy is material, requires deeper examination" | `escalate` |
| Destructive | Filled red | "Reject Onboarding" | "Close case and reject onboarding" | `reject` |

**API call**: `POST /api/cases/:id/phases/3/decision`

On `proceed`: triggers Phase 4 stub job → processes near-instantly → `IN_REVIEW_4`.

On `escalate`: → `ESCALATED`, navigate to `/dashboard`.

On `reject`: → `REJECTED`, navigate to `/dashboard`. Confirmation dialog required.

---

### 5.6 Phase 4 — Sanctions Screening & Tax Consistency (Stub)

**Entry condition**: `status === "IN_REVIEW_4"`

**Phase title**: "Phase 4: Sanctions Screening and Tax Consistency"
**Phase subtitle**: "Review screening results and tax compliance"

Phase 4 is a backend stub — artifacts contain hardcoded placeholder data with a `"[STUB — not implemented for prototype]"` disclaimer. The UI should render the stub data faithfully.

**Additional data to fetch on mount**:
```
GET /api/cases/:id/artifacts/ART-11
GET /api/cases/:id/artifacts/ART-15
GET /api/cases/:id/artifacts/ART-16
```

#### Content View Cards

**Card 1: Sanctions Screening Results**

| Property | Value |
|----------|-------|
| Title | "Sanctions Screening" |
| Subtitle | "ART-11" |
| Border | Default (stub data should show "clear" results) |

**Data source**: `GET /api/cases/:id/artifacts/ART-11` → `data` field

**Body content**:
- Stub disclaimer banner at top: "This is simulated data for prototype purposes."
- Display the artifact `data` fields:

| Label | Source |
|-------|--------|
| Subjects Screened | `data.subjects_screened` (list) |
| Lists Used | `data.lists_used` (list) |
| Screened At | `data.screened_at` |
| Result | `data.result` (badge: clear=green, potential_match=amber, match=red) |

---

**Card 2: CRS/FATCA Self-Certification**

| Property | Value |
|----------|-------|
| Title | "Tax Self-Certification" |
| Subtitle | "ART-15" |
| Border | Default |

**Data source**: `GET /api/cases/:id/artifacts/ART-15` → `data` field

**Body content**:
- Stub disclaimer banner.

| Label | Source |
|-------|--------|
| Entity Classification | `data.entity_classification` |
| Tax Residencies | `data.tax_residencies` (list) |
| Entity TINs | `data.entity_TINs` (list) |
| Controlling Persons | `data.controlling_persons` (table: name, residency, TIN) |

---

**Card 3: Investing KYC Profile**

| Property | Value |
|----------|-------|
| Title | "Corporate KYC Profile" |
| Subtitle | "ART-16" |
| Border | Default |

**Data source**: `GET /api/cases/:id/artifacts/ART-16` → `data` field

**Body content**:
- Stub disclaimer banner.

| Label | Source |
|-------|--------|
| Nature of Business | `data.nature_of_business` |
| Financial Circumstances | `data.financial_circumstances` |
| Investment Objectives | `data.investment_objectives` |
| Risk Tolerance | `data.risk_tolerance` |
| Controllers (≥25%) | `data.controllers_25_percent` (table) |

---

#### Decision Panel (Phase 4)

| Button | Style | Label | Description | Decision Value |
|--------|-------|-------|-------------|---------------|
| Primary | Filled dark | "Proceed to Finalization" | "All screening and tax items cleared" | `proceed` |
| Secondary | Outlined | "Escalate to Compliance" | "Screening match or tax inconsistency requires review" | `escalate` |
| Destructive | Filled red | "Reject Onboarding" | "Close case and reject onboarding" | `reject` |

**API call**: `POST /api/cases/:id/phases/4/decision`

On `proceed`: triggers Phase 5 stub job → near-instant → `IN_REVIEW_5`.

---

### 5.7 Phase 5 — Finalization & Audit Package (Stub)

**Entry condition**: `status === "IN_REVIEW_5"`

**Phase title**: "Phase 5: Finalization and Audit Package"
**Phase subtitle**: "Review final decision and export audit package"

**Additional data to fetch on mount**:
```
GET /api/cases/:id/artifacts
(Full list needed for the manifest display)
```

#### Content View Cards

**Card 1: Final Decision Summary**

| Property | Value |
|----------|-------|
| Title | "Case Summary" |
| Subtitle | "ART-23" |
| Border | Default |

**Data source**: Compiled from `canonical_record` and `phases` from `GET /api/cases/:id`

**Body content**:

*Decision History table*:

| Phase | Decision | Decided At | Rationale |
|-------|----------|------------|-----------|
| 1 | `phases[1].decision` | `phases[1].decided_at` | From `canonical_record.phase_decisions[1].rationale` |
| 2 | ... | ... | ... |
| 3 | ... | ... | ... |
| 4 | ... | ... | ... |

*Key Case Data*:

| Label | Source |
|-------|--------|
| Corporation | `corporation_name` |
| Jurisdiction | `canonical_record.subject_corporation.jurisdiction` |
| Risk Level | `canonical_record.risk_assessment.risk_level` |
| Beneficial Owners | Count from `canonical_record.beneficial_owners` |
| Total Artifacts | `artifact_codes.length` |
| Total Issues Resolved | `issue_summary.resolved` |

---

**Card 2: Audit Package Manifest**

| Property | Value |
|----------|-------|
| Title | "Account Opening Package" |
| Subtitle | "ART-23" |
| Border | Default |

**Data source**: `GET /api/cases/:id/artifacts`

**Body content** — table of all generated artifacts:

| Column | Source |
|--------|--------|
| Code | `artifacts[].code` |
| Name | `artifacts[].name` |
| Phase | `artifacts[].phase` |
| Generated At | `artifacts[].generated_at` |
| View | Click → opens Artifact Detail Modal |

Each row is clickable to open the artifact.

Stub disclaimer banner for Phase 4–5 artifacts.

---

#### Decision Panel (Phase 5)

This is the final approval gate.

| Button | Style | Label | Description | Decision Value |
|--------|-------|-------|-------------|---------------|
| Primary | Filled dark | "Approve & Close" | "Approve onboarding, lock audit package" | `approve` |
| Secondary | Outlined | "Escalate to Compliance" | "Route to senior review" | `escalate` |
| Destructive | Filled red | "Reject Onboarding" | "Close case and reject onboarding" | `reject` |

**API call**: `POST /api/cases/:id/phases/5/decision`

On `approve`: case becomes `APPROVED`. Stay on case view, transition to Approved Terminal State (§6). Confirmation dialog: "This will approve the case and lock all artifacts. Continue?"

---

## 6. Terminal State Views

When a case reaches a terminal status, the Case View renders a read-only state. The layout is the same as §3.1, but:
- Decision Panel is replaced by a **Terminal Status Banner**.
- Chat popover is hidden (or shown as read-only history).
- Content View shows a summary.

### 6.1 Approved

**Banner**: Green background. "Case Approved" with checkmark icon and timestamp (`phases[5].decided_at`).

**Content View**: Render the Phase 5 content (Case Summary + Audit Package Manifest) as read-only. All artifacts are clickable for review.

### 6.2 Rejected

**Banner**: Red background. "Case Rejected" with X icon and timestamp.

**Body**: Display rejection rationale from `canonical_record.phase_decisions[N].rationale` (where N is the phase that triggered rejection).

**Content View**: Show a condensed summary of where the case was when rejected (phase, key issues).

### 6.3 Escalated

**Banner**: Amber background. "Case Escalated" with alert icon and timestamp.

**Body**: Display escalation rationale from `canonical_record.phase_decisions[N].rationale`.

**Content View**: Show a condensed summary similar to Rejected.

---

## 7. Graph Visualization Modal

**Trigger**: "View Graph" button in the case header (visible when `current_phase >= 2`).

**Data source**:
```
GET /api/cases/:id/graph
→ {
    nodes: [{ id, label, type, is_subject, is_beneficial_owner, effective_ownership_pct, jurisdiction }],
    edges: [{ id, source, target, type, ownership_pct, control_type, label }],
    metadata: { total_entities, total_relationships, beneficial_owner_count, has_gaps }
  }
```

### Layout

Centered modal (not full-screen) with:

**Header**: "Ownership & Control Graph" (title), "Visual representation of ownership structure" (subtitle), X close button (top-right).

**Graph area** (main area):
- Directed graph visualization (view-only).
- Layout: **Target corporation at top**, owners/controllers below. Ownership flows downward (target → intermediaries → individuals).
- View-only: no dragging or editing.

**Node rendering** — colored rectangles/boxes:

| Entity Type | Color | Label |
|-------------|-------|-------|
| Target corporation (`is_subject === true`) | Yellow/gold background | Entity name + "Corporation" type label |
| Natural person (`type === "individual"`) | Blue background | Entity name + "Person" type label |
| Corporate entity (`type === "corporation"`, not subject) | Red/coral background | Entity name + "Corporation" type label |
| Other (`trust`, `partnership`, `other`) | Purple/mauve background | Entity name + type label |

Each node displays:
- `label` (entity name) — bold text
- `type` label — subtitle text (e.g. "Corporation", "Person")
- Beneficial owner indicator: if `is_beneficial_owner === true`, show `effective_ownership_pct` on or near the node.

**Edge rendering**:
- Downward arrows from target to owners, labeled with ownership percentage (e.g. "↓ 45%").
- Edges with `ownership_pct: null` shown with "?" label.
- Control edges shown with a distinct style (dotted line) and `control_type` label.

**Color legend** (below the graph area):

| Swatch | Label |
|--------|-------|
| Yellow | Target Corporation |
| Blue | Natural Person |
| Red/coral or Purple | Corporate Entity |

**Footer**: "Close" button.

---

## 8. Artifact Detail Modal

**Trigger**: Click "View" on any artifact in the Artifacts Panel or the Audit Package Manifest table.

**Data source**:
```
GET /api/cases/:id/artifacts/:code
→ {
    code, name, phase, data, markdown,
    source_documents, generated_at
  }
```

### Layout

Modal with:

**Header**:
- Artifact code and name (e.g., "ART-1 — Corporate Identity Snapshot")
- Phase badge
- Generated at timestamp
- Source documents list: `source_documents[]` (displayed as tags, e.g., "DOC-1", "DOC-3")

**Body**:
- Render the `markdown` field as formatted Markdown (the backend pre-renders artifact data into readable Markdown).
- Scrollable content area.

**Footer**:
- Close button.

**404 handling**: If the artifact hasn't been generated yet, show "This artifact has not been generated yet" in the modal body.

---

## 9. Polling & Real-Time Update Strategy

### 9.1 Phase Job Polling

When `active_job` is present in the case response:

1. Show Phase Processing Loading State.
2. Poll `GET /api/cases/:id` every **2 seconds**.
3. Stop polling when `active_job` becomes `null`.
4. On status change: reload phase content.
5. If polling exceeds 120 seconds without completion: show "Processing is taking longer than expected. Please wait or refresh."

### 9.2 Post-Chat Refetch

After receiving a `patches_applied` SSE event:

1. Refetch `GET /api/cases/:id` (for canonical record, issue summary, artifact codes).
2. Refetch `GET /api/cases/:id/issues?phase=<current_phase>` (for updated issue list).
3. If `current_phase >= 2`: refetch `GET /api/cases/:id/graph` (if the graph card is visible).
4. Update all content cards with new data.

### 9.3 No Background Polling

Outside of active phase jobs, there is no background polling. The UI is single-user and does not need to watch for external updates.

---

## 10. API Integration Quick Reference

### 10.1 Case Lifecycle

| Action | Method | Endpoint | Request Body | Key Response Fields |
|--------|--------|----------|-------------|-------------------|
| Create case | POST | `/api/cases` | `{ intake, account_intent, consent }` | `id`, `status` |
| List cases | GET | `/api/cases?status=&search=` | — | `cases[]`, `counts` |
| Get case detail | GET | `/api/cases/:id` | — | `canonical_record`, `phases`, `active_job`, `issue_summary`, `artifact_codes` |
| Update intake | PATCH | `/api/cases/:id` | `{ intake?, account_intent?, consent? }` | Full case |

### 10.2 Documents

| Action | Method | Endpoint | Request Body | Key Response Fields |
|--------|--------|----------|-------------|-------------------|
| Upload documents | POST | `/api/cases/:id/documents` | `multipart/form-data` (`files`) | `documents[]` |
| List documents | GET | `/api/cases/:id/documents` | — | `documents[]` |

### 10.3 Phase Execution

| Action | Method | Endpoint | Request Body | Key Response Fields |
|--------|--------|----------|-------------|-------------------|
| Trigger phase run | POST | `/api/cases/:id/phases/:phase/run` | — | `job` |
| Submit decision | POST | `/api/cases/:id/phases/:phase/decision` | `{ decision, rationale? }` | `case_status`, `next_job` |

### 10.4 Data Retrieval

| Action | Method | Endpoint | Query Params | Key Response Fields |
|--------|--------|----------|-------------|-------------------|
| List artifacts | GET | `/api/cases/:id/artifacts` | `?phase=` | `artifacts[]` |
| Get artifact | GET | `/api/cases/:id/artifacts/:code` | — | `code`, `name`, `data`, `markdown`, `source_documents` |
| List issues | GET | `/api/cases/:id/issues` | `?phase=&resolved=&severity=` | `issues[]`, `summary` |
| Get graph | GET | `/api/cases/:id/graph` | — | `nodes[]`, `edges[]`, `metadata` |

### 10.5 Chat

| Action | Method | Endpoint | Request Body | Response |
|--------|--------|----------|-------------|----------|
| Get history | GET | `/api/cases/:id/chat` | — | `messages[]` |
| Send message | POST | `/api/cases/:id/chat` | `{ content }` | SSE stream |

### 10.6 SSE Events (from `POST /api/cases/:id/chat`)

| Event | Data Shape | UI Action |
|-------|-----------|-----------|
| `message_start` | `{ message_id }` | Create assistant message placeholder |
| `text_delta` | `{ delta }` | Append to assistant message |
| `tool_call` | `{ tool, patches, resolve_issue_ids }` | Show "Modifying data..." indicator |
| `patches_applied` | `{ patches_count, resolved_issue_ids, new_issue_ids, regenerated_artifacts }` | Refetch case, issues, and artifacts |
| `message_end` | `{ message_id }` | Finalize message, re-enable input |
| `error` | `{ code, message }` | Show error, re-enable input |

### 10.7 Error Codes

| Code | HTTP | Meaning | UI Handling |
|------|------|---------|-------------|
| `NOT_FOUND` | 404 | Resource missing | Show "not found" state |
| `VALIDATION_ERROR` | 422 | Bad input | Show field-level errors |
| `INVALID_STATE` | 409 | Wrong status for action | Show error toast |
| `JOB_ACTIVE` | 409 | Job already running | Disable action, show message |
| `PRECONDITION_FAILED` | 409 | Blocking issues unresolved | Disable proceed, highlight issues |
| `UPLOAD_ERROR` | 400 | File upload problem | Show upload error |
| `LLM_ERROR` | 502 | AI failed | Show retry option |
| `INTERNAL_ERROR` | 500 | Server error | Show generic error with retry |

# CorpoGraph — Backend Technical Design Document

> **Scope**: Full design for Phases 0–3. Stub endpoints for Phases 4–5.
> **Stack**: Next.js API routes · PostgreSQL · Prisma · OpenAI
> **Constraint**: Hackathon prototype — no auth, no multi-tenancy, no production error recovery.

---

## 1. Architecture

### 1.1 Monolith with 3 Internal Modules

Everything runs in a single Next.js process. The three modules are folders, not services.

| Module | Responsibility |
|--------|---------------|
| **Case Orchestrator** | Case lifecycle, phase state machine, job scheduling, decision gates, "one active job per case" invariant |
| **AI Engine** | Document extraction (Phase 1), ownership narrative (Phase 2), risk/measures assessment (Phase 3), chat-driven patch generation |
| **Graph Engine** | Builds ownership/control graph, computes effective ownership recursively, identifies UBOs (≥ 25%), detects gaps |

### 1.2 Data Flow

```
Documents + Questionnaire
       │
       ▼
  AI Engine ── extract ──▶ Canonical Record (JSONB)
                                 │
                                 ▼
                          Graph Engine ── compute ──▶ Canonical Record (updated)
                                                          │
                                                          ▼
                                                    Artifact Renderer ── derive ──▶ Artifacts (JSON + Markdown)
```

Chat-driven patches re-enter at the canonical record level and trigger artifact re-rendering for the current phase.

---

## 2. Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js + TypeScript |
| Framework | Next.js (API routes) |
| Database | PostgreSQL |
| ORM | Prisma |
| File storage | Local disk (`./data/uploads`), paths in DB |
| LLM | OpenAI API (GPT-4o) |
| PDF extraction | `pdf-parse` |
| Job queue | Postgres-backed (`jobs` table + in-process async runner) |

---

## 3. Data Model

### 3.1 Database Tables

#### `cases`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `status` | text | See §3.3 |
| `corporation_name` | text | Nullable; set after Phase 1 extraction |
| `canonical_record` | jsonb | See §3.2 |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `documents`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `case_id` | uuid | FK → cases |
| `filename` | text | Original filename |
| `storage_path` | text | Path on disk |
| `doc_kind` | text | Optional classification |
| `size_bytes` | integer | |
| `uploaded_at` | timestamptz | |

#### `artifacts`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `case_id` | uuid | FK → cases |
| `artifact_code` | text | e.g. `"ART-1"` |
| `name` | text | Human-readable name |
| `phase` | integer | Phase that generated it |
| `data` | jsonb | Structured JSON matching artifact-spec fields |
| `markdown` | text | Rendered markdown for display |
| `source_documents` | text[] | Document IDs used as source |
| `generated_at` | timestamptz | |

Unique index: `(case_id, artifact_code)` — upsert on regeneration.

#### `issues`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `case_id` | uuid | FK → cases |
| `phase` | integer | Phase that detected it |
| `type` | text | `missing_field` · `conflict` · `graph_gap` · `registry_discrepancy` · `sum_mismatch` · `other` |
| `severity` | text | `error` (blocks proceed) · `warning` (informational) |
| `title` | text | Short label |
| `description` | text | Detailed explanation |
| `field_path` | text | Canonical record JSON path (nullable) |
| `resolved` | boolean | Default `false` |
| `resolved_at` | timestamptz | |
| `resolution_note` | text | |
| `created_at` | timestamptz | |

#### `chat_messages`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `case_id` | uuid | FK → cases |
| `role` | text | `user` · `assistant` · `system` |
| `content` | text | |
| `metadata` | jsonb | Patch summary, regenerated artifacts, resolved issues |
| `created_at` | timestamptz | |

Single thread per case; messages ordered by `created_at`.

#### `patch_log`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `case_id` | uuid | FK → cases |
| `chat_message_id` | uuid | FK → chat_messages (the triggering user message) |
| `patches` | jsonb | Array of patch operations applied |
| `canonical_snapshot_before` | jsonb | Optional: snapshot for rollback/audit |
| `created_at` | timestamptz | |

#### `jobs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `case_id` | uuid | FK → cases |
| `type` | text | `PHASE_1_RUN` … `PHASE_5_RUN` |
| `status` | text | `queued` · `running` · `succeeded` · `failed` |
| `error` | text | Error message if failed |
| `started_at` | timestamptz | |
| `completed_at` | timestamptz | |
| `created_at` | timestamptz | |

---

### 3.2 Canonical Record Schema

The canonical record is the single source of truth for all case data. Stored as JSONB in `cases.canonical_record`. Fields are `undefined` / absent until their phase populates them. All artifacts are deterministic projections of this record.

```typescript
interface CanonicalRecord {

  // ═══ Phase 0: Intake ═════════════════════════════════

  intake: {
    account_type: 'corporate_chequing' | 'corporate_investing';
    entity_type: 'corporation' | 'trust' | 'partnership';
    service_model?: 'OEO' | 'managed';
  };

  account_intent: {
    account_purpose: string;
    expected_monthly_volume: number;
    expected_transaction_types: string[];
    funding_sources: string[];
    counterparty_geographies: string[];
  };

  consent: {
    privacy_notice_version: string;
    consented_at: string;           // ISO datetime
    acknowledged: boolean;
  };

  // ═══ Phase 1: Entity Verification & Authority ════════

  subject_corporation: {
    legal_name: string;
    jurisdiction: string;
    registration_number: string;
    registered_address: string;
    incorporation_date: string;     // ISO date
    business_number?: string;
    corporate_status?: 'active' | 'dissolved' | 'amalgamated' | 'unknown';
  };

  directors: Array<{
    id: string;
    full_name: string;
    role: 'director' | 'officer' | 'director_and_officer';
    address?: string;
    date_of_birth?: string;         // ISO date
    appointment_date?: string;      // ISO date
  }>;

  authorized_signatories: Array<{
    id: string;
    full_name: string;
    residential_address: string;
    date_of_birth?: string;
    occupation?: string;
    authority_limits: string;
    verification_method?: string;
  }>;

  authority_to_bind: {
    resolution_date?: string;
    scope_of_authority: string;
    authorized_person_ids: string[];  // references authorized_signatories[].id
    document_ref?: string;            // document ID
  };

  registry_crosscheck: {
    performed: boolean;
    source?: string;
    discrepancies: Array<{
      id: string;
      field: string;
      extracted_value: string;
      registry_value: string;
      resolved: boolean;
      resolution_note?: string;
    }>;
  };

  // ═══ Phase 2: Ownership & Structure ══════════════════
  //
  // Phase 1 extraction populates initial entities and
  // ownership_relationships from documents. Phase 2
  // validates, extends, and computes derived fields.

  entities: Array<{
    id: string;
    type: 'corporation' | 'individual' | 'trust' | 'partnership' | 'other';
    name: string;
    jurisdiction?: string;
    is_subject: boolean;
  }>;

  ownership_relationships: Array<{
    id: string;
    owner_entity_id: string;        // FK → entities[].id
    owned_entity_id: string;         // FK → entities[].id
    ownership_pct: number | null;    // null = unknown
    source?: string;                 // document ID or "questionnaire"
  }>;

  control_relationships: Array<{
    id: string;
    controller_entity_id: string;
    controlled_entity_id: string;
    control_type: string;            // e.g. "voting_rights", "board_control", "agreement"
    source?: string;
  }>;

  // Computed by Graph Engine during Phase 2
  beneficial_owners: Array<{
    entity_id: string;               // FK → entities[].id (always type=individual)
    name: string;
    effective_ownership_pct: number;
    control_reasons: string[];       // e.g. ["ownership >= 25%", "board_control"]
    ownership_paths: string[][];     // each path is an ordered list of entity IDs from owner → subject
  }>;

  ownership_gaps: Array<{
    entity_id: string;               // the entity with the gap
    entity_name: string;
    gap_type: 'missing_pct' | 'sum_not_100' | 'unknown_owner';
    details: string;
    total_known_pct?: number;        // for sum_not_100: the known total
  }>;

  ownership_narrative: string;       // LLM-generated natural language summary

  // ═══ Phase 3: Reasonable Measures & Risk ═════════════

  confirmation_measures: Array<{
    measure: string;                 // description of the confirmation step
    source: string;                  // what was consulted
    result: string;                  // outcome
  }>;

  third_party_determination: {
    acting_on_behalf: boolean;
    determination_rationale: string;
    third_party_details?: {
      name: string;
      relationship: string;
    };
    grounds_for_suspicion?: string;
  };

  risk_assessment: {
    complexity_score: number;        // 1–10
    risk_score: number;              // 1–100
    risk_level: 'low' | 'medium' | 'high';
    risk_factors: string[];
    rationale: string;
    enhanced_measures_required: boolean;
    ai_recommendation?: string;      // LLM-generated recommendation for Phase 3 decision
  };

  // ═══ Phase Decisions (populated by analyst actions) ══

  phase_decisions: Record<number, {
    decision: 'proceed' | 'escalate' | 'reject' | 'approve';
    decided_at: string;
    rationale?: string;
  }>;
}
```

### 3.3 Case Status State Machine

**Valid status values**:

`DRAFT_INPUT` · `IN_REVIEW_1` · `IN_REVIEW_2` · `IN_REVIEW_3` · `IN_REVIEW_4` · `IN_REVIEW_5` · `ESCALATED` · `APPROVED` · `REJECTED`

**Transitions**:

```
DRAFT_INPUT ──[Phase 1 job succeeds]──▶ IN_REVIEW_1
IN_REVIEW_1 ──[decide: proceed]──▶ Phase 2 job ──▶ IN_REVIEW_2
IN_REVIEW_2 ──[decide: proceed]──▶ Phase 3 job ──▶ IN_REVIEW_3
IN_REVIEW_3 ──[decide: proceed]──▶ Phase 4 stub ──▶ IN_REVIEW_4
IN_REVIEW_4 ──[decide: proceed]──▶ Phase 5 stub ──▶ IN_REVIEW_5
IN_REVIEW_5 ──[decide: approve]──▶ APPROVED

Any IN_REVIEW_N ──[decide: escalate]──▶ ESCALATED
IN_REVIEW_3+ ──[decide: reject]──▶ REJECTED
```

**During phase processing**: The case status remains at its current value. The `active_job` field in API responses signals that a job is in progress. Status transitions only when the job succeeds.

**`current_phase` derivation**:

| Status | `current_phase` |
|--------|-----------------|
| `DRAFT_INPUT` | `0` |
| `IN_REVIEW_N` | `N` |
| Terminal (`ESCALATED` / `APPROVED` / `REJECTED`) | Last active phase before terminal |

---

## 4. Phase Execution

Each phase runs as a background job via the in-process async runner. The Case Orchestrator enforces: **one active job per case at any time**.

### 4.1 Phase 0 — Intake

**No background job** — synchronous via API calls.

| Step | Action | Writes to |
|------|--------|-----------|
| 1 | `POST /api/cases` — create case | `cases` row in `DRAFT_INPUT` |
| 2 | `POST /api/cases/:id/documents` — upload PDFs (repeatable) | `documents` rows + files on disk |
| 3 | `PATCH /api/cases/:id` — set intake / questionnaire fields | `canonical_record.intake`, `.account_intent`, `.consent` |

**Artifacts generated**: ART-13 (Privacy Consent Record) — created synchronously when consent fields are set.

### 4.2 Phase 1 — Entity Verification & Authority

**Trigger**: `POST /api/cases/:id/phases/1/run`

**Preconditions** (422 if unmet):
- Status is `DRAFT_INPUT`
- ≥ 1 document uploaded
- `intake`, `account_intent`, `consent` present in canonical record

**Pipeline** (job type `PHASE_1_RUN`):

**Step P1.1 — Build document context pack**

For each uploaded PDF: extract text via `pdf-parse`. Assign sequential labels `DOC-1`, `DOC-2`, … based on upload order. Bundle all document texts together with the questionnaire answers from the canonical record.

**Step P1.2 — LLM extraction**

Single LLM call. Input: document context pack. Output: structured JSON matching Phase 1 canonical record fields.

The LLM extracts:
- `subject_corporation` — identity fields
- `directors` — director/officer list with IDs
- `authorized_signatories` — signatory details
- `authority_to_bind` — resolution/mandate info
- `entities` — initial entity list (subject corp + any entities mentioned in documents)
- `ownership_relationships` — initial ownership edges from shareholder registers, articles, etc.
- `account_intent` — refinements if documents contain relevant information

Each extracted value carries a source reference (`DOC-N`).

**Step P1.3 — Registry cross-check (simulated)**

Compare extracted `subject_corporation` fields against a hardcoded mock registry. Populate `canonical_record.registry_crosscheck.discrepancies`. Create an `issues` row (type: `registry_discrepancy`, severity: `error`) for each discrepancy.

**Step P1.4 — Issue detection**

Scan the canonical record for missing required fields → create `issues` (type: `missing_field`). Detect conflicts between document sources → create `issues` (type: `conflict`).

**Step P1.5 — Artifact generation**

Render from canonical record: **ART-1**, **ART-2**, **ART-3**, **ART-4**, **ART-5**, **ART-6**, **ART-7**. Conditionally: **ART-14** if registry discrepancies were found.

**Step P1.6 — Status transition**

Set `cases.corporation_name` from `canonical_record.subject_corporation.legal_name`. Job → `succeeded`. Case → `IN_REVIEW_1`.

Insert a `system` chat message: summary of extraction results and any issues found.

### 4.3 Phase 2 — Beneficial Ownership & Structure

**Trigger**: Phase 1 decision = `proceed` (via decision endpoint).

**Preconditions** (409 if unmet):
- Status is `IN_REVIEW_1`
- No unresolved `error`-severity issues

**Pipeline** (job type `PHASE_2_RUN`):

**Step P2.1 — Build graph**

Read `entities`, `ownership_relationships`, `control_relationships` from the canonical record. Construct a directed graph in memory: nodes = entities, edges = ownership/control links.

**Step P2.2 — Compute effective ownership**

Recursive propagation through ownership chains. For each individual entity, compute effective ownership of the subject corporation. When multiple paths exist, sum the path products. Example: if A owns 60% of B, and B owns 100% of Subject, then A's effective ownership = 60%.

**Step P2.3 — Identify beneficial owners**

Filter: individuals with effective ownership ≥ 25% or significant control (board control, agreement-based control). Write to `canonical_record.beneficial_owners`.

**Step P2.4 — Detect gaps**

For each owned entity: if sum of all owners' percentages ≠ 100%, flag as `sum_not_100`. For each relationship with `ownership_pct: null`, flag as `missing_pct`. Write to `canonical_record.ownership_gaps`. Create `issues` for each gap (type: `graph_gap`, severity: `error`).

**Step P2.5 — Generate ownership narrative (LLM)**

Input: graph data, beneficial owners, gaps. Output: natural-language narrative describing the ownership structure. Write to `canonical_record.ownership_narrative`.

**Step P2.6 — Artifact generation**

Render: **ART-8**. Conditionally: **ART-14** if new discrepancies surfaced.

**Step P2.7 — Status transition**

Job → `succeeded`. Case → `IN_REVIEW_2`. Insert `system` chat message with graph summary.

### 4.4 Phase 3 — Reasonable Measures & Risk

**Trigger**: Phase 2 decision = `proceed`.

**Preconditions** (409 if unmet):
- Status is `IN_REVIEW_2`
- No unresolved `error`-severity issues

**Pipeline** (job type `PHASE_3_RUN`):

**Step P3.1 — Build decision context**

Full canonical record + all issues (resolved and unresolved) + all artifacts generated so far + hardcoded policy snippets (reasonable measures guidance text).

**Step P3.2 — LLM assessment**

Single LLM call. Input: decision context. Output:

- `confirmation_measures[]` — checklist of reasonable measures to confirm BO accuracy
- `third_party_determination` — analysis of whether the entity acts on behalf of a third party
- `risk_assessment` — complexity score, risk rating, risk factors, rationale, and an `ai_recommendation` for the analyst's Phase 3 decision

All written to canonical record.

**Step P3.3 — Artifact generation**

Render: **ART-9**, **ART-10**, **ART-12**.

**Step P3.4 — Status transition**

Job → `succeeded`. Case → `IN_REVIEW_3`. Insert `system` chat message with risk summary and recommendation.

### 4.5 Phases 4–5 (Stubs)

**Phase 4** (Sanctions & Tax): When triggered by Phase 3 `proceed`, immediately generates stub artifacts (**ART-11**, **ART-15**, **ART-16**) with realistic but hardcoded placeholder data and a `"[STUB — not implemented for prototype]"` disclaimer. Transitions to `IN_REVIEW_4`.

**Phase 5** (Finalization): When triggered by Phase 4 `proceed`, immediately generates stub artifacts (**ART-17**, **ART-18**, **ART-19**, **ART-21**, **ART-22**, **ART-23**). Transitions to `IN_REVIEW_5`.

These complete near-instantly (no LLM calls).

---

## 5. Chat-Driven Patching

### 5.1 Overview

Chat is a single persistent thread per case. The analyst sends natural-language instructions; the LLM interprets them as structured patch operations on the canonical record, applies them, and re-renders affected artifacts. This is the core "AI-native" interaction: the human directs, the system edits structured truth and re-derives documentation.

### 5.2 Patch Format

```typescript
interface PatchOperation {
  op: 'add' | 'update' | 'remove';
  path: string;       // dot-notation path in canonical record (e.g. "entities", "subject_corporation.legal_name")
  value?: any;         // required for add/update
  index?: number;      // for targeting a specific array element by index
}
```

Examples:

| Instruction | Patch |
|-------------|-------|
| "Add John Doe as a 60% owner of HoldingCo" | `{ op: "add", path: "ownership_relationships", value: { id: "or-4", owner_entity_id: "e3", owned_entity_id: "e2", ownership_pct: 60 } }` |
| "Fix the legal name to SubjectCo Incorporated" | `{ op: "update", path: "subject_corporation.legal_name", value: "SubjectCo Incorporated" }` |
| "Remove the third director" | `{ op: "remove", path: "directors", index: 2 }` |

### 5.3 Execution Flow

1. User sends message → `POST /api/cases/:id/chat`
2. Save user message to `chat_messages`
3. Build LLM context:
   - System prompt (explains the analyst role, current phase, available patch operations, canonical record structure)
   - Current `canonical_record` (full)
   - Current unresolved `issues`
   - Chat history (last 20 messages)
   - User's new message
4. Call LLM in **tool-calling** mode with the `apply_patches` tool available
5. **Stream** the LLM's natural-language response to the client via SSE
6. If the LLM invokes `apply_patches`:
   a. Validate patches against canonical record structure
   b. Apply patches atomically to `cases.canonical_record`
   c. Resolve specified issues (`resolved = true`, `resolved_at = now()`)
   d. Re-detect issues (some may be auto-resolved by the data change; new ones may emerge)
   e. Re-render all artifacts for the current phase
   f. Write to `patch_log`
   g. Emit `patches_applied` SSE event to client
7. Save assistant message to `chat_messages` with metadata

### 5.4 LLM Tool Definition

```typescript
{
  name: "apply_patches",
  description: "Apply structured changes to the onboarding case data based on the analyst's instructions. Only call this when the user is asking to modify, add, or remove data.",
  parameters: {
    type: "object",
    properties: {
      patches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            op: { type: "string", enum: ["add", "update", "remove"] },
            path: { type: "string" },
            value: {},
            index: { type: "number" }
          },
          required: ["op", "path"]
        }
      },
      resolve_issue_ids: {
        type: "array",
        items: { type: "string" },
        description: "IDs of issues that this change resolves"
      }
    },
    required: ["patches"]
  }
}
```

### 5.5 Constraints

- Chat is **blocked** while a phase job is running (return `409 JOB_ACTIVE`)
- Each patch is logged for auditability
- The LLM is instructed to only modify fields relevant to the current and prior phases

---

## 6. Artifact Pipeline

### 6.1 Storage Model

Each artifact stores **both** structured JSON (`data` column, matching artifact-spec field definitions) and rendered markdown (`markdown` column). Artifacts are upserted on `(case_id, artifact_code)`.

### 6.2 Phase → Artifact Mapping

| Phase | Artifacts Generated |
|-------|--------------------|
| 0 | ART-13 |
| 1 | ART-1, ART-2, ART-3, ART-4, ART-5, ART-6, ART-7, ART-14* |
| 2 | ART-8, ART-14* |
| 3 | ART-9, ART-10, ART-12 |
| 4 (stub) | ART-11, ART-15, ART-16 |
| 5 (stub) | ART-17, ART-18, ART-19, ART-21, ART-22, ART-23 |

*ART-14 is conditional on discrepancy detection. ART-20 excluded from prototype.

### 6.3 Canonical → Artifact Derivation Map

| Artifact | Source Fields in `canonical_record` |
|----------|-------------------------------------|
| ART-1 | `subject_corporation` |
| ART-2 | `subject_corporation.legal_name`, `consent` |
| ART-3 | `directors` |
| ART-4 | `authority_to_bind`, `authorized_signatories` |
| ART-5 | `authorized_signatories` |
| ART-6 | `authorized_signatories` (stub — no real signatures) |
| ART-7 | `account_intent` |
| ART-8 | `entities`, `ownership_relationships`, `control_relationships`, `beneficial_owners`, `ownership_gaps`, `ownership_narrative` |
| ART-9 | `confirmation_measures` |
| ART-10 | `third_party_determination` |
| ART-12 | `risk_assessment` |
| ART-13 | `consent` |
| ART-14 | `registry_crosscheck.discrepancies` |

### 6.4 Regeneration Trigger

Artifacts for the **current phase** are regenerated whenever:
1. A phase job completes (initial generation)
2. A chat-driven patch modifies any source field listed in §6.3

---

## 7. API Contract

### 7.1 Conventions

| Convention | Value |
|------------|-------|
| Base path | `/api` |
| Content-Type | `application/json` (except file uploads: `multipart/form-data`) |
| IDs | UUID v4 strings |
| Timestamps | ISO 8601 with timezone: `2026-03-02T14:30:00Z` |
| Authentication | None |
| Polling interval | 2–3 seconds for job completion checks |

### 7.2 Common Response Types

```typescript
type CaseStatus =
  | 'DRAFT_INPUT'
  | 'IN_REVIEW_1' | 'IN_REVIEW_2' | 'IN_REVIEW_3'
  | 'IN_REVIEW_4' | 'IN_REVIEW_5'
  | 'ESCALATED' | 'APPROVED' | 'REJECTED';

type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

type IssueSeverity = 'error' | 'warning';
type IssueType = 'missing_field' | 'conflict' | 'graph_gap'
               | 'registry_discrepancy' | 'sum_mismatch' | 'other';

type Decision = 'proceed' | 'escalate' | 'reject' | 'approve';
type ChatRole = 'user' | 'assistant' | 'system';

interface JobSummary {
  id: string;
  type: string;
  status: JobStatus;
  created_at: string;
  error?: string;
}

interface PhaseInfo {
  status: 'not_started' | 'processing' | 'in_review' | 'completed';
  started_at?: string;
  completed_at?: string;
  decision?: Decision;
  decided_at?: string;
}
```

---

### 7.3 Cases

#### `POST /api/cases` — Create a new case

**Request body**:

```json
{
  "intake": {
    "account_type": "corporate_chequing",
    "entity_type": "corporation",
    "service_model": "OEO"
  },
  "account_intent": {
    "account_purpose": "Operating account for day-to-day business",
    "expected_monthly_volume": 50000,
    "expected_transaction_types": ["wire", "eft"],
    "funding_sources": ["revenue", "investment"],
    "counterparty_geographies": ["CA", "US"]
  },
  "consent": {
    "privacy_notice_version": "1.0",
    "acknowledged": true
  }
}
```

**Response `201`**:

```json
{
  "id": "a1b2c3d4-...",
  "status": "DRAFT_INPUT",
  "corporation_name": null,
  "created_at": "2026-03-02T14:30:00Z"
}
```

---

#### `GET /api/cases` — List all cases

**Query params**:

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status (optional) |
| `search` | string | Search by corporation name (optional) |

**Response `200`**:

```json
{
  "cases": [
    {
      "id": "a1b2c3d4-...",
      "status": "IN_REVIEW_1",
      "corporation_name": "SubjectCo Inc.",
      "created_at": "2026-03-02T14:30:00Z",
      "updated_at": "2026-03-02T15:00:00Z",
      "current_phase": 1,
      "document_count": 5,
      "artifact_count": 7,
      "unresolved_issue_count": 2
    }
  ],
  "counts": {
    "total": 10,
    "draft": 2,
    "in_review": 5,
    "escalated": 1,
    "approved": 1,
    "rejected": 1
  }
}
```

---

#### `GET /api/cases/:id` — Get full case details

This is the primary endpoint for the case view. Returns the full canonical record and all derived metadata.

**Response `200`**:

```json
{
  "id": "a1b2c3d4-...",
  "status": "IN_REVIEW_2",
  "corporation_name": "SubjectCo Inc.",
  "created_at": "2026-03-02T14:30:00Z",
  "updated_at": "2026-03-02T16:00:00Z",
  "current_phase": 2,
  "canonical_record": { },
  "active_job": null,
  "phases": {
    "1": {
      "status": "completed",
      "started_at": "2026-03-02T14:40:00Z",
      "completed_at": "2026-03-02T14:42:00Z",
      "decision": "proceed",
      "decided_at": "2026-03-02T14:50:00Z"
    },
    "2": {
      "status": "in_review",
      "started_at": "2026-03-02T14:50:00Z",
      "completed_at": "2026-03-02T14:52:00Z"
    },
    "3": { "status": "not_started" },
    "4": { "status": "not_started" },
    "5": { "status": "not_started" }
  },
  "document_count": 5,
  "artifact_codes": ["ART-1", "ART-2", "ART-3", "ART-4", "ART-5", "ART-6", "ART-7", "ART-8", "ART-13"],
  "issue_summary": {
    "total": 5,
    "resolved": 3,
    "unresolved": 2,
    "blocking": 1
  }
}
```

**Notes**:
- `active_job` is non-null when a phase job is `queued` or `running`. The UI should poll this endpoint every 2–3s when `active_job` is present to detect completion.
- `canonical_record` is the full record as defined in §3.2. Use it to populate all content view cards.
- `phases` is server-computed from case status, job history, and decision records.

---

#### `PATCH /api/cases/:id` — Update intake fields

**Constraint**: Only allowed when status is `DRAFT_INPUT`.

**Request body** (partial — only fields being updated):

```json
{
  "intake": { "account_type": "corporate_investing" },
  "account_intent": { "account_purpose": "Updated purpose..." }
}
```

**Response `200`**: Same shape as `GET /api/cases/:id`.

---

### 7.4 Documents

#### `POST /api/cases/:id/documents` — Upload documents

**Constraint**: Only allowed when status is `DRAFT_INPUT`. Max 15 documents per case.

**Request**: `Content-Type: multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `files` | File[] | One or more PDF files |
| `doc_kind` | string | Optional classification (applied to all files in this upload) |

**Response `201`**:

```json
{
  "documents": [
    {
      "id": "d1e2f3a4-...",
      "filename": "articles_of_incorporation.pdf",
      "doc_kind": null,
      "size_bytes": 245000,
      "uploaded_at": "2026-03-02T14:35:00Z"
    }
  ]
}
```

---

#### `GET /api/cases/:id/documents` — List documents

**Response `200`**:

```json
{
  "documents": [
    {
      "id": "d1e2f3a4-...",
      "filename": "articles_of_incorporation.pdf",
      "doc_kind": null,
      "size_bytes": 245000,
      "uploaded_at": "2026-03-02T14:35:00Z"
    }
  ]
}
```

---

### 7.5 Phase Execution & Decisions

#### `POST /api/cases/:id/phases/:phase/run` — Trigger phase execution

**Path params**: `phase` — integer `1`–`5`.

**Request body**: None.

**Response `202`**:

```json
{
  "job": {
    "id": "j1k2l3m4-...",
    "type": "PHASE_1_RUN",
    "status": "queued",
    "created_at": "2026-03-02T14:40:00Z"
  }
}
```

**Preconditions** (returns `409` or `422` on failure):

| Phase | Required status | Additional checks |
|-------|----------------|-------------------|
| 1 | `DRAFT_INPUT` | ≥ 1 document uploaded; `intake`, `account_intent`, `consent` present |
| 2–5 | — | Not called directly. Triggered by the decision endpoint. Returns `409 INVALID_STATE`. |

**Re-run**: If a Phase 1 job previously `failed`, the endpoint creates a new job (the old one stays as `failed`).

---

#### `POST /api/cases/:id/phases/:phase/decision` — Submit analyst decision

**Path params**: `phase` — integer `1`–`5`.

**Request body**:

```json
{
  "decision": "proceed",
  "rationale": "All discrepancies resolved, artifacts verified."
}
```

**Response `200`**:

```json
{
  "case_status": "IN_REVIEW_2",
  "decision_recorded": true,
  "next_job": {
    "id": "j2k3l4m5-...",
    "type": "PHASE_2_RUN",
    "status": "queued"
  }
}
```

**Behavior by decision**:

| Decision | Effect | `next_job` |
|----------|--------|-----------|
| `proceed` | Records decision → triggers next phase job | Job summary |
| `escalate` | Records decision → status → `ESCALATED` | `null` |
| `reject` | Records decision → status → `REJECTED` | `null` |
| `approve` | Records decision → status → `APPROVED` (Phase 5 only) | `null` |

**Validation**:

| Condition | Error |
|-----------|-------|
| Status ≠ `IN_REVIEW_N` for the given phase | `409 INVALID_STATE` |
| `proceed` with unresolved `error`-severity issues | `409 PRECONDITION_FAILED` |
| `reject` on Phase 1 or 2 | `422 VALIDATION_ERROR` |
| `approve` on any phase except 5 | `422 VALIDATION_ERROR` |
| Active job running | `409 JOB_ACTIVE` |

---

### 7.6 Artifacts

#### `GET /api/cases/:id/artifacts` — List artifacts

**Query params**:

| Param | Type | Description |
|-------|------|-------------|
| `phase` | integer | Filter by generating phase (optional) |

**Response `200`**:

```json
{
  "artifacts": [
    {
      "code": "ART-1",
      "name": "Corporate Identity Snapshot",
      "phase": 1,
      "generated_at": "2026-03-02T14:45:00Z"
    },
    {
      "code": "ART-8",
      "name": "Beneficial Ownership & Structure",
      "phase": 2,
      "generated_at": "2026-03-02T15:10:00Z"
    }
  ]
}
```

---

#### `GET /api/cases/:id/artifacts/:code` — Get single artifact

**Path params**: `code` — artifact code, e.g. `ART-1`.

**Response `200`**:

```json
{
  "code": "ART-1",
  "name": "Corporate Identity Snapshot",
  "phase": 1,
  "data": {
    "legal_name": "SubjectCo Incorporated",
    "jurisdiction": "Ontario",
    "registration_number": "1234567",
    "registered_address": "123 Bay St, Toronto, ON",
    "incorporation_date": "2015-06-15",
    "verification_source": "Ontario Business Registry",
    "verified_at": "2026-03-02T14:45:00Z",
    "document_hash": "sha256:abc123..."
  },
  "markdown": "# ART-1 — Corporate Identity Snapshot\n\n| Field | Value |\n|---|---|\n| Legal Name | SubjectCo Incorporated |\n| Jurisdiction | Ontario |\n...",
  "source_documents": ["DOC-1", "DOC-3"],
  "generated_at": "2026-03-02T14:45:00Z"
}
```

**`404`** if artifact has not been generated yet.

---

### 7.7 Issues

#### `GET /api/cases/:id/issues` — List issues

**Query params**:

| Param | Type | Description |
|-------|------|-------------|
| `phase` | integer | Filter by detecting phase (optional) |
| `resolved` | boolean | Filter by resolution status (optional) |
| `severity` | string | `error` or `warning` (optional) |

**Response `200`**:

```json
{
  "issues": [
    {
      "id": "i1j2k3l4-...",
      "phase": 1,
      "type": "registry_discrepancy",
      "severity": "error",
      "title": "Legal name mismatch",
      "description": "Extracted 'SubjectCo Inc' but registry shows 'SubjectCo Incorporated'",
      "field_path": "subject_corporation.legal_name",
      "resolved": false,
      "resolved_at": null,
      "resolution_note": null,
      "created_at": "2026-03-02T14:45:00Z"
    }
  ],
  "summary": {
    "total": 5,
    "resolved": 3,
    "unresolved": 2,
    "blocking": 1
  }
}
```

---

### 7.8 Chat

#### `GET /api/cases/:id/chat` — Get chat history

**Response `200`**:

```json
{
  "messages": [
    {
      "id": "m1n2o3p4-...",
      "role": "system",
      "content": "Phase 1 review started. I extracted data from 5 documents and found 2 discrepancies that need resolution.",
      "created_at": "2026-03-02T14:45:00Z",
      "metadata": null
    },
    {
      "id": "m2n3o4p5-...",
      "role": "user",
      "content": "The legal name should be 'SubjectCo Incorporated' per the registry.",
      "created_at": "2026-03-02T14:50:00Z",
      "metadata": null
    },
    {
      "id": "m3n4o5p6-...",
      "role": "assistant",
      "content": "I've updated the legal name to 'SubjectCo Incorporated' and resolved the registry discrepancy.",
      "created_at": "2026-03-02T14:50:05Z",
      "metadata": {
        "patches_applied": 1,
        "artifacts_regenerated": ["ART-1", "ART-2"],
        "issues_resolved": ["i1j2k3l4-..."]
      }
    }
  ]
}
```

---

#### `POST /api/cases/:id/chat` — Send message (SSE streaming response)

**Request body**:

```json
{
  "content": "Add John Doe as a 60% owner of HoldingCo and mark the ownership gap as resolved."
}
```

**Response**: `200` with `Content-Type: text/event-stream`. See §8 for full SSE protocol.

**Preconditions**:

| Condition | Error |
|-----------|-------|
| Status is not `IN_REVIEW_N` | `409 INVALID_STATE` |
| Active job running | `409 JOB_ACTIVE` |

---

### 7.9 Graph

#### `GET /api/cases/:id/graph` — Get ownership graph for visualization

**Response `200`**:

```json
{
  "nodes": [
    {
      "id": "e1",
      "label": "SubjectCo Inc.",
      "type": "corporation",
      "is_subject": true,
      "is_beneficial_owner": false,
      "effective_ownership_pct": null,
      "jurisdiction": "Ontario"
    },
    {
      "id": "e2",
      "label": "HoldingCo Ltd.",
      "type": "corporation",
      "is_subject": false,
      "is_beneficial_owner": false,
      "effective_ownership_pct": null,
      "jurisdiction": "BC"
    },
    {
      "id": "e3",
      "label": "John Doe",
      "type": "individual",
      "is_subject": false,
      "is_beneficial_owner": true,
      "effective_ownership_pct": 60,
      "jurisdiction": null
    },
    {
      "id": "e4",
      "label": "Jane Smith",
      "type": "individual",
      "is_subject": false,
      "is_beneficial_owner": true,
      "effective_ownership_pct": 40,
      "jurisdiction": null
    }
  ],
  "edges": [
    {
      "id": "o1",
      "source": "e2",
      "target": "e1",
      "type": "ownership",
      "ownership_pct": 100,
      "control_type": null,
      "label": "100%"
    },
    {
      "id": "o2",
      "source": "e3",
      "target": "e2",
      "type": "ownership",
      "ownership_pct": 60,
      "control_type": null,
      "label": "60%"
    },
    {
      "id": "o3",
      "source": "e4",
      "target": "e2",
      "type": "ownership",
      "ownership_pct": 40,
      "control_type": null,
      "label": "40%"
    }
  ],
  "metadata": {
    "total_entities": 4,
    "total_relationships": 3,
    "beneficial_owner_count": 2,
    "has_gaps": false
  }
}
```

**`404`** if graph has not been computed yet (Phase 2 not complete).

**Edge semantics**: `source` **owns** a percentage of `target` (ownership flows top-down: individuals → intermediaries → subject corp). For control edges, `type` is `"control"` and `control_type` describes the mechanism.

---

## 8. SSE Protocol (Chat Streaming)

`POST /api/cases/:id/chat` returns a streaming SSE response. The connection stays open until the assistant finishes or an error occurs.

### Event Types

#### `message_start`

Emitted when the assistant begins generating its response.

```
event: message_start
data: {"message_id":"m3n4o5p6-..."}
```

#### `text_delta`

Streamed chunks of the assistant's natural-language response. Concatenate all deltas to build the full message.

```
event: text_delta
data: {"delta":"I've updated the "}
```

#### `tool_call`

The LLM has invoked the `apply_patches` tool. Emitted before patches are applied (allows UI to show a "modifying data…" indicator).

```
event: tool_call
data: {"tool":"apply_patches","patches":[{"op":"update","path":"subject_corporation.legal_name","value":"SubjectCo Incorporated"}],"resolve_issue_ids":["i1j2k3l4-..."]}
```

#### `patches_applied`

Patches applied, artifacts regenerated. The UI should refetch the canonical record, issues, and listed artifacts.

```
event: patches_applied
data: {"patches_count":1,"resolved_issue_ids":["i1j2k3l4-..."],"new_issue_ids":[],"regenerated_artifacts":["ART-1","ART-2"]}
```

#### `message_end`

The full response is complete.

```
event: message_end
data: {"message_id":"m3n4o5p6-..."}
```

#### `error`

Processing failed. The connection will close after this event.

```
event: error
data: {"code":"LLM_ERROR","message":"Failed to generate response"}
```

### Client Handling

1. On `message_start` → create message placeholder in the chat panel
2. On `text_delta` → append to message content (streaming display)
3. On `tool_call` → optionally show "modifying data…" indicator
4. On `patches_applied` → refetch case data (`GET /api/cases/:id`), issues, and listed artifacts
5. On `message_end` → finalize message; update chat metadata
6. On `error` → display error; allow retry

---

## 9. Error Handling

### Error Response Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "At least one document must be uploaded before running Phase 1",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `NOT_FOUND` | 404 | Case, artifact, or resource not found |
| `VALIDATION_ERROR` | 422 | Request body failed validation |
| `INVALID_STATE` | 409 | Operation not valid for current case status |
| `JOB_ACTIVE` | 409 | A phase job is already running for this case |
| `PRECONDITION_FAILED` | 409 | Unresolved blocking issues prevent this action |
| `UPLOAD_ERROR` | 400 | File upload failed (wrong type, too large, limit exceeded) |
| `LLM_ERROR` | 502 | LLM API call failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Appendix A: UI Content View Data Sources

This appendix maps each UI content view card (from ui-flow-v2) to the API data source.

### Phase 1

| Card | Data Source |
|------|------------|
| Discrepancies in cross-check | `GET /api/cases/:id/issues?phase=1&type=registry_discrepancy` **or** `canonical_record.registry_crosscheck.discrepancies` |
| Corporation Identity Data | `canonical_record.subject_corporation` |
| Directors and Officers | `canonical_record.directors` |
| Signing Authority | `canonical_record.authorized_signatories` + `canonical_record.authority_to_bind` |

**Proceed button disabled when**: `issue_summary.blocking > 0` (from `GET /api/cases/:id`)

### Phase 2

| Card | Data Source |
|------|------------|
| Ownership Gap & Discrepancy Report | `canonical_record.ownership_gaps` + `GET /api/cases/:id/issues?phase=2` |
| Ownership Graph | `GET /api/cases/:id/graph` |
| Beneficial Ownership Summary | `canonical_record.beneficial_owners` |

**Proceed button disabled when**: `issue_summary.blocking > 0`
**Graph & BO Summary**: show empty state if unresolved `error`-severity issues exist in Phase 2.

### Phase 3

| Card | Data Source |
|------|------------|
| Case Complexity & Material Discrepancy | `canonical_record.risk_assessment.complexity_score` + previously resolved `error`-severity issues |
| AI Recommendation | `canonical_record.risk_assessment.ai_recommendation` |
| Confirmation Steps | `canonical_record.confirmation_measures` |

### Decision Panel (all phases)

| Button | API Call |
|--------|---------|
| Proceed | `POST /api/cases/:id/phases/:phase/decision` `{ "decision": "proceed" }` |
| Escalate | `POST /api/cases/:id/phases/:phase/decision` `{ "decision": "escalate" }` |
| Reject (Phase 3+) | `POST /api/cases/:id/phases/:phase/decision` `{ "decision": "reject" }` |

### Artifacts Panel (all phases)

List: `GET /api/cases/:id/artifacts`. Current-phase artifacts are those where `artifact.phase === current_phase`. Open artifact detail: `GET /api/cases/:id/artifacts/:code` → render `markdown` in a modal.

### Chat Panel (all phases)

History: `GET /api/cases/:id/chat`. Send: `POST /api/cases/:id/chat` (SSE stream). After `patches_applied` event: refetch `GET /api/cases/:id` to update content views.

---

## Appendix B: Endpoint Summary

| # | Method | Path | Description |
|---|--------|------|-------------|
| 1 | `POST` | `/api/cases` | Create case |
| 2 | `GET` | `/api/cases` | List cases |
| 3 | `GET` | `/api/cases/:id` | Get case detail |
| 4 | `PATCH` | `/api/cases/:id` | Update intake fields |
| 5 | `POST` | `/api/cases/:id/documents` | Upload documents |
| 6 | `GET` | `/api/cases/:id/documents` | List documents |
| 7 | `POST` | `/api/cases/:id/phases/:phase/run` | Trigger phase job |
| 8 | `POST` | `/api/cases/:id/phases/:phase/decision` | Submit decision |
| 9 | `GET` | `/api/cases/:id/artifacts` | List artifacts |
| 10 | `GET` | `/api/cases/:id/artifacts/:code` | Get artifact detail |
| 11 | `GET` | `/api/cases/:id/issues` | List issues |
| 12 | `POST` | `/api/cases/:id/chat` | Send chat (SSE) |
| 13 | `GET` | `/api/cases/:id/chat` | Get chat history |
| 14 | `GET` | `/api/cases/:id/graph` | Get graph data |

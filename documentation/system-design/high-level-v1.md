Alright — here’s a **hackathon-grade, build-in-<8h** system design that stays **monolith + Postgres-only**, supports **multiple cases**, has a real **AI “core”** (extraction → graph → artifacts + chat-driven patching), and cleanly demos **Phase 1 → 3**.

---

## Architecture overview

### 1) One monolith, 3 “internal services” (just modules)

**A. Case Orchestrator**

* Owns phase state machine (`IN_REVIEW_1..5`, `ESCALATED`, `APPROVED`, `REJECTED`)
* Starts phase runs (Phase 1, 2, 3) as background jobs
* Ensures “one active run per case”

**B. AI Engine**

* Document extraction (Phase 1)
* Patch generator (chat-driven edits → JSON patch ops)
* Report / artifact generator (Phase 1–3)
* (Phase 4–5 stubbed/hardcoded per your plan)

**C. Graph Engine**

* Builds ownership/control graph
* Computes effective ownership recursively (UBO ≥ 25%)
* Detects gaps (ownership % missing or totals ≠ 100% → “gap”)
* Produces `ownership_graph` JSON + narrative for **ART-8** (required) 

Everything is still one Node/TS backend; these are folders, not services.

---

## Tech stack (fast + local + deployable)

* **Frontend**: React (I’d do **Next.js** so API routes live next to UI)
* **Backend**: Next.js API routes
* **DB**: Postgres
* **ORM**: Prisma
* **File storage**: local disk (`./data/uploads`) with file paths stored in DB
* **Job queue**: Postgres-backed (a simple `jobs` table + a worker loop)

---

## Core data model

### 1) Canonical record (single source of truth)

You already agreed on the “canonical extraction shape”. We’ll store it as JSONB:

* `cases.canonical_record_jsonb` — the evolving truth
* Phase artifacts are derived from it (markdown) and overwritten per phase

### 2) The “minimum” tables (you can build this quickly)

**cases**

* `id (uuid)`
* `status enum` (`DRAFT_INPUT`, `IN_REVIEW_1..5`, `ESCALATED`, `APPROVED`, `REJECTED`)
* `canonical_record jsonb`
* `created_at`, `updated_at`

**documents**

* `id (uuid)`
* `case_id`
* `filename`
* `storage_path`
* `sha256`
* `uploaded_at`
* optional: `doc_kind`

**artifacts**

* `id (uuid)`
* `case_id`
* `phase int`
* `artifact_code text` (e.g. `ART-8`)
* `markdown text` (this is your storage format)
* `updated_at`
* Unique index: `(case_id, artifact_code)` since you overwrite

**issues**

* `id (uuid)`
* `case_id`
* `phase int`
* `type text` (`missing_field | conflict | graph_gap | other`)
* `title text`
* `description text`
* `resolved bool`
* `created_at`, `updated_at`

**chat_messages**

* `id (uuid)`
* `case_id`
* `role enum` (`user | assistant | system`)
* `content text`
* `created_at`
* optional: `metadata jsonb` (store patch summary or tool outputs)

**patch_log** (cheap but VERY demo-useful)

* `id (uuid)`
* `case_id`
* `message_id` (the user chat message that triggered it)
* `patch_ops jsonb` (list of ops)
* `applied bool`
* `created_at`

**jobs**

* `id (uuid)`
* `case_id`
* `type text` (`PHASE_1_RUN | PHASE_2_RUN | PHASE_3_RUN`)
* `status enum` (`queued | running | succeeded | failed`)
* `payload jsonb`
* `error text`
* `created_at`, `updated_at`

That’s enough to ship.

---

## Phase execution model

### Phase 0 (intake)

UI uploads PDFs (max 15) + questionnaire form.

Backend:

1. Create case in `DRAFT_INPUT`
2. Save PDFs to disk, insert `documents`
3. Store questionnaire answers into `cases.canonical_record.account_intent` etc.

No AI yet.

---

### Phase 1 (Extraction + Phase-1 artifacts)

Start a background job: `PHASE_1_RUN`.

**Step P1.1 — Build “Document Context Pack”**

* For each PDF: extract text (since we assume text-readable now)
* Build a structured prompt input:

  * list of documents with doc_id + extracted text
  * questionnaire answers

**Step P1.2 — LLM extraction**
LLM outputs a JSON object matching your canonical schema:

* subject corp identity fields (feeds **ART-1**) 
* directors/officers/signatories/etc. (feeds **ART-3/4/5**)  
* intended use (feeds **ART-7**) 
* initial `issues[]` list for missing/conflicts

**Step P1.3 — Generate Phase 1 artifacts (markdown)**
You overwrite only Phase 1 artifacts.
Likely Phase 1 artifacts:

* ART-1 (identity snapshot) 
* ART-2 (attestation)
* ART-3 (director/officer list)
* ART-4 (authority to bind)
* ART-5 (authorized signatory record)
* ART-6 (signature specimen) (can be stubbed if no signature in PDFs)
* ART-7 (account intended use) 

Each markdown artifact ends with:

```
## Sources
DOC-1, DOC-3, DOC-7
```

(You wanted provenance embedded, doc ids only.)

---

### Phase 2 (Graph + Phase-2 artifacts)

Start job: `PHASE_2_RUN`.

**Step P2.1 — Build graph**
From canonical record:

* Nodes = entities
* Ownership edges = `ownership_relationships`
* Control edges = `control_relationships`

**Step P2.2 — Compute**

* Effective ownership propagation (recursive)
* UBO list: persons with effective ownership ≥ 25% (plus “control reasons”)
* Intermediate entities list
* Gap detection:

  * any missing ownership pct
  * any owned_entity where sum(owner_pcts) ≠ 100% (gap, not error)

**Step P2.3 — Generate Phase 2 artifacts**

* **ART-8** Beneficial Ownership & Structure:

  * includes `ownership_graph` JSON, `ownership_narrative`, BOs, intermediates 
* **ART-9** Confirmation Evidence (reasonable measures):

  * keep it simple: LLM generates `confirmation_measures[]` + `outcome` etc. 
* **ART-10** Third Party Determination (LLM + questionnaire) 

---

### Phase 3 (HITL decision)

Start job: `PHASE_3_RUN` only when Phase 2 exists.

**Step P3.1 — Build a “decision packet”**

* summarize unresolved issues (from `issues` table / canonical record)
* summarize key artifacts (ART-1..10)
* include “policy snippet text” you hardcode

**Step P3.2 — LLM produces:**

* a short “reviewer briefing”
* suggested decision + rationale
  But **human decides** and clicks: Approve / Escalate / Reject.

Store decision in:

* `cases.status`
* `cases.canonical_record.phase3`

(Optionally generate a Phase 3 markdown artifact, even if it’s not in ART spec — or keep it as “Phase 3 Summary” artifact.)

---

## Chat-driven patching (your “AI expands what humans can do” core)

### UX

User writes in chat:

> “Add John Doe as a 60% owner of HoldingCo; HoldingCo owns 100% of SubjectCo; mark missing ownership issue resolved.”

### Backend flow

1. Save user chat message
2. Create a “PATCH_FROM_CHAT” LLM call
3. LLM returns **PatchOps** (your earlier format)
4. Apply patch ops to:

   * `cases.canonical_record`
   * affected `issues.resolved`
5. Auto-regenerate **current phase artifacts** (only that phase, per your requirement)

This is where your prototype looks “AI-native”:

* user gives natural language instructions
* system directly updates structured truth + artifacts

**Why this works well:** the LLM doesn’t “free write artifacts”; it edits the canonical truth, then artifacts are deterministic renders from it.

---

## Job queue (Postgres-only, simple)

A single worker loop:

* polls `jobs` where `status='queued'`
* marks `running`
* executes phase runner
* writes artifacts/issues/canonical updates
* marks `succeeded` or `failed`

No Redis.

---

## API surface (minimal)

* `POST /api/cases` create case
* `GET /api/cases` list cases (dashboard)
* `GET /api/cases/:id` case details (canonical + status)
* `POST /api/cases/:id/documents` upload PDFs
* `POST /api/cases/:id/run?phase=1|2|3` enqueue job
* `GET /api/cases/:id/artifacts` list artifact headers
* `GET /api/cases/:id/artifacts/:code` get markdown
* `POST /api/cases/:id/chat` send message (streams assistant)
* `GET /api/cases/:id/chat` get chat history

Streaming chat: SSE or fetch streaming.

---

## UI mapping (simple)

* Dashboard: list cases + status
* Case page:

  * left: phase cards (1–5) with “Run phase” button and outputs list
  * main: artifact viewer (markdown)
  * right: chat panel (streaming)
  * graph modal uses `ART-8.ownership_graph` JSON
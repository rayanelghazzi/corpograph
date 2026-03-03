# CorpoGraph — Frontend Technical Design Document

> **Scope**: Full frontend architecture for the CorpoGraph UI.  
> **Stack**: Vite · React 19 · TypeScript · Tailwind CSS · shadcn/ui  
> **Backend reference**: `documentation/system-design/backend-tdd.md`  
> **PRD reference**: `documentation/ui-flow/prd.md`  
> **Constraint**: Hackathon prototype — no auth, no tests, no i18n.

---

## 1. Tech Stack

### 1.1 Core

| Layer | Choice | Justification |
|-------|--------|---------------|
| Build tool | Vite 6 | Fast HMR, lightweight. No SSR needed for an internal compliance tool. |
| UI framework | React 19 | Matches the backend's React version. |
| Language | TypeScript 5 | Type safety across the API boundary. |
| Routing | React Router 7 | Standard client-side routing. |
| Server state | TanStack Query 5 | Caching, polling, cache invalidation — all critical for the phase-job lifecycle. |
| Styling | Tailwind CSS 4 | Utility-first, pairs with shadcn/ui. |
| Components | shadcn/ui | Composable Radix-based primitives that integrate with Tailwind. |

### 1.2 Feature Libraries

| Feature | Library | Purpose |
|---------|---------|---------|
| Graph visualization | `@xyflow/react` (React Flow 12) | Render the ownership/control graph in a modal. |
| Graph auto-layout | `@dagrejs/dagre` | Compute hierarchical node positions from the API's node/edge data. |
| Markdown rendering | `react-markdown` + `remark-gfm` | Render artifact `markdown` content (tables, lists, headers). |
| SSE parsing | None (native `fetch` + `ReadableStream`) | The chat endpoint uses `POST` for SSE, so `EventSource` (GET-only) cannot be used. |

### 1.3 shadcn/ui Components to Install

These map directly to PRD components:

| shadcn component | PRD usage |
|------------------|-----------|
| `Button` | Decision panel buttons, form submit, navigation |
| `Card` | Content cards, dashboard summary counters |
| `Badge` | Status badges, severity tags, materiality tags |
| `Table` | Dashboard case table, director lists, signatory tables |
| `Dialog` | Rationale confirmation dialog, artifact detail modal, graph modal |
| `Collapsible` | Sidebar sections (Human Decision, Artifacts) |
| `Input` / `Textarea` | Form fields, chat input, rationale textarea |
| `Select` | Intake form dropdowns |
| `Progress` | Complexity score bar, phase processing indicator |
| `Tooltip` | Disabled button explanations |
| `Separator` | Section dividers |
| `Label` | Form field labels |

---

## 2. Project Structure

The frontend lives at `/web` in the monorepo root, fully separate from the `/api` Next.js app.

```
web/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json              # shadcn/ui config
├── public/
└── src/
    ├── main.tsx                  # React entry, providers, router
    ├── App.tsx                   # Route definitions
    ├── index.css                 # Tailwind directives + shadcn theme
    │
    ├── api/                      # API client layer
    │   ├── client.ts             # Base fetch wrapper, error handling
    │   ├── cases.ts              # Case CRUD endpoints
    │   ├── documents.ts          # Document upload/list
    │   ├── phases.ts             # Phase run + decision endpoints
    │   ├── artifacts.ts          # Artifact list + detail
    │   ├── issues.ts             # Issue list
    │   ├── chat.ts               # Chat history + SSE send
    │   ├── graph.ts              # Graph data endpoint
    │   └── types.ts              # API response types (see §2.1)
    │
    ├── hooks/                    # Custom React hooks
    │   ├── use-case.ts           # TanStack Query wrapper for GET /api/cases/:id
    │   ├── use-cases.ts          # TanStack Query wrapper for GET /api/cases
    │   ├── use-issues.ts         # TanStack Query for issues
    │   ├── use-artifacts.ts      # TanStack Query for artifacts
    │   ├── use-graph.ts          # TanStack Query for graph
    │   ├── use-chat.ts           # Chat SSE streaming hook
    │   └── use-phase-polling.ts  # Polling orchestration for active jobs
    │
    ├── lib/                      # Utilities
    │   ├── status.ts             # Status enum → display label + color mapping
    │   ├── format.ts             # Date formatting, percentage formatting
    │   └── constants.ts          # Phase labels, static regulatory text
    │
    ├── components/               # Shared UI components
    │   ├── ui/                   # shadcn/ui generated components (auto-managed)
    │   ├── layout/
    │   │   ├── CaseViewLayout.tsx
    │   │   ├── CaseHeader.tsx
    │   │   └── PhaseProgressBar.tsx
    │   ├── sidebar/
    │   │   ├── HumanDecisionPanel.tsx
    │   │   ├── ArtifactsPanel.tsx
    │   │   └── ArtifactItem.tsx
    │   ├── chat/
    │   │   ├── ChatPopover.tsx
    │   │   ├── ChatMessage.tsx
    │   │   └── ChatInput.tsx
    │   ├── cards/
    │   │   ├── ContentCard.tsx         # Base card shell
    │   │   ├── DiscrepancyCard.tsx     # Phase 1: registry cross-check
    │   │   ├── CorpIdentityCard.tsx    # Phase 1: corporation identity
    │   │   ├── DirectorsCard.tsx       # Phase 1: directors & officers
    │   │   ├── SigningAuthorityCard.tsx # Phase 1: signing authority
    │   │   ├── OwnershipGapsCard.tsx   # Phase 2: gap & discrepancy report
    │   │   ├── OwnershipGraphCard.tsx  # Phase 2: graph preview
    │   │   ├── BeneficialOwnersCard.tsx # Phase 2: BO summary
    │   │   ├── ComplexityCard.tsx      # Phase 3: complexity + materiality + AI rec
    │   │   ├── ConfirmationStepsCard.tsx # Phase 3: confirmation checklist
    │   │   ├── ThirdPartyCard.tsx      # Phase 3: third-party determination
    │   │   ├── RegulatoryContextCard.tsx # Phase 3: static regulatory text
    │   │   └── StubArtifactCard.tsx    # Phase 4–5: renders stub artifact data
    │   ├── modals/
    │   │   ├── GraphModal.tsx
    │   │   ├── ArtifactModal.tsx
    │   │   └── RationaleDialog.tsx
    │   └── shared/
    │       ├── StatusBadge.tsx
    │       ├── ErrorBanner.tsx
    │       ├── EmptyState.tsx
    │       └── LoadingOverlay.tsx
    │
    └── pages/                    # Route-level page components
        ├── LandingPage.tsx
        ├── SubmitCasePage.tsx
        ├── SubmitConfirmationPage.tsx
        ├── DashboardPage.tsx
        └── CaseViewPage.tsx      # Delegates to phase-specific content
```

### 2.1 Type Definitions (`src/api/types.ts`)

Types are derived from the backend's `api/lib/types.ts` and the API response shapes in `backend-tdd.md` §7. They are duplicated in the frontend (not shared via a package) for hackathon simplicity.

```typescript
// --- Enums / unions (mirrored from backend) ---

export type CaseStatus =
  | "DRAFT_INPUT"
  | "IN_REVIEW_1" | "IN_REVIEW_2" | "IN_REVIEW_3"
  | "IN_REVIEW_4" | "IN_REVIEW_5"
  | "ESCALATED" | "APPROVED" | "REJECTED";

export type JobStatus = "queued" | "running" | "succeeded" | "failed";
export type IssueSeverity = "error" | "warning";
export type IssueType =
  | "missing_field" | "conflict" | "graph_gap"
  | "registry_discrepancy" | "sum_mismatch" | "other";
export type Decision = "proceed" | "escalate" | "reject" | "approve";
export type ChatRole = "user" | "assistant" | "system";
export type PhaseStatus = "not_started" | "processing" | "in_review" | "completed";

// --- API response shapes ---

export interface CaseListItem {
  id: string;
  status: CaseStatus;
  corporation_name: string | null;
  created_at: string;
  updated_at: string;
  current_phase: number;
  document_count: number;
  artifact_count: number;
  unresolved_issue_count: number;
}

export interface CaseListResponse {
  cases: CaseListItem[];
  counts: {
    total: number;
    draft: number;
    in_review: number;
    escalated: number;
    approved: number;
    rejected: number;
  };
}

export interface PhaseInfo {
  status: PhaseStatus;
  started_at?: string;
  completed_at?: string;
  decision?: Decision;
  decided_at?: string;
}

export interface JobSummary {
  id: string;
  type: string;
  status: JobStatus;
  created_at: string;
  error?: string;
}

export interface IssueSummary {
  total: number;
  resolved: number;
  unresolved: number;
  blocking: number;
}

export interface CaseDetail {
  id: string;
  status: CaseStatus;
  corporation_name: string | null;
  created_at: string;
  updated_at: string;
  current_phase: number;
  canonical_record: CanonicalRecord;
  active_job: JobSummary | null;
  phases: Record<string, PhaseInfo>;
  document_count: number;
  artifact_codes: string[];
  issue_summary: IssueSummary;
}

// CanonicalRecord: full interface mirrored from api/lib/types.ts (see §3.2 of backend-tdd.md)
export interface CanonicalRecord { /* ... same as backend ... */ }

export interface ArtifactListItem {
  code: string;
  name: string;
  phase: number;
  generated_at: string;
}

export interface ArtifactDetail extends ArtifactListItem {
  data: Record<string, unknown>;
  markdown: string;
  source_documents: string[];
}

export interface Issue {
  id: string;
  phase: number;
  type: IssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  field_path: string | null;
  resolved: boolean;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
}

export interface IssueListResponse {
  issues: Issue[];
  summary: IssueSummary;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string;
  metadata: {
    patches_applied?: number;
    artifacts_regenerated?: string[];
    issues_resolved?: string[];
  } | null;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "corporation" | "individual" | "trust" | "partnership" | "other";
  is_subject: boolean;
  is_beneficial_owner: boolean;
  effective_ownership_pct: number | null;
  jurisdiction: string | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "ownership" | "control";
  ownership_pct: number | null;
  control_type: string | null;
  label: string;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    total_entities: number;
    total_relationships: number;
    beneficial_owner_count: number;
    has_gaps: boolean;
  };
}

export interface DecisionResponse {
  case_status: CaseStatus;
  decision_recorded: boolean;
  next_job: JobSummary | null;
}

// --- SSE event types ---

export type SSEEvent =
  | { type: "message_start"; message_id: string }
  | { type: "text_delta"; delta: string }
  | { type: "tool_call"; tool: string; patches: unknown[]; resolve_issue_ids: string[] }
  | { type: "patches_applied"; patches_count: number; resolved_issue_ids: string[]; new_issue_ids: string[]; regenerated_artifacts: string[] }
  | { type: "message_end"; message_id: string }
  | { type: "error"; code: string; message: string };

// --- API error shape ---

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

---

## 3. API Client Layer

### 3.1 Base Client (`src/api/client.ts`)

A thin wrapper around `fetch` that handles JSON parsing, error extraction, and base URL resolution.

```typescript
const API_BASE = "/api";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = body.error ?? {};
    throw new ApiRequestError(
      res.status,
      err.code ?? "UNKNOWN",
      err.message ?? res.statusText,
      err.details
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
```

For file uploads (`POST /api/cases/:id/documents`), a separate `apiUpload` function omits the `Content-Type` header to let the browser set the multipart boundary.

### 3.2 Endpoint Modules

Each file in `src/api/` exports typed functions. Example signatures:

**`cases.ts`**:
```typescript
export function createCase(body: CreateCaseRequest): Promise<{ id: string; status: CaseStatus; ... }>
export function listCases(params?: { status?: string; search?: string }): Promise<CaseListResponse>
export function getCase(id: string): Promise<CaseDetail>
export function updateCase(id: string, body: Partial<CreateCaseRequest>): Promise<CaseDetail>
```

**`phases.ts`**:
```typescript
export function runPhase(caseId: string, phase: number): Promise<{ job: JobSummary }>
export function submitDecision(caseId: string, phase: number, body: { decision: Decision; rationale?: string }): Promise<DecisionResponse>
```

**`documents.ts`**:
```typescript
export function uploadDocuments(caseId: string, files: File[]): Promise<{ documents: DocumentItem[] }>
export function listDocuments(caseId: string): Promise<{ documents: DocumentItem[] }>
```

**`artifacts.ts`**:
```typescript
export function listArtifacts(caseId: string, phase?: number): Promise<{ artifacts: ArtifactListItem[] }>
export function getArtifact(caseId: string, code: string): Promise<ArtifactDetail>
```

**`issues.ts`**:
```typescript
export function listIssues(caseId: string, params?: { phase?: number; resolved?: boolean; severity?: string }): Promise<IssueListResponse>
```

**`graph.ts`**:
```typescript
export function getGraph(caseId: string): Promise<GraphResponse>
```

**`chat.ts`**:
```typescript
export function getChatHistory(caseId: string): Promise<{ messages: ChatMessage[] }>
export function sendChatMessage(caseId: string, content: string): ReadableStream<SSEEvent>
```

### 3.3 SSE Client (`sendChatMessage`)

Since the chat endpoint uses `POST` (not `GET`), the standard `EventSource` API cannot be used. Instead, `sendChatMessage` uses `fetch` with a `ReadableStream` reader to parse the SSE text protocol.

```typescript
export async function* streamChat(caseId: string, content: string): AsyncGenerator<SSEEvent> {
  const res = await fetch(`/api/cases/${caseId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) { /* throw ApiRequestError */ }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Parse SSE frames: split on double newline, extract event + data lines
    const frames = buffer.split("\n\n");
    buffer = frames.pop()!; // keep incomplete frame in buffer

    for (const frame of frames) {
      const eventLine = frame.match(/^event:\s*(.+)$/m);
      const dataLine = frame.match(/^data:\s*(.+)$/m);
      if (!eventLine || !dataLine) continue;

      const eventType = eventLine[1].trim();
      const data = JSON.parse(dataLine[1].trim());
      yield { type: eventType, ...data } as SSEEvent;
    }
  }
}
```

This returns an async generator that the `useChat` hook consumes.

---

## 4. State Management

### 4.1 Provider Setup

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30s before background refetch
      retry: 1,                // single retry on failure
      refetchOnWindowFocus: false,
    },
  },
});

// Wrap <App /> with <QueryClientProvider client={queryClient}>
```

### 4.2 Query Key Convention

All query keys follow a hierarchical pattern for targeted invalidation:

| Query | Key | Stale Time |
|-------|-----|------------|
| List cases | `["cases"]` | 30s |
| Case detail | `["case", caseId]` | 30s |
| Issues for case | `["case", caseId, "issues", filterParams]` | 30s |
| Artifacts for case | `["case", caseId, "artifacts"]` | 30s |
| Single artifact | `["case", caseId, "artifact", code]` | 60s |
| Graph | `["case", caseId, "graph"]` | 30s |
| Chat history | `["case", caseId, "chat"]` | Infinity (managed manually) |

### 4.3 Query Hooks

**`use-case.ts`** — primary hook for the case view page:

```typescript
export function useCase(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCase(caseId),
  });
}
```

**`use-cases.ts`** — dashboard case list:

```typescript
export function useCases(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ["cases", filters],
    queryFn: () => listCases(filters),
  });
}
```

Other hooks (`useIssues`, `useArtifacts`, `useGraph`) follow the same pattern with their respective query keys.

### 4.4 Polling for Active Jobs

When a phase job is running, the UI must poll `GET /api/cases/:id` every 2 seconds until `active_job` becomes null.

```typescript
export function useCaseWithPolling(caseId: string) {
  const query = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCase(caseId),
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll every 2s while a job is active; stop when done
      return data?.active_job ? 2000 : false;
    },
  });

  return query;
}
```

The `CaseViewPage` uses this hook. When `active_job` transitions from non-null to null, the phase content re-renders with the updated case data.

### 4.5 Cache Invalidation After Chat Patches

When a `patches_applied` SSE event arrives, the `useChat` hook invalidates relevant queries so all content cards refresh:

```typescript
const queryClient = useQueryClient();

function handlePatchesApplied(event: PatchesAppliedEvent) {
  // Invalidate all case-related queries so content cards, issues,
  // artifacts, and graph re-fetch with patched data
  queryClient.invalidateQueries({ queryKey: ["case", caseId] });
  queryClient.invalidateQueries({ queryKey: ["case", caseId, "issues"] });
  queryClient.invalidateQueries({ queryKey: ["case", caseId, "artifacts"] });
  queryClient.invalidateQueries({ queryKey: ["case", caseId, "graph"] });
}
```

### 4.6 Mutations

Decision submission and case creation are handled via `useMutation`:

```typescript
export function useSubmitDecision(caseId: string, phase: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { decision: Decision; rationale?: string }) =>
      submitDecision(caseId, phase, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}
```

---

## 5. Component Architecture

### 5.1 Component Hierarchy

```
App
├── LandingPage
├── SubmitCasePage
│   └── SubmitConfirmationPage
├── DashboardPage
│   ├── StatusBadge
│   └── Table (shadcn)
└── CaseViewPage
    ├── CaseViewLayout
    │   ├── CaseHeader
    │   │   └── GraphModal (dialog, conditional)
    │   ├── PhaseProgressBar
    │   ├── ContentView (phase-specific)
    │   │   ├── Phase1Content
    │   │   │   ├── DiscrepancyCard
    │   │   │   ├── CorpIdentityCard
    │   │   │   ├── DirectorsCard
    │   │   │   └── SigningAuthorityCard
    │   │   ├── Phase2Content
    │   │   │   ├── OwnershipGapsCard
    │   │   │   ├── OwnershipGraphCard
    │   │   │   └── BeneficialOwnersCard
    │   │   ├── Phase3Content
    │   │   │   ├── ComplexityCard
    │   │   │   ├── ConfirmationStepsCard
    │   │   │   ├── ThirdPartyCard
    │   │   │   └── RegulatoryContextCard
    │   │   ├── Phase4Content
    │   │   │   └── StubArtifactCard (×3)
    │   │   ├── Phase5Content
    │   │   │   └── StubArtifactCard + manifest table
    │   │   └── TerminalStateView
    │   ├── Sidebar
    │   │   ├── HumanDecisionPanel (Collapsible)
    │   │   │   └── RationaleDialog
    │   │   └── ArtifactsPanel (Collapsible)
    │   │       ├── ArtifactItem
    │   │       └── ArtifactModal (dialog)
    │   └── ChatPopover (floating, FAB-triggered)
    │       ├── ChatMessage
    │       └── ChatInput
    └── LoadingOverlay (when active_job)
```

### 5.2 Key Component Specifications

#### `CaseViewLayout`

The top-level layout for `/cases/:id`. Composes header, progress bar, content area, sidebar, and chat FAB.

**Props**: `caseData: CaseDetail`, `children: ReactNode` (the phase content)

**Responsibilities**:
- Renders `CaseHeader` and `PhaseProgressBar` from `caseData`.
- Renders a two-column grid: left = scrollable content area (children), right = sidebar.
- Renders `ChatPopover` as a fixed-position element.
- Renders `LoadingOverlay` when `caseData.active_job !== null`.

#### `CaseHeader`

**Data**: `corporation_name`, `id`, `current_phase`

- Back arrow (← link to `/dashboard`)
- Corporation name (large) + "Case ID: {id}" (subtitle)
- "View Graph" button (top-right), rendered only when `current_phase >= 2`. Opens `GraphModal`.

#### `PhaseProgressBar`

**Data**: `phases` object from `CaseDetail`, `current_phase`

Renders a horizontal 5-step indicator. Each step:
- Number in a circle (filled dark if completed or current, grey outline if not started)
- Label below (from PRD §1.4: "Entity Verification", "Ownership Graph", etc.)
- Connecting line between steps (solid if both sides completed, grey otherwise)
- Visual gap between step 3 and step 4 to indicate the stub boundary.

#### `HumanDecisionPanel`

**Data**: `current_phase`, `issue_summary`, `status`

Uses shadcn `Collapsible` with header "Human Decision" / "Approve or escalate at decision gates".

Renders phase-specific buttons (see PRD §5.3–5.7 decision panels). Each button has:
- A label (e.g., "Proceed to Beneficial Ownership")
- A description line below (e.g., "All artifacts are accurate and complete")
- A style: filled dark (primary), outlined (secondary), filled red (destructive)

The Proceed button is disabled when `issue_summary.blocking > 0` with a tooltip.

Clicking Escalate or Reject opens `RationaleDialog` before calling the API. Clicking Proceed calls the decision endpoint directly with optional rationale.

#### `ArtifactsPanel`

**Data**: `artifacts[]` from `useArtifacts`, `current_phase`

Uses shadcn `Collapsible` with header "Artifacts" / "View and manage case artifacts".

Renders a vertical list of `ArtifactItem` components. Each shows:
- Status icon: green checkmark / blue clock / red exclamation (derived from artifact phase vs current phase and issue state)
- Artifact code (bold) and name (subtitle)
- "View" link → opens `ArtifactModal`

Current-phase artifacts have a highlighted background (amber/beige via Tailwind `bg-amber-50`).

#### `ChatPopover`

A floating panel anchored to the bottom-right, toggled by a FAB.

**State**: `isOpen` (local boolean), `messages` (from `useChat` hook), `isStreaming` (from hook).

**Closed**: Circular button (fixed bottom-right, `fixed bottom-6 right-6`) with chat icon. `z-50`.

**Open**: A panel (`fixed bottom-6 right-6 w-[400px] h-[480px]`) containing:
- Header: "AI Agent Chat" / subtitle / X close button
- Messages area: scrollable div, auto-scrolls to bottom on new messages
- Input area: text input + send button. Disabled while streaming or while `active_job` is present.

Uses the `useChat` hook for all messaging logic.

#### `ContentCard`

Base wrapper for all phase content cards.

**Props**: `title`, `subtitle` (artifact code), `variant` ("default" | "error" | "warning"), `children`

Renders a shadcn `Card` with:
- Red dashed border (`border-red-400 border-dashed`) when `variant === "error"`
- Default border otherwise
- Title + subtitle in the card header
- Children in the card body

#### `RationaleDialog`

Triggered by Escalate / Reject buttons.

**Props**: `action` ("escalate" | "reject"), `onConfirm(rationale: string)`, `onCancel()`

Renders a shadcn `Dialog` with:
- Title: "Escalate to Compliance" or "Reject Onboarding"
- Textarea for rationale (required)
- Warning text for Reject: "This action cannot be undone."
- Confirm + Cancel buttons

#### `GraphModal`

Uses shadcn `Dialog` (large size) to render the ownership graph.

**Data**: `GraphResponse` from `useGraph`.

Uses React Flow with dagre for layout:
1. Convert `GraphResponse.nodes` → React Flow nodes with positions computed by dagre.
2. Convert `GraphResponse.edges` → React Flow edges with labels.
3. Render `<ReactFlow>` in view-only mode (`nodesDraggable={false}`, `nodesConnectable={false}`).
4. Color legend below the graph.

Node styling by type:
- Target corporation (`is_subject`): yellow background `bg-amber-100 border-amber-400`
- Individual: blue background `bg-blue-100 border-blue-400`
- Other corporation: red/coral background `bg-red-100 border-red-400`
- Trust/partnership/other: purple background `bg-purple-100 border-purple-400`

#### `ArtifactModal`

Uses shadcn `Dialog`.

**Data**: `ArtifactDetail` from `useQuery` on `getArtifact`.

Renders:
- Header: code + name, phase badge, generated_at, source document tags
- Body: `<ReactMarkdown remarkPlugins={[remarkGfm]}>{artifact.markdown}</ReactMarkdown>`

### 5.3 Phase Content Components

Each phase has a dedicated content component that composes the relevant cards:

**`Phase1Content`**: Renders `DiscrepancyCard`, `CorpIdentityCard`, `DirectorsCard`, `SigningAuthorityCard` in a vertical stack. Reads from `canonical_record` fields as specified in PRD §5.3.

**`Phase2Content`**: Renders `OwnershipGapsCard`, `OwnershipGraphCard`, `BeneficialOwnersCard`. Uses both `canonical_record` and `useGraph` / `useIssues` hooks.

**`Phase3Content`**: Renders `ComplexityCard`, `ConfirmationStepsCard`, `ThirdPartyCard`, `RegulatoryContextCard`. The `ComplexityCard` is a composite containing the complexity score, material discrepancies, and AI recommendation sub-sections.

**`Phase4Content` / `Phase5Content`**: Render `StubArtifactCard` components, fetching individual artifacts via `getArtifact`. Each shows a stub disclaimer banner.

**`TerminalStateView`**: Renders a status banner (green/red/amber) + rationale + condensed case summary. Used when `status` is `APPROVED`, `REJECTED`, or `ESCALATED`.

---

## 6. Routing

### 6.1 Route Definitions

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/submit" element={<SubmitCasePage />} />
        <Route path="/submit/confirmation" element={<SubmitConfirmationPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cases/:id" element={<CaseViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 6.2 Page-Level Data Loading

Each page fetches its own data using TanStack Query hooks. There is no global data loader or route-level prefetching.

| Page | Primary Hook | Secondary Hooks |
|------|-------------|-----------------|
| `DashboardPage` | `useCases()` | — |
| `CaseViewPage` | `useCaseWithPolling(id)` | `useIssues(id, phase)`, `useArtifacts(id)`, `useGraph(id)` |
| `SubmitCasePage` | — (uses mutations) | `useCreateCase()`, `useUploadDocs()`, `useRunPhase()` |

### 6.3 Navigation Patterns

| Trigger | Navigation | Method |
|---------|-----------|--------|
| Dashboard → Case | `/cases/:id` | `navigate(`/cases/${id}`)` |
| Case → Dashboard (back arrow) | `/dashboard` | `navigate("/dashboard")` |
| Decision: escalate/reject | `/dashboard` | `navigate("/dashboard")` after mutation succeeds |
| Submit case → Confirmation | `/submit/confirmation` | `navigate` after API sequence completes |
| Landing → Submit | `/submit` | Link |
| Landing → Dashboard | `/dashboard` | Link |

---

## 7. Key Implementation Patterns

### 7.1 `useChat` Hook

The most complex hook. Manages the chat popover's state, streaming, and side-effects.

**Signature**:
```typescript
function useChat(caseId: string): {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => void;
}
```

**Internal state**:
- `messages`: Initialized from `GET /api/cases/:id/chat` via TanStack Query. New messages appended during streaming.
- `streamingContent`: Accumulated text from `text_delta` events.
- `isStreaming`: True between `message_start` and `message_end`.
- `error`: Set on `error` events.

**Flow when `sendMessage` is called**:
1. Append a new `user` message to local state.
2. Set `isStreaming = true`.
3. Call `streamChat(caseId, content)` (async generator from §3.3).
4. Iterate over yielded events:
   - `message_start` → create empty assistant message placeholder.
   - `text_delta` → append delta to the assistant message's content.
   - `tool_call` → append "[Modifying case data...]" indicator to message.
   - `patches_applied` → call `handlePatchesApplied` (§4.5) to invalidate queries.
   - `message_end` → set `isStreaming = false`.
   - `error` → set error state, set `isStreaming = false`.
5. On stream completion, invalidate `["case", caseId, "chat"]` to sync with server.

### 7.2 Graph Layout with Dagre

The `GraphModal` converts API data into React Flow elements with dagre-computed positions.

```typescript
import dagre from "@dagrejs/dagre";

function computeLayout(graphData: GraphResponse) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 100 });

  const NODE_WIDTH = 180;
  const NODE_HEIGHT = 60;

  for (const node of graphData.nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of graphData.edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const nodes = graphData.nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      id: node.id,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: node,
      type: "entityNode", // custom node type
    };
  });

  const edges = graphData.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.ownership_pct === null,
    style: edge.type === "control" ? { strokeDasharray: "5,5" } : undefined,
  }));

  return { nodes, edges };
}
```

A custom `EntityNode` component renders the colored box with entity name, type label, and ownership percentage.

### 7.3 Status Badge Mapping

```typescript
// src/lib/status.ts

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface StatusDisplay {
  label: string;
  variant: BadgeVariant;
  className: string;
}

const STATUS_MAP: Record<CaseStatus, StatusDisplay> = {
  DRAFT_INPUT:  { label: "Ready for Review", variant: "outline", className: "border-amber-400 text-amber-700 bg-amber-50" },
  IN_REVIEW_1:  { label: "In Review",        variant: "outline", className: "border-yellow-400 text-yellow-700 bg-yellow-50" },
  IN_REVIEW_2:  { label: "In Review",        variant: "outline", className: "border-yellow-400 text-yellow-700 bg-yellow-50" },
  IN_REVIEW_3:  { label: "In Review",        variant: "outline", className: "border-yellow-400 text-yellow-700 bg-yellow-50" },
  IN_REVIEW_4:  { label: "In Review",        variant: "outline", className: "border-yellow-400 text-yellow-700 bg-yellow-50" },
  IN_REVIEW_5:  { label: "In Review",        variant: "outline", className: "border-yellow-400 text-yellow-700 bg-yellow-50" },
  ESCALATED:    { label: "Escalated",         variant: "destructive", className: "bg-red-100 text-red-700 border-red-400" },
  REJECTED:     { label: "Rejected",          variant: "destructive", className: "bg-red-100 text-red-700 border-red-400" },
  APPROVED:     { label: "Approved",          variant: "default", className: "bg-green-100 text-green-700 border-green-400" },
};

export function getStatusDisplay(status: CaseStatus): StatusDisplay {
  return STATUS_MAP[status];
}
```

### 7.4 Phase Content Routing

`CaseViewPage` delegates rendering to the correct phase content based on `current_phase` and `status`:

```typescript
function CaseViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: caseData, isLoading } = useCaseWithPolling(id!);

  if (isLoading || !caseData) return <LoadingOverlay />;

  const isTerminal = ["ESCALATED", "REJECTED", "APPROVED"].includes(caseData.status);

  return (
    <CaseViewLayout caseData={caseData}>
      {caseData.active_job ? (
        <LoadingOverlay phase={caseData.current_phase} />
      ) : isTerminal ? (
        <TerminalStateView caseData={caseData} />
      ) : (
        <PhaseContent phase={caseData.current_phase} caseData={caseData} />
      )}
    </CaseViewLayout>
  );
}

function PhaseContent({ phase, caseData }: { phase: number; caseData: CaseDetail }) {
  switch (phase) {
    case 1: return <Phase1Content caseData={caseData} />;
    case 2: return <Phase2Content caseData={caseData} />;
    case 3: return <Phase3Content caseData={caseData} />;
    case 4: return <Phase4Content caseData={caseData} />;
    case 5: return <Phase5Content caseData={caseData} />;
    default: return null;
  }
}
```

### 7.5 Submission Flow (Role A)

`SubmitCasePage` manages a sequential multi-step API call triggered by a single "Submit" button:

```typescript
async function handleSubmit(formData: FormData, files: File[]) {
  // Step 1: Create case
  const caseRes = await createCase({
    intake: formData.intake,
    account_intent: formData.accountIntent,
    consent: { privacy_notice_version: "1.0", acknowledged: true, consented_at: new Date().toISOString() },
  });

  // Step 2: Upload documents
  await uploadDocuments(caseRes.id, files);

  // Step 3: Trigger Phase 1
  await runPhase(caseRes.id, 1);

  // Navigate to confirmation
  navigate("/submit/confirmation", { state: { caseId: caseRes.id } });
}
```

Each step is wrapped in try/catch. If Step 1 succeeds but a later step fails, the case ID is stored to allow retrying from the failed step.

---

## 8. Dev Environment

### 8.1 Vite Configuration

```typescript
// web/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

The proxy forwards all `/api/*` requests to the Next.js backend running on port 3000. This avoids CORS issues during development and means the API client uses relative paths (`/api/cases`) everywhere.

### 8.2 Running the Project

```bash
# Terminal 1: API server
cd api
npm run dev          # Next.js on :3000

# Terminal 2: Frontend
cd web
npm run dev          # Vite on :5173
```

The analyst opens `http://localhost:5173` in the browser. All `/api` requests are proxied to `:3000`.

### 8.3 Package Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/"
  }
}
```

### 8.4 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "paths": { "@/*": ["./src/*"] },
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

---

## Appendix A: Data Flow Diagram

```
                    ┌─────────────────┐
                    │   React App     │
                    │   (Vite :5173)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         TanStack Query   useChat()    useMutation()
         (GET requests)   (SSE stream) (POST/PATCH)
              │              │              │
              └──────────────┼──────────────┘
                             │
                       Vite Dev Proxy
                        /api → :3000
                             │
                    ┌────────┴────────┐
                    │   Next.js API   │
                    │   (:3000)       │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │   PostgreSQL    │
                    └─────────────────┘
```

## Appendix B: Dependency List

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@xyflow/react": "^12.0.0",
    "@dagrejs/dagre": "^1.1.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "eslint": "^9.0.0"
  }
}
```

Note: `class-variance-authority`, `clsx`, `tailwind-merge`, and `lucide-react` are required by shadcn/ui. Exact versions should be resolved at install time via `npm install` (do not pin manually).

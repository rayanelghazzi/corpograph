export type CaseStatus =
  | "DRAFT_INPUT"
  | "IN_REVIEW_1"
  | "IN_REVIEW_2"
  | "IN_REVIEW_3"
  | "IN_REVIEW_4"
  | "IN_REVIEW_5"
  | "ESCALATED"
  | "APPROVED"
  | "REJECTED";

export type JobStatus = "queued" | "running" | "succeeded" | "failed";
export type IssueSeverity = "error" | "warning";
export type IssueType =
  | "missing_field"
  | "conflict"
  | "graph_gap"
  | "registry_discrepancy"
  | "sum_mismatch"
  | "other";
export type Decision = "proceed" | "escalate" | "reject" | "approve";
export type ChatRole = "user" | "assistant" | "system";
export type PhaseStatus = "not_started" | "processing" | "in_review" | "completed";

export interface CanonicalRecord {
  intake?: {
    account_type: "corporate_chequing" | "corporate_investing";
    entity_type: "corporation" | "trust" | "partnership";
    service_model?: "OEO" | "managed";
  };
  account_intent?: {
    account_purpose: string;
    expected_monthly_volume: number;
    expected_transaction_types: string[];
    funding_sources: string[];
    counterparty_geographies: string[];
  };
  consent?: {
    privacy_notice_version: string;
    consented_at: string;
    acknowledged: boolean;
  };
  subject_corporation?: {
    legal_name: string;
    jurisdiction: string;
    registration_number: string;
    registered_address: string;
    incorporation_date: string;
    business_number?: string;
    corporate_status?: "active" | "dissolved" | "amalgamated" | "unknown";
  };
  directors?: Array<{
    id: string;
    full_name: string;
    role: "director" | "officer" | "director_and_officer";
    address?: string;
    date_of_birth?: string;
    appointment_date?: string;
  }>;
  authorized_signatories?: Array<{
    id: string;
    full_name: string;
    residential_address: string;
    date_of_birth?: string;
    occupation?: string;
    authority_limits: string;
    verification_method?: string;
  }>;
  authority_to_bind?: {
    resolution_date?: string;
    scope_of_authority: string;
    authorized_person_ids: string[];
    document_ref?: string;
  };
  registry_crosscheck?: {
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
  entities?: Array<{
    id: string;
    type: "corporation" | "individual" | "trust" | "partnership" | "other";
    name: string;
    jurisdiction?: string;
    is_subject: boolean;
  }>;
  ownership_relationships?: Array<{
    id: string;
    owner_entity_id: string;
    owned_entity_id: string;
    ownership_pct: number | null;
    source?: string;
  }>;
  control_relationships?: Array<{
    id: string;
    controller_entity_id: string;
    controlled_entity_id: string;
    control_type: string;
    source?: string;
  }>;
  beneficial_owners?: Array<{
    entity_id: string;
    name: string;
    effective_ownership_pct: number;
    control_reasons: string[];
    ownership_paths: string[][];
  }>;
  ownership_gaps?: Array<{
    entity_id: string;
    entity_name: string;
    gap_type: "missing_pct" | "sum_not_100" | "unknown_owner";
    details: string;
    total_known_pct?: number;
  }>;
  ownership_narrative?: string;
  confirmation_measures?: Array<{
    measure: string;
    source: string;
    result: string;
  }>;
  third_party_determination?: {
    acting_on_behalf: boolean;
    determination_rationale: string;
    third_party_details?: {
      name: string;
      relationship: string;
    };
    grounds_for_suspicion?: string;
  };
  risk_assessment?: {
    complexity_score: number;
    risk_score: number;
    risk_level: "low" | "medium" | "high";
    risk_factors: string[];
    rationale: string;
    enhanced_measures_required: boolean;
    ai_recommendation?: string;
  };
  phase_decisions?: Record<
    number,
    {
      decision: "proceed" | "escalate" | "reject" | "approve";
      decided_at: string;
      rationale?: string;
    }
  >;
}

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

export interface DocumentItem {
  id: string;
  filename: string;
  doc_kind: string | null;
  size_bytes: number;
  uploaded_at: string;
}

export interface CreateCaseRequest {
  intake: {
    account_type: "corporate_chequing" | "corporate_investing";
    entity_type: "corporation" | "trust" | "partnership";
    service_model?: "OEO" | "managed";
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
    acknowledged: boolean;
    consented_at?: string;
  };
}

export type SSEEvent =
  | { type: "message_start"; message_id: string }
  | { type: "text_delta"; delta: string }
  | { type: "tool_call"; tool: string; patches: unknown[]; resolve_issue_ids: string[] }
  | { type: "patches_applied"; patches_count: number; resolved_issue_ids: string[]; new_issue_ids: string[]; regenerated_artifacts: string[] }
  | { type: "message_end"; message_id: string }
  | { type: "error"; code: string; message: string };

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

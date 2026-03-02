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

export interface PatchOperation {
  op: "add" | "update" | "remove";
  path: string;
  value?: unknown;
  index?: number;
}

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

export interface PhaseInfo {
  status: "not_started" | "processing" | "in_review" | "completed";
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

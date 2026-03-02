# artifact-spec.md

**Wealthsimple AI-Native Corporate Onboarding -- Full Artifact
Specifications (ART-1 → ART-23)**

Generated on: 2026-03-02T12:48:44.162952 UTC

All fields are defined as variables with explicit types aligned to the
research modeling conventions: `string`, `number`, `boolean`, `date`,
`datetime`, `enum`, `array<string>`, `array<object>`, `object`, `json`,
`file_ref`, `signature`, `hash`.

------------------------------------------------------------------------

## ART-1 --- Corporate Identity Snapshot

**Purpose**\
Proves legal existence of the corporation.

### Required Fields

-   `legal_name`: **string**
-   `jurisdiction`: **string**
-   `registration_number`: **string**
-   `registered_address`: **string**
-   `incorporation_date`: **date**
-   `verification_source`: **string**
-   `verified_at`: **datetime**
-   `document_hash`: **hash**

### Optional Fields

-   `business_number`: **string**
-   `corporate_status`: **enum**
-   `certificate_of_status_date`: **date**
-   `directors_snapshot`: **array`<object>`{=html}**

------------------------------------------------------------------------

## ART-2 --- Registry Accuracy Attestation

**Purpose**\
Confirms registry filings are current.

### Required Fields

-   `legal_name`: **string**
-   `attestation_statement`: **string**
-   `signatory_name`: **string**
-   `signed_at`: **datetime**
-   `signature`: **signature**

### Optional Fields

-   `supporting_document`: **file_ref**

------------------------------------------------------------------------

## ART-3 --- Director / Officer List

**Purpose**\
Lists directors for AML and sanctions screening.

### Required Fields

-   `directors`: **array`<object>`{=html}**
-   `generated_at`: **datetime**

### Optional Fields

-   `officers`: **array`<object>`{=html}**

------------------------------------------------------------------------

## ART-4 --- Corporate Authority to Bind

**Purpose**\
Proves who can bind the corporation for the account.

### Required Fields

-   `corporation_name`: **string**
-   `authorized_persons`: **array`<object>`{=html}**
-   `scope_of_authority`: **string**
-   `resolution_date`: **date**
-   `document_ref`: **file_ref**

### Optional Fields

-   `minute_book_reference`: **string**
-   `corporate_seal_present`: **boolean**

------------------------------------------------------------------------

## ART-5 --- Authorized Signatory Record

**Purpose**\
Defines account operators and controllers.

### Required Fields

-   `full_name`: **string**
-   `residential_address`: **string**
-   `date_of_birth`: **date**
-   `occupation`: **string**
-   `authority_limits`: **string**
-   `verification_method`: **enum**
-   `verified_at`: **datetime**

### Optional Fields

-   `email`: **string**
-   `phone`: **string**

------------------------------------------------------------------------

## ART-6 --- Signature Specimen

**Purpose**\
Stores signature specimen for authentication.

### Required Fields

-   `signatory_name`: **string**
-   `signature_image`: **file_ref**
-   `captured_at`: **datetime**

### Optional Fields

-   `signature_method`: **enum**

------------------------------------------------------------------------

## ART-7 --- Account Intended Use Record

**Purpose**\
Documents purpose and expected activity.

### Required Fields

-   `account_purpose`: **string**
-   `expected_monthly_volume`: **number**
-   `expected_transaction_types`: **array`<string>`{=html}**
-   `funding_sources`: **array`<string>`{=html}**
-   `counterparty_geographies`: **array`<string>`{=html}**

### Optional Fields

-   `industry_code`: **string**

------------------------------------------------------------------------

## ART-8 --- Beneficial Ownership & Structure

**Purpose**\
Captures ownership graph down to natural persons.

### Required Fields

-   `directors`: **array`<object>`{=html}**
-   `beneficial_owners`: **array`<object>`{=html}**
-   `intermediate_entities`: **array`<object>`{=html}**
-   `ownership_graph`: **json**
-   `ownership_narrative`: **string**
-   `created_at`: **datetime**

### Optional Fields

-   `trust_details`: **object**
-   `voting_rights_breakdown`: **json**

------------------------------------------------------------------------

## ART-9 --- Beneficial Ownership Confirmation Evidence

**Purpose**\
Documents reasonable measures taken to confirm BO accuracy.

### Required Fields

-   `confirmation_measures`: **array`<string>`{=html}**
-   `reviewer_name`: **string**
-   `reviewed_at`: **datetime**
-   `outcome`: **enum**

### Optional Fields

-   `supporting_documents`: **array`<file_ref>`{=html}**
-   `risk_notes`: **string**

------------------------------------------------------------------------

## ART-10 --- Third Party Determination Record

**Purpose**\
Determines whether entity acts on behalf of another.

### Required Fields

-   `acting_on_behalf`: **boolean**
-   `determination_date`: **datetime**

### Optional Fields

-   `third_party_details`: **object**
-   `grounds_for_suspicion`: **string**

------------------------------------------------------------------------

## ART-11 --- Sanctions Screening Log

**Purpose**\
Evidence of sanctions screening and match resolution.

### Required Fields

-   `subjects_screened`: **array`<string>`{=html}**
-   `lists_used`: **array`<string>`{=html}**
-   `screened_at`: **datetime**
-   `result`: **enum**

### Optional Fields

-   `analyst_notes`: **string**
-   `match_score`: **number**

------------------------------------------------------------------------

## ART-12 --- AML Risk Assessment

**Purpose**\
Documents AML risk rating and enhanced measures.

### Required Fields

-   `risk_score`: **number**
-   `risk_level`: **enum**
-   `risk_factors`: **array`<string>`{=html}**
-   `rationale`: **string**
-   `enhanced_measures_required`: **boolean**
-   `assessed_at`: **datetime**

### Optional Fields

-   `compliance_signoff`: **signature**

------------------------------------------------------------------------

## ART-13 --- Privacy Consent Record

**Purpose**\
Proof of valid consent under PIPEDA.

### Required Fields

-   `notice_version`: **string**
-   `consent_timestamp`: **datetime**
-   `acknowledgement`: **boolean**

### Optional Fields

-   `language`: **enum**

------------------------------------------------------------------------

## ART-14 --- CBCA Discrepancy Report

**Purpose**\
Documents discrepancy reporting to registry.

### Required Fields

-   `discrepancy_description`: **string**
-   `identified_at`: **datetime**
-   `reported_at`: **datetime**
-   `acknowledgement_ref`: **file_ref**

### Optional Fields

-   `resolution_notes`: **string**

------------------------------------------------------------------------

## ART-15 --- CRS/FATCA Self-Certification

**Purpose**\
Tax reporting compliance artifact.

### Required Fields

-   `entity_classification`: **enum**
-   `tax_residencies`: **array`<string>`{=html}**
-   `entity_TINs`: **array`<string>`{=html}**
-   `controlling_persons`: **array`<object>`{=html}**
-   `self_cert_signature`: **signature**
-   `signed_at`: **datetime**

### Optional Fields

-   `GIIN`: **string**
-   `TIN_explanation`: **string**

------------------------------------------------------------------------

## ART-16 --- Corporate Investing KYC Profile

**Purpose**\
Captures NI 31-103 corporate KYC data.

### Required Fields

-   `nature_of_business`: **string**
-   `financial_circumstances`: **string**
-   `investment_objectives`: **string**
-   `risk_tolerance`: **enum**
-   `controllers_25_percent`: **array`<object>`{=html}**
-   `confirmed_at`: **datetime**

### Optional Fields

-   `time_horizon`: **string**
-   `liquidity_needs`: **string**

------------------------------------------------------------------------

## ART-17 --- Suitability Determination Record

**Purpose**\
Documents suitability analysis.

### Required Fields

-   `recommendation`: **string**
-   `rationale`: **string**
-   `alternatives_considered`: **array`<string>`{=html}**
-   `cost_impact_analysis`: **string**
-   `determined_at`: **datetime**

### Optional Fields

-   `client_override_confirmation`: **boolean**
-   `override_signature`: **signature**

------------------------------------------------------------------------

## ART-18 --- OEO Disclosure Acknowledgement

**Purpose**\
Confirms OEO disclosure delivered prior to opening.

### Required Fields

-   `disclosure_version`: **string**
-   `acknowledged_at`: **datetime**

### Optional Fields

-   `delivery_channel`: **enum**

------------------------------------------------------------------------

## ART-19 --- CIPF Disclosure Acknowledgement

**Purpose**\
Confirms investor protection disclosure.

### Required Fields

-   `disclosure_reference`: **string**
-   `acknowledged_at`: **datetime**

### Optional Fields

*None*

------------------------------------------------------------------------

## ART-20 --- CDIC Trust Disclosure Dataset

**Purpose**\
Provides beneficiary data to partner banks for trust deposits.

### Required Fields

-   `trustee_identity`: **object**
-   `beneficiaries`: **array`<object>`{=html}**
-   `generated_at`: **datetime**

### Optional Fields

-   `allocation_breakdown`: **json**

------------------------------------------------------------------------

## ART-21 --- Account Application & Agreements

**Purpose**\
Stores signed account application and agreements.

### Required Fields

-   `application_payload`: **json**
-   `agreement_versions`: **array`<string>`{=html}**
-   `accepted_at`: **datetime**

### Optional Fields

-   `ip_address`: **string**
-   `device_fingerprint`: **string**

------------------------------------------------------------------------

## ART-22 --- Records Retrieval Readiness Proof

**Purpose**\
Demonstrates ability to produce records within 30 days.

### Required Fields

-   `indexing_system_description`: **string**
-   `last_retrieval_test_date`: **date**
-   `test_result`: **enum**

### Optional Fields

-   `compliance_officer_signature`: **signature**

------------------------------------------------------------------------

## ART-23 --- Account Opening Package Manifest

**Purpose**\
Master audit index linking all artifacts.

### Required Fields

-   `account_id`: **string**
-   `artifacts`: **array`<object>`{=html}**
-   `generated_at`: **datetime**

### Optional Fields

-   `final_decision`: **enum**
-   `reviewer_signature`: **signature**

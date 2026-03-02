# AI-Native Corporate Onboarding Workflow Specification (Workflow v5)

> This version aligns strictly with the canonical artifact specification (ART-1 → ART-23).
> Only artifacts defined in artifact-spec.md are generated in this workflow.

---

# PHASE 0 — Intake, Consent, and Single Upload Packet  
**Maps to:** STEP-I-1  

## Goal  
Collect all required onboarding inputs once and generate required consent artifact.

## Outputs (Artifacts Generated)

- **ART-13 — Privacy Consent Record**

---

# PHASE 1 — Entity Verification and Authority  
**Maps to:** STEP-I-2 + STEP-I-3  

## Goal  
Verify legal existence of the corporation and determine who can bind the corporation.

## Outputs (Artifacts Generated)

- **ART-1 — Corporate Identity Snapshot**
- **ART-2 — Registry Accuracy Attestation**
- **ART-3 — Director / Officer List**
- **ART-4 — Corporate Authority to Bind**
- **ART-5 — Authorized Signatory Record**
- **ART-6 — Signature Specimen**

If registry discrepancy identified:

- **ART-14 — CBCA Discrepancy Report**

---

# PHASE 2 — Beneficial Ownership & Structure  
**Maps to:** STEP-I-4 + STEP-I-6  

## Goal  
Construct full ownership and control structure down to natural persons.

## Outputs (Artifacts Generated)

- **ART-8 — Beneficial Ownership & Structure**

If discrepancy requires registry reporting:

- **ART-14 — CBCA Discrepancy Report**

---

# PHASE 3 — Reasonable Measures & Risk Determination  
**Maps to:** STEP-I-6 + STEP-I-7  

## Goal  
Confirm beneficial ownership accuracy and determine AML risk and third-party status.

## Outputs (Artifacts Generated)

- **ART-9 — Beneficial Ownership Confirmation Evidence**
- **ART-10 — Third Party Determination Record**
- **ART-12 — AML Risk Assessment**

---

# PHASE 4 — Sanctions Screening & Tax Compliance  
**Maps to:** STEP-I-8 + STEP-I-9  

## Goal  
Perform sanctions screening and verify tax compliance.

## Outputs (Artifacts Generated)

- **ART-11 — Sanctions Screening Log**
- **ART-15 — CRS/FATCA Self-Certification**
- **ART-16 — Corporate Investing KYC Profile**

---

# PHASE 5 — Finalization & Account Opening Package  
**Maps to:** STEP-I-13  

## Goal  
Finalize onboarding decision and generate audit-ready account package.

## Outputs (Artifacts Generated)

- **ART-17 — Suitability Determination Record**
- **ART-18 — OEO Disclosure Acknowledgement**
- **ART-19 — CIPF Disclosure Acknowledgement**
- **ART-21 — Account Application & Agreements**
- **ART-22 — Records Retrieval Readiness Proof**
- **ART-23 — Account Opening Package Manifest**

---

## Terminal States

- APPROVED  
- REJECTED  
- ESCALATED  

All generated artifacts are referenced in **ART-23 — Account Opening Package Manifest**.

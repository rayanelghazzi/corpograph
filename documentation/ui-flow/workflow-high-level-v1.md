# CorpoGraph Onboarding Orchestrator

## Overview

**CorpoGraph Onboarding Orchestrator** is an AI-native system that
automates and structures the onboarding of multi-owned and multi-layered
corporations. It produces:

1.  A beneficial ownership/control graph (multi-layer, down to natural
    persons)
2.  An evidence + confirmation log ("reasonable measures" record)
3.  A risk/complexity score with explainability
4.  An audit-ready account opening package manifest (ART-23)

------------------------------------------------------------------------

## Workflow v1 (Demo-Optimized)

### PHASE 0 --- Intake + Consent

**Reference:** STEP-I-1

-   AI pre-fills entity type and jurisdiction from minimal input.
-   Human confirms intended product and submits.

------------------------------------------------------------------------

### PHASE 1 --- Entity Verification + Authority

**MERGE-A = STEP-I-2 + STEP-I-3 (+ optional STEP-C-2 + STEP-C-3)**

User uploads: 
- Articles / Certificate 
- Registry profile 
- Board resolution / mandate extract 
- Optional cap table / org chart

AI extracts: 
- Legal name 
- Corp number 
- Jurisdiction 
- Registered address 
- Directors / officers 
- Authority to bind / trade

Outputs: 
- Structured "Entity Snapshot" 
- "Authority Model" 
- ART-1 + ART-4 + ART-5 artifacts (JSON + PDF preview) 
- Confidence scores per extracted field

------------------------------------------------------------------------

### PHASE 2 --- Ownership Graph Build (Core Engine)

**MERGE-B = STEP-I-4 + STEP-I-6**

AI Graph Builder: 
- Inputs: extracted entities + uploaded docs + (mocked) registry responses 
- Outputs: graph with nodes (entities/persons/trusts) and edges (ownership/control %)

AI Missing-Link Prompts: 
- Identifies incomplete chains to natural persons 
- Generates targeted follow-up requests

AI Reconciliation: 
- Detects discrepancies between registry and documents 
- Flags conflicts for review

------------------------------------------------------------------------

### PHASE 3 --- Reasonable Measures Engine + Evidence Log

**STEP-I-6 + STEP-I-7 (Escalation Modules)**

AI Evidence Planner: 
- Uses complexity score (layers, trusts, foreign nodes, missing docs) 
- Generates checklist of "reasonable measures" 
- Logs all confirmation steps

AI Evidence Collector: 
- Attaches registry snapshots 
- Attaches document excerpts 
- Captures signer attestation 
- Produces structured "Measures Taken" log

Human Review Gate (Critical Decision): 
- AI provides recommendation + confidence score 
- Human must decide: 
    - Accept 
    - Request more info
    - Escalate to compliance

### Critical Human-Only Decision

Whether the confirmation steps meet the "reasonable measures"
requirement and whether any discrepancy is "material."

This must remain human because: 
- It is context and risk dependent 
- Regulatory defensibility depends on judgement
- AI cannot fully internalize supervisory expectations

------------------------------------------------------------------------

### PHASE 4 --- Sanctions + Tax Self-Cert Checks

**MERGE-C = STEP-I-8 + STEP-I-9**

Sanctions Screening: 
- Run across all graph nodes (entities + directors + UBOs) 
- Logged and explainable

Tax Self-Cert Checks:
- Collect entity + controlling-person certifications 
- AI contradiction detection (e.g., jurisdiction inconsistencies) 
- Escalate inconsistencies to Human Review Gate

------------------------------------------------------------------------

### PHASE 5 --- Decision + Audit Package Generator

**MERGE-D = STEP-I-13 + ART-23 Manifest**

One-click "Generate Account Opening Package":

Includes: 
- Manifest listing step codes covered 
- Artifacts produced 
- Hashes 
- Timestamps 
- Human approvals

Final Status: 
- APPROVE 
- CONDITIONAL 
- ESCALATE

Exports: - PDF - JSON - Zipped audit package

------------------------------------------------------------------------

## What to Skip for Hackathon Scope

-   STEP-I-11 (Suitability for managed accounts)
-   STEP-C-12 (CDIC trust datasets unless building chequing product)

------------------------------------------------------------------------

## MVP Build Plan

1.  Frontend:
    -   Intake form
    -   Document upload
    -   Graph visualization
    -   Human Review screen
2.  Backend Orchestrator:
    -   State machine workflow (Phases 1--5)
3.  LLM Document Extraction:
    -   Schema-first JSON extraction
    -   Citation-backed outputs
4.  Graph Store:
    -   Neo4j or in-memory graph
    -   D3 visualization
5.  Artifact Generator:
    -   Manifest JSON
    -   PDF snapshots
    -   Measures log

------------------------------------------------------------------------

## What Breaks First at Scale

-   Registry coverage gaps and rate limits
-   Sanctions false positives across large ownership graphs
-   Poor-quality scans and document variety
-   Complex trust and foreign ownership structures increasing manual
    escalations

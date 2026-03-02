# CorpGraph — AI-Native Corporate Onboarding Orchestrator

## Summary

CorpGraph is an AI-native internal compliance workflow that enables Wealthsimple to onboard complex, multi-owned, and multi-layered corporations — without increasing analyst headcount.

Instead of manually parsing documents, mapping ownership chains, and reconciling discrepancies across registries, self-certifications, and screening results, analysts operate inside a structured orchestration system that generates normalized compliance artifacts (ART-*) at each phase.

Note that this is a hackathon idea, not a production-grade product, and is intended to be built in a couple hours.

The system:

- Ingests a single onboarding packet (documents + questionnaires)
- Constructs a full ownership/control graph (ART-6)
- Identifies beneficial owners (ART-7)
- Detects structural gaps and discrepancies (ART-5, ART-8)
- Generates a reasonable measures checklist (ART-9)
- Drafts a materiality assessment (ART-10)
- Performs sanctions screening and tax consistency checks (ART-11, ART-12) (might skip this)
- Produces an audit-ready manifest (ART-23) (might skip this)

## What the Human Can Now Do

A compliance analyst can review and decide on complex corporate structures in minutes rather than hours — even when ownership spans multiple entities and jurisdictions.

The analyst no longer:
- Manually reconstructs ownership chains
- Cross-references registry filings by hand
- Drafts discrepancy rationales from scratch
- Re-checks tax declarations against structural data

Instead, the analyst performs targeted judgment at defined human gates (PHASE 3 and PHASE 5).

## What AI Is Responsible For

AI handles:
- Document extraction
- Ownership graph construction inputs
- Entity resolution
- Discrepancy detection
- Reasonable measures drafting
- Screening match explanation
- Tax consistency analysis
- Audit narrative drafting

It generates standardized artifacts (ART-0 through ART-23) that make every decision traceable and reproducible.

## Where AI Must Stop

AI does **not** determine materiality of discrepancies.

At PHASE 3, a human must decide whether:
- Reasonable measures are sufficient
- Discrepancies are material
- The case should proceed, escalate, or be rejected

This preserves regulatory accountability and human oversight.
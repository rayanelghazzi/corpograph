# Wealthsimple AI‑Native Corporate Onboarding for Complex Canadian Corporations

## Scope and core framing

This research targets **Canadian corporate account opening** that supports **multi‑owned, multi‑layered incorporated businesses** (e.g., multiple shareholders, holding‑company chains, trusts as owners, cross‑provincial and cross‑border ownership, multiple authorised signatories). The aim is to derive a defensible onboarding workflow and artefact model that can withstand **regulator and audit scrutiny**, while highlighting **where Canadian law or binding regulatory rules force human judgement** (vs what can be automated safely with escalation).

Two product tracks are treated separately, because the rulebooks differ:

- **Corporate chequing / deposit account** onboarding is dominated by **PCMLTFA/PCMLTFR** (AML/ATF), **sanctions**, **privacy**, **tax information reporting (FATCA/CRS)**, and (depending on structure) **CDIC trust disclosure** requirements.  
- **Corporate investing / brokerage account** onboarding includes all of the above **plus** securities‑registrant obligations under **National Instrument 31‑103** (KYC, beneficial ownership/control, suitability frameworks) and self‑regulatory expectations for order‑execution‑only (OEO) models (CIRO guidance), and investor‑protection disclosures (CIPF/CIRO).

Important baseline about current public Wealthsimple constraints (useful for “step discovery” and for framing what needs to change):

- The Wealthsimple corporate account help article states corporate eligibility includes **“a single layer of ownership”** and, specifically for self‑directed corporate investing, **“single‑director corporations.”**  
- Wealthsimple’s business chequing article (beta) is described as available to **“single‑owner”** incorporated businesses (with multi‑director support operationally).  
- Wealthsimple’s “automatic business verification” announcement describes automated verification as limited to single‑owner corporations (>75% owned by one individual) and notes that other ownership structures require manual review.  

## Onboarding step discovery

This section **does not derive** the final canonical steps yet; it enumerates what is observable in (a) Wealthsimple public materials, (b) major Canadian banks, and (c) brokerages / institutional forms and regulator guidance—then the next section converts those observations into atomic step codes.

### Observed onboarding patterns for corporate chequing

**Wealthsimple (public onboarding flow signals)**  
- Business chequing is initiated on the web: **Move → Add an account → Corporate tab → Business chequing → prompts → sign agreements on web**; if the corporation is not already verified, the user is guided through “adding and verifying” the corporation.  
- Multi‑director operational mode exists (shared visibility for authorised individuals), which suggests a real “authorised user” concept—but the product is still constrained to **single‑owner / single‑layer** eligible structures publicly.  
- Wealthsimple’s chequing / CDIC disclosures emphasise “funds held in trust … provided certain disclosure rules are met” and that funds are spread across CDIC members for higher aggregate coverage (mechanically implying beneficiary‑level recordkeeping and downstream reporting to partner institutions).  

**Major banks (document and control expectations)**  
- **Royal Bank of Canada** separates who can open online: “sole proprietorship or a single‑owner corporation with only one authorised signatory” can open online; “multi‑owner … or more than one authorised signatory” must call to open (suggesting increased KYC/authority verification friction for more complex control).  
- **Royal Bank of Canada** lists baseline artefacts for opening: government ID plus business registration documents such as Articles of Incorporation / Certificate of Existence / Master Business Licence; and requires a branch visit to verify identity and activate in the described flow.  
- **TD Canada Trust** explicitly calls for **director information** and **“ownership information, including full ownership structure”** alongside incorporation/registration documents.  
- **National Bank of Canada** (quick reference) explicitly requires, for indirect ownership cases, an **organisation chart showing the ownership structure down to individuals**, including **percentage ownership** of each related business and beneficial owner, signed and dated by an authorised representative—indicating a bank expectation of a formalised “ownership structure diagram” artefact for layered ownership.  

### Observed onboarding patterns for corporate investing

**Wealthsimple (public onboarding flow signals)**  
- The corporate help article states that after submitting the request, “our team will review … against the business registry records” and then send “additional forms … via DocuSign.”  
- Wealthsimple’s “automatic business verification” describes: user answers questions → the system searches Canadian business registries, runs a risk analysis with first‑party and third‑party information, then returns an instant decision or sends to manual review.  
- Wealthsimple’s relationship disclosure states that corporate self‑directed accounts are provided by an investment dealer that provides **order‑execution‑only** services (important for how KYC/suitability are operationalised).  

**Brokerage forms (what they actually collect)**  
- A common investing pattern is a **Beneficial Ownership Form** for non‑individual accounts collecting beneficial owners / controllers (often ≥25% control), including name, DOB, address, sometimes banking info to facilitate identity verification, and an authorised signatory signature attesting completeness and accuracy.  
- These forms explicitly model **indirect account holders** (beneficial ownership through layered structures), which is directly relevant to your “multi‑layer corp” target.  

**Regulator expectations that shape “step discovery”**  
- NI 31‑103 requires registrants to take “reasonable steps” to establish identity and collect sufficient KYC information, and for corporate clients specifically to establish the nature of the business and identify individuals who beneficially own or control >25% voting rights.  
- AML rules require obtaining and confirming beneficial ownership/control/structure information (including multi‑layer tracing) and requiring deeper measures for complex structures.  
- OEO/OEE models require **pre‑account‑opening written disclosures** (CIRO guidance), shaping steps around disclosure and acknowledgement for investing accounts.  

## Canonical onboarding steps and step codes

The following step definitions are derived *after* the discovery above and are designed to be **atomic, ordered, and non‑overlapping**, with explicit **Mandatory vs Conditional** classification for multi‑layer corporate onboarding.

### Corporate chequing onboarding steps

**STEP‑C‑1 — Intake and product eligibility capture (Mandatory)**  
Capture account type, entity type, jurisdiction(s), and intended use, plus whether the business relationship is being established. This is required because AML rules require records of intended use and business relationship purpose/intended nature.  

**STEP‑C‑2 — Collect corporate identifiers and verify corporate existence (Mandatory)**  
Collect legal name, address, registration/incorporation details (incl. BN where used operationally) and verify corporate existence using acceptable records.  

**STEP‑C‑3 — Collect and validate corporate authority to bind (Mandatory)**  
Collect corporate documentation that proves who can bind the corporation for the account (board resolution / mandate / extract of corporate records).  

**STEP‑C‑4 — Identify and verify authorised signatories and key account controllers (Mandatory; “up to three” record requirement applies to certain account records)**  
Record and verify identity of the account holder and authorised instruction‑givers (up to three recorded in the referenced provision for a business account record), including required attributes.  

**STEP‑C‑5 — Capture and document beneficial ownership, control, and structure (Mandatory)**  
Obtain directors, 25%+ owners/controllers, and information establishing ownership/control/structure. Multi‑layer corporations require tracing through layers.  

**STEP‑C‑6 — Confirm beneficial ownership accuracy using “reasonable measures” (Mandatory; risk‑scaled)**  
Confirm accuracy at onboarding and in ongoing monitoring; the confirming measures must not be the same as obtaining measures and must scale up for complex structures.  

**STEP‑C‑7 — Third‑party determination / “acting on behalf of” assessment (Conditional but typically expected at onboarding)**  
When creating an information record, take reasonable measures to determine whether the entity is acting on behalf of a third party; if suspicion exists, record grounds.  

**STEP‑C‑8 — Sanctions screening and prohibited dealings controls (Mandatory)**  
Screen proposed engagement against sanctions lists and assess indirect dealings risk (including through subsidiaries/holding companies/associates).  

**STEP‑C‑9 — Tax residency / FATCA‑CRS self‑certification (Mandatory where the provider is a reporting financial institution)**  
Obtain and validate entity and controlling‑person self‑certifications; confirm reasonableness using information collected at account opening including AML/KYC documentation.  

**STEP‑C‑10 — AML risk assessment and onboarding decisioning (Mandatory; escalation‑driven)**  
Document risk assessment and ensure it drives depth of verification and ongoing monitoring approach; complex structures require deeper measures but are not automatically “high risk.”  

**STEP‑C‑11 — Record creation, retention clocking, and retrieval readiness (Mandatory)**  
Create required account records and ensure retention and 30‑day production capability.  

**STEP‑C‑12 — Deposit insurance (CDIC) trust disclosure and downstream reporting (Conditional; depends on product architecture)**  
If funds are held in trust at CDIC members, ensure required beneficiary info disclosure on member institution records, otherwise coverage can be limited.  

### Corporate investing onboarding steps

**STEP‑I‑1 — Intake: account type and service model selection (Mandatory)**  
Determine whether the corporate investing account is **order‑execution‑only** vs portfolio‑managed/advised, since suitability and disclosure obligations differ materially.  

**STEP‑I‑2 — Corporate identifiers and existence verification (Mandatory)**  
Same core requirement as chequing: verify corporation identity through acceptable records.  

**STEP‑I‑3 — Corporate authority, trading authorisations, and “who can act” model (Mandatory)**  
Define authorised trader(s), signing authority, and any trading limits. A best‑practice analogue is bank/broker requirement for documented authority to bind.  

**STEP‑I‑4 — KYC collection for the corporate client and controllers (Mandatory)**  
Collect KYC information necessary for the registrant’s obligations, including corporate beneficial ownership/control (25%+ voting rights ownership/control) and nature of business.  

**STEP‑I‑5 — Client confirmation of KYC accuracy and update model (Mandatory)**  
Take reasonable steps to have the client confirm accuracy and keep information current.  

**STEP‑I‑6 — AML beneficial ownership/control/structure record + “reasonable measures” confirmation (Mandatory; risk‑scaled)**  
Same AML core as chequing, but now applied to brokerage onboarding (including multi‑layer tracing and documentation).  

**STEP‑I‑7 — CBCA high‑risk registry consultation and discrepancy reporting (Conditional)**  
If (a) CBCA corporation and (b) assessed high‑risk, consult ISC data under CBCA 21.303 and, if a material discrepancy is found and not resolved in 30 days, report it and retain acknowledgement.  

**STEP‑I‑8 — Sanctions screening (Mandatory)**  
Same as chequing, but applied to corporate client, controllers, and relevant counterparties; include indirect dealings as a core consideration.  

**STEP‑I‑9 — CRS/FATCA self‑certifications for entity and controlling persons (Mandatory where applicable)**  
Obtain and validate self‑certification in the course of account opening; do reasonableness checks against AML/KYC information.  

**STEP‑I‑10 — OEO disclosures prior to opening (Mandatory for OEO models)**  
Provide written disclosures prior to account opening confirming the OEO dealer will not provide recommendations and defining client suitability for the channel.  

**STEP‑I‑11 — Suitability and “client interest first” controls (Conditional)**  
Where suitability applies (e.g., managed portfolios/advice; or contexts where suitability determinations are required), determine on a reasonable basis suitability before opening and before investment actions and put the client’s interest first; allow client‑directed override only with recorded acknowledgement and disclosures.  

**STEP‑I‑12 — Investor protection disclosure acknowledgement (CIPF/CIRO) (Conditional but generally expected)**  
Ensure CIPF coverage disclosures meet CIRO rule‑linked disclosure requirements and reference CIPF coverage policy.  

**STEP‑I‑13 — Record creation, retention, and retrieval readiness (Mandatory)**  
Same retention and retrieval constraints apply for AML records, and securities‑registrant documentation must be maintained to show compliance.  

## Artefact model and documentation design

### Artefact index

The artefacts below are designed to (a) satisfy binding requirements, (b) support regulator‑traceable rationale, and (c) enable an auditable “account opening package” that records the multi‑layer ownership story coherently.

**Notation**  
- **Mandatory** = required in essentially all complex‑corp onboardings for the product line.  
- **Conditional** = required only if triggers apply (e.g., trust ownership, CBCA high‑risk, OEO, etc.).  
- “Legal basis” references are **non‑exhaustive**, but include the most direct provisions observed in authoritative sources.

### Artefact definitions

| Artefact code | Artefact name | Legal basis (non‑exhaustive) | Purpose | Mand./Cond. | Required fields (minimum) | Acceptable formats | Validation requirements | Retention / retrieval | Production timeline | Human sign‑off | Relationships |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ART‑1 | Corporate Identity Snapshot | PCMLTFR s.109(1) (corp identity verification) | Proves entity exists and anchors legal identifiers used everywhere. | Mandatory | Legal name; registered address; directors (if included in source); registration/incorp #; jurisdiction; timestamp; source record type. | PDF / registry extract / certified copy / screenshot with metadata. | Source must be authentic/valid/current where required. | ≥5y after last transaction (where it is a record proving existence). | Before approval. | No (unless conflicts). | Drives ART‑3, ART‑4, ART‑8. |
| ART‑2 | Business registry “up‑to‑date” attestation | Wealthsimple requires registry details accurate before opening. | Prevents mismatches with registry verification processes; reduces false discrepancies. | Conditional (operational) | Entity identifiers; declaration that filings are current. | Checkbox + timestamp. | Cross‑check against registry data when available. | As part of audit file. | At intake. | No. | Supports STEP‑C‑2 / STEP‑I‑2. |
| ART‑3 | Director / Officer List | PCMLTFR s.138(1)(a) (names of all directors); bank expectations include director lists | Supports beneficial ownership trace, governance, and sanctions screening. | Mandatory | Director full name; role; address (if collected); start/end dates if known. | Structured form / PDF. | Must reconcile vs registry/official docs where available. | AML retention rules apply. | Before approval. | Conditional (if discrepancies). | Feeds ART‑8, ART‑11. |
| ART‑4 | Corporate Authority to Bind (Resolution / Mandate Extract) | PCMLTFR s.12(c) (official corporate record showing power to bind) | Establishes who can open/operate account; prevents unauthorised onboarding. | Mandatory | Corporation name; resolution text; authorised signatories; scope; date; corporate minute reference. | PDF; certified extract; e‑signature. | Verify authenticity; confirm signatory authority chain. | ≥5y after account closed (as operating agreement/application class). | Before account activation. | Yes (if non‑standard). | Cross‑refs ART‑5, ART‑6. |
| ART‑5 | Authorised Signatory / Authorised Instruction‑Giver Record | PCMLTFR s.12(b) (record for up to three authorised instruction persons) | Defines operational controllers; used for identity verification and permissions. | Mandatory | Full name; address; occupation/business; DOB (if person); role; authority limits; start date. | Structured record + audit log. | Must match ID verification outputs. | ≥5y after account closed (record category). | Before activation. | No (except escalations). | Uses ART‑6/ART‑7. |
| ART‑6 | Signature Card / Signature Specimen | PCMLTFR s.12(a) (signature card) | Prevents fraud; supports instruction authentication. | Mandatory (where applicable) | Specimen signature; signer identity link; date. | Wet signature scan / compliant e‑sig. | Verify signer identity first. | ≥5y after account closed. | Before activation. | No. | Linked to ART‑5. |
| ART‑7 | Account Intended Use + Business Relationship Purpose Record | PCMLTFR s.12(d) (intended use record); PCMLTFR s.145 (purpose/intended nature) | Core AML baseline for monitoring and risk assessment. | Mandatory | Purpose; expected activity; funding sources; expected counterparties; geographies; products used. | Structured form. | Review for plausibility vs entity profile; escalate mismatches. | ≥5y after account closed. | At onboarding acceptance. | Conditional (high‑risk). | Drives ART‑12. |
| ART‑8 | Beneficial Ownership, Control & Structure Record (incl. Org Chart) | PCMLTFR s.138(1)(a),(d) (25% owners + structure); bank practice for multi‑layer structure diagrams | Single source of truth for complex ownership. | Mandatory | Directors; 25%+ owners/controllers; intermediate entities; % ownership per link; control mechanisms; trustee/settlor/beneficiaries if trust; diagram + narrative. | Diagram + structured data (JSON‑like) + PDF. | Must be confirmable via reasonable measures and/or signed attestation. | ≥5y after last transaction (beneficial ownership record class). | Before approval. | Yes if complex/opaque. | Anchors ART‑9/ART‑11/ART‑14/ART‑15. |
| ART‑9 | Beneficial Ownership Confirmation Evidence | PCMLTFR s.138(2),(3) (confirm accuracy + record measures); FINTRAC: “reasonable measures cannot be the same … client can sign” | Shows how you confirmed accuracy. | Mandatory | List of measures; documents consulted; date(s); who performed; outcome. | Checklist + attachments. | Measures must differ from initial obtain measures; scale with risk/complexity. | ≥5y after last transaction. | Before approval (or conditional clearance). | Yes (high‑risk). | References ART‑8 and registry sources. |
| ART‑10 | Third‑Party Determination Record | PCMLTFR s.136 (reasonable measures; record if suspect) | Captures “acting on behalf of” logic for corporations and signatories. | Conditional | Determination; third party details (if any); relationship; grounds for suspicion if applicable. | Structured form. | Requires logical consistency with ownership/control story. | AML retention applies. | At onboarding. | Yes if suspicion. | Complements ART‑8. |
| ART‑11 | Sanctions Screening Log | Global Affairs: screen against UN + Canada lists; indirect dealings matter | Proves proactive screening and indirect dealings analysis. | Mandatory | Subjects screened; lists used; timestamps; match results; disposition; escalation notes. | System log export. | Must include indirect associations analysis for layered control. | Retain per internal policy aligned to AML. | Before approval + ongoing. | Yes for positive/near matches. | Uses ART‑8/ART‑5/ART‑3. |
| ART‑12 | AML Risk Assessment Record | FINTRAC: reasonable measures align with risk assessment; complex structures require deeper measures | Evidence of risk‑based approach, not box‑ticking. | Mandatory | Risk factors; rating; rationale; required EDD; monitoring plan. | Structured form + narrative. | Must drive step depth (“go further” for complex/high risk). | Retain with AML file. | Before approval. | Yes (high‑risk). | Drives ART‑9/ART‑14. |
| ART‑13 | Privacy Notice + Consent Record | PIPEDA s.6.1 valid consent; s.5(3) appropriate purposes | Enables defensible collection/use/disclosure of personal info (directors/UBOs). | Mandatory | Notice version; purposes; sharing; consent timestamp; user acknowledgement. | UI record + PDF snapshot. | Must be understandable for valid consent. | Retain to prove consent. | Before collecting sensitive fields. | No. | Cross‑refs ART‑15, ART‑8. |
| ART‑14 | CBCA Beneficial Ownership Discrepancy Report + Acknowledgement | PCMLTFR s.138.1(1) (report in 30 days; keep acknowledgement) | Audit‑proof response to registry mismatches for high‑risk CBCA corporations. | Conditional | Discrepancy details; submission timestamp; acknowledgement copy. | Official submission export. | Must determine “material discrepancy” and whether resolved within 30 days. | Acknowledgement retention 5y (explicit in FINTRAC guidance). | Within statutory timeline. | Yes (materiality judgement). | References ART‑8/ART‑9. |
| ART‑15 | CRS/FATCA Self‑Certification Package (Entity + Controlling Persons) | CRA: self‑certify at account opening; confirm reasonableness; can’t rely if “knows or has reason to know” incorrect | Enables tax information reporting compliance for entity accounts and controlling persons. | Mandatory (where applicable) | Entity classification; tax residencies; TINs; controlling persons identities/residencies; signatures/affirmations; date. | Form + e‑sig. | Must do reasonableness check vs AML/KYC docs. | Retain supporting due diligence docs (CRA guidance). | In course of opening; “as soon as possible”. | Yes if contradictions. | Cross‑refs ART‑8/ART‑12. |
| ART‑16 | Investing KYC Profile (Corporate client) | NI 31‑103 s.13.2(2),(3) (identity, reputation if concern; nature of business; 25% controllers) | Supports registrant obligations and suitability logic (where applicable). | Mandatory (investing) | Business nature; financial circumstances; objectives; risk profile; controllers; confirmation status. | Structured form. | Must be confirmed and kept current. | Needs update cycle. | Before trading/advice. | Yes for edge cases. | Inputs ART‑17/ART‑18. |
| ART‑17 | Suitability Determination Record | NI 31‑103 s.13.3 (before opening; reasonable basis; interest first; alternatives) | Defensible suitability and “interest first” evidence (esp. managed). | Conditional (service‑model dependent) | Recommendation/action; basis; alternatives; costs impact; interest‑first rationale. | Structured record. | Must be performed before account opening and before investment action. | Retain under registrant record rules. | Before activation/trade. | Yes (core judgement). | Uses ART‑16/ART‑12. |
| ART‑18 | OEO / Non‑Recommendation Disclosure Acknowledgement | CIRO OEO guidance: written disclosure prior to opening confirming OEO dealer will not do certain things | Defensible OEO boundary (no personalised recommendations). | Conditional (OEO) | Disclosure version; acknowledgement; date; delivery channel. | UI log. | Ensure delivered **prior to opening**. | Retain to prove disclosure. | Before open. | No. | Supports client segmentation. |
| ART‑19 | CIPF Coverage / Membership Disclosure Acknowledgement | CIPF FAQ: CIRO rule 2284 requires members to disclose CIPF membership and coverage | Investor protection disclosure defensibility. | Conditional (investing) | Disclosure text; acknowledgement; date. | UI log / PDF. | Must refer to coverage limits/exclusions. | Retain with account file. | Prior to/at open. | No. | Part of investing disclosure pack. |
| ART‑20 | CDIC Trust Disclosure Dataset to Partner Banks | CDIC: coverage for deposits held in trust depends on disclosure of trustee/beneficiary info on member records | Enables correct deposit insurance determination for trust‑held funds. | Conditional | Trustee identity; beneficiary identity and required fields; allocation logic; update deltas. | Structured file (CSV/JSON). | Must be accurate and kept current. | Retain as operational evidence. | Pre‑funding/settlement. | Yes (design + QA). | Links to ART‑5/ART‑13. |
| ART‑21 | Account Application + Agreement Record | PCMLTFR s.12(e),(f) (applications; operating agreements) | Core account file evidence. | Mandatory | Application payload; agreements; acceptance timestamps; versions. | PDF + event log. | Must be retrievable. | ≥5y after closure. | At opening. | No. | Cross‑refs ART‑23. |
| ART‑22 | Records Retrieval Readiness Proof | PCMLTFR s.149 (provide within 30 days) | Demonstrates operational ability to respond to regulator requests. | Mandatory | Indexing scheme; retrieval test logs; last test date. | Runbook + logs. | Must prove 30‑day capability. | Ongoing. | Ongoing. | Yes (compliance). | Ensures audit defensibility. |
| ART‑23 | “Account Opening Package” Manifest (Audit File Map) | Derived from retention/recordkeeping and audit defensibility requirements. | A structured table‑of‑contents to make the file regulator‑traceable. | Mandatory | List of artefacts; versions; hashes; cross‑refs; timestamps; responsible owners. | JSON + PDF. | Must cross‑reference step codes and artefact codes deterministically. | Retain with file. | At approval. | Yes (final reviewer). | Parent of all artefacts. |

### Complete account opening artefact package model

A minimally defensible audit file for complex corporate onboarding should be assembled as a **versioned, cross‑referenced package** where every decision is traceable to (a) a step code, (b) an artefact code, and (c) a legal basis and/or guidance reference. The ordering below mirrors typical audit review flow:

1) **ART‑23 (Manifest)** with a deterministic directory of artefacts, versions, timestamps, and step references.  
2) **ART‑1/ART‑2 (Identity snapshot + registry accuracy)** for the corporation baseline.  
3) **ART‑4/ART‑5/ART‑6 (Authority + signatories + signatures)** to establish who can act.  
4) **ART‑7 + ART‑12 (Purpose/intended nature + AML risk assessment)** to justify risk‑scaled measures.  
5) **ART‑8 + ART‑9 (Ownership/control/structure + confirmation evidence)** as the core multi‑layer “story”.  
6) **ART‑11 (Sanctions log)** with any escalations and resolutions.  
7) **ART‑15 (CRS/FATCA package)** including reasonableness checks.  
8) **Conditional modules**: ART‑14 (discrepancy reporting), ART‑18 (OEO disclosure), ART‑17 (suitability record), ART‑19 (CIPF disclosure), ART‑20 (CDIC trust disclosure dataset).  

Versioning and cross‑reference minimum:  
- Every artefact should carry a **version ID** and **effective timestamp**; any update to beneficial ownership or controlling persons should trigger a new version of **ART‑8, ART‑9, ART‑12, ART‑15** with clear diffs.  
- The package must be retrievable within regulatory timelines (e.g., **30 days** in PCMLTFR s.149).  

## Regulatory index and regime deep dives

### Regulatory index

| Regime | Jurisdiction | Applies to | Binding vs guidance | Governing authority / source |
|---|---|---|---|---|
| PCMLTFA | Canada (federal) | Chequing + Investing (AML/ATF baseline) | Binding statute | Parliament / FINTRAC framework |
| PCMLTFR (SOR/2002‑184) | Canada (federal) | Chequing + Investing (verification, BO, records, retention) | Binding regulation | Department of Justice (consolidated regs) |
| FINTRAC guidance (e.g., Beneficial Ownership, Business Relationships) | Canada | Chequing + Investing | Guidance (authoritative compliance interpretation) | FINTRAC |
| Sanctions frameworks (UN Act, SEMA, JVCFOA) + Global Affairs guidance | Canada | Chequing + Investing (screening / prohibited dealings) | Acts & regulations binding; guidance non‑binding | Global Affairs + Justice Laws |
| Securities registrant rulebook: NI 31‑103 | Canada (provincial/territorial via adoption) | Investing | Binding instrument / regulation | CSA / provincial regulators |
| CIRO OEO guidance + CIPF disclosure linkages | Canada | Investing (esp. OEO) | CIRO guidance (SRO expectation); rules binding to members | CIRO / CIPF |
| Income Tax Act Part XVIII (FATCA) & Part XIX (CRS) + CRA guidance | Canada | Chequing + Investing (reporting FIs) | Binding statute; guidance non‑binding but authoritative | CRA |
| CBCA + ISC filing/search ecosystem (Corporate registry framework) | Canada | Conditional (CBCA corps; registry checks; discrepancy) | Binding statute + regulatory obligations | Corporations Canada / Justice Laws |
| PIPEDA + OPC consent guidance | Canada | Chequing + Investing | Act binding; guidance non‑binding | Department of Justice + OPC |
| CDIC trust disclosure + by‑law | Canada | Chequing (if trust‑held deposits via partners) | Binding by‑law + operational guidance | CDIC |
| CIPF coverage | Canada | Investing | Coverage framework (industry protection) | CIPF |

### Regulation deep dives

Quoted extracts below are **short extracts** from the authoritative texts; consult the cited sources for full statutory/regulatory wording.

#### PCMLTFR

**Plain‑English summary**  
PCMLTFR operationalises AML/ATF requirements for reporting entities: how to verify identities, what records must be kept for accounts, how to obtain and confirm beneficial ownership/control/structure information, and how long records must be retained and produced upon request. Multi‑layer corporations increase complexity because “ownership, control and structure” and “reasonable measures” confirmation can require tracing through multiple entities and trust arrangements and documenting how accuracy was confirmed.

**Legal requirements table (selected high‑load obligations)**

| Regulation | Section | Short extract | Mandatory obligation | Operational interpretation |
|---|---:|---|---|---|
| PCMLTFR | s.12 | “keep … records … every account …” | Keep defined account records (signature cards, authorised persons, applications, operating agreements, etc.). | Treat as the canonical “account file schema” for chequing onboarding. |
| PCMLTFR | s.105(1) | “verify a person’s identity …” | Verify identity using permitted methods; ensure documents are “authentic, valid and current.” | Drives identity‑verification sub‑workflow for directors/signatories/authorised traders. |
| PCMLTFR | s.109(1) | “verify a corporation’s identity … certificate of incorporation …” | Verify existence using specified records including directors list. | Forces registry/document verification step for corporate existence. |
| PCMLTFR | s.138(1) | “obtain … names of all directors … 25% … and … structure” | Obtain directors, 25% owners/controllers, and info establishing ownership/control/structure. | Requires structured ownership graph collection for multi‑layer corporations. |
| PCMLTFR | s.138(2) | “take reasonable measures to confirm … accuracy …” | Confirm accuracy initially and during ongoing monitoring; CBCA high‑risk requires consulting ISC public info. | Requires a risk‑scaled confirmation protocol + human review for complex cases. |
| PCMLTFR | s.138.1(1) | “report the discrepancy … within 30 days …” | Report material discrepancies (CBCA/high‑risk cases) and keep acknowledgement. | Requires a discrepancy triage workflow with a 30‑day timer. |
| PCMLTFR | s.145 | “keep a record … purpose and intended nature …” | Must record why the relationship exists and what is expected. | Drives “account purpose / expected activity” capture. |
| PCMLTFR | s.148(1) | “keep … at least five years …” | Retention rules by record type; apps/agreements retained after closure; others after last transaction/creation. | Requires retention policies and a “close account → start retention clock” control. |
| PCMLTFR | s.149 | “provided … within 30 days …” | Must be able to produce records within 30 days of request. | Requires indexing, retrieval testing, and audit‑file manifest discipline. |

**Onboarding steps impacted**  
STEP‑C‑1 to STEP‑C‑11 and STEP‑I‑2 to STEP‑I‑13, with particularly heavy impact on STEP‑C‑4/5/6 and STEP‑I‑4/5/6/7.

**Artefacts required by law (high‑load mapping)**  
ART‑4/5/6/7/8/9/10/14/21/22/23 (and ART‑1 as the practical carrier for s.109 proof).

**Human judgement mandates**  
- “Reasonable measures” confirmation of beneficial ownership accuracy (what is “reasonable” differs by risk/complexity).  
- Determining whether a discrepancy is “material” and whether it is resolved within 30 days (triggering mandatory reporting).  
- Assessing “cause for concern” signals (e.g., requiring deeper inquiries and escalation) is inherently judgement‑based; the regulation directly conditions additional action on such assessments (e.g., in other frameworks like NI 31‑103 and in guidance).  

#### FINTRAC beneficial ownership and business relationship guidance

**Plain‑English summary**  
FINTRAC guidance explains how to operationalise and evidence compliance with beneficial ownership and business relationship obligations, explicitly acknowledging that multi‑layer structures may require searching “many layers” to identify beneficial owners and that confirmation steps must go further for complex structures.

**Guidance requirements table (selected)**

| Source | Section (in guidance) | Short extract | Practical obligation | Operational interpretation |
|---|---|---|---|---|
| FINTRAC Beneficial ownership guidance | Confirmation section | “reasonable measures cannot be the same …” | Confirm accuracy using distinct measures from collection. | Require separate evidence of confirmation steps and sources. |
| FINTRAC Beneficial ownership guidance | Complexity handling | “complex business structure must go further …” | Increase depth for complexity, without presuming high risk. | Use a complexity score that influences required confirmation artefacts. |
| FINTRAC Beneficial ownership guidance | Signed confirmation | “client sign a document … satisfy … two steps” | Client signature can evidence both obtain + confirm. | Build a combined “BO declaration + attestation” artefact (ART‑9). |
| FINTRAC Business relationship guidance | Overview | Guidance defines business relationship and related obligations. | Ensure business relationship recordkeeping exists. | Make ART‑7 mandatory for any account opening. |

**Onboarding steps impacted**  
STEP‑C‑5/6/10 and STEP‑I‑6/7 plus any escalation logic tied to complexity and risk.

**Human judgement mandates**  
Selecting confidence thresholds for “reasonable measures,” resolving conflicting sources, and choosing escalation paths is judgement‑heavy and must be risk‑scaled.

#### NI 31‑103 (investing)

**Plain‑English summary**  
NI 31‑103 is the core registrant rulebook for many Canadian securities firms, requiring KYC collection and maintenance and suitability determinations (with a strong “reasonable basis” framing and “client interest first” requirement). For corporate clients, it explicitly requires identifying controllers/beneficial owners above a threshold and the nature of the business. Multi‑layer corporations add complexity because “beneficial ownership” and “direct or indirect control or direction” must be understood through the ownership graph.

**Legal requirements table (selected)**

| Instrument | Section | Short extract | Mandatory obligation | Operational interpretation |
|---|---:|---|---|---|
| NI 31‑103 | s.13.2(2)(a) | “establish the identity …” | Establish identity; if concerns, inquire re reputation. | Define identity + red‑flag triggers for deeper review. |
| NI 31‑103 | s.13.2(3) | “identity of … beneficial owner … control … >25% …” | For corporations, establish nature of business + 25% controllers/owners. | Requires a structured controller registry (ART‑16 + ART‑8). |
| NI 31‑103 | s.13.2(3.1) | “take reasonable steps to have a client confirm … accuracy” | Obtain client confirmation of accuracy. | Should be an explicit clickwrap/e‑sig (ART‑16). |
| NI 31‑103 | s.13.3(1) | “Before … opens an account … must determine … suitable …” | Suitability determination prior to account opening / investment action. | Applies strongly to advice/managed contexts; OEO is treated differently operationally under SRO frameworks. |
| NI 31‑103 | s.13.3(1)(b) | “puts the client’s interest first” | Client‑first requirement in suitability. | Creates non‑automatable judgement about conflicts/costs/alternatives. |

**Onboarding steps impacted**  
STEP‑I‑4 to STEP‑I‑6 and STEP‑I‑11, plus ongoing update controls implied by s.13.2(4).

**Artefacts required by law**  
ART‑16 (KYC), ART‑17 (where suitability applies), plus confirmation/update evidence.

**Human judgement mandates**  
- “Cause for concern” and reputation inquiries in KYC, and how much diligence is required.  
- Suitability “reasonable basis,” “client interest first,” and alternatives analysis (judgement competes with automation).  

#### Income Tax Act reporting regimes (FATCA/CRS) via CRA guidance

**Plain‑English summary**  
For reporting financial institutions, CRA requires processes to identify accounts held by entities that are non‑resident or controlled by non‑residents/U.S. persons, obtain self‑certifications, and validate them. The “reasonableness” obligation explicitly leverages AML/KYC data collected at onboarding (creating a direct dependency between tax compliance and AML onboarding artefacts).

**Legal/guidance requirements table (selected)**

| Source | Reference | Short extract | Mandatory obligation | Operational interpretation |
|---|---|---|---|---|
| CRA CRS guidance | 6.30 | “cannot be relied upon if … reason to know …” | Must reject unreliable self‑certification. | Requires contradiction detection against KYC/AML information. |
| CRA CRS guidance | 6.31 | “must consider … AML/KYC procedures …” | Use onboarding data to validate. | Tax self‑cert depends on ART‑8/ART‑16. |
| CRA CRS guidance | 6.27 | “take effective measures … as soon as possible” | Ensure timely collection/validation; consider “freeze/closure” measures. | Creates escalation and remediation steps for missing self‑certs. |
| CRA entity accounts info | Account opening | “ask you to certify … controlled by …” | Collect entity + controlling persons info at opening. | Needs controlling person mapping aligned with BO artefacts. |

**Onboarding steps impacted**  
STEP‑C‑9 and STEP‑I‑9 (plus escalation hooks in STEP‑C‑10 / STEP‑I‑13).

**Human judgement mandates**  
Determining whether the institution has “reason to know” a self‑certification is unreliable, and choosing appropriate remediation measures (request more info vs restrict account).  

#### Sanctions (UN Act, SEMA, JVCFOA) via Global Affairs guidance

**Plain‑English summary**  
Sanctions compliance requires screening and avoiding prohibited dealings, including **indirect** dealings. Multi‑layer ownership increases complexity because prohibited dealings can arise through parents/subsidiaries/associates or third parties even if the immediate customer is not listed.

**Guidance requirements table (selected)**

| Source | Reference | Short extract | Mandatory obligation | Operational interpretation |
|---|---|---|---|---|
| Global Affairs guidance (financial sector) | Screening | “Screen … against … consolidated lists …” | Screen proposed engagement against lists. | Build sanctions screening into onboarding gating. |
| Global Affairs guidance | Indirect dealings | “indirect dealings are an important consideration” | Consider indirect connections. | Requires UB/UC graph screening (ART‑8→ART‑11). |
| Global Affairs guidance | SEMA/JVCFOA | “prohibited … even indirectly, such as through a third party” | Prohibit facilitation of listed‑person dealings. | Forces escalation and legal review for matches/near matches. |

**Onboarding steps impacted**  
STEP‑C‑8 and STEP‑I‑8.

**Human judgement mandates**  
“Indirect association” analysis and deciding whether a match is a true positive and whether an activity “facilitates” a prohibited dealing are not safely fully automatable.  

#### PIPEDA (privacy)

**Plain‑English summary**  
Corporate onboarding necessarily collects personal information about directors, officers, beneficial owners, trustees/settlors/beneficiaries, and authorised signers. PIPEDA requires that organisations only collect/use/disclose personal info for appropriate purposes and that consent be meaningful/valid (reasonable expectation of understanding).

**Legal requirements table (selected)**

| Act | Section | Short extract | Mandatory obligation | Operational interpretation |
|---|---:|---|---|---|
| PIPEDA | s.5(3) | “only for purposes … appropriate …” | Collect only what’s appropriate. | Prevents “just in case” data grabs in onboarding. |
| PIPEDA | s.6.1 | “consent … only valid if … would understand …” | Ensure valid consent standard. | Requires plain‑language privacy disclosure + UX evidence (ART‑13). |

**Onboarding steps impacted**  
STEP‑C‑1 through STEP‑C‑6 and STEP‑I‑1 through STEP‑I‑6 (any step collecting personal data).

**Human judgement mandates**  
Designing what is “appropriate” and what a “reasonable person would consider” appropriate, and whether consent UX is understandable, requires human assessment and periodic review.  

#### CDIC trust disclosure (chequing architecture dependent)

**Plain‑English summary**  
If deposits are held **in trust** at CDIC member institutions (as described in Wealthsimple disclosures), CDIC coverage for beneficiaries depends on required trustee/beneficiary information being disclosed on the member institution’s records before a failure. Where no beneficiary info is provided, coverage can be limited to the trustee name.

**Binding/guidance table (selected)**

| Source | Reference | Short extract | Obligation | Operational interpretation |
|---|---|---|---|---|
| CDIC “Deposits held in trust” | Conditions | “Required information … disclosed … prior to failure” | Ensure disclosure rules met. | Requires a beneficiary dataset pushed to partner institutions. |
| CDIC by‑law | Beneficiary disclosure | “setting out the beneficiary’s name and address” | Ensure beneficiary info present on records. | Drives ART‑20 field requirements. |
| Wealthsimple disclosure | Trust framework | “provided certain disclosure rules are met” | Operational obligation to meet disclosure rules. | Aligns product design with CDIC disclosure rulebooks. |

**Onboarding steps impacted**  
STEP‑C‑12 (plus STEP‑C‑4/5 for collecting beneficiary identity fields used downstream).

**Human judgement mandates**  
Determining correct beneficiary identity data, allocations, and handling exceptions (e.g., mismatched names, entity reorganisations) requires supervised review in complex cases.  

## Onboarding step matrices

This section maps each step code to **exact rule hooks** and required artefacts. “Human judgement required” is marked **Yes** only where binding “reasonable measures / reasonable basis / reason to know / material discrepancy” style language or prohibition analysis makes full automation unsafe.

### Corporate chequing step matrix

**STEP‑C‑1 — Intake and intended use**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| PCMLTFR | s.12(d) | “record that sets out the intended use of the account” | Capture intended use at intake. | ART‑7 | Yes (reasonableness of narrative) | Weak monitoring baseline; AML failures. |
| PCMLTFR | s.145 | “keep a record … purpose and intended nature” | Record business relationship purpose. | ART‑7 | Yes (classification) | Non‑compliant recordkeeping. |
| PIPEDA | s.5(3) | “only for purposes … appropriate” | Ensure fields requested are appropriate. | ART‑13 | Yes (purpose design) | Privacy non‑compliance. |

**STEP‑C‑2 — Verify corporate existence**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| PCMLTFR | s.109(1) | “verify a corporation’s identity … certificate …” | Verify via acceptable records. | ART‑1 | Yes (document sufficiency) | Improper entity identification → AML breach. |
| Wealthsimple (current public flow) | Eligibility | “single layer of ownership …” | (Current state) restricts eligibility. | N/A | Yes (policy change) | Product mismatch if expanded without controls. |

**STEP‑C‑3 — Authority to bind**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| PCMLTFR | s.12(c) | “copy … corporate records … power to bind …” | Collect resolution/mandate extract. | ART‑4 | Yes (validity) | Unauthorised account opening / fraud risk. |

**STEP‑C‑4 — Verify identities of authorised persons**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| PCMLTFR | s.12(b) | “record … person … authorized to give instructions …” | Record authorised instruction‑givers. | ART‑5 | Sometimes | Missing controller inventory. |
| PCMLTFR | s.105(1) | “verify a person’s identity …” | Verify signers/controllers via permitted methods. | ART‑5 | Yes (exceptions, mismatches) | Identity verification breach. |

**STEP‑C‑5 — Beneficial ownership + structure capture**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| PCMLTFR | s.138(1) | “names … directors … 25% … and … structure” | Build ownership/control/structure record down to individuals. | ART‑8 | Yes (control interpretation) | Beneficial ownership failure. |
| Bank practice (example) | Org chart criteria | “ownership structure down to the individuals … percentage ownership … signed” | Require signed org chart for indirect ownership. | ART‑8 | Yes | Incomplete structure detection. |

**STEP‑C‑6 — Beneficial ownership confirmation**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| PCMLTFR | s.138(2) | “take reasonable measures to confirm … accuracy” | Confirm using risk‑scaled measures. | ART‑9 | Yes (what is “reasonable”) | Regulatory breach; poor AML controls. |
| FINTRAC guidance | Confirmation | “cannot be the same … acceptable … client sign …” | Ensure confirmation differs; allow signed attestation. | ART‑9 | Yes | Weak defensibility. |

**STEP‑C‑7 — Third‑party determination**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| PCMLTFR | s.136(1) | “take reasonable measures to determine … acting on behalf of a third party” | Perform and record determination. | ART‑10 | Yes | Missed true controller; AML exposure. |

**STEP‑C‑8 — Sanctions screening**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---|---|---|---|---|---|
| Global Affairs guidance | List screening | “Screen … against … consolidated lists …” | Screen entity + controllers + signers. | ART‑11 | Yes (indirect dealings) | Prohibited dealings; severe legal risk. |
| Global Affairs guidance | Indirect | “prohibited … even indirectly … through a third party” | Assess indirect ownership/control. | ART‑11 | Yes | Indirect sanctions breach risk. |

**STEP‑C‑9 — CRS/FATCA self‑certification**

| Regulation / guidance | Reference | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---|---|---|---|---|---|
| CRA CRS guidance | 6.30–6.31 | “cannot be relied upon … reason to know …”; “must consider … AML/KYC” | Collect + validate; contradiction checks vs AML/KYC. | ART‑15 | Yes (“reason to know”) | Tax reporting breach; penalties. |
| CRA CRS guidance | 6.27 | “take effective measures … as soon as possible” | Remediation path if missing. | ART‑15 | Yes | Non‑compliance and penalty exposure. |

**STEP‑C‑10 — AML risk assessment & decisioning**

| Regulation / guidance | Reference | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---|---|---|---|---|---|
| FINTRAC BO guidance | Risk scaling | “should align with your risk assessment … go further …” | Document risk and use it to scale measures. | ART‑12 | Yes | Inadequate diligence for complex/high‑risk structures. |

**STEP‑C‑11 — Retention & retrieval**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| PCMLTFR | s.148(1) | “keep … at least five years …” | Apply retention clocks by record type. | ART‑22/23 | No (policy design: Yes) | Inability to evidence compliance. |
| PCMLTFR | s.149 | “provided … within 30 days …” | Build retrieval index and test. | ART‑22 | Yes (controls sign‑off) | Regulatory failure on request. |

**STEP‑C‑12 — CDIC trust disclosure (if applicable)**

| Regulation / guidance | Reference | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---|---|---|---|---|---|
| CDIC trust deposits | Conditions | “Required information … disclosed … prior to failure” | Ensure beneficiary info is on member records. | ART‑20 | Yes (edge cases) | Reduced/incorrect deposit insurance coverage. |

### Corporate investing step matrix

**STEP‑I‑1 — Determine service model (OEO vs managed)**

| Regulation / guidance | Reference | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---|---|---|---|---|---|
| CIRO OEO guidance | Prior to opening | “must provide … prior to opening … written disclosures …” | Decide channel + deliver correct disclosure pack. | ART‑18 | Yes (client suitability for channel) | Wrong regulatory obligations applied. |
| NI 31‑103 | s.13.3(1) | “Before … opens an account … must determine … suitable …” | If managed/advised, enable suitability workflow. | ART‑17 | Yes | Breach of suitability requirements. |

**STEP‑I‑2 — Corporate identity verification**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| PCMLTFR | s.109(1) | “verify … certificate … contains … directors” | Verify existence. | ART‑1 | Yes | AML breach. |

**STEP‑I‑3 — Authority to bind + authorised trader model**

| Regulation / guidance | Reference | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---|---|---|---|---|---|
| PCMLTFR | s.12(c) (analogy) | “power to bind … in respect of the account” | Capture corporate trading authority and who can trade. | ART‑4/ART‑5 | Yes | Unauthorised trading authority. |

**STEP‑I‑4 — KYC for corporate client**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| NI 31‑103 | s.13.2(2) | “take reasonable steps to … establish the identity …” | KYC identity and baseline KYC fields. | ART‑16 | Yes (“reasonable steps”) | KYC non‑compliance. |
| NI 31‑103 | s.13.2(3) | “nature of the client’s business …” | Capture business nature + controllers. | ART‑16 | Yes | Incomplete corporate profile. |

**STEP‑I‑5 — Client confirmation & updates**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| NI 31‑103 | s.13.2(3.1) | “take reasonable steps … confirm … accuracy” | Explicit client confirmation. | ART‑16 | Yes | Weak KYC defensibility. |
| NI 31‑103 | s.13.2(4) | “keep current … within a reasonable time …” | Update on significant changes. | ART‑16 | Yes (change significance) | Stale profile leading to suitability failures. |

**STEP‑I‑6 — AML beneficial ownership + reasonable measures confirmation**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| PCMLTFR | s.138(1)–(3) | “obtain …”; “reasonable measures …”; “keep a record … measures” | Capture + confirm ownership/control/structure, log measures. | ART‑8/ART‑9 | Yes | AML breach. |
| FINTRAC guidance | Complexity | “search through many layers …” | Multi‑layer tracing expectations. | ART‑8/ART‑9 | Yes | Missed indirect beneficial owners. |

**STEP‑I‑7 — CBCA high‑risk registry consult + discrepancy reporting**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| PCMLTFR | s.138(2) | “shall consult … section 21.303 … if … high risk …” | Consult ISC data for high‑risk CBCA corps. | ART‑9 | Yes (high‑risk determination) | Missed discrepancy duty. |
| PCMLTFR | s.138.1(1) | “report … within 30 days … keep … acknowledgement” | Report material discrepancies, retain ack. | ART‑14 | Yes (materiality) | Statutory breach. |

**STEP‑I‑8 — Sanctions screening**

Same mapping as STEP‑C‑8.

**STEP‑I‑9 — CRS/FATCA**

Same mapping as STEP‑C‑9.

**STEP‑I‑10 — OEO disclosures prior to open**

| Regulation / guidance | Reference | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---|---|---|---|---|---|
| CIRO OEO guidance | Prior to opening | “must provide … prior to opening … disclosures …” | Deliver and capture acknowledgement. | ART‑18 | Yes (edge cases) | OEO compliance failure. |

**STEP‑I‑11 — Suitability (where applicable)**

| Regulation / guidance | Section | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---:|---|---|---|---|---|
| NI 31‑103 | s.13.3(1) | “Before … opens an account … must determine …” | Make suitability determination. | ART‑17 | Yes (core) | Securities compliance failure. |
| NI 31‑103 | s.13.3(2.1) | “received recorded confirmation …” | If client insists, record override. | ART‑17 | Yes | Weak client‑harm defensibility. |

**STEP‑I‑12 — CIPF / investor protection disclosure**

| Regulation / guidance | Reference | Exact requirement (short extract) | Required action | Artefact(s) | Human judgement required | Risk if not performed |
|---|---|---|---|---|---|---|
| CIPF FAQ (CIRO linkage) | Rule 2284 | “requires … disclose … membership … coverage …” | Provide CIPF disclosure in required form. | ART‑19 | No | Client disclosure non‑compliance. |

**STEP‑I‑13 — retention & retrieval**

Same mapping logic as STEP‑C‑11; include AML retention.  

## Human judgement map and operational pseudocode manuals

### Human judgement map

This section lists decisions that cannot be safely “hands‑off automated” because the binding language forces discretion, or because prohibitions require contextual analysis.

**Hard legal requirement (explicitly discretion‑framed in binding text)**  
- **“Reasonable measures”** for confirming beneficial ownership accuracy (PCMLTFR s.138(2)) requires selecting measures that are reasonable in context and risk‑scaled.  
- **“Material discrepancy”** determination and whether resolved within 30 days (PCMLTFR s.138.1) requires judgement about what differences “could impact the proper identification” (as described by FINTRAC guidance).  
- **CRS “knows or has reason to know”** self‑certification unreliability (CRA guidance) requires human evaluation of contradictory signals.  
- **NI 31‑103 suitability “reasonable basis”** and **“puts the client’s interest first”** requires human‑grade analysis of alternatives, costs, and the client’s objectives (especially for managed/advised contexts).  
- **Sanctions indirect dealings analysis** is explicitly treated as important by Global Affairs guidance and involves contextual determination of indirect relationships and facilitation risk.  

**Supervisory expectation (non‑binding but regulator‑traceable)**  
- FINTRAC’s explicit instruction that complex structures “must go further” in reasonable measures pushes human oversight for multi‑layer cases even where purely algorithmic checks exist.  
- CIRO OEO guidance requires that disclosures be delivered prior to opening and that client appropriateness for an online/OEO channel is considered (practically, human escalation for clients who struggle or seek personalised recommendations).  

**Risk‑based discretion (automation allowed, but with mandatory human escalation triggers)**  
- Escalate to human review when: ownership/control graph cannot be resolved to natural persons; conflicting registry vs client claims; sanctions screening returns matches; CRS/FATCA contradictions; or when corporate authority evidence is incomplete.  

### Operational pseudocode manual for corporate chequing

```text
CHEQUING ONBOARDING MANUAL (multi-layer corporate)

INPUTS:
  - Application payload (entity identifiers, requested account features)
  - Uploaded docs (if any)
  - Registry lookup results (if available)
  - Screening results (sanctions)
  - Self-certifications (tax)

OUTPUTS:
  - Decision: APPROVE / COND_APPROVE (pending artefacts) / REJECT / ESCALATE
  - Audit package: ART-23 manifest + required ART-* artefacts

PROCESS:

STEP-C-1 (Intake & intended use)
  Collect intended use + purpose of business relationship -> ART-7
  IF requested fields exceed "appropriate purposes" boundary:
    escalate to privacy/compliance reviewer

STEP-C-2 (Verify corporate existence)
  Obtain registry evidence -> ART-1
  Validate document is authentic/valid/current
  IF registry lookup fails OR contradictions exist:
    ESCALATE (manual verification required)

STEP-C-3 (Authority to bind)
  Require corporate resolution/mandate extract -> ART-4
  IF authority doc missing OR does not clearly authorise opening/operation:
    ESCALATE

STEP-C-4 (Authorised signatories)
  Collect authorised instruction-givers -> ART-5
  Verify identity for each required person -> ART-5 (with verification method logs)
  Create signature specimens where applicable -> ART-6
  IF identity verification fails:
    REJECT or ESCALATE depending on failure reason

STEP-C-5 (Beneficial ownership/control/structure capture)
  Build ownership graph down to individuals -> ART-8
  Require % ownership per link and control mechanisms
  IF cannot reach natural persons OR trust structures unclear:
    ESCALATE (complexity)

STEP-C-6 (Confirm BO accuracy - "reasonable measures")
  Perform confirmation measures (docs, registries, signed attestation) -> ART-9
  IF risk/complexity high:
    require enhanced measures (more sources, stronger evidence) and compliance sign-off

STEP-C-7 (Third-party determination)
  Determine acting-on-behalf-of -> ART-10
  IF reasonable grounds to suspect third-party:
    record grounds and ESCALATE

STEP-C-8 (Sanctions screening)
  Screen entity + directors + signers + beneficial owners -> ART-11
  IF positive/near match:
    ESCALATE to sanctions specialist; HOLD account opening

STEP-C-9 (CRS/FATCA)
  Collect entity + controlling persons self-certifications -> ART-15
  Perform reasonableness checks vs ART-8/ART-5/ART-1
  IF "reason to know" inconsistency:
    ESCALATE; request correction or restrict onboarding until resolved

STEP-C-10 (AML risk assessment & decisioning)
  Compute risk rating with documented rationale -> ART-12
  IF high risk:
    require compliance officer approval and enhanced monitoring plan

STEP-C-11 (Record creation, retention, retrieval readiness)
  Save account application + agreements -> ART-21
  Generate ART-23 manifest linking: steps -> artefacts -> timestamps
  Ensure retention metadata and retrieval index -> ART-22

STEP-C-12 (CDIC trust disclosure dataset - if trust-held deposits architecture)
  Generate beneficiary disclosure dataset to partner institutions -> ART-20
  Validate beneficiary identity fields align to partner requirements
  IF dataset invalid:
    ESCALATE (coverage risk)

FINALISE:
  IF any ESCALATE flags unresolved:
    Decision = ESCALATE
  ELSE IF mandatory artefacts incomplete:
    Decision = COND_APPROVE (no funding/activation until complete)
  ELSE:
    Decision = APPROVE
```

### Operational pseudocode manual for corporate investing

```text
INVESTING ONBOARDING MANUAL (multi-layer corporate)

INPUTS:
  - Account type: OEO self-directed OR managed/advised
  - Corporate identity + registry evidence
  - Authority docs + authorised traders
  - KYC/AML info (including beneficial ownership/control/structure)
  - Sanctions screening
  - CRS/FATCA self-certifications
  - Disclosure acknowledgements

OUTPUTS:
  - Decision: APPROVE / COND_APPROVE / REJECT / ESCALATE
  - Audit package: ART-23 manifest + required ART-* artefacts

PROCESS:

STEP-I-1 (Service model selection)
  IF account is OEO:
    require ART-18 (OEO disclosure acknowledgement) before opening
  ELSE (managed/advised):
    enable suitability workflow (ART-17 required)

STEP-I-2 (Corporate identity verification)
  Verify corporate existence -> ART-1
  IF not verifiable:
    ESCALATE

STEP-I-3 (Authority + authorised trader model)
  Collect binding authority docs -> ART-4
  Define authorised trader(s) and limits -> ART-5
  IF unclear authority:
    ESCALATE

STEP-I-4 (KYC for corporate client)
  Collect registrant KYC fields -> ART-16
  Include nature of business + controllers/beneficial owners threshold details
  IF any "cause for concern" indicator:
    require deeper review; note escalation

STEP-I-5 (Client confirmation + updates)
  Obtain client confirmation of accuracy -> ART-16
  Set KYC refresh triggers (ownership change, address change, control change)

STEP-I-6 (AML beneficial ownership + confirmation)
  Build ART-8 ownership graph down to individuals
  Perform reasonable measures confirmation -> ART-9
  IF complexity high:
    require compliance sign-off and enhanced measures

STEP-I-7 (CBCA high-risk ISC consult + discrepancy reporting)
  IF entity is CBCA-incorporated AND AML risk is high:
    consult ISC data (record in ART-9)
    IF material discrepancy AND not resolved within 30 days:
      submit discrepancy report; store acknowledgement -> ART-14

STEP-I-8 (Sanctions screening)
  Screen entity + controllers + authorised traders -> ART-11
  IF match:
    HOLD + ESCALATE

STEP-I-9 (CRS/FATCA)
  Collect and validate self-certifications -> ART-15
  IF contradictions:
    ESCALATE

STEP-I-10 (OEO disclosures prior to opening)
  IF OEO model:
    confirm ART-18 exists and was delivered before opening
    IF client behaviour suggests need for advice/recommendations:
      ESCALATE or route to advice-eligible channel

STEP-I-11 (Suitability where applicable)
  IF managed/advised OR suitability required:
    perform suitability determination -> ART-17
    IF client insists on unsuitable action:
      record disclosure + alternative + confirmation -> ART-17

STEP-I-12 (Investor protection disclosures)
  Provide CIPF/coverage disclosure acknowledgement -> ART-19 (as applicable)

STEP-I-13 (Records and audit package)
  Save agreements -> ART-21
  Generate ART-23 manifest and retention metadata -> ART-22/ART-23

FINALISE:
  same decision logic as chequing.
```

### Likely gaps and access limitations

- Some **CIRO rule text** (beyond public guidance and CIPF’s summary of CIRO rule references) can be distributed across member‑only or large consolidated PDF rulebooks; this research therefore anchors disclosure‑related obligations primarily on CIRO’s published OEO guidance and CIPF’s published explanation of CIRO disclosure rule linkages.  
- Wealthsimple’s exact internal operational steps and control thresholds (e.g., how risk scoring is implemented) are not fully public; the step discovery therefore uses Wealthsimple public descriptions of registry verification + manual review fallback as the observable basis.
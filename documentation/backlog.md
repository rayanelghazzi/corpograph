TODO:

BEFORE ARCHITECTURE:
- Produce ART-* reference doc, to help populate the db with a reference table to be used for RAG
- Specify exact input document list, with content of each, probably to include in db table to be used for RAG
- Identify fallback chain for required documents in PHASE 1 and PHASE 2 (i.e. what to ask for when indentification or mapping fails or is ambiguous)

POST-ARCHITECTURE:
- Identify the type of discrepencies that exist in PHASE 1
- Architecture: Data Models, Entities, Relationships, Fields, APIs, Services, ETC
- After Architecture and review, revisit workflow with precise terms and fields


SUMMARY OF AI SYSTEMS:
- Report, summary, and artifact generator (ALL PHASES)
- Document extraction engine (PHASE 1, 2)
- Reconciliation engine (PHASE 1)
- Graph construction service
    - Graph construction
    - Completeness analyzer: outputs gap analysis, gap report, and additional doc request list
    - Notes:
        - Exact instructions for complexity, completeness etc.
- Match explanation engine
- Audit narrative generator


UI Brainstorming:
- Document storage view + export button (exports as zip)
- Document editor
- Graph view should be easily accessible at any point in the workflow and should be updated with each step with info (e.g. sanction screening )
- HITL interface is: instructions, buttons, and if manual entry required -> text to be processed by LLM
- Chatbot with documents



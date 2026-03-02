**Common UI elements for all steps**

- Workflow frame:
    - Top: 
        - Workflow progress bar:
            - 1 -> 3 timeline
    - Right:
        - Human Decision section
            - Contains buttons
            - Contains Agent Chat, which is an LLM Agent chat interface with a conversation history visible through text and an input with a send button. This is always present in all steps and conversations persist between steps.
        - Artifacts section
            - Contains all the case artifacts accumulated throughout the workflow
            - Highlights the artifacts included in the current step
            - Contains a button to open the artifact in a modal that displays the artifact in a read-only view
            - Artifact item contains:
                - Artifact name
                - Artifact description
                - Artifact status
                - Artifact action
        - Button to open graph view
            - Clicking on it opens a modal that displays the graph view
            - Graph view button only visible after graph is generated in PHASE 2
    - Content view (UI cards of info useful to the analyst)
        - All cards have similar design and layout
        - Error or warning cards have different border colors
        - Title should be name of the card as described in the "Content View" section of each phase
        - Description should be a list of artifact codes that the card represents

**Status list of each case:**
- DRAFT_INPUT
- READY_FOR_REVIEW
- IN_REVIEW
- ESCALATED
- REJECTED
- APPROVED

# DASHBOARD
- Total cases, pending review, ready for approval, rejected, escalated (counts)
- Searchable and filterable list of case
- Each case hase:
    - Icon
    - Corporation Name (title)
    - Case number, date, etc (grey and smaller font under titl)
    - Phase progress
    - Review/Continue button

# PHASE 1 — Entity Verification and Authority  

Content View:
- Discrepencies in cross-check with registry records
    - List of discrepencies
    - Assistive test that explains that resolving discrepencies can be done through the chat
- Corporation Identity Data
- Directors and Officers
- Signing Authoriy

Decision Panel:
- Button 1:
    - Title: Proceed to Beneficial Ownership
    - Description: All artifacts are accurate and complete
    - Logic: 
        - Disabled if discrepencies are not resolved
        - Clicking takes user to PHASE 2
- Button 2:
    - Title: Escalate to compliance
    - Description: There are significant issues that require senior review
    - Logic:
        - Clicking takes user to dashboard and sets case to ESCALATED


# PHASE 2 — Ownership and Beneficial Ownership Graph

Content View:
- Ownership Gap & Discrepancy Report
    - List of gaps
    - List of discrepencies
    - Assistive test that explains that resolving gaps and discrepencies can be done through the chat
    - Logic:
        - Should hide if no gaps or discrepencies are present
- Ownership Graph
    - Visual graph of ownership and control structure
    - Logic:
        - Should show empty state if gaps and discrepencies are not resolved, and ask user to resolve them
    
- Beneficial Ownership Summary
    - List of beneficial owners
        - Should show empty state if gaps and discrepencies are not resolved, and ask user to resolve them

Decision Panel:
- Button 1:
    - Title: Proceed to Reasonable Measures
    - Description: All artifacts are accurate and complete
    - Logic:
        - Disabled if discrepencies and gaps are not resolved
        - Clicking takes user to PHASE 3
- Button 2:
    - Title: Escalate to compliance
    - Description: There are significant issues that require senior review
    - Logic:
        - Clicking takes user to dashboard and sets case to ESCALATED


# PHASE 3 — Reasonable Measures and Discrepancy Determination  

Content View:
- Case Complexity & material discrepency
    - Displays complexity score
    - Material discrepencies that were needed to be resolved
    - AI Recommendation 
- Confirmation steps
    - List of reasonable confirmation steps

Decision Panel:
- Button 1:
    - Title: Proceed to Sanctions Screening
    - Description: Measures taken to verify ownership are sufficient, and artifacts are accurate and complete
    - Logic:
        - Clicking takes user to PHASE 4
- Button 2:
    - Title: Escalate to compliance
    - Description: Discrepency is material and requires deeper examination
    - Logic:
        - Clicking takes user to dashboard and sets case to ESCALATED
- Button 3:
    - Title: Reject onboarding
    - Description: Close case and reject onboarding


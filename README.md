# CorpoGraph

An AI-native onboarding workflow that expands Wealthsimple’s ability to serve more complex business structures while keeping humans in control.

This is my submission to Wealthsimple's [AI Builder](https://jobs.ashbyhq.com/wealthsimple/f7e4d9e1-2774-4a21-99b6-02e1e4120cef?utm_source=linkedinpaid) application.

---

## Demo

**Note:** Really sorry for the long demo, couldn't shrink it to less than that. Please feel free to play it x2.  
**Another Note:** Renamed it to CorpoGraph after filming the demo, sounds nicer.

<iframe width="560" height="315" src="https://www.youtube.com/embed/SbYIAX-CGjw" title="Demo" frameborder="0" allowfullscreen></iframe>

---

## Written Explanation

While brainstorming for ideas to work on, I stumbled upon a couple interesting requirements/restrictions in the Wealthsimple write-up for [opening a corporate account](https://help.wealthsimple.com/hc/en-ca/articles/4404312884763-Open-a-Corporate-account):

- "Have a single layer of ownership for incorporated entities"
- "We currently don't support account opening or transfers for self-directed accounts with three or more owners."

So multi-owned (3+ owners) and multi-layered corporations weren't supported. I was curious to understand why. After a bit of back and forth with ChatGPT, I found some potential reasons:

- Complex ownership makes identity and regulatory verification harder (especially automated verification)
- Financial platforms must follow strict regulations on anti-money-laundering (AML), know-your-customer (KYC), and ownership transparency. So complex ownership chains or many owners increase risk profiles and documentation burden, which Wealthsimple may be avoiding
- Onboarding a corporate client with a complex structure might involve a lot of back and forth with all owners
- Wealthsimple = automation & speed, so introducing a long, complex onboarding process would blur the distinction between Wealthsimple and a traditional bank.
- The potential upside for Wealthsimple may not justify the additional human labor required to support these complex structures.
- There may not even be demand for it, as clients with more complex ownership structures often go for traditional financial institutions instead.

Although I knew there was a chance that the last point might be the biggest reason, I was compelled to explore the different opportunities to optimize and quasi-automate the onboarding process of businesses with complex structures.

In short, my theory is that the current process is very manual-intensive, and requires a lot of work:

- Get all required documents  
- Understand them  
- Pinpoint ambiguities and gaps  
- Request documents to fill those gaps  
- Finally confirm the beneficial ownership  
- Proceed with KYC on individuals and entities  

But streamlining it and automating parts of it might make it worth it for Wealthsimple to onboard such clients. And this is what CorpoGraph does:

- Automatically parse documents and extract meaningful data from them for future processing  
- Detect discrepancies, ambiguities, and gaps in the data  
- Make the editing interface smoother, more intuitive, and less redundant  
- Assess the case and recommend actions  

This is what AI helps with, and where it stops. The human analyst is still responsible for:

- Approval, rejection, escalation  
- Editing and resolving discrepancies/gaps/ambiguities  

So the AI supports and proposes, but the human decides and owns accountability.

---

## Prototype Limitations

This project is a prototype, I built it in 3 days (2 days for ideation and design, 1 day for code). There's a lot that would break at scale right now:

- It’s built for one machine. Everything runs in a single Next.js process with an in-process job runner, so if many cases run at once, they’ll queue up, slow down, and compete for CPU/memory. A crash would take all active jobs down with it. There’s no distributed queue, retries, or idempotency yet.
- Storage wouldn’t scale. Files live on local disk with paths saved in the DB — fine for a prototype, but not for multiple servers or cloud object storage.
- OpenAI usage would get expensive fast. Every Phase 1–3 run and every chat turn hits the API, so at scale you’d need rate limits, backoff, caching, or batching to control cost and quotas. The system uses AI a LOT. In production, I would rely much less on it for PDF parsing, graph building, or complexity scoring, for instance (I would still use some other forms of AI, but not necessarily LLMs).

---

## Explanation on Documentation

See the [documentation](./documentation) folder for design notes, workflow specs, and technical details:

- [Summary](./documentation/summary.md) — overview of the project
- [System design](./documentation/system-design/) — backend/frontend TDD and high-level architecture
- [UI flow](./documentation/ui-flow/) — PRD and flow variants
- [Workflow](./documentation/workflow/) — workflow versions and specs
- [Artifact spec](./documentation/artifact-spec.md), [backlog](./documentation/backlog.md), [deep research](./documentation/deep-research-report.md)

---

## Deployment

The project will be deployed later; I didn't have the chance to do this by the deadline. It can be run locally, see the `api` and `ui` directories for setup and run instructions.

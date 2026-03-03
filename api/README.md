# CorpoGraph API

Backend API for the CorpoGraph AI-Native Corporate Onboarding Orchestrator. Built with Next.js (App Router), Prisma, PostgreSQL, and OpenAI.

## Prerequisites

- **Node.js** >= 20.14
- **Docker** (for PostgreSQL)
- **OpenAI API Key** (for LLM-powered extraction and analysis)

## Local Setup

### 1. Install dependencies

```bash
cd api
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your OpenAI API key:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/corpograph?schema=public"
OPENAI_API_KEY="sk-your-key-here"
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

This starts a PostgreSQL 16 instance on port 5432.

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`.

## API Endpoints

| # | Method | Path | Description |
|---|--------|------|-------------|
| 1 | POST | `/api/cases` | Create a new case |
| 2 | GET | `/api/cases` | List all cases |
| 3 | GET | `/api/cases/:id` | Get full case details |
| 4 | PATCH | `/api/cases/:id` | Update intake fields |
| 5 | POST | `/api/cases/:id/documents` | Upload PDF documents |
| 6 | GET | `/api/cases/:id/documents` | List documents |
| 7 | POST | `/api/cases/:id/phases/:phase/run` | Trigger phase execution |
| 8 | POST | `/api/cases/:id/phases/:phase/decision` | Submit analyst decision |
| 9 | GET | `/api/cases/:id/artifacts` | List artifacts |
| 10 | GET | `/api/cases/:id/artifacts/:code` | Get artifact detail |
| 11 | GET | `/api/cases/:id/issues` | List issues |
| 12 | POST | `/api/cases/:id/chat` | Send chat message (SSE) |
| 13 | GET | `/api/cases/:id/chat` | Get chat history |
| 14 | GET | `/api/cases/:id/graph` | Get ownership graph |

## Quick Test Flow

```bash
# 1. Create a case
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{
    "intake": {"account_type": "corporate_chequing", "entity_type": "corporation"},
    "account_intent": {
      "account_purpose": "Operating account",
      "expected_monthly_volume": 50000,
      "expected_transaction_types": ["wire", "eft"],
      "funding_sources": ["revenue"],
      "counterparty_geographies": ["CA", "US"]
    },
    "consent": {"privacy_notice_version": "1.0", "acknowledged": true}
  }'

# 2. Upload documents (use sample PDFs from testing-resources/)
curl -X POST http://localhost:3000/api/cases/{CASE_ID}/documents \
  -F "files=@../testing-resources/wealthverysimple/01_Certificate_of_Incorporation_WealthVerySimple.pdf" \
  -F "files=@../testing-resources/wealthverysimple/04_Shareholder_Register_WealthVerySimple.pdf"

# 3. Run Phase 1
curl -X POST http://localhost:3000/api/cases/{CASE_ID}/phases/1/run

# 4. Poll for completion
curl http://localhost:3000/api/cases/{CASE_ID}

# 5. Submit Phase 1 decision
curl -X POST http://localhost:3000/api/cases/{CASE_ID}/phases/1/decision \
  -H "Content-Type: application/json" \
  -d '{"decision": "proceed"}'
```

## Project Structure

```
api/
├── app/api/           # Next.js API routes (14 endpoints)
├── lib/
│   ├── ai-engine/     # OpenAI integration, extraction, assessment
│   ├── artifacts/     # Artifact rendering pipeline
│   ├── case-orchestrator/  # State machine, job runner
│   ├── graph-engine/  # Ownership graph computation
│   ├── patches/       # Chat-driven patch system
│   ├── pipelines/     # Phase execution pipelines
│   ├── prisma.ts      # Database client
│   ├── errors.ts      # Error response helpers
│   └── types.ts       # TypeScript types
├── prisma/            # Database schema and migrations
├── data/uploads/      # Uploaded PDF storage
└── docker-compose.yml # PostgreSQL service
```

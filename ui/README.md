# CorpoGraph UI

Frontend for the CorpoGraph AI-Native Corporate Onboarding Orchestrator.

## Tech Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **React Router 7** — client-side routing
- **TanStack Query 5** — server state management
- **React Flow** + **dagre** — ownership graph visualization
- **react-markdown** — artifact rendering

## Prerequisites

- Node.js 20+
- The API server running on `http://localhost:3000` (see `../api/README.md`)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (proxies /api to localhost:3000)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Running with the API

```bash
# Terminal 1: Start the API
cd ../api
npm run dev

# Terminal 2: Start the UI
cd ../ui
npm run dev
```

## Testing with Sample Data

1. Open http://localhost:5173
2. Click "Submit Onboarding Packet"
3. Fill in the intake form
4. Upload PDFs from `../testing-resources/wealthverysimple/`
5. Submit the case
6. Navigate to the Analyst Dashboard
7. Click "Review" on the submitted case
8. Walk through each phase, using the AI chat to resolve any issues

## Project Structure

```
src/
├── api/          # Typed API client and endpoint modules
├── hooks/        # TanStack Query hooks
├── lib/          # Utilities (status mapping, formatting, constants)
├── components/
│   ├── ui/       # shadcn/ui generated components
│   ├── layout/   # CaseHeader, PhaseProgressBar, CaseViewLayout
│   ├── sidebar/  # HumanDecisionPanel, ArtifactsPanel
│   ├── chat/     # ChatPopover (FAB + floating panel)
│   ├── cards/    # Phase content cards (Phase1-5Content, etc.)
│   ├── modals/   # GraphModal, ArtifactModal, RationaleDialog
│   └── shared/   # StatusBadge, ErrorBanner, EmptyState, LoadingOverlay
└── pages/        # Route-level page components
```

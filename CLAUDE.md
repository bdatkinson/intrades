# InTrades — Agentic Commerce Platform for Skilled Trades

## What This Is
InTrades is a next-generation skilled trades mentoring and commerce platform. It connects apprentices with AI-powered mentor personas, integrates cost estimation tools, and builds a local economic loop connecting trades professionals, suppliers (Ace Hardware), community banks, and educational institutions (KCTCS/BCTC).

## Architecture (Fresh Build — Starting from Scratch)

### Stack
- **Frontend:** React 18+ (hooks only, no class components)
- **Backend:** Node.js / Express (or Next.js API routes)
- **Database:** PostgreSQL (primary) + Redis (caching/sessions)
- **AI Integration:** Anthropic API (Claude), DeepSeek API, Google Gemini API
- **Voice:** Web Speech API (STT) + Edge TTS or ElevenLabs (TTS)
- **Styling:** IBM Plex Mono for code/UI, system fonts for prose. Tailwind CSS for utility-first styling
- **Icons:** Lucide React
- **Testing:** Vitest + React Testing Library + Playwright (E2E)
- **Build:** Vite
- **Deployment:** Docker → target hosting TBD

### Key Domain Concepts
- **Mentor Cards:** AI personas representing trade specialists (electrician, plumber, carpenter, etc.)
- **Iron Companion Pattern:** Job Agent = initiation companion, not substitute mentor
- **Enabling Constraints:** Architectural constraints accepted early become defensible moats
- **The Local Loop:** Trades pro ↔ Supplier (Ace) ↔ Community Bank ↔ Education (BCTC)
- **Day-One Experience:** Only 4 surfaces visible; 33 more unlock via behavioral milestones
- **Factual Companion Constraint:** No emotional claims — factual voice only
- **Daily Closeout:** 2-min voice ritual at 6:30 PM
- **Weekly Call:** 10-min Sun/Mon voice review

### Business Model
- 1.2% settled invoice fee (capped at $25)
- Zero payment processing spreads
- 2.0% Ace store commissions
- $100 community bank activation dividend
- $7,500/year SIM portals license via Perkins V

### GTM Strategy
- Target: Adult post-secondary KCTCS/BCTC (bypasses high-school minor constraints)
- Cost data pipeline: Ph1 1build cold-start → Ph2 BCTC/Ace SKU import → Ph3 proprietary invoice-reconciled actuals

## Code Standards
- **TypeScript** everywhere (strict mode)
- **Hooks only** — no class components in React
- **Single-file components** preferred over multi-file structures
- **IBM Plex Mono** for code aesthetic decisions
- **TDD:** Write failing test → implement → verify pass → commit
- **Commit style:** `type: concise subject` (feat, fix, refactor, docs, chore, test)
- **Error handling:** Always handle errors explicitly, never silent catches
- **Environment variables:** Never hardcode API keys or secrets

## Project Structure (Target)
```
intrades/
├── CLAUDE.md              # This file
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example           # Template for environment variables
├── src/
│   ├── app/               # App shell, routing, providers
│   ├── components/        # Shared UI components
│   ├── features/          # Feature modules
│   │   ├── mentors/       # Mentor card personas + dialogue
│   │   ├── cost-estimator/# Cost estimation engine
│   │   ├── job-agent/     # Iron Companion / Job Agent
│   │   ├── auth/          # Authentication
│   │   └── dashboard/     # User dashboard
│   ├── lib/               # Utilities, API clients, hooks
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global styles, theme
├── server/                # Backend API
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── models/            # Database models
│   └── middleware/        # Auth, error handling, etc.
├── tests/                 # Test files mirror src/ structure
├── docs/
│   ├── plans/             # Implementation plans
│   ├── architecture/      # Architecture decisions
│   └── api/               # API documentation
└── .hermes/               # Hermes-specific config
    └── plans/             # Hermes implementation plans
```

## Key Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm test             # Run test suite
npm run test:e2e     # Run E2E tests
npm run lint         # Lint check
npm run type-check   # TypeScript check
```

## Reference Documents
- Strategy: ~/intrades-strategy/ (Constitution v2.0, Strategy v0.7)
- Obsidian: ~/obsidian-vault/02-outputs/job-agent-research/
- NotebookLM: "Job Agent - Cost Estimator" notebook

## What "Done" Looks Like
- All tests passing (unit + integration + E2E)
- TypeScript strict mode, no errors
- Responsive on 375px–2560px viewports
- Voice interaction works on mobile Chrome
- Mentor personas respond with Socratic quality gates
- No console errors or warnings
- Accessible (WCAG 2.1 AA minimum)

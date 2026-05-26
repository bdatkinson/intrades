# InTrades — Skilled Trades Mentoring System

## Overview
InTrades is a React-based mentoring platform connecting apprentices with 12 AI-powered trade specialist mentors across 4 suit domains. Powered by:
- Web Speech API (STT/TTS — Phase 3)
- Anthropic Claude API
- React 19 + TypeScript + Tailwind CSS

**Current version:** v0.2.0 — "Crew Deck: 12 AI Mentors with Socratic Dialogue"

## Quick Start
```sh
npm install
npm run dev        # Dev server on port 3000
npm test           # 722 tests across 42 files
npm run build      # Production build to dist/
```

## Features

### Phase 2: Mentor Cards & Dialogue (v0.2.0)
- **12 AI Mentor Personas** across 4 suit domains — each with unique voice, background, and teaching style
- **Socratic Quality Gates** — 4 progressive gates (comprehension, misconception, application, advancement) evaluate learner understanding before advancing
- **Card-Based UI** — Playing card aesthetic with suit-colored accents (♠️ slate, ♥️ rose, ♦️ amber, ♣️ emerald)
- **Session Persistence** — Conversations saved to localStorage, resumable across sessions
- **Factual Companion Constraint** — Constitutional guardrail ensuring mentors use factual, "older brother" tone — no emotional claims
- **Error Boundary** — Global React error boundary with retry

### Phase 1: Foundation (v0.1.0)
- React 19 + TypeScript + Vite project scaffold
- Tailwind CSS + IBM Plex Mono typography
- Layout with responsive sidebar navigation
- Auth provider with login/logout
- AI service abstraction layer (Anthropic/DeepSeek)
- Supabase client setup

## Architecture

```
src/
├── app/                    # App shell, routing
├── components/
│   ├── Layout.tsx          # Sidebar + content layout
│   └── ui/                 # Shared: Button, Card, Input, SkeletonCard, ErrorBoundary
├── features/
│   ├── mentors/            # Phase 2: 12 mentors, dialogue engine, quality gates
│   │   ├── data/           # personas.ts (48KB of prompts)
│   │   ├── dialogue.ts     # DialogueEngine
│   │   ├── engine/         # QualityGateEngine
│   │   ├── hooks/          # useMentorSession (localStorage persistence)
│   │   └── components/     # MentorCard, MentorGrid, MentorChat, etc.
│   ├── deck/               # Scenario cards + BRT track
│   ├── brt/                # Business Readiness Track (multi-step wizard)
│   └── auth/               # Login, ProtectedRoute, AuthProvider
├── lib/                    # ai-service, api-client, supabase
├── types/                  # Shared TypeScript types
└── styles/                 # Global CSS, theme
```

See [Phase 2 ADR](docs/architecture/phase-2-mentor-cards.md) for full architecture decisions.

## Key Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm test             # Run test suite (722 tests)
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
npm run type-check   # TypeScript check
npm run lint         # ESLint
```

## What "Done" Looks Like
- All 722 tests passing (unit + integration + E2E)
- TypeScript strict mode, no errors
- Responsive on 375px–2560px viewports
- Mentor personas respond with Socratic quality gates
- Factual Companion Constraint enforced across all 12 mentors
- No console errors or warnings

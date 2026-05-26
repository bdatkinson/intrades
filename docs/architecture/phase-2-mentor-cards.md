# Phase 2: Mentor Cards & Socratic Dialogue Engine — Architecture Decision Record

**Status:** Complete  
**Date:** 2026-05-26  
**Version:** v0.2.0  
**Author:** Benjamin Atkinson (Coder profile via Hermes Kanban)

## Executive Summary

Phase 2 delivers the complete Crew Deck mentor system — 12 AI-powered trade specialist personas organized across four suit domains, a Socratic dialogue engine with quality gates, session persistence, and a card-based UI. All mentor behavior is data-driven: a single `MentorChat` component renders any mentor by loading their persona configuration.

## Architecture Overview

```
src/features/mentors/
├── types.ts                      # Type system: Suit, Face, MentorPersona, Session types
├── data/
│   ├── personas.ts               # 12 mentor fixtures + SUIT_DOMAINS (48KB of prompts)
│   ├── personas.test.ts          # 18 tests: structure, constraints, uniqueness
│   └── system-prompts.test.ts    # Constraint validation across all 12 prompts
├── dialogue.ts                   # DialogueEngine: prompt building, gate evaluation, session mgmt
├── engine/
│   ├── quality-gates.ts          # QualityGateEngine: 4 gate types with progressive unlocking
│   └── quality-gates.test.ts     # 20 tests: gate progression, evaluation criteria
├── hooks/
│   ├── useMentorSession.ts       # Session persistence hook with localStorage adapter
│   └── __tests__/useMentorSession.test.ts
├── components/
│   ├── MentorCard.tsx             # Individual mentor card with suit-themed styling
│   ├── MentorGrid.tsx             # Deck overview: 4 suit sections, filter tabs, search
│   ├── MentorDetailPage.tsx       # Full mentor view with Resume/Start options
│   ├── MentorChatPage.tsx         # Route wrapper: /mentors/:id/chat
│   ├── MentorChat.tsx             # Dialogue UI: messages, quality gates, input
│   └── __tests__/                  # Component tests (MentorCard, MentorGrid, MentorChat, etc.)
└── integration.test.tsx           # 37 E2E tests: grid → detail → chat → persistence
```

## Key Architecture Decisions

### ADR-1: Data-Driven Personas

**Decision:** All 12 mentors are defined as data objects with embedded system prompts — not hardcoded components.

**Rationale:** A single `MentorChat` component renders any mentor by loading their `MentorPersona` config. Adding a new mentor requires only a new entry in `personas.ts`, no component code changes. This is the "Enabling Constraint" principle in action: the up-front decision to separate persona data from rendering logic creates a moat — the system can scale to 52+ personas with zero component changes.

**Structure:**
```typescript
interface MentorPersona {
  id: string              // "iron-thorne"
  name: string            // "Jon \"Iron\" Thorne"
  card: { suit: Suit; face: Face }
  trade: string           // "Structural Steel & Welding"
  systemPrompt: string    // ~1.2KB AI system prompt per persona
  suitDomain: SuitDomain
  // ... background, personalityVibe, whyQuote, etc.
}
```

### ADR-2: Four Suit Domains (The Crew Deck)

**Decision:** Mentors are organized into four suit domains, each representing a durable skill-set.

| Suit | Domain | Color | Mentors |
|------|--------|-------|---------|
| ♠️ Spades | Tools & Technology | Slate | K: Iron Thorne (Steel), Q: Elena Rodriguez (Concrete), J: Jax Miller (Equipment) |
| ♥️ Hearts | Interpersonal & Customer Service | Rose | K: Sal Rossi (Plumbing), Q: Ma Jenkins (Restoration), J: Mateo Flores (HVAC) |
| ♦️ Diamonds | Business Acumen | Amber | K: David Chang (Automation), Q: Aisha Okonjo (Solar), J: Kenji Sato (Cabinetry) |
| ♣️ Clubs | Safety, Compliance & Risk Management | Emerald | K: Big Mike (GC), Q: Maria Lupita (Landscape), J: Tyrell Washington (Roofing) |

**Rationale:** The suit structure provides a natural taxonomy for browsing and filtering. Each suit has a distinct visual treatment (color accent in cards, chat bubbles, section headers). This maps to the physical card deck concept — the visual language of standard playing cards applied to trade mentorship.

### ADR-3: Socratic Quality Gate Engine

**Decision:** A progressive, 4-gate system that evaluates learner responses before advancing topics.

**Gate Progression:**
1. **Comprehension Check** — After explaining a concept, learner must restate it in their own words
2. **Misconception Probe** — Mentor detects wrong assumptions and surfaces them
3. **Application Gate** — Learner applies the concept to a real scenario
4. **Advancement Gate** — All three above passed → unlock next topic

**Evaluation Strategy:** The engine uses keyword/signal-based evaluation (`because`, `therefore`, `I chose`) vs. vagueness detection (`I guess`, `maybe`, `not sure`). This is a lightweight heuristic until full LLM-based evaluation is warranted. The gate results are attached to messages as `QualityGateResult` objects and rendered visually as Pass/Fail indicators.

**Rationale:** Keyword-based gates are deterministic, fast (no extra API calls), and testable. They provide immediate feedback without the latency and cost of secondary LLM calls. The design leaves a clear upgrade path: replace `DialogueEngine.evaluateGate()` with an LLM call when quality demands it, without changing the interface.

### ADR-4: Factual Companion Constraint

**Decision:** Every system prompt is injected with a constitutional constraint that enforces factual, "older brother" tone — no emotional claims, no cheerleading.

**Constraint text (injected into every prompt):**
```
FACTUAL COMPANION CONSTRAINT:
- Do not make emotional claims about the user ("I'm proud of you", "You have a gift")
- Praise the work, not the person ("That weld held" not "You're a great welder")
- Maintain a direct, factual, "older brother" tone — never therapist, never cheerleader
- Stay grounded in observable trade realities
```

**Rationale:** This implements the "Iron Companion Pattern" (Bly's Iron John): the Job Agent is an initiation companion, not a substitute parent. The constraint is injected at the `buildPrompt` layer so it applies uniformly across all 12 mentors, regardless of their individual personality differences. It's tested: every persona test verifies the constraint is present in each system prompt.

### ADR-5: Session Persistence via localStorage

**Decision:** Chat sessions are persisted to `localStorage` with a `mentor-chat-{mentorId}` key pattern, using a StorageAdapter abstraction.

**Rationale:** localStorage is universally available, synchronous (no loading states for resume), and appropriate for proto-MVP. The StorageAdapter interface (`load/save/remove/check`) abstracts the storage backend, making it trivial to swap in IndexedDB or a server-backed store later. Sessions auto-save after every message exchange.

**Key behaviors:**
- Auto-load on chat mount (`autoLoad: true`)
- Resume indicator on detail page when saved session exists
- "Start Chat" clears saved session and begins fresh
- Separate localStorage keys per mentor (parallel conversations)

### ADR-6: Duck-Typed AI Provider Interface

**Decision:** The `DialogueEngine.sendMessage()` accepts a duck-typed `AIProvider` interface rather than importing the concrete `AIService`.

```typescript
interface AIProvider {
  sendMessage(messages: AIMessage[], options: AIOptions): Promise<string>
}
```

**Rationale:** This enables testability — tests inject mock providers without module-level mocking. It also decouples the dialogue engine from any specific AI service implementation. The concrete `ai-service.ts` can be swapped for DeepSeek, Gemini, or a local model without touching dialogue logic.

## UI Architecture

### Component Tree
```
App
├── Layout (sidebar + Outlet wrapped in ErrorBoundary)
│   ├── Home                         # Feature cards dashboard
│   ├── MentorGrid                   # /mentors
│   │   ├── SuitSection × 4          # One per suit domain
│   │   │   └── MentorCard × 3       # K, Q, J per suit
│   │   └── TabButton × 5            # All + 4 suit filters
│   ├── MentorDetailPage             # /mentors/:id
│   │   └── (Resume | Start Chat)
│   └── MentorChatPage               # /mentors/:id/chat
│       └── MentorChat
│           ├── ChatMessageBubble    # User or mentor message
│           │   └── QualityGateIndicator  # Pass/Fail badge
│           └── (input area)
```

### Visual Design System
- **Suit Colors:** Spades=slate, Hearts=rose, Diamonds=amber, Clubs=emerald
- **Typography:** IBM Plex Mono for all UI text (K/Q/J labels, names, tabs, chat)
- **Card Layout:** Each MentorCard follows a playing card aesthetic — face indicator (KING/QUEEN/JACK) + suit symbol, name in mono, trade underneath, city/state in muted text, personality vibe as badge, "Why" quote in italic
- **Chat Bubbles:** Mentor messages colored by suit, user messages in neutral slate
- **Quality Gates:** Pass=emerald badge, Fail=red badge with feedback text

### Responsive Strategy (375px–2560px)
- **Grid:** 1 col mobile → 2 col tablet (sm) → 3 col desktop (md)
- **Tabs:** Horizontally scrollable on narrow screens (`overflow-x-auto`)
- **Layout:** Reduced padding on mobile (`p-4` → `sm:p-6`), responsive header sizes
- **Sidebar:** Hidden by default on mobile, togglable via hamburger menu; always visible on desktop (`lg:block`)
- **Chat:** Messages capped at 80% width, input full-width on mobile

## Component Polish (v0.2.0 additions)

### Loading States
- **SkeletonCard:** Animated pulse placeholders matching MentorCard shape (header, name, trade, quote lines)
- **SkeletonText:** Multi-line text skeleton with decreasing widths
- **SkeletonCircle:** Circular skeleton for avatars
- **App Suspense:** Skeleton grid replaces bare "Loading..." text

### Error States
- **ErrorBoundary:** Class-based React error boundary wrapping Layout Outlet. Catches render errors, displays message + retry button. Resets internal state on retry.
- **MentorChat:** Inline error display with AlertCircle icon for AI call failures
- **MentorDetailPage/MentorChatPage:** "Mentor not found" with back link for invalid IDs

### Empty States
- **MentorGrid:** "No mentors found" with guidance text when search/filter produces zero results
- **MentorChat:** Empty session shows the mentor's opening greeting extracted from their system prompt

## Routing

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Feature cards dashboard |
| `/mentors` | MentorGrid | All 12 mentors in 4 suit sections |
| `/mentors/:id` | MentorDetailPage | Full mentor info + Resume/Start options |
| `/mentors/:id/chat` | MentorChatPage | Full dialogue interface |

Navigation flow: Grid → Card click → Detail → Start/Resume → Chat

## Test Coverage

| Category | Tests | Files |
|----------|-------|-------|
| Persona data | 18 | personas.test.ts |
| System prompts | 7 | system-prompts.test.ts |
| Quality gates | 20 | quality-gates.test.ts |
| Dialogue engine | 22 | dialogue.test.ts |
| Session hook | ~12 | useMentorSession.test.ts |
| MentorCard | 14 | MentorCard.test.tsx |
| MentorGrid | 13 | MentorGrid.test.tsx |
| MentorDetail | ~12 | MentorDetailPage.test.tsx |
| MentorChat | ~16 | MentorChat.test.tsx |
| MentorChatPage | ~8 | MentorChatPage.test.tsx |
| Integration (E2E) | 37 | integration.test.tsx |
| Skeleton components | 15 | SkeletonCard.test.tsx |
| Error boundary | 6 | ErrorBoundary.test.tsx |
| **Total** | **722** | **42 files** |

## Dependencies Introduced

- `react-router-dom` ^7.15.1 (routing for mentor flows)
- `lucide-react` ^1.16.0 (icons: MessageCircle, Send, AlertCircle, etc.)

## Known Limitations & Future Work

1. **Quality gate evaluation** is keyword-based, not LLM-powered. Phase 3+ should upgrade to LLM evaluation for nuanced understanding checks.
2. **Session persistence** is localStorage-only — no cross-device sync. Server-backed storage needed for production.
3. **Voice interaction** is deferred to Phase 3 (Web Speech API + TTS).
4. **MentorChatPage** does not pass `aiProvider` prop to `MentorChat` — the AI call path requires integration wiring.
5. **System prompts** are large (~48KB total). As more mentors are added, consider lazy-loading or splitting into a prompts service.

## Migration Notes

- `App.tsx` now imports `SkeletonCard` and `ErrorBoundary` from `components/ui`
- `Layout.tsx` wraps `<Outlet />` in `<ErrorBoundary>`
- Feature card for "Mentor Cards" is now marked `active` (was `coming soon`)
- Version bumped from 0.1.0 → 0.2.0

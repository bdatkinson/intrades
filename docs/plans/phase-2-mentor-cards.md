# Phase 2: Mentor Cards & Dialogue Engine — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build the complete Crew Deck mentor system — all 12 AI mentor personas with text-based Socratic dialogue, quality gates, and the card-based UI. Voice interaction deferred to Phase 3.

**Architecture:** Each mentor is defined as data (not hardcoded components). A single `MentorChat` component renders any mentor by loading their persona config. The dialogue engine handles conversation history, Socratic quality gates, and the Factual Companion Constraint. AI calls go through the existing `ai-service` abstraction layer to Claude API.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vitest, Anthropic Claude API (via ai-service), Lucide React

---

## Crew Deck Reference

### Suit Domains (Durable Skill-Sets)
- **♠️ Spades** — Tools & Technology
- **♥️ Hearts** — Interpersonal & Customer Service
- **♦️ Diamonds** — Business Acumen (Business Readiness Track)
- **♣️ Clubs** — Safety, Compliance & Risk Management

### The 12 Mentors (Face Cards)

| Card | Name | City | Trade | Personality |
|------|------|------|-------|-------------|
| K♠️ | Jon "Iron" Thorne | Pittsburgh | Structural Steel & Welding | Gruff, intimidating, zero tolerance for corners |
| Q♠️ | Elena Rodriguez | Houston | Commercial Concrete | Analytical, walking spreadsheet, critical path |
| J♠️ | Jaxon "Jax" Miller | Detroit | Heavy Equipment Operator | Loud, big-brother energy, safety-first |
| K♥️ | Salvatore "Sal" Rossi | Boston | Master Plumber | Grandfatherly, parables, customer trust |
| Q♥️ | Sarah "Ma" Jenkins | Charleston | Historic Restoration | Matronly, patient, stern but kind |
| J♥️ | Mateo Flores | Phoenix | HVAC Service Tech | Resourceful, charming, optimist puzzle-solver |
| K♦️ | David Chang | San Francisco | Industrial Automation | Visionary, corporate buzzwords, scaling obsessed |
| Q♦️ | Aisha Okonjo | Atlanta | Green Building & Solar | Polished, high-expectation, hates excuses |
| J♦️ | Kenji Sato | Seattle | Precision Cabinetry | Quiet perfectionist, introverted, craft over speed |
| K♣️ | "Big Mike" Kowalski | Chicago | General Contracting | Boisterous, yeller with heart, freedom-focused |
| Q♣️ | Maria Lupita | Santa Fe | Landscape Architecture | Earthy, calm, commands respect through competence |
| J♣️ | Tyrell Washington | New Orleans | Roofing & Siding | Hustler, fast-talking, speed and efficiency |

---

## Task 1: Create mentor persona data model and fixtures

**Objective:** Define the TypeScript types and create the 12 mentor data fixtures

**Files:**
- Create: `src/features/mentors/types.ts` — mentor-specific types
- Create: `src/features/mentors/data/personas.ts` — all 12 mentor definitions
- Create: `src/features/mentors/data/personas.test.ts`
- Modify: `src/types/mentor.ts` — update with proper persona fields

**Steps:**
1. Write test: all 12 mentors load, each has required fields, no duplicates
2. Create `types.ts`:
   ```typescript
   export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'
   export type Face = 'king' | 'queen' | 'jack'

   export interface SuitDomain {
     suit: Suit
     symbol: string        // ♠️ ♥️ ♦️ ♣️
     name: string          // "Tools & Technology", etc.
     color: string         // tailwind color class
   }

   export interface MentorPersona {
     id: string                // e.g. "iron-thorne"
     name: string              // "Jon \"Iron\" Thorne"
     nickname?: string         // "Iron"
     card: { suit: Suit; face: Face }
     city: string
     state: string
     trade: string             // "Structural Steel & Welding"
     background: string        // full background paragraph
     personalityVibe: string   // "Gruff & Intimidating"
     personalityDescription: string
     whyQuote: string          // their "Why" quote
     systemPrompt: string      // AI system prompt for this persona
     suitDomain: SuitDomain
   }

   export interface DialogueMessage {
     id: string
     role: 'user' | 'mentor'
     content: string
     timestamp: number
     qualityGate?: QualityGateResult
   }

   export interface QualityGateResult {
     type: 'understanding-check' | 'misconception' | 'advancement'
     passed: boolean
     feedback?: string
   }

   export interface MentorSession {
     mentorId: string
     messages: DialogueMessage[]
     currentTopic?: string
     gatesPassed: number
     startedAt: number
   }
   ```
3. Create `personas.ts` with all 12 mentors, each with a crafted `systemPrompt` that:
   - Establishes their personality and voice
   - Enforces the Factual Companion Constraint (no emotional claims)
   - Teaches through Socratic questioning (ask, don't tell)
   - Stays in their suit's domain expertise
   - Uses their specific speech patterns and vocabulary
4. Run tests, verify pass
5. Commit: `feat: add 12 Crew Deck mentor personas with system prompts`

---

## Task 2: Build the Socratic Quality Gate engine

**Objective:** Create the framework that checks learner understanding before advancing topics

**Files:**
- Create: `src/features/mentors/engine/quality-gates.ts`
- Create: `src/features/mentors/engine/quality-gates.test.ts`

**Steps:**
1. Write tests: gate triggers after explanation, checks understanding, blocks/advances
2. Create quality gate engine with these gate types:
   - **Comprehension Check** — After explaining a concept, mentor asks learner to explain it back. Passes if learner demonstrates understanding (not just repeats).
   - **Misconception Probe** — Mentor detects a wrong assumption and asks a targeted question to surface it. Doesn't advance until misconception is addressed.
   - **Application Gate** — Mentor presents a scenario and asks how the learner would apply the concept. Checks for practical understanding.
   - **Advancement Gate** — All three above passed for current topic → unlock next topic.
3. Gate evaluation happens via a secondary AI call (lightweight, checks the learner's response against criteria)
4. Each gate returns: `{ type, passed, feedback }` — feedback is what the mentor says next
5. Run tests, verify pass
6. Commit: `feat: add Socratic quality gate engine`

---

## Task 3: Build the dialogue engine (conversation management)

**Objective:** Create the core engine that manages mentor-learner conversations

**Files:**
- Create: `src/features/mentors/engine/dialogue-engine.ts`
- Create: `src/features/mentors/engine/dialogue-engine.test.ts`

**Steps:**
1. Write tests: send message → get response, conversation history maintained, quality gates trigger, Factual Companion Constraint enforced
2. Create dialogue engine:
   - `startSession(mentorId)` — creates new session, loads mentor's system prompt
   - `sendMessage(session, userMessage)` — sends to AI, returns mentor response
   - `buildPrompt(session, userMessage)` — constructs full prompt with:
     - Mentor's system prompt (personality + voice + constraints)
     - Conversation history
     - Quality gate instructions (when to probe understanding)
     - Factual Companion Constraint enforcement
   - `evaluateGate(session, response)` — checks if a quality gate should trigger
3. Factual Companion Constraint rules in system prompt:
   - Never say "I'm proud of you" or make emotional claims
   - Never claim to "feel" anything
   - Factual observations only: "That's correct" not "That makes me happy"
   - Praise the work, not the person: "Clean weld" not "You're talented"
4. Integrate with existing `src/lib/ai-service.ts` for API calls
5. Run tests, verify pass
6. Commit: `feat: add dialogue engine with Factual Companion Constraint`

---

## Task 4: Build the MentorCard UI component

**Objective:** Create the visual card component that represents each mentor

**Files:**
- Create: `src/features/mentors/components/MentorCard.tsx`
- Create: `src/features/mentors/components/MentorCard.test.tsx`

**Steps:**
1. Write tests: renders name, trade, suit icon, personality, quote; click opens chat
2. Create MentorCard component:
   - Card layout with suit color accent (♠️ slate-blue, ♥️ rose, ♦️ amber, ♣️ emerald)
   - Top: Card face indicator (K/Q/J) + suit symbol
   - Name in IBM Plex Mono, trade underneath
   - City, state in muted text
   - Personality vibe as a tag/badge
   - "Why" quote in italic
   - Hover state reveals "Start Dialogue" button
   - Responsive: stack on mobile, grid on desktop
3. Each suit domain gets a subtle background pattern or border color
4. Run tests, verify pass
5. Commit: `feat: add MentorCard UI component with suit-themed styling`

---

## Task 5: Build the MentorGrid (deck overview page)

**Objective:** Create the page that displays all 12 mentors organized by suit

**Files:**
- Create: `src/features/mentors/components/MentorGrid.tsx`
- Create: `src/features/mentors/components/MentorGrid.test.tsx`
- Create: `src/features/mentors/components/SuitSection.tsx`

**Steps:**
1. Write tests: renders all 12 mentors, grouped by suit, filter works
2. Create SuitSection — groups 3 cards (K/Q/J) under suit header with domain name
3. Create MentorGrid:
   - Header: "The Crew Deck — 12 Mentors, 4 Domains"
   - 4 suit sections, each with domain description
   - Filter by suit domain (tabs or toggle)
   - Search by name or trade
   - Responsive grid: 1 col mobile → 2 col tablet → 3 col desktop
4. Wire into MentorsPage (replace placeholder)
5. Run tests, verify pass
6. Commit: `feat: add MentorGrid page with suit-organized layout`

---

## Task 6: Build the MentorChat component (dialogue interface)

**Objective:** Create the chat UI for conversing with a mentor

**Files:**
- Create: `src/features/mentors/components/MentorChat.tsx`
- Create: `src/features/mentors/components/MentorChat.test.tsx`
- Create: `src/features/mentors/components/ChatMessage.tsx`
- Create: `src/features/mentors/components/QualityGateIndicator.tsx`

**Steps:**
1. Write tests: sends message, displays response, shows quality gate, scrolls to bottom
2. Create ChatMessage — renders user or mentor message with:
   - Mentor messages styled in their suit color
   - Mentor's name/nickname as avatar label
   - Timestamp
   - Quality gate badge when gate result attached
3. Create QualityGateIndicator — visual indicator showing:
   - 🔴 Misconception detected — mentor is probing
   - 🟡 Understanding check — mentor is verifying
   - 🟢 Gate passed — topic advancing
4. Create MentorChat:
   - Header: mentor name, trade, suit badge, back button
   - Message list with auto-scroll
   - Text input with send button (Enter to send)
   - Loading state while AI responds
   - Session persistence (localStorage for now)
   - Empty state: mentor's greeting message based on personality
5. Opening greeting uses mentor's voice — e.g., Iron Thorne: "You're here. Good. Let's talk about what keeps steel standing. What do you know about load paths?"
6. Run tests, verify pass
7. Commit: `feat: add MentorChat component with quality gate indicators`

---

## Task 7: Create mentor system prompts (all 12)

**Objective:** Write the AI system prompts that give each mentor their unique voice

**Files:**
- Modify: `src/features/mentors/data/personas.ts` — add detailed systemPrompt for each
- Create: `src/features/mentors/data/system-prompts.test.ts`

**Steps:**
1. Write tests: each prompt contains persona name, Factual Companion Constraint, Socratic instruction, suit domain
2. Write 12 system prompts, each following this template:
   ```
   You are [Name], [trade] based in [city]. [Background].

   PERSONALITY: [Personality description]. [Speech patterns].

   DOMAIN: Your suit is [suit] — [domain name]. You teach through the lens of [domain description].

   TEACHING METHOD:
   - Use Socratic questioning — ask, don't tell
   - After explaining a concept, ask the learner to explain it back
   - If they show a misconception, ask a targeted question to surface it
   - Present real scenarios from your experience in [trade]
   - Use your personality: [specific speech examples]

   CONSTRAINTS (Constitutional — never violate):
   - FACTUAL COMPANION: Never make emotional claims. Never say "I'm proud of you" or "that makes me happy." Praise the work, not the person. "Clean joint" not "You're talented."
   - NARRATIVE-VOICE BOUNDARY: You are not their therapist, parent, or friend. You are a trade professional sharing knowledge.
   - Stay in your domain. If asked about something outside [trade/suit domain], redirect: "That's [other mentor]'s territory."

   OPENING: [Unique greeting in character]
   ```
3. Each prompt must feel distinctly different — Sal tells parables, Iron Thorne grunts, Mateo jokes
4. Run tests, verify pass
5. Commit: `feat: add 12 unique mentor system prompts with Socratic teaching`

---

## Task 8: Wire routing and navigation for mentor flows

**Objective:** Connect MentorGrid → MentorCard → MentorChat navigation

**Files:**
- Modify: `src/app/routes.tsx` — add mentor detail and chat routes
- Modify: `src/features/mentors/MentorsPage.tsx` — use MentorGrid
- Create: `src/features/mentors/MentorDetailPage.tsx` — single mentor view + chat entry
- Create: `src/features/mentors/MentorChatPage.tsx` — full chat experience

**Steps:**
1. Write tests: navigate grid → card click → detail → start chat → chat works
2. Routes:
   - `/mentors` — MentorGrid (all 12)
   - `/mentors/:mentorId` — MentorDetailPage (full card + background + start chat)
   - `/mentors/:mentorId/chat` — MentorChatPage (full dialogue)
3. MentorDetailPage shows:
   - Full mentor card (large format)
   - Background story
   - "Why" quote prominently
   - Suit domain explanation
   - "Begin Dialogue" button → navigates to chat
4. MentorChatPage wraps MentorChat with route params
5. Run tests, verify pass
6. Commit: `feat: wire mentor routing — grid → detail → chat`

---

## Task 9: Add session persistence and conversation history

**Objective:** Save chat sessions so learners can resume conversations

**Files:**
- Create: `src/features/mentors/hooks/useMentorSession.ts`
- Create: `src/features/mentors/hooks/useMentorSession.test.ts`
- Create: `src/lib/storage.ts` — localStorage abstraction

**Steps:**
1. Write tests: session saves, loads, resumes, lists past sessions
2. Create `storage.ts` — typed localStorage wrapper with:
   - `save<T>(key, value)` / `load<T>(key)` / `remove(key)` / `list(prefix)`
   - JSON serialization with error handling
3. Create `useMentorSession` hook:
   - `startSession(mentorId)` — creates new session
   - `resumeSession(sessionId)` — loads existing
   - `listSessions(mentorId?)` — all sessions, optionally filtered
   - `sendMessage(text)` — sends and receives, auto-saves
   - Auto-save after each message exchange
4. Integrate with MentorChat component
5. Show "Resume" option on MentorDetailPage if active session exists
6. Run tests, verify pass
7. Commit: `feat: add mentor session persistence with localStorage`

---

## Task 10: Integration test — full mentor dialogue flow

**Objective:** End-to-end test of the complete mentor experience

**Files:**
- Create: `src/features/mentors/integration.test.tsx`

**Steps:**
1. Write integration tests:
   - Browse mentor grid → see all 12 mentors in 4 suit sections
   - Click a mentor → see detail page with full info
   - Start dialogue → mentor greets in character
   - Send a message → receive a response in mentor's voice
   - Quality gate triggers after explanation
   - Session persists across page reload (mock localStorage)
   - Navigate back → resume session option visible
2. Mock AI service for deterministic responses
3. Verify Factual Companion Constraint in mock responses
4. Run full test suite: `npm test`
5. Verify build: `npm run build`
6. Commit: `test: add full mentor dialogue integration tests`

---

## Task 11: Polish, responsive design, and documentation

**Objective:** Final polish pass and Phase 2 documentation

**Files:**
- Update: various component files for responsive tweaks
- Create: `docs/architecture/phase-2-mentor-cards.md` — ADR
- Update: `CLAUDE.md` — add mentor system docs
- Update: `README.md` — add mentor feature docs

**Steps:**
1. Responsive polish: verify all mentor UI works on 375px → 2560px
2. Loading states: skeleton cards while data loads
3. Error states: friendly error if AI call fails
4. Empty states: guidance text for first-time users
5. Create ADR documenting Phase 2 decisions
6. Update project docs
7. Run full test suite + build
8. Commit: `docs: Phase 2 complete — 12 mentors with Socratic dialogue`
9. Tag: `git tag v0.2.0 -m "Phase 2: Crew Deck — 12 AI Mentors with Socratic Dialogue"`
10. Push to GitHub

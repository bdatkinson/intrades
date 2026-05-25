# Phase 1: Foundation Sprint — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Establish the core application architecture — routing, layout system, theme, API client, and type system — so that all subsequent feature sprints have a stable foundation to build on.

**Architecture:** Modular feature-based structure. Each domain (mentors, job-agent, cost-estimator) lives in its own `src/features/` directory with colocated components, hooks, types, and tests. Shared UI components live in `src/components/`. API communication goes through a unified client in `src/lib/`.

**Tech Stack:** React 19, TypeScript strict, Vite, Tailwind CSS, Vitest, React Router DOM, Lucide React, IBM Plex Mono

---

## Task 1: Clean up scaffold and establish project conventions

**Objective:** Remove Vite boilerplate, set up project-specific conventions

**Files:**
- Delete: `src/App.css`, `src/index.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `public/icons.svg`, `public/favicon.svg`
- Modify: `src/main.tsx` — clean imports
- Modify: `index.html` — update title, meta tags, favicon placeholder

**Steps:**
1. Remove all Vite boilerplate files listed above
2. Update `index.html`: title to "InTrades — Skilled Trades Mentoring", add meta description
3. Update `src/main.tsx` to only import App and global styles
4. Run `npm test` — verify 3 tests still pass
5. Commit: `chore: clean up Vite boilerplate, set project conventions`

---

## Task 2: Create the design system foundation (theme + typography)

**Objective:** Establish color palette, typography scale, and spacing tokens

**Files:**
- Create: `src/styles/theme.ts` — color palette, typography, spacing constants
- Modify: `src/styles/global.css` — Tailwind customization, IBM Plex Mono setup
- Create: `src/styles/theme.test.ts` — verify theme exports

**Steps:**
1. Write test: verify theme exports colors, fonts, spacing
2. Create `theme.ts` with InTrades design tokens:
   - Colors: slate-950 (bg), slate-100 (text), blue-500 (primary), amber-500 (accent/trades), red-500 (error), green-500 (success)
   - Fonts: IBM Plex Mono (code/headings), system sans-serif (body)
   - Spacing: 4px base unit
3. Update `global.css` with Tailwind theme extensions
4. Run tests, verify pass
5. Commit: `feat: add design system foundation with InTrades color palette`

---

## Task 3: Build the Layout component (shell + navigation)

**Objective:** Create the persistent app shell with header, sidebar nav, and main content area

**Files:**
- Create: `src/components/Layout.tsx` — responsive shell with nav
- Create: `src/components/Layout.test.tsx`
- Modify: `src/App.tsx` — wrap routes in Layout

**Steps:**
1. Write tests: Layout renders header, nav links, content area
2. Create Layout with:
   - Header: InTrades logo/wordmark, user avatar placeholder
   - Sidebar nav (collapsible on mobile): Home, Mentors, Job Agent, Cost Estimator, Dashboard
   - Main content area with `<Outlet />` for route content
   - Footer with version
3. Use Lucide icons: `Home`, `Users`, `Briefcase`, `Calculator`, `LayoutDashboard`
4. Mobile-responsive: hamburger menu on small screens
5. Run tests, verify pass
6. Commit: `feat: add Layout component with responsive nav`

---

## Task 4: Set up routing structure

**Objective:** Create the route tree with lazy-loaded feature pages

**Files:**
- Create: `src/app/routes.tsx` — route definitions
- Create: `src/features/mentors/MentorsPage.tsx` — placeholder
- Create: `src/features/job-agent/JobAgentPage.tsx` — placeholder
- Create: `src/features/cost-estimator/CostEstimatorPage.tsx` — placeholder
- Create: `src/features/dashboard/DashboardPage.tsx` — placeholder
- Create: `src/app/routes.test.tsx`
- Modify: `src/App.tsx` — use route config

**Steps:**
1. Write test: all routes render correct placeholder pages
2. Create placeholder pages for each feature (simple heading + description)
3. Create routes config with lazy loading (`React.lazy` + `Suspense`)
4. Wire routes into App.tsx with Layout wrapper
5. Run tests, verify pass
6. Commit: `feat: add route structure with lazy-loaded feature pages`

---

## Task 5: Create the API client module

**Objective:** Build a typed API client for communicating with the backend and AI services

**Files:**
- Create: `src/lib/api-client.ts` — fetch wrapper with error handling
- Create: `src/lib/api-client.test.ts`
- Create: `src/types/api.ts` — API response types

**Steps:**
1. Write tests: api client handles success, error, timeout, auth
2. Create `api-client.ts` with:
   - `apiClient.get/post/put/delete` methods
   - Automatic JSON parsing
   - Error handling with typed errors
   - Auth token header injection
   - Timeout support
   - Base URL from env var
3. Create `src/types/api.ts` with:
   - `ApiResponse<T>` — success wrapper
   - `ApiError` — error type with code, message
   - `MentorMessage` — chat message type
4. Run tests, verify pass
5. Commit: `feat: add typed API client with error handling`

---

## Task 6: Create the AI service abstraction layer

**Objective:** Build a service layer that abstracts AI provider calls (Claude, DeepSeek, Gemini)

**Files:**
- Create: `src/lib/ai-service.ts` — AI provider abstraction
- Create: `src/lib/ai-service.test.ts`
- Create: `src/types/ai.ts` — AI-related types

**Steps:**
1. Write tests: AI service sends/receives messages, handles errors, switches providers
2. Create `ai-service.ts` with:
   - `AIService` class/module
   - `sendMessage(messages, options)` — sends chat to configured provider
   - Provider config: model, apiKey, maxTokens, temperature
   - Support for: anthropic, deepseek (future: gemini)
   - Streaming support placeholder
3. Create `src/types/ai.ts`:
   - `AIProvider` union type
   - `AIMessage` — role + content
   - `AIConfig` — provider settings
   - `AIResponse` — response with usage stats
4. Run tests, verify pass
5. Commit: `feat: add AI service abstraction layer`

---

## Task 7: Create shared UI component library (Button, Card, Input)

**Objective:** Build the base UI components used across all features

**Files:**
- Create: `src/components/ui/Button.tsx` + test
- Create: `src/components/ui/Card.tsx` + test
- Create: `src/components/ui/Input.tsx` + test
- Create: `src/components/ui/index.ts` — barrel export

**Steps:**
1. Write tests for each component: renders, variants, disabled state, click handler
2. Create `Button`: primary, secondary, ghost variants; sizes sm/md/lg; loading state
3. Create `Card`: header, body, footer slots; border variants
4. Create `Input`: label, placeholder, error state, icon support
5. All components use Tailwind classes + theme tokens
6. Create barrel export `src/components/ui/index.ts`
7. Run tests, verify pass
8. Commit: `feat: add shared UI components (Button, Card, Input)`

---

## Task 8: Create type definitions for domain entities

**Objective:** Define TypeScript types for all InTrades domain objects

**Files:**
- Create: `src/types/mentor.ts` — mentor/persona types
- Create: `src/types/user.ts` — user/apprentice types
- Create: `src/types/trade.ts` — trade/skill types
- Create: `src/types/index.ts` — barrel export

**Steps:**
1. Create `mentor.ts`:
   - `Mentor` — name, title, trade, specialty, voiceDescription, teachingMode
   - `MentorDialogue` — conversation history
   - `QualityGate` — understanding check type
2. Create `user.ts`:
   - `User` — id, name, email, role
   - `ApprenticeProfile` — trade, level, milestones unlocked
   - `Milestone` — id, name, unlockedAt, criteria
3. Create `trade.ts`:
   - `Trade` — name, category, skills
   - `Skill` — name, level, description
4. Create barrel export
5. Commit: `feat: add domain type definitions (mentor, user, trade)`

---

## Task 9: Integration test — full app renders with all routes

**Objective:** Verify the complete foundation works end-to-end

**Files:**
- Create: `src/app/integration.test.tsx`
- Modify: `src/App.test.tsx` — update for new structure

**Steps:**
1. Write integration test: app renders, nav works, all routes accessible
2. Test: clicking each nav link renders the correct page
3. Test: unknown routes show 404 or redirect
4. Run full test suite: `npm test`
5. Verify build: `npm run build`
6. Commit: `test: add integration tests for app shell and routing`

---

## Task 10: Final cleanup and documentation

**Objective:** Clean up, document, and prepare for Phase 2

**Files:**
- Update: `CLAUDE.md` — add completed structure details
- Create: `docs/architecture/phase-1-foundation.md` — architecture decisions record
- Update: `README.md` — project overview with setup instructions

**Steps:**
1. Create README.md with: project description, setup instructions, available scripts, architecture overview
2. Create architecture decision record documenting Phase 1 choices
3. Update CLAUDE.md with actual (not target) project structure
4. Run full test suite one final time
5. Run build one final time
6. Commit: `docs: add README, architecture docs, update CLAUDE.md`
7. Tag: `git tag v0.1.0 -m "Phase 1: Foundation Sprint complete"`

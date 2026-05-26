# Phase 3: Scenario Cards & Business Readiness Track — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build the full 52-card deck experience — 36 pitfall scenario cards as interactive learning modules, 4 Diamonds face cards as the guided Business Readiness Track (BRT), and 12 "coming soon" placeholder cards for remaining face/ace cards.

**Architecture:** Scenario cards are data-driven (JSON fixtures). Each card renders through a shared `ScenarioCard` component. The BRT is a separate guided-wizard feature with 4 milestone steps. Face cards for non-Diamond suits render a styled "coming soon" page.

---

## Task 1: Create scenario card data model and 36 fixtures

**Objective:** Define types and load all 36 pitfall scenarios as structured data

**Files:**
- Create: `src/features/deck/types.ts` — card types (extends mentor types for suit)
- Create: `src/features/deck/data/scenarios.ts` — all 36 scenario fixtures
- Create: `src/features/deck/data/scenarios.test.ts`

**Steps:**
1. Write test: 36 scenarios load, 9 per suit, no duplicates, all have required fields
2. Create types:
   ```typescript
   export type CardRank = 2|3|4|5|6|7|8|9|10|'jack'|'queen'|'king'|'ace'
   export interface ScenarioCard {
     id: string
     rank: CardRank          // 2-10 for pitfall scenarios
     suit: Suit              // from mentor types
     title: string           // "The Van Black Hole"
     category: string        // "Operational Practices"
     description: string     // full scenario text
     mentorId?: string       // which mentor teaches this (same suit K/Q/J)
   }
   export interface FaceCard {
     id: string
     rank: 'jack'|'queen'|'king'|'ace'
     suit: Suit
     type: 'capstone' | 'brt'  // business readiness track or capstone
     title: string
     status: 'active' | 'coming-soon'
   }
   ```
3. Create all 36 scenarios from docs/architecture/scenario-cards-deck.md
4. Run tests, verify pass
5. Commit: `feat: add 36 pitfall scenario card fixtures`

---

## Task 2: Build ScenarioCard UI component

**Objective:** Create the visual card component for pitfall scenarios

**Files:**
- Create: `src/features/deck/components/ScenarioCard.tsx`
- Create: `src/features/deck/components/ScenarioCard.test.tsx`

**Steps:**
1. Write tests: renders title, suit icon, rank number, description, suit color
2. Create ScenarioCard:
   - Playing card aesthetic — rank in corner, suit symbol
   - Suit color accent (same palette as MentorCard)
   - Front: rank + suit + scenario title
   - Back/expanded: full description + "Discuss with [Mentor]" link
   - Flip animation on click (CSS transform)
   - Responsive sizing
3. Run tests, verify pass
4. Commit: `feat: add ScenarioCard component with flip animation`

---

## Task 3: Build DeckView page (full 52-card grid)

**Objective:** Create the main deck browsing page showing all 52 cards

**Files:**
- Create: `src/features/deck/components/DeckView.tsx`
- Create: `src/features/deck/components/DeckView.test.tsx`
- Create: `src/features/deck/components/ComingSoonCard.tsx`

**Steps:**
1. Write tests: renders all 52 cards, filters by suit, face cards show correctly
2. Create ComingSoonCard — styled placeholder for non-Diamond face/ace cards:
   - Suit-colored card with face indicator
   - "Coming Soon" badge
   - Subtle lock icon (Lucide `Lock`)
   - Mentor silhouette or suit emblem
3. Create DeckView:
   - Tab bar: All | ♠️ | ♥️ | ♦️ | ♣️
   - Grid layout showing all 52 cards:
     - Number cards (2-10): ScenarioCard components
     - Diamond face/ace cards: BRT milestone cards (linked to BRT)
     - Other face/ace cards: ComingSoonCard
   - Card count badge per suit
4. Wire into routing (new /deck route)
5. Run tests, verify pass
6. Commit: `feat: add DeckView with 52-card grid and coming-soon placeholders`

---

## Task 4: Build Business Readiness Track (BRT) shell and navigation

**Objective:** Create the BRT framework — a guided 4-step wizard for business formation

**Files:**
- Create: `src/features/brt/types.ts` — BRT step types
- Create: `src/features/brt/BRTPage.tsx` — main BRT page
- Create: `src/features/brt/components/BRTStepper.tsx` — progress stepper
- Create: `src/features/brt/components/BRTStepCard.tsx`
- Create: `src/features/brt/BRTPage.test.tsx`

**Steps:**
1. Write tests: renders 4 steps, shows progress, navigates between steps
2. Create types:
   ```typescript
   export interface BRTStep {
     id: string
     card: 'jack' | 'queen' | 'king' | 'ace'
     title: string
     subtitle: string
     status: 'locked' | 'active' | 'completed'
     route: string
   }
   ```
3. BRT Steps (in order):
   - **J♦️ — Select Business Name & Domain** → `/brt/name`
   - **Q♦️ — File for KY LLC** → `/brt/llc`
   - **K♦️ — Bank Account & Insurance** → `/brt/bank-insurance`
   - **A♦️ — Create Business Website** → `/brt/website`
4. BRTStepper: horizontal progress bar with 4 diamond-colored steps
5. BRTStepCard: card for each step showing status, description, action button
6. Steps unlock sequentially (Q♦️ locked until J♦️ complete, etc.)
7. Run tests, verify pass
8. Commit: `feat: add Business Readiness Track shell with 4-step wizard`

---

## Task 5: BRT Step 1 — Select Business Name & Domain (J♦️)

**Objective:** Guided experience for choosing a business name and checking domain availability

**Files:**
- Create: `src/features/brt/steps/BusinessNameStep.tsx`
- Create: `src/features/brt/steps/BusinessNameStep.test.tsx`

**Steps:**
1. Write tests: input name, check suggestions, validate domain, save selection
2. Create BusinessNameStep:
   - **Name input** with real-time suggestions based on trade + city
   - **Name guidelines**: tips for trades business names (memorable, professional, trade-relevant)
   - **Domain check** — query a domain availability API or show manual lookup link
   - **Common patterns**: "[Name] [Trade] LLC", "[City] [Trade] Services"
   - **Save selection** to BRT state (localStorage for now)
   - Aisha Okonjo (Q♦️) provides contextual tips in her voice: "Your name is your first impression. Make it count."
3. Completion criteria: user has entered a business name and noted a domain
4. Run tests, verify pass
5. Commit: `feat: add BRT Step 1 — Business Name & Domain selection`

---

## Task 6: BRT Step 2 — File for KY LLC (Q♦️)

**Objective:** Step-by-step guided walkthrough of Kentucky LLC formation

**Files:**
- Create: `src/features/brt/steps/LLCFilingStep.tsx`
- Create: `src/features/brt/steps/LLCFilingStep.test.tsx`

**Steps:**
1. Write tests: renders all sub-steps, tracks completion, shows external links
2. Create LLCFilingStep as a checklist walkthrough:
   - **Step 1**: Choose a Registered Agent (explanation + options)
   - **Step 2**: File Articles of Organization with KY Secretary of State
     - Direct link: https://app.sos.ky.gov/ftbusinessfilings/
     - Cost: $40 online
     - Fields needed: LLC name, registered agent, organizer, office address
   - **Step 3**: Get an EIN from the IRS (free)
     - Link: https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online
   - **Step 4**: File KY Tax Registration
   - **Step 5**: Create an Operating Agreement (template provided or AI-assisted)
   - David Chang (K♦️) provides tips: "Think of your LLC as the operating system for your business. Get it right now, scale later."
3. Each sub-step has: description, external link, "Mark Complete" checkbox
4. Progress saves to localStorage
5. Run tests, verify pass
6. Commit: `feat: add BRT Step 2 — KY LLC filing walkthrough`

---

## Task 7: BRT Step 3 — Bank Account & Insurance (K♦️)

**Objective:** Guide for opening a commercial bank account and getting insurance quotes

**Files:**
- Create: `src/features/brt/steps/BankInsuranceStep.tsx`
- Create: `src/features/brt/steps/BankInsuranceStep.test.tsx`

**Steps:**
1. Write tests: renders bank and insurance sections, tracks completion
2. Create BankInsuranceStep with two sections:
   **Section A — Commercial Bank Account:**
   - Why you need a separate business account (liability protection, tax simplicity)
   - What to bring: EIN letter, Articles of Organization, ID, initial deposit
   - Recommended: community banks and credit unions (aligned with InTrades Local Loop)
   - Checklist: opened account → got debit card → set up online banking
   
   **Section B — Business Insurance:**
   - Types needed: General Liability, Workers' Comp (if employees), Commercial Auto, Tools & Equipment
   - Quick-quote links:
     - Thimble: https://www.thimble.com/ (pay-per-job, great for new trades)
     - NEXT Insurance: https://www.nextinsurance.com/
     - Simply Business: https://www.simplybusiness.com/
   - Checklist: got GL quote → compared 2+ providers → selected policy
   - Big Mike (K♣️) provides tips: "Don't cheap out on insurance. One lawsuit without it and you're done. That's not freedom, that's gambling."
3. Run tests, verify pass
4. Commit: `feat: add BRT Step 3 — bank account & insurance guidance`

---

## Task 8: BRT Step 4 — Create Business Website (A♦️)

**Objective:** Guide for creating a simple one-page business website

**Files:**
- Create: `src/features/brt/steps/WebsiteStep.tsx`
- Create: `src/features/brt/steps/WebsiteStep.test.tsx`

**Steps:**
1. Write tests: renders builder sections, previews content, tracks completion
2. Create WebsiteStep:
   - **Section 1: What your site needs** (minimum viable website):
     - Business name + logo placeholder
     - Services list (trade specialties)
     - Service area (city/county)
     - Phone number + email
     - "Request a Quote" call-to-action
   - **Section 2: Content builder** — simple form that collects:
     - Business name (pre-filled from J♦️)
     - Tagline
     - Services (multi-select from trade categories)
     - Service area
     - Contact info
   - **Section 3: Platform recommendations**:
     - Carrd.co (simplest, $19/yr)
     - Google Business Profile (free, essential)
     - Square Online (free tier, good for service businesses)
   - **Section 4: Live preview** — renders a mock one-page site with their info
   - Kenji Sato (J♦️) provides tips: "A website is your digital storefront. Keep it clean. Like a good joint — no gaps, no filler."
3. Run tests, verify pass
4. Commit: `feat: add BRT Step 4 — business website creation guide`

---

## Task 9: Wire BRT into deck and routing

**Objective:** Connect DeckView → BRT and all navigation

**Files:**
- Modify: `src/app/routes.tsx` — add /deck and /brt/* routes
- Modify: `src/components/Layout.tsx` — add Deck and BRT nav items

**Steps:**
1. Write tests: deck route works, BRT routes work, diamond face cards link to BRT
2. Routes:
   - `/deck` — DeckView (all 52 cards)
   - `/brt` — BRTPage (overview with stepper)
   - `/brt/name` — J♦️ Business Name step
   - `/brt/llc` — Q♦️ LLC Filing step
   - `/brt/bank-insurance` — K♦️ Bank & Insurance step
   - `/brt/website` — A♦️ Website step
3. Add "The Deck" and "Business Readiness" to sidebar navigation
4. Diamond face cards in DeckView link directly to their BRT step
5. Run tests, verify pass
6. Commit: `feat: wire deck and BRT routing into app navigation`

---

## Task 10: BRT state persistence and progress tracking

**Objective:** Save BRT progress so users can resume across sessions

**Files:**
- Create: `src/features/brt/hooks/useBRTProgress.ts`
- Create: `src/features/brt/hooks/useBRTProgress.test.ts`

**Steps:**
1. Write tests: progress saves, loads, step completion unlocks next step
2. Create useBRTProgress hook:
   - Track completion status for each step and sub-step
   - Persist to localStorage (same pattern as mentor sessions)
   - `completeSubStep(stepId, subStepId)` — marks a sub-step done
   - `isStepUnlocked(stepId)` — checks if previous step is complete
   - `getProgress()` — returns overall BRT completion percentage
3. Show progress on BRTPage stepper and in deck view
4. Run tests, verify pass
5. Commit: `feat: add BRT progress persistence and step unlocking`

---

## Task 11: Integration tests and final polish

**Objective:** E2E tests for deck browsing and BRT flow

**Files:**
- Create: `src/features/deck/integration.test.tsx`
- Create: `src/features/brt/integration.test.tsx`

**Steps:**
1. Deck tests: browse all 52 cards, filter by suit, flip scenario card, click diamond face card → BRT
2. BRT tests: navigate all 4 steps, complete sub-steps, progress saves, steps unlock sequentially
3. Coming-soon tests: non-diamond face cards show placeholder correctly
4. Responsive polish on all new components
5. Update CLAUDE.md, README
6. Run full test suite + build
7. Commit: `docs: Phase 3 complete — 52-card deck with Business Readiness Track`
8. Tag: `git tag v0.3.0 -m "Phase 3: Full 52-card deck + Business Readiness Track"`
9. Push to GitHub

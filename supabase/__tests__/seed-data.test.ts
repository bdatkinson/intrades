import { describe, it, expect } from 'vitest'
import {
  buildMentorInserts,
  buildScenarioInserts,
  MENTOR_COUNT,
  SCENARIO_COUNT,
  SCENARIO_PER_SUIT,
} from '../seed-data'

import type { MentorSource, ScenarioSource } from '../seed-data'
import type { SuitType, CardRank } from '../../src/types/database'

// ─── Test Fixtures ───────────────────────────────────────────────

const MOCK_MENTORS: MentorSource[] = [
  // ♠️ Spades (K, Q, J)
  { id: 'iron-thorne', name: 'Jon "Iron" Thorne', trade: 'Structural Steel', suit: 'spades', face: 'king', personalityVibe: 'Gruff', systemPrompt: 'You are Iron Thorne. You build bridges. You do not cut corners. When someone asks a stupid question, you let silence do the work. Always factual, never emotional. Praise the work, not the person.' },
  { id: 'elena-rodriguez', name: 'Elena Rodriguez', trade: 'Commercial Concrete', suit: 'spades', face: 'queen', personalityVibe: 'Analytical', systemPrompt: 'You are Elena Rodriguez. You speak in facts, figures, and critical-path logic. You ask questions you already know the answer to — testing whether they have done their homework. Always factual, never emotional.' },
  { id: 'jax-miller', name: 'Jax Miller', trade: 'Heavy Equipment', suit: 'spades', face: 'jack', personalityVibe: 'Loud & Protective', systemPrompt: 'You are Jax Miller. You have big-brother energy. You tease, you joke, but you get dead serious about safety. Always factual, never emotional. Praise the work, not the person.' },

  // ♥️ Hearts (K, Q, J)
  { id: 'sal-rossi', name: 'Sal Rossi', trade: 'Master Plumber', suit: 'hearts', face: 'king', personalityVibe: 'Grandfatherly', systemPrompt: 'You are Sal Rossi. You tell long stories to make a point. You believe plumbing protects the health of the nation. Always factual, never emotional. Praise the work, not the person.' },
  { id: 'sarah-jenkins', name: 'Sarah Jenkins', trade: 'Historic Restoration', suit: 'hearts', face: 'queen', personalityVibe: 'Matronly', systemPrompt: 'You are Ma Jenkins. You bring biscuits to meetings. You are infinitely patient with careful work and zero-tolerance for carelessness. Always factual, never emotional. Praise the work, not the person.' },
  { id: 'mateo-flores', name: 'Mateo Flores', trade: 'HVAC Service Tech', suit: 'hearts', face: 'jack', personalityVibe: 'Charming', systemPrompt: 'You are Mateo Flores. You treat every service call like a detective story. You want customers to understand, not just pay. Always factual, never emotional. Praise the work, not the person.' },

  // ♦️ Diamonds (K, Q, J)
  { id: 'david-chang', name: 'David Chang', trade: 'Industrial Automation', suit: 'diamonds', face: 'king', personalityVibe: 'Visionary', systemPrompt: 'You are David Chang. You think in systems and growth curves. You believe the trades are the final frontier for technology. Always factual, never emotional. Praise the thinking, not the thinker.' },
  { id: 'aisha-okonjo', name: 'Aisha Okonjo', trade: 'Green Building & Solar', suit: 'diamonds', face: 'queen', personalityVibe: 'High-Expectation', systemPrompt: 'You are Aisha Okonjo. You are impeccably corporate. You hate excuses and have zero tolerance for missed milestones. Always factual, never emotional. Praise the planning, not the planner.' },
  { id: 'kenji-sato', name: 'Kenji Sato', trade: 'Precision Cabinetry', suit: 'diamonds', face: 'jack', personalityVibe: 'Quiet Perfectionist', systemPrompt: 'You are Kenji Sato. You speak only when you have something worth saying. You notice a 1/16th-inch gap from across the room. Always factual, never emotional. Praise the decision, not the decider.' },

  // ♣️ Clubs (K, Q, J)
  { id: 'big-mike', name: 'Big Mike Kowalski', trade: 'General Contracting', suit: 'clubs', face: 'king', personalityVibe: 'Boisterous', systemPrompt: 'You are Big Mike. You scream about safety violations and buy beers after shift. You measure success by whether you eat steak or go hungry. Always factual, never emotional. Praise the call, not the caller.' },
  { id: 'maria-lupita', name: 'Maria Lupita', trade: 'Landscape Architecture', suit: 'clubs', face: 'queen', personalityVibe: 'Earthy & Observant', systemPrompt: 'You are Maria Lupita. You listen more than you speak. When you speak, people listen because you have thought it through. Always factual, never emotional. Praise the assessment, not the assessor.' },
  { id: 'tyrell-washington', name: 'Tyrell Washington', trade: 'Roofing & Siding', suit: 'clubs', face: 'jack', personalityVibe: 'Hustler', systemPrompt: 'You are Tyrell Washington. You move fast and talk fast. The rain doesn\'t wait and neither do you. Always factual, never emotional. Praise the hustle, not the hustler.' },
]

const MOCK_SCENARIOS: ScenarioSource[] = [
  // ♠️ Spades (9)
  { title: 'The Mental Note Mistake', suit: 'spades', description: 'Failing to write down a client specific request or a measurement trusting memory instead.' },
  { title: 'The Van Black Hole', suit: 'spades', description: 'Letting the work vehicle become so disorganized that 20% of billable time is wasted searching for tools.' },
  { title: 'The Supply Run Drain', suit: 'spades', description: 'Starting the day without checking inventory resulting in three separate trips to the supply house.' },
  { title: 'The I Will Do It Later Logs', suit: 'spades', description: 'Failing to log hours or materials immediately after a job leading to guesswork at the end of the week.' },
  { title: 'Scope Creep Silence', suit: 'spades', description: 'Agreeing to just fix this one other little thing while on-site without documenting a change order.' },
  { title: 'The Phantom Arrival', suit: 'spades', description: 'Telling a client I will be there between 8 and 12 and showing up at 11:55 AM without calling.' },
  { title: 'Ignoring Manufacturer Specs', suit: 'spades', description: 'Assuming you know how a new material works without reading the technical data sheet.' },
  { title: 'The Site Cleanup Fail', suit: 'spades', description: 'Doing excellent technical work but leaving drywall dust wire clippings or footprints behind.' },
  { title: 'Battery Roulette', suit: 'spades', description: 'Arriving at a job site with cordless tools but no fully charged batteries and no charger in the truck.' },

  // ♥️ Hearts (9)
  { title: 'The Jargon Barrier', suit: 'hearts', description: 'Explaining a problem to a homeowner using strictly technical terms causing confusion and mistrust.' },
  { title: 'The Not My Job Attitude', suit: 'hearts', description: 'Refusing to help a team member move a heavy object because it falls outside your specific trade.' },
  { title: 'Broadcasting Frustration', suit: 'hearts', description: 'Swearing or venting about the project complications loud enough for the client or their neighbors to hear.' },
  { title: 'The Defensive Crouch', suit: 'hearts', description: 'Reacting to a foreman critique with excuses rather than asking how to do better next time.' },
  { title: 'Disrespecting the Gatekeeper', suit: 'hearts', description: 'Being polite to the property owner but rude or dismissive to their assistant or property manager.' },
  { title: 'The Smartphone Zombie', suit: 'hearts', description: 'Being seen by the client scrolling social media or texting extensively while on the clock.' },
  { title: 'Over-Promising Timelines', suit: 'hearts', description: 'Telling a client a job will take two days to make them happy knowing deep down it requires four.' },
  { title: 'Ignoring Non-Verbal Cues', suit: 'hearts', description: 'Continuing to talk or sell services when the client clearly looks rushed annoyed or uncomfortable.' },
  { title: 'Appearance Apathy', suit: 'hearts', description: 'Arriving at an occupied residential job looking disheveled or smelling of strong odors.' },

  // ♦️ Diamonds (9)
  { title: 'The Revenue vs Profit Trap', suit: 'diamonds', description: 'Confusing the check amount with personal income forgetting to set aside money for taxes and overhead.' },
  { title: 'Underbidding to Win', suit: 'diamonds', description: 'Dropping the price so low to get the job that you end up working for less than minimum wage.' },
  { title: 'The Handshake Deal', suit: 'diamonds', description: 'Starting a substantial job without a signed contract or a deposit leaving no recourse if the client refuses to pay.' },
  { title: 'Tool Debt', suit: 'diamonds', description: 'Buying the most expensive top-tier brand tools on credit before the business has the cash flow.' },
  { title: 'Receipt Shoeboxing', suit: 'diamonds', description: 'Throwing receipts on the dashboard and fading them in the sun making tax season a nightmare.' },
  { title: 'Discounting Experience', suit: 'diamonds', description: 'Apologizing for your price when a client objects rather than confidently explaining the value.' },
  { title: 'Ignoring Vehicle Costs', suit: 'diamonds', description: 'Failing to factor in vehicle wear and tear fuel and insurance into the hourly or project rate.' },
  { title: 'Billing Surprise', suit: 'diamonds', description: 'Presenting a final invoice significantly higher than the estimate without communicating extra costs.' },
  { title: 'Commingling Funds', suit: 'diamonds', description: 'Using the business debit card for personal lunch piercing the corporate veil and muddying accounting.' },

  // ♣️ Clubs (9)
  { title: 'The Guard Removal', suit: 'clubs', description: 'Taking the safety guard off a grinder or saw because it gets in the way.' },
  { title: 'The Hero Lift', suit: 'clubs', description: 'Attempting to lift a heavy boiler beam or unit alone to prove strength resulting in a back injury.' },
  { title: 'The Dead Wire Assumption', suit: 'clubs', description: 'Touching a wire assuming the breaker is off without testing it with a multimeter first.' },
  { title: 'Improvised Tool Use', suit: 'clubs', description: 'Using a screwdriver as a chisel or a wrench as a hammer damaging the tool and risking injury.' },
  { title: 'PPE Fatigue', suit: 'clubs', description: 'Removing safety glasses or ear protection because it is hot or uncomfortable just for this one quick cut.' },
  { title: 'Code Guessing', suit: 'clubs', description: 'Installing something based on how we did it at the last company rather than verifying current codes.' },
  { title: 'Ladder Laziness', suit: 'clubs', description: 'Using the top step of a stepladder or leaning a ladder at an unsafe angle to avoid getting the right size.' },
  { title: 'Blind Cutting', suit: 'clubs', description: 'Cutting into a wall or floor without checking for pipes wires or ducts behind the surface.' },
  { title: 'Ignoring Fatigue', suit: 'clubs', description: 'Pushing through exhaustion to finish a job when the majority of severe errors and injuries occur.' },
]

// ─── Tests ───────────────────────────────────────────────────────

describe('seed-data', () => {
  describe('buildMentorInserts', () => {
    const mentors = buildMentorInserts(MOCK_MENTORS)

    it('produces exactly 12 mentor inserts', () => {
      expect(mentors).toHaveLength(MENTOR_COUNT)
    })

    it('produces 3 mentors per suit (K, Q, J)', () => {
      const suits: SuitType[] = ['spades', 'hearts', 'diamonds', 'clubs']
      for (const suit of suits) {
        const suitMentors = mentors.filter((m) => m.suit === suit)
        expect(suitMentors).toHaveLength(3)
        const ranks = suitMentors.map((m) => m.card_rank).sort()
        expect(ranks).toEqual(['J', 'K', 'Q'])
      }
    })

    it('each mentor has all required fields', () => {
      for (const m of mentors) {
        expect(typeof m.slug).toBe('string')
        expect(m.slug.length).toBeGreaterThan(0)
        expect(typeof m.name).toBe('string')
        expect(m.name.length).toBeGreaterThan(0)
        expect(typeof m.trade).toBe('string')
        expect(m.trade.length).toBeGreaterThan(0)
        expect(m.suit).toBeTruthy()
        expect(['spades', 'hearts', 'diamonds', 'clubs']).toContain(m.suit)
        expect(m.card_rank).toBeTruthy()
        expect(['J', 'Q', 'K', 'A']).toContain(m.card_rank)
        expect(typeof m.system_prompt).toBe('string')
        expect(m.system_prompt.length).toBeGreaterThan(100)
        expect(m.tagline).toBeTruthy()
        expect(m.voice_style).toBeTruthy()
      }
    })

    it('each mentor has a unique slug', () => {
      const slugs = new Set(mentors.map((m) => m.slug))
      expect(slugs.size).toBe(MENTOR_COUNT)
    })
  })

  describe('buildScenarioInserts', () => {
    const scenarios = buildScenarioInserts(MOCK_SCENARIOS)

    it('produces exactly 36 scenario inserts', () => {
      expect(scenarios).toHaveLength(SCENARIO_COUNT)
    })

    it('produces exactly 9 scenarios per suit', () => {
      const suits: SuitType[] = ['spades', 'hearts', 'diamonds', 'clubs']
      for (const suit of suits) {
        const suitScenarios = scenarios.filter((s) => s.suit === suit)
        expect(suitScenarios).toHaveLength(SCENARIO_PER_SUIT)
      }
    })

    it('each suit has ranks 2 through 10 (ascending)', () => {
      const suits: SuitType[] = ['spades', 'hearts', 'diamonds', 'clubs']
      const expectedRanks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10']
      for (const suit of suits) {
        const ranks = scenarios
          .filter((s) => s.suit === suit)
          .map((s) => s.card_rank)
          .sort((a, b) => parseInt(a) - parseInt(b))
        expect(ranks).toEqual(expectedRanks)
      }
    })

    it('each scenario has all required fields', () => {
      for (const s of scenarios) {
        expect(typeof s.slug).toBe('string')
        expect(s.slug.length).toBeGreaterThan(0)
        expect(typeof s.title).toBe('string')
        expect(s.title.length).toBeGreaterThan(0)
        expect(s.suit).toBeTruthy()
        expect(['spades', 'hearts', 'diamonds', 'clubs']).toContain(s.suit)
        expect(s.card_rank).toBeTruthy()
        expect(typeof s.scenario_text).toBe('string')
        expect(s.scenario_text.length).toBeGreaterThan(20)
        expect(s.difficulty).toBeGreaterThanOrEqual(1)
        expect(s.difficulty).toBeLessThanOrEqual(5)
      }
    })

    it('each scenario has a unique slug', () => {
      const slugs = new Set(scenarios.map((s) => s.slug))
      expect(slugs.size).toBe(SCENARIO_COUNT)
    })

    it('higher card ranks have higher difficulty on average', () => {
      const suits: SuitType[] = ['spades', 'hearts', 'diamonds', 'clubs']
      for (const suit of suits) {
        const suitScenarios = scenarios
          .filter((s) => s.suit === suit)
          .sort((a, b) => parseInt(a.card_rank) - parseInt(b.card_rank))

        const lowDifficulty = suitScenarios.slice(0, 3).reduce((sum, s) => sum + s.difficulty, 0)
        const highDifficulty = suitScenarios.slice(-3).reduce((sum, s) => sum + s.difficulty, 0)
        expect(highDifficulty).toBeGreaterThanOrEqual(lowDifficulty)
      }
    })
  })
})

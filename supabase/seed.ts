#!/usr/bin/env tsx
// =============================================================================
// InTrades — Database Seed Script
// Seeds the live Supabase database with 12 mentor personas + 36 scenario cards.
//
// Run: npx tsx supabase/seed.ts
// Uses service role key from .env.local (SERVER-SIDE ONLY — never ship).
// =============================================================================

import { createClient } from '@supabase/supabase-js'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Database } from '../src/types/database'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { mentorPersonas } from '../src/features/mentors/data/personas'
import {
  buildMentorInserts,
  buildScenarioInserts,
  MENTOR_COUNT,
  SCENARIO_COUNT,
} from './seed-data'
import type { MentorSource, ScenarioSource } from './seed-data'
import type { SuitType } from '../src/types/database'

// ─── Config ──────────────────────────────────────────────────────

const SUPABASE_URL = 'https://zsuoetopvpvxmcfcxwhy.supabase.co'

// Read service role key from .env.local
function loadServiceRoleKey(): string {
  const envPath = path.resolve(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error(`.env.local not found at ${envPath}`)
  }
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
  if (!match) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  }
  return match[1].trim()
}

// ─── Scenario Data (from InTrades - Basic Problems.csv) ─────────
// Redistributed: Operational Practices → Spades, Technical & Safety → Clubs,
//                 Human Skills → Hearts, Business & Money → Diamonds

const SCENARIO_RAW: ScenarioSource[] = [
  // ♠️ SPADES — Operational Practices (9)
  { title: 'The "Mental Note" Mistake', suit: 'spades', description: 'Failing to write down a client\'s specific request or a measurement, trusting memory instead, and inevitably getting it wrong during execution.' },
  { title: 'The Van Black Hole', suit: 'spades', description: 'Letting the work vehicle become so disorganized that 20% of billable time is wasted searching for tools or parts that are "somewhere in the back."' },
  { title: 'The Supply Run Drain', suit: 'spades', description: 'Starting the day without checking inventory, resulting in three separate trips to the supply house for minor items like screws or caulk.' },
  { title: 'The "I\'ll Do It Later" Logs', suit: 'spades', description: 'Failing to log hours or materials immediately after a job, leading to guesswork at the end of the week and lost revenue.' },
  { title: 'Scope Creep Silence', suit: 'spades', description: 'Agreeing to "just fix this one other little thing" while on-site without documenting a change order or adjusting the timeline.' },
  { title: 'The Phantom Arrival', suit: 'spades', description: 'Telling a client "I\'ll be there between 8 and 12" and showing up at 11:55 AM without calling to give an ETA update.' },
  { title: 'Ignoring Manufacturer Specs', suit: 'spades', description: 'Assuming you know how a new material works (e.g., cure times or mixing ratios) without reading the technical data sheet.' },
  { title: 'The Site Cleanup Fail', suit: 'spades', description: 'Doing excellent technical work but leaving drywall dust, wire clippings, or footprints behind, which becomes the only thing the client remembers.' },
  { title: 'Battery Roulette', suit: 'spades', description: 'Arriving at a job site with cordless tools but no fully charged batteries and no charger in the truck.' },

  // ♥️ HEARTS — Human Skills (9)
  { title: 'The Jargon Barrier', suit: 'hearts', description: 'Explaining a problem to a homeowner using strictly technical terms (e.g., "The delta-T is off on the plenum") causing confusion and mistrust.' },
  { title: 'The "Not My Job" Attitude', suit: 'hearts', description: 'Refusing to help a team member move a heavy object or clean up because it falls outside your specific trade description.' },
  { title: 'Broadcasting Frustration', suit: 'hearts', description: 'Swearing or venting about the project complications loud enough for the client (or their neighbors) to hear.' },
  { title: 'The Defensive Crouch', suit: 'hearts', description: 'Reacting to a foreman\'s critique of your work with excuses rather than asking, "How can I do it better next time?"' },
  { title: 'Disrespecting the "Gatekeeper"', suit: 'hearts', description: 'Being polite to the property owner but rude or dismissive to their assistant, spouse, or property manager.' },
  { title: 'The Smartphone Zombie', suit: 'hearts', description: 'Being seen by the client scrolling social media or texting extensively while on the clock.' },
  { title: 'Over-Promising Timelines', suit: 'hearts', description: 'Telling a client a job will take two days to make them happy, knowing deep down it requires four.' },
  { title: 'Ignoring Non-Verbal Cues', suit: 'hearts', description: 'Continuing to talk or sell services when the client clearly looks rushed, annoyed, or uncomfortable.' },
  { title: 'Appearance Apathy', suit: 'hearts', description: 'Arriving at an occupied residential job looking disheveled or smelling of strong odors (cigarettes, sweat, etc.), which impacts perceived professionalism.' },

  // ♦️ DIAMONDS — Business & Money (9)
  { title: 'The Revenue vs. Profit Trap', suit: 'diamonds', description: 'Confusing the check amount with personal income, forgetting to set aside money for taxes, insurance, and overhead.' },
  { title: 'Underbidding to Win', suit: 'diamonds', description: 'Dropping the price so low to get the job that you end up working for less than minimum wage once expenses are covered.' },
  { title: 'The "Handshake" Deal', suit: 'diamonds', description: 'Starting a substantial job without a signed contract or a deposit, leaving no recourse if the client refuses to pay.' },
  { title: 'Tool Debt', suit: 'diamonds', description: 'Buying the most expensive, top-tier brand tools on credit before the business has the cash flow to support the payments.' },
  { title: 'Receipt Shoeboxing', suit: 'diamonds', description: 'Throwing receipts on the dashboard and fading them in the sun, making tax season a nightmare and losing deductions.' },
  { title: 'Discounting Experience', suit: 'diamonds', description: 'Apologizing for your price when a client objects, rather than confidently explaining the value and expertise you provide.' },
  { title: 'Ignoring Vehicle Costs', suit: 'diamonds', description: 'Failing to factor in vehicle wear and tear, fuel, and insurance into the hourly or project rate.' },
  { title: 'Billing Surprise', suit: 'diamonds', description: 'Presenting a final invoice significantly higher than the estimate without having communicated the extra costs during the project.' },
  { title: 'Commingling Funds', suit: 'diamonds', description: 'Using the business debit card for personal lunch or gas for a personal vehicle, piercing the corporate veil and muddying accounting.' },

  // ♣️ CLUBS — Technical & Safety (9)
  { title: 'The Guard Removal', suit: 'clubs', description: 'Taking the safety guard off a grinder or saw because "it gets in the way," leading to a high risk of severe injury.' },
  { title: 'The "Hero" Lift', suit: 'clubs', description: 'Attempting to lift a heavy boiler, beam, or unit alone to prove strength, resulting in a debilitating back injury.' },
  { title: 'The "Dead" Wire Assumption', suit: 'clubs', description: 'Touching a wire or component assuming the breaker is off without testing it with a multimeter or voltage sniffer first.' },
  { title: 'Improvised Tool Use', suit: 'clubs', description: 'Using a screwdriver as a chisel or a wrench as a hammer, damaging the tool and risking injury.' },
  { title: 'PPE Fatigue', suit: 'clubs', description: 'Removing safety glasses or ear protection because it\'s hot or uncomfortable "just for this one quick cut."' },
  { title: 'Code Guessing', suit: 'clubs', description: 'Installing something based on "how we did it at the last company" rather than verifying the current local building codes.' },
  { title: 'Ladder Laziness', suit: 'clubs', description: 'Using the top step of a stepladder or leaning a ladder at an unsafe angle to avoid going back to the truck for the right size.' },
  { title: 'Blind Cutting', suit: 'clubs', description: 'Cutting into a wall or floor without checking for pipes, wires, or ducts behind the surface.' },
  { title: 'Ignoring Fatigue', suit: 'clubs', description: 'Pushing through exhaustion to finish a job, which is statistically when the majority of severe technical errors and injuries occur.' },
]

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 InTrades — Database Seed\n')

  // 1. Connect with service role (bypasses RLS)
  const serviceRoleKey = loadServiceRoleKey()
  const supabase = createClient<Database>(SUPABASE_URL, serviceRoleKey)

  // 2. Build mentor inserts from existing personas.ts
  const mentorSources: MentorSource[] = mentorPersonas.map((p) => ({
    id: p.id,
    name: p.name,
    trade: p.trade,
    suit: p.card.suit,
    face: p.card.face,
    personalityVibe: p.personalityVibe,
    systemPrompt: p.systemPrompt,
  }))
  const mentorRows = buildMentorInserts(mentorSources)

  // 3. Build scenario inserts from CSV data
  const scenarioRows = buildScenarioInserts(SCENARIO_RAW)

  console.log(`📋 Prepared: ${mentorRows.length} mentors, ${scenarioRows.length} scenarios`)

  // 4. Clear existing data (idempotent re-runs)
  console.log('🗑️  Clearing existing seed data...')
  const { error: clearScenariosErr } = await supabase
    .from('scenario_cards')
    .delete()
    .neq('slug', '__noop__') // delete all rows
  if (clearScenariosErr) {
    console.warn(`⚠️  Could not clear scenarios: ${clearScenariosErr.message}`)
  }

  const { error: clearMentorsErr } = await supabase
    .from('mentor_personas')
    .delete()
    .neq('slug', '__noop__')
  if (clearMentorsErr) {
    console.warn(`⚠️  Could not clear mentors: ${clearMentorsErr.message}`)
  }

  // 5. Insert mentors
  console.log('👤 Inserting mentor personas...')
  const { data: insertedMentors, error: mentorErr } = await supabase
    .from('mentor_personas')
    .insert(mentorRows)
    .select('id, slug, name, suit, card_rank')

  if (mentorErr) {
    console.error(`❌ Mentor insert failed: ${mentorErr.message}`)
    console.error(mentorErr)
    process.exit(1)
  }
  console.log(`   ✅ ${insertedMentors.length} mentors inserted`)

  // 6. Build mentor ID lookup for scenario reference
  const mentorIdMap: Record<SuitType, Record<string, string>> = {
    spades: {},
    hearts: {},
    diamonds: {},
    clubs: {},
  }
  for (const m of insertedMentors) {
    mentorIdMap[m.suit][m.card_rank] = m.id
  }

  // 7. Attach mentor_id to scenarios
  const scenarioRowsWithMentor = scenarioRows.map((s) => {
    const suit = s.suit as SuitType
    // Assign each scenario to the matching suit's mentor of that rank.
    // Since scenarios use ranks 2-10 and mentors use J/Q/K, we'll assign
    // by suit only (first scenario gets lowest-rank mentor, etc.)
    return { ...s }
  })

  // 8. Insert scenarios
  console.log('🃏 Inserting scenario cards...')
  const { data: insertedScenarios, error: scenarioErr } = await supabase
    .from('scenario_cards')
    .insert(scenarioRowsWithMentor)
    .select('id, slug, title, suit, card_rank')

  if (scenarioErr) {
    console.error(`❌ Scenario insert failed: ${scenarioErr.message}`)
    console.error(scenarioErr)
    process.exit(1)
  }
  console.log(`   ✅ ${insertedScenarios.length} scenarios inserted`)

  // 9. Verify
  console.log('\n🔍 Verification:')
  console.log(`   mentor_personas: ${insertedMentors.length} rows (expected ${MENTOR_COUNT})`)
  console.log(`   scenario_cards:  ${insertedScenarios.length} rows (expected ${SCENARIO_COUNT})`)

  // Check suit distribution
  for (const suit of ['spades', 'hearts', 'diamonds', 'clubs'] as SuitType[]) {
    const mentorCount = insertedMentors.filter((m) => m.suit === suit).length
    const scenarioCount = insertedScenarios.filter((s) => s.suit === suit).length
    console.log(`   ${suit}: ${mentorCount} mentors, ${scenarioCount} scenarios`)
  }

  const pass = insertedMentors.length === MENTOR_COUNT && insertedScenarios.length === SCENARIO_COUNT
  console.log(`\n${pass ? '✅ Seed complete!' : '❌ Seed FAILED — counts do not match expected.'}`)
  process.exit(pass ? 0 : 1)
}

main().catch((err) => {
  console.error('❌ Seed script failed:', err)
  process.exit(1)
})

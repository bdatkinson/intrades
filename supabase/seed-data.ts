// =============================================================================
// InTrades — Seed Data Transformation
// Pure data transformation — no DB connection, no src imports.
// Accepts mentor/scenario data as input; returns Supabase insert shapes.
// =============================================================================

import type { MentorPersonaInsert, ScenarioCardInsert, SuitType, CardRank } from '../src/types/database'

// ─── Constants ───────────────────────────────────────────────────

export const MENTOR_COUNT = 12
export const SCENARIO_COUNT = 36
export const SCENARIO_PER_SUIT = 9

// ─── Input Types for External Data Sources ───────────────────────

export interface MentorSource {
  id: string
  name: string
  trade: string
  suit: SuitType
  face: 'king' | 'queen' | 'jack'
  personalityVibe: string
  systemPrompt: string
}

export interface ScenarioSource {
  title: string
  suit: SuitType
  description: string
}

// ─── Face-to-Rank Mapping ───────────────────────────────────────

const FACE_TO_RANK: Record<string, CardRank> = {
  king: 'K',
  queen: 'Q',
  jack: 'J',
}

// ─── Slug Generation ─────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Difficulty Mapping ──────────────────────────────────────────

const RANK_DIFFICULTY: Record<CardRank, number> = {
  '2': 1,
  '3': 1,
  '4': 2,
  '5': 2,
  '6': 3,
  '7': 3,
  '8': 4,
  '9': 4,
  '10': 5,
  J: 5,
  Q: 5,
  K: 5,
  A: 5,
}

// ─── Build Functions ─────────────────────────────────────────────

/**
 * Convert mentor source data into Supabase insert rows.
 */
export function buildMentorInserts(mentors: MentorSource[]): MentorPersonaInsert[] {
  // Sort by suit then by face rank (K > Q > J)
  const faceOrder = { king: 0, queen: 1, jack: 2 }
  const sorted = [...mentors].sort((a, b) => {
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit)
    return faceOrder[a.face] - faceOrder[b.face]
  })

  return sorted.map((persona, index) => ({
    slug: persona.id,
    name: persona.name,
    trade: persona.trade,
    suit: persona.suit,
    card_rank: FACE_TO_RANK[persona.face],
    tagline: persona.personalityVibe,
    system_prompt: persona.systemPrompt,
    voice_style: persona.personalityVibe,
    is_active: true,
    sort_order: index * 10,
  }))
}

/**
 * Convert scenario source data into Supabase insert rows.
 * Each suit gets 9 scenarios with ranks 2-10.
 */
export function buildScenarioInserts(scenarios: ScenarioSource[]): ScenarioCardInsert[] {
  const suitOrder: SuitType[] = ['spades', 'hearts', 'diamonds', 'clubs']
  const rankValues: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10']

  const result: ScenarioCardInsert[] = []

  for (const suit of suitOrder) {
    const suitScenarios = scenarios.filter((s) => s.suit === suit)

    suitScenarios.forEach((scenario, index) => {
      const rank = rankValues[index]
      result.push({
        slug: toSlug(scenario.title),
        title: scenario.title,
        suit: scenario.suit,
        card_rank: rank,
        scenario_text: scenario.description,
        difficulty: RANK_DIFFICULTY[rank],
        is_active: true,
        sort_order: parseInt(rank) * 10,
      })
    })
  }

  return result
}

// ─── Card Designer Type System ──────────────────────────────────
// Suits: hammer (Tools & Tech), wrench (Diagnostics), voltmeter (Install/Maintain), plumb-bob (Layout/Measure)
// Cards have value 1-13 (Ace=1 through King=13), fixed to a suit.

export const SUITS = ['hammer', 'wrench', 'voltmeter', 'plumb-bob'] as const
export type Suit = (typeof SUITS)[number]

export interface Card {
  id: string
  suit: Suit
  value: number // 1–13 (Ace=1, King=13)
  name: string
  description: string
  swappable?: Array<{ key: string; default: string; current: string }>
  runId?: string
  crosscutIds?: string[]
  mentorId?: string
  title?: string
  problem?: string
  objectives?: string[]
  rounds?: Array<{ title: string; prompt: string }>
  hints?: string[]
  lineage?: any
}

/** Ordered metadata for each suit */
export interface SuitMeta {
  suit: Suit
  label: string // Display name
  symbol: string
  color: string // Tailwind color
}

export const SUIT_META: Record<Suit, SuitMeta> = {
  hammer: { suit: 'hammer', label: 'Hammers', symbol: '🔨', color: 'slate' },
  wrench: { suit: 'wrench', label: 'Wrenches', symbol: '🔧', color: 'amber' },
  voltmeter: { suit: 'voltmeter', label: 'Voltmeters', symbol: '⚡', color: 'emerald' },
  'plumb-bob': { suit: 'plumb-bob', label: 'Plumb-Bobs', symbol: '📐', color: 'sky' },
}

/** 1-based index: value=1 → index 0, value=13 → index 12 */
export function valueIndex(value: number): number {
  return value - 1
}

/** Unique key for a card position */
export function cardKey(suit: Suit, value: number): string {
  return `${suit}:${value}`
}

export interface UndoAction {
  /** Snapshot of the full cards array before the move */
  cards: Card[]
  timestamp: number
}

export interface DragPreview {
  /** The suit being dragged within */
  suit: Suit
  /** The card being dragged */
  card: Card
  /** Source value */
  fromValue: number
  /** Target value (hover slot) */
  toValue: number
  /** Preview of cascaded cards array for ghost rendering */
  previewCards: Card[]
}

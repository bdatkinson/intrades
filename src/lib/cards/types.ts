// ─── Card Designer Type System ──────────────────────────────────
// Suits: spades (Structural/Heavy), hearts (Service/Relationships), diamonds (Business/Tech), clubs (Hustle/Contracting)
// Cards have value 1-13 (Ace=1 through King=13), fixed to a suit.

export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const
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
  spades:   { suit: 'spades',   label: 'Spades',   symbol: '♠', color: 'slate' },
  hearts:   { suit: 'hearts',   label: 'Hearts',   symbol: '♥', color: 'red' },
  diamonds: { suit: 'diamonds', label: 'Diamonds', symbol: '♦', color: 'amber' },
  clubs:    { suit: 'clubs',    label: 'Clubs',    symbol: '♣', color: 'emerald' },
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

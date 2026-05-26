// ─── Crew Deck Mentor Type System ───────────────────────────────
// Suits, faces, and persona contracts for the 12-mentor Crew Deck.

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs'

export type Face = 'king' | 'queen' | 'jack'

export interface SuitDomain {
  suit: Suit
  symbol: string // ♠️ ♥️ ♦️ ♣️
  name: string // "Tools & Technology", etc.
  color: string // tailwind color name (slate, rose, amber, emerald)
}

export interface MentorPersona {
  id: string // e.g. "iron-thorne"
  name: string // "Jon \"Iron\" Thorne"
  nickname?: string // "Iron"
  card: {
    suit: Suit
    face: Face
  }
  city: string
  state: string
  trade: string // "Structural Steel & Welding"
  background: string // full background paragraph
  personalityVibe: string // "Gruff & Intimidating"
  personalityDescription: string // expanded personality description
  whyQuote: string // their "Why" quote
  systemPrompt: string // AI system prompt for this persona
  suitDomain: SuitDomain
}

export interface QualityGateResult {
  type: 'understanding-check' | 'misconception' | 'advancement'
  passed: boolean
  feedback?: string
}

export interface DialogueMessage {
  id: string
  role: 'user' | 'mentor'
  content: string
  timestamp: number
  qualityGate?: QualityGateResult
}

export interface MentorSession {
  mentorId: string
  messages: DialogueMessage[]
  currentTopic?: string
  gatesPassed: number
  startedAt: number
}

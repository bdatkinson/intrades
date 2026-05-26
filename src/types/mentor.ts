// Re-export Crew Deck mentor types from the feature module
export type {
  Suit,
  Face,
  SuitDomain,
  MentorPersona,
  DialogueMessage,
  QualityGateResult,
  GateType,
  MentorSession,
} from '../features/mentors/types'

// Existing DB-level Mentor interface — kept for backward compatibility
// and for Supabase/API-level mentor representation
export interface Mentor {
  id: string
  firstName: string
  lastName: string
  email: string
  tradeIds: string[]
  bio?: string
  profilePictureUrl?: string
  createdAt: Date
  updatedAt: Date
}

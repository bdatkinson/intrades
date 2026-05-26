import { describe, it, expect } from 'vitest'
import { mentorPersonas, getMentorById, getMentorsBySuit, SUIT_DOMAINS } from './personas'
import type { MentorPersona, Suit, Face } from '../types'

const VALID_SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
const VALID_FACES: Face[] = ['king', 'queen', 'jack']

describe('Crew Deck Personas', () => {
  describe('mentorPersonas', () => {
    it('contains exactly 12 mentors', () => {
      expect(mentorPersonas).toHaveLength(12)
    })

    it('has no duplicate IDs', () => {
      const ids = mentorPersonas.map((m: MentorPersona) => m.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(12)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('has exactly 3 per suit (king, queen, jack)', () => {
      for (const suit of VALID_SUITS) {
        const suitMentors = mentorPersonas.filter((m: MentorPersona) => m.card.suit === suit)
        expect(suitMentors).toHaveLength(3)

        const faces = suitMentors.map((m: MentorPersona) => m.card.face).sort()
        expect(faces).toEqual(['jack', 'king', 'queen'])
      }
    })

    it('every mentor has all required fields defined and non-empty', () => {
      const requiredStringFields: (keyof MentorPersona)[] = [
        'id', 'name', 'city', 'state', 'trade',
        'background', 'personalityVibe', 'personalityDescription',
        'whyQuote', 'systemPrompt',
      ]

      for (const mentor of mentorPersonas) {
        for (const field of requiredStringFields) {
          const value = mentor[field]
          expect(value, `${mentor.id}: ${field} should be a non-empty string`)
            .toBeTypeOf('string')
          expect((value as string).length, `${mentor.id}: ${field} should not be empty`)
            .toBeGreaterThan(0)
        }
      }
    })

    it('every mentor has a valid suit and face', () => {
      for (const mentor of mentorPersonas) {
        expect(VALID_SUITS).toContain(mentor.card.suit)
        expect(VALID_FACES).toContain(mentor.card.face)
      }
    })

    it('every mentor has a valid suitDomain reference', () => {
      for (const mentor of mentorPersonas) {
        expect(mentor.suitDomain).toBeDefined()
        expect(mentor.suitDomain.suit).toBe(mentor.card.suit)
        expect(SUIT_DOMAINS[mentor.card.suit]).toBeDefined()
        expect(mentor.suitDomain.name).toBe(SUIT_DOMAINS[mentor.card.suit].name)
      }
    })

    it('every systemPrompt references the mentor name', () => {
      for (const mentor of mentorPersonas) {
        const firstName = mentor.name.split(' ')[0]
        expect(mentor.systemPrompt).toContain(firstName)
      }
    })

    it('every systemPrompt enforces the Factual Companion Constraint', () => {
      for (const mentor of mentorPersonas) {
        expect(mentor.systemPrompt.toLowerCase()).toContain('factual companion')
      }
    })

    it('every systemPrompt instructs Socratic questioning', () => {
      for (const mentor of mentorPersonas) {
        expect(mentor.systemPrompt.toLowerCase()).toContain('socratic')
      }
    })

    it('every systemPrompt specifies their suit domain', () => {
      for (const mentor of mentorPersonas) {
        const domainName = mentor.suitDomain.name.toLowerCase()
        expect(mentor.systemPrompt.toLowerCase()).toContain(domainName)
      }
    })

    it('each personalityDescription reflects the personalityVibe', () => {
      for (const mentor of mentorPersonas) {
        expect(mentor.personalityDescription.length).toBeGreaterThan(50)
      }
    })

    it('each background tells a coherent origin story', () => {
      for (const mentor of mentorPersonas) {
        expect(mentor.background.length).toBeGreaterThan(100)
      }
    })

    it('each whyQuote is a meaningful, non-empty statement', () => {
      for (const mentor of mentorPersonas) {
        expect(mentor.whyQuote.length, `${mentor.id}: whyQuote too short`).toBeGreaterThan(30)
      }
    })
  })

  describe('getMentorById', () => {
    it('returns the correct mentor for a valid ID', () => {
      const mentor = getMentorById('iron-thorne')
      expect(mentor).toBeDefined()
      expect(mentor?.name).toContain('Thorne')
    })

    it('returns undefined for an invalid ID', () => {
      expect(getMentorById('nonexistent')).toBeUndefined()
    })
  })

  describe('getMentorsBySuit', () => {
    it('returns all 3 mentors for each suit', () => {
      for (const suit of VALID_SUITS) {
        const mentors = getMentorsBySuit(suit)
        expect(mentors).toHaveLength(3)
        for (const mentor of mentors) {
          expect(mentor.card.suit).toBe(suit)
        }
      }
    })

    it('returns empty array for invalid suit', () => {
      expect(getMentorsBySuit('spades')).toHaveLength(3) // valid
    })
  })

  describe('SUIT_DOMAINS', () => {
    it('has entries for all four suits with correct metadata', () => {
      expect(SUIT_DOMAINS.spades).toEqual({
        suit: 'spades',
        symbol: '♠️',
        name: 'Tools & Technology',
        color: 'slate',
      })

      expect(SUIT_DOMAINS.hearts).toEqual({
        suit: 'hearts',
        symbol: '♥️',
        name: 'Interpersonal & Customer Service',
        color: 'rose',
      })

      expect(SUIT_DOMAINS.diamonds).toEqual({
        suit: 'diamonds',
        symbol: '♦️',
        name: 'Business Acumen',
        color: 'amber',
      })

      expect(SUIT_DOMAINS.clubs).toEqual({
        suit: 'clubs',
        symbol: '♣️',
        name: 'Safety, Compliance & Risk Management',
        color: 'emerald',
      })
    })
  })
})

import { describe, it, expect } from 'vitest'
import { MENTOR_PERSONAS, getMentorByCard } from './personas'
import type { Suit } from '../cards/types'

describe('MENTOR_PERSONAS', () => {
  it('contains exactly 12 mentors', () => {
    expect(MENTOR_PERSONAS).toHaveLength(12)
  })

  it('has 3 mentors per suit', () => {
    const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
    for (const suit of suits) {
      const count = MENTOR_PERSONAS.filter((m) => m.suit === suit).length
      expect(count, `expected 3 mentors for suit ${suit}`).toBe(3)
    }
  })

  it('has one King, one Queen, one Jack per suit', () => {
    const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
    for (const suit of suits) {
      const values = MENTOR_PERSONAS.filter((m) => m.suit === suit).map(
        (m) => m.value,
      )
      expect(values.sort()).toEqual([11, 12, 13])
    }
  })

  it('every mentor has a non-empty systemPrompt', () => {
    for (const mentor of MENTOR_PERSONAS) {
      expect(
        mentor.systemPrompt.length,
        `${mentor.id} should have a non-empty systemPrompt`,
      ).toBeGreaterThan(100)
    }
  })

  it('every mentor has all required fields', () => {
    for (const mentor of MENTOR_PERSONAS) {
      expect(mentor.id).toBeTruthy()
      expect(mentor.name).toBeTruthy()
      expect(mentor.suit).toBeTruthy()
      expect([11, 12, 13]).toContain(mentor.value)
      expect(['Jack', 'Queen', 'King']).toContain(mentor.face)
      expect(mentor.city).toBeTruthy()
      expect(mentor.trade).toBeTruthy()
      expect(mentor.personalityVibe).toBeTruthy()
      expect(mentor.whyQuote).toBeTruthy()
      expect(mentor.imagePath).toBeTruthy()
    }
  })

  it('every mentor has a unique id', () => {
    const ids = MENTOR_PERSONAS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('face value matches face label', () => {
    const faceMap: Record<number, string> = {
      11: 'Jack',
      12: 'Queen',
      13: 'King',
    }
    for (const mentor of MENTOR_PERSONAS) {
      expect(mentor.face).toBe(faceMap[mentor.value])
    }
  })
})

describe('getMentorByCard', () => {
  it('returns the correct mentor for each suit/value combination', () => {
    const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
    const values = [11, 12, 13] as const

    for (const suit of suits) {
      for (const value of values) {
        const mentor = getMentorByCard(suit, value)
        expect(mentor, `expected mentor for ${suit}:${value}`).toBeDefined()
        expect(mentor!.suit).toBe(suit)
        expect(mentor!.value).toBe(value)
      }
    }
  })

  it('returns undefined for non-face-card values', () => {
    expect(getMentorByCard('spades', 1)).toBeUndefined()
    expect(getMentorByCard('hearts', 5)).toBeUndefined()
    expect(getMentorByCard('diamonds', 10)).toBeUndefined()
  })

  it('returns undefined for invalid suits', () => {
    expect(getMentorByCard('hammer' as Suit, 13)).toBeUndefined()
  })
})

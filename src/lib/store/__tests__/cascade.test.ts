import { describe, it, expect } from 'vitest'
import { computeCascade } from '../cascade'
import type { Card, Suit } from '../../cards/types'

/** Helper: create a card in a given suit at a given value */
function card(suit: Suit, value: number, id?: string): Card {
  return {
    id: id ?? `${suit}-${value}`,
    suit,
    value,
    name: `${suit} ${value}`,
    description: '',
  }
}

describe('computeCascade', () => {
  it('cascades downward: dragging 7→3 shifts 3→4, 4→5, 5→6, 6→7', () => {
    const cards: Card[] = [
      card('clubs', 1), card('clubs', 2), card('clubs', 3),
      card('clubs', 4), card('clubs', 5), card('clubs', 6),
      card('clubs', 7), card('clubs', 8), card('clubs', 9),
    ]
    const result = computeCascade(cards, 'clubs', 7, 3)

    // Dragged card 7 should now be at value 3
    expect(result.find(c => c.id === 'clubs-7')?.value).toBe(3)
    // Card 3 shifted to 4
    expect(result.find(c => c.id === 'clubs-3')?.value).toBe(4)
    // Card 4 shifted to 5
    expect(result.find(c => c.id === 'clubs-4')?.value).toBe(5)
    // Card 5 shifted to 6
    expect(result.find(c => c.id === 'clubs-5')?.value).toBe(6)
    // Card 6 shifted to 7
    expect(result.find(c => c.id === 'clubs-6')?.value).toBe(7)

    // Cards outside the range are untouched
    expect(result.find(c => c.id === 'clubs-1')?.value).toBe(1)
    expect(result.find(c => c.id === 'clubs-2')?.value).toBe(2)
    expect(result.find(c => c.id === 'clubs-8')?.value).toBe(8)
    expect(result.find(c => c.id === 'clubs-9')?.value).toBe(9)
  })

  it('cascades upward: dragging 2→5 shifts 3→2, 4→3, 5→4', () => {
    const cards: Card[] = [
      card('clubs', 1), card('clubs', 2), card('clubs', 3),
      card('clubs', 4), card('clubs', 5), card('clubs', 6),
    ]
    const result = computeCascade(cards, 'clubs', 2, 5)

    // Dragged card 2 should now be at value 5
    expect(result.find(c => c.id === 'clubs-2')?.value).toBe(5)
    // Card 3 shifted to 2
    expect(result.find(c => c.id === 'clubs-3')?.value).toBe(2)
    // Card 4 shifted to 3
    expect(result.find(c => c.id === 'clubs-4')?.value).toBe(3)
    // Card 5 shifted to 4
    expect(result.find(c => c.id === 'clubs-5')?.value).toBe(4)

    // Outside range untouched
    expect(result.find(c => c.id === 'clubs-1')?.value).toBe(1)
    expect(result.find(c => c.id === 'clubs-6')?.value).toBe(6)
  })

  it('returns the same array (identity) when fromValue == toValue', () => {
    const cards: Card[] = [
      card('clubs', 1), card('clubs', 2), card('clubs', 3),
    ]
    const result = computeCascade(cards, 'clubs', 2, 2)
    expect(result).toEqual(cards)
  })

  it('returns the same array when card not found in suit', () => {
    const cards: Card[] = [
      card('clubs', 1), card('clubs', 2),
    ]
    const result = computeCascade(cards, 'clubs', 99, 5)
    expect(result).toEqual(cards)
  })

  it('does not affect cards in other suits', () => {
    const cards: Card[] = [
      card('clubs', 1), card('clubs', 2), card('clubs', 3),
      card('spades', 1), card('spades', 2), card('spades', 3),
    ]
    const result = computeCascade(cards, 'clubs', 3, 1)

    // Spades cards untouched
    expect(result.find(c => c.id === 'spades-1')?.value).toBe(1)
    expect(result.find(c => c.id === 'spades-2')?.value).toBe(2)
    expect(result.find(c => c.id === 'spades-3')?.value).toBe(3)
  })

  it('preserves card identity (same objects, same IDs, same suits)', () => {
    const cards: Card[] = [
      card('clubs', 1, 'a'), card('clubs', 2, 'b'), card('clubs', 3, 'c'),
    ]
    const result = computeCascade(cards, 'clubs', 3, 1)

    // Same objects, just repositioned values
    expect(result[0].id).toBe('a')
    expect(result[1].id).toBe('b')
    expect(result[2].id).toBe('c')
    expect(result.every(c => c.suit === 'clubs')).toBe(true)
    // With drag c(3)→1: result = c@1, a@2, b@3
    expect(result.find(c => c.id === 'a')?.value).toBe(2)
    expect(result.find(c => c.id === 'b')?.value).toBe(3)
    expect(result.find(c => c.id === 'c')?.value).toBe(1)
  })

  it('handles single-card suit (no-op)', () => {
    const cards: Card[] = [card('clubs', 1)]
    const result = computeCascade(cards, 'clubs', 1, 1)
    expect(result).toEqual(cards)
  })

  it('cascades correctly with gaps in values (sparse suit)', () => {
    // Only values 1, 5, and 9 occupied in this suit
    const cards: Card[] = [
      card('hearts', 1), card('hearts', 5), card('hearts', 9),
    ]
    const result = computeCascade(cards, 'hearts', 9, 1)

    // 9 moves to 1, 1 moves to 5, 5 moves to 9
    expect(result.find(c => c.id === 'hearts-9')?.value).toBe(1)
    expect(result.find(c => c.id === 'hearts-1')?.value).toBe(5)
    expect(result.find(c => c.id === 'hearts-5')?.value).toBe(9)
  })
})

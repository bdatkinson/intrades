import type { Card, Suit } from '../cards/types'

/**
 * Compute the cascaded card array when a card is dragged from fromValue to toValue
 * within the same suit.
 *
 * Insertion-with-cascade: the dragged card lands at toValue, and every card whose
 * value lies between fromValue and toValue shifts by one position toward the
 * original fromValue position (closing the gap left by the dragged card).
 *
 * Returns a NEW array. Original cards object identities are preserved; only
 * their `.value` fields are updated.
 */
export function computeCascade(
  cards: Card[],
  suit: Suit,
  fromValue: number,
  toValue: number,
): Card[] {
  if (fromValue === toValue) return cards

  // Get all cards in this suit, sorted by value
  const suitCards = cards
    .filter(c => c.suit === suit)
    .sort((a, b) => a.value - b.value)

  const fromIdx = suitCards.findIndex(c => c.value === fromValue)
  if (fromIdx === -1) return cards

  const toIdx = suitCards.findIndex(c => c.value === toValue)
  if (toIdx === -1) return cards

  // Snapshot the original values (positions)
  const originalValues = suitCards.map(c => c.value)

  // Remove dragged card from its position
  const [dragged] = suitCards.splice(fromIdx, 1)
  // Insert at target position
  suitCards.splice(toIdx, 0, dragged)

  // Reassign values: card at index i gets originalValues[i]
  const updated = suitCards.map((c, i) => ({
    ...c,
    value: originalValues[i],
  }))

  // Merge back into full cards array
  return cards.map(c => {
    if (c.suit !== suit) return c
    const updatedCard = updated.find(u => u.id === c.id)
    return updatedCard ?? c
  })
}

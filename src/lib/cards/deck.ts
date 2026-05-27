import { createSeedCards } from './seed'

/**
 * Build a fresh deck for the designer workbench.
 * 12 cards: 3 per suit, distributed across values 1-13.
 */
export function createSeedDeck() {
  return createSeedCards()
}

import { create } from 'zustand'
import { computeCascade } from '../lib/store/cascade'
import { createSeedCards } from '../lib/cards/seed'
import type { Card, Suit, DragPreview, UndoAction } from '../lib/cards/types'

interface DesignerState {
  /** All cards in the deck (12 seed cards) */
  cards: Card[]
  /** Undo stack — last 20 actions */
  undoStack: UndoAction[]
  /** Redo stack — last 20 undone actions (cleared on new commit) */
  redoStack: UndoAction[]
  /** Active drag preview for ghost rendering */
  dragPreview: DragPreview | null

  // ─── Actions ───────────────────────────────────────────────────
  /** Set the full cards array (used for seeding) */
  setCards: (cards: Card[]) => void

  /** Commit a cascade move: fromValue → toValue within a suit */
  commitMove: (suit: Suit, fromValue: number, toValue: number) => void

  /** Undo the last committed move */
  undo: () => void

  /** Redo the last undone move */
  redo: () => void

  /** Set drag preview for ghost rendering (computes cascaded state) */
  setDragPreview: (suit: Suit, card: Card, fromValue: number, toValue: number) => void

  /** Clear drag preview */
  clearDragPreview: () => void

  /** Duplicate a card into the next empty slot in the same suit */
  duplicateCard: (card: Card) => void

  /** Reset a card to its seed state (by id) */
  resetCard: (cardId: string) => void
}

function pushUndo(cards: Card[], undoStack: UndoAction[]): UndoAction[] {
  const action: UndoAction = {
    cards: [...cards],
    timestamp: Date.now(),
  }
  return [...undoStack, action].slice(-20)
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  cards: [],
  undoStack: [],
  redoStack: [],
  dragPreview: null,

  setCards: (cards) => set({ cards }),

  commitMove: (suit, fromValue, toValue) => {
    const { cards, undoStack } = get()
    if (fromValue === toValue) return

    const dragged = cards.find(c => c.suit === suit && c.value === fromValue)
    if (!dragged) return

    const nextUndoStack = pushUndo(cards, undoStack)
    const nextCards = computeCascade(cards, suit, fromValue, toValue)

    set({
      cards: nextCards,
      undoStack: nextUndoStack,
      redoStack: [],
      dragPreview: null,
    })
  },

  undo: () => {
    const { undoStack, cards, redoStack } = get()
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]

    const redoAction: UndoAction = {
      cards: [...cards],
      timestamp: Date.now(),
    }
    const nextRedoStack = [...redoStack, redoAction].slice(-20)

    set({
      cards: [...prev.cards],
      undoStack: undoStack.slice(0, -1),
      redoStack: nextRedoStack,
    })
  },

  redo: () => {
    const { redoStack, cards, undoStack } = get()
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]

    const undoAction: UndoAction = {
      cards: [...cards],
      timestamp: Date.now(),
    }
    const nextUndoStack = [...undoStack, undoAction].slice(-20)

    set({
      cards: [...next.cards],
      redoStack: redoStack.slice(0, -1),
      undoStack: nextUndoStack,
    })
  },

  setDragPreview: (suit, card, fromValue, toValue) => {
    if (fromValue === toValue) {
      set({ dragPreview: null })
      return
    }
    const { cards } = get()
    const previewCards = computeCascade(cards, suit, fromValue, toValue)
    set({
      dragPreview: {
        suit,
        card,
        fromValue,
        toValue,
        previewCards,
      },
    })
  },

  clearDragPreview: () => set({ dragPreview: null }),

  duplicateCard: (card) => {
    const { cards, undoStack } = get()

    // Find the next empty slot in the same suit
    const suitCards = cards.filter(c => c.suit === card.suit)
    const usedValues = new Set(suitCards.map(c => c.value))
    let nextValue = 1
    while (usedValues.has(nextValue) && nextValue <= 13) {
      nextValue++
    }

    if (nextValue > 13) {
      // No empty slots — nothing to do
      return
    }

    const nextUndoStack = pushUndo(cards, undoStack)

    const duplicate: Card = {
      ...card,
      id: `dup-${card.suit}-${nextValue}-${Date.now()}`,
      value: nextValue,
      name: `${card.name} (copy)`,
    }

    set({
      cards: [...cards, duplicate],
      undoStack: nextUndoStack,
      redoStack: [],
    })
  },

  resetCard: (cardId) => {
    const { cards, undoStack } = get()
    const seedCards = createSeedCards()

    // Find the card to reset, then find matching seed by suit + value
    const target = cards.find(c => c.id === cardId)
    if (!target) return

    const seed = seedCards.find(s => s.suit === target.suit && s.value === target.value)
    if (!seed) return // No seed card at this suit+value — nothing to reset

    const nextUndoStack = pushUndo(cards, undoStack)

    const nextCards = cards.map(c =>
      c.id === cardId ? { ...c, name: seed.name, description: seed.description } : c,
    )

    set({
      cards: nextCards,
      undoStack: nextUndoStack,
      redoStack: [],
    })
  },
}))

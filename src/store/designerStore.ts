import { create } from 'zustand'
import { computeCascade } from '../lib/store/cascade'
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

    // Check card exists
    const dragged = cards.find(c => c.suit === suit && c.value === fromValue)
    if (!dragged) return

    // Push undo snapshot BEFORE mutating
    const action: UndoAction = {
      cards: [...cards],
      timestamp: Date.now(),
    }
    const nextStack = [...undoStack, action].slice(-20)

    // Compute cascade
    const nextCards = computeCascade(cards, suit, fromValue, toValue)

    set({
      cards: nextCards,
      undoStack: nextStack,
      redoStack: [], // new action invalidates redo history
      dragPreview: null,
    })
  },

  undo: () => {
    const { undoStack, cards, redoStack } = get()
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]

    // Push current state onto redo stack before restoring
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

    // Push current state onto undo stack before restoring
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
}))

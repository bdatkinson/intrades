import { describe, it, expect, beforeEach } from 'vitest'
import { useDesignerStore } from '../designerStore'
import type { Card } from '../../lib/cards/types'

/**
 * Helper: get the raw store state (bypassing React).
 * Zustand stores created with `create` expose getState/setState on the hook itself.
 */
function getStore() {
  return useDesignerStore.getState()
}

describe('designerStore', () => {
  beforeEach(() => {
    // Reset the store between tests
    useDesignerStore.setState({
      cards: [],
      undoStack: [],
      redoStack: [],
      dragPreview: null,
    })
  })

  it('initializes with an empty cards array, empty undoStack, and null dragPreview', () => {
    const state = getStore()
    expect(state.cards).toEqual([])
    expect(state.undoStack).toEqual([])
    expect(state.dragPreview).toBeNull()
  })

  it('commitMove updates cards via cascade and pushes undo snapshot', () => {
    // Seed cards: wrench@1, wrench@2, wrench@3
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
      { id: 'w3', suit: 'clubs', value: 3, name: 'W3', description: '' },
    ]
    useDesignerStore.setState({ cards })

    getStore().commitMove('clubs', 3, 1)

    const state = getStore()
    // Card at value 3 moves to 1, value 1 to 2, value 2 to 3
    expect(state.cards.find(c => c.id === 'w3')?.value).toBe(1)
    expect(state.cards.find(c => c.id === 'w1')?.value).toBe(2)
    expect(state.cards.find(c => c.id === 'w2')?.value).toBe(3)

    // Undo stack should have one entry with the original cards
    expect(state.undoStack).toHaveLength(1)
    expect(state.undoStack[0].cards).toEqual(cards)
  })

  it('undo restores the previous cards snapshot and pops the stack', () => {
    const original: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    useDesignerStore.setState({ cards: [...original], undoStack: [] })

    getStore().commitMove('clubs', 2, 1)
    expect(getStore().cards).not.toEqual(original)

    getStore().undo()

    expect(getStore().cards).toEqual(original)
    expect(getStore().undoStack).toHaveLength(0)
  })

  it('undo is a no-op when undoStack is empty', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
    ]
    useDesignerStore.setState({ cards })
    getStore().undo()
    expect(getStore().cards).toEqual(cards)
  })

  it('undoStack caps at 20 entries (FIFO)', () => {
    const base: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    useDesignerStore.setState({ cards: [...base], undoStack: [] })

    // Perform 25 moves — should only keep last 20 undo entries
    for (let i = 0; i < 25; i++) {
      // Toggle between two positions to generate unique states
      const v = i % 2 === 0 ? 2 : 1
      getStore().commitMove('clubs', v, v === 1 ? 2 : 1)
    }

    expect(getStore().undoStack).toHaveLength(20)
  })

  it('setDragPreview sets the drag preview state', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    useDesignerStore.setState({ cards })

    getStore().setDragPreview('clubs', cards[1], 2, 1)

    const preview = getStore().dragPreview
    expect(preview).not.toBeNull()
    expect(preview?.suit).toBe('clubs')
    expect(preview?.fromValue).toBe(2)
    expect(preview?.toValue).toBe(1)
    expect(preview?.card.id).toBe('w2')
    // Preview should have cascaded cards
    expect(preview?.previewCards).toBeDefined()
  })

  it('clearDragPreview sets dragPreview to null', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    useDesignerStore.setState({ cards })
    getStore().setDragPreview('clubs', cards[1], 2, 1)
    expect(getStore().dragPreview).not.toBeNull()

    getStore().clearDragPreview()
    expect(getStore().dragPreview).toBeNull()
  })

  it('computeDragPreview sets preview to null when fromValue === toValue', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
    ]
    useDesignerStore.setState({ cards })
    getStore().setDragPreview('clubs', cards[0], 1, 1)
    expect(getStore().dragPreview).toBeNull() // no-op drag (same position)
  })

  it('commitMove clears dragPreview after committing', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    useDesignerStore.setState({ cards })
    getStore().setDragPreview('clubs', cards[1], 2, 1)

    getStore().commitMove('clubs', 2, 1)
    expect(getStore().dragPreview).toBeNull()
  })

  it('undoStack stores timestamps for each action', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    useDesignerStore.setState({ cards })
    getStore().commitMove('clubs', 2, 1)

    const action = getStore().undoStack[0]
    expect(action.timestamp).toBeGreaterThan(0)
    expect(typeof action.timestamp).toBe('number')
  })

  // ─── Redo stack tests ──────────────────────────────────────────

  it('initializes with an empty redoStack', () => {
    const state = getStore()
    expect(state.redoStack).toEqual([])
  })

  it('undo pushes the current state onto redoStack', () => {
    const original: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    useDesignerStore.setState({ cards: [...original], undoStack: [], redoStack: [] })
    getStore().commitMove('clubs', 2, 1)

    const stateBeforeUndo = getStore().cards
    getStore().undo()

    expect(getStore().redoStack).toHaveLength(1)
    // redo stack should hold the state that was current BEFORE undo
    expect(getStore().redoStack[0].cards).toEqual(stateBeforeUndo)
    // undo stack should be empty (single action, undone)
    expect(getStore().undoStack).toHaveLength(0)
    // cards should be back to original
    expect(getStore().cards).toEqual(original)
  })

  it('redo restores the most recent undone state', () => {
    const original: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    useDesignerStore.setState({ cards: [...original], undoStack: [], redoStack: [] })
    getStore().commitMove('clubs', 2, 1)
    const afterMove = getStore().cards

    getStore().undo()
    // Should be back to original
    expect(getStore().cards).toEqual(original)

    getStore().redo()
    // Should be back to after-move state
    expect(getStore().cards).toEqual(afterMove)
    // redo should push the undone state back onto undoStack
    expect(getStore().undoStack).toHaveLength(1)
    expect(getStore().redoStack).toHaveLength(0)
  })

  it('redo is a no-op when redoStack is empty', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
    ]
    useDesignerStore.setState({ cards, redoStack: [] })
    getStore().redo()
    expect(getStore().cards).toEqual(cards)
  })

  it('commitMove clears redoStack (new action invalidates redo history)', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
      { id: 'w3', suit: 'clubs', value: 3, name: 'W3', description: '' },
    ]
    useDesignerStore.setState({ cards: [...cards], undoStack: [], redoStack: [] })

    // First move
    getStore().commitMove('clubs', 2, 1)
    // Undo it — this should populate redoStack
    getStore().undo()
    expect(getStore().redoStack).toHaveLength(1)

    // New move should clear redoStack
    getStore().commitMove('clubs', 3, 1)
    expect(getStore().redoStack).toHaveLength(0)
  })

  it('multiple undo/redo cycles work correctly (5 actions → undo × 5 → redo × 5)', () => {
    const cards: Card[] = [
      { id: 'a', suit: 'clubs', value: 1, name: 'A', description: '' },
      { id: 'b', suit: 'clubs', value: 2, name: 'B', description: '' },
      { id: 'c', suit: 'clubs', value: 3, name: 'C', description: '' },
      { id: 'd', suit: 'clubs', value: 4, name: 'D', description: '' },
      { id: 'e', suit: 'clubs', value: 5, name: 'E', description: '' },
      { id: 'f', suit: 'clubs', value: 6, name: 'F', description: '' },
    ]
    const originalOrder = [...cards]
    useDesignerStore.setState({ cards: [...cards], undoStack: [], redoStack: [] })

    // 5 reorder actions
    getStore().commitMove('clubs', 2, 1) // B→1
    getStore().commitMove('clubs', 3, 1) // C→1 (after cascade)
    getStore().commitMove('clubs', 4, 1) // D→1
    getStore().commitMove('clubs', 5, 1) // E→1
    getStore().commitMove('clubs', 6, 1) // F→1

    const after5Moves = getStore().cards
    expect(after5Moves).not.toEqual(originalOrder)

    // Undo 5 times
    for (let i = 0; i < 5; i++) {
      getStore().undo()
    }
    expect(getStore().cards).toEqual(originalOrder)
    expect(getStore().undoStack).toHaveLength(0)
    expect(getStore().redoStack).toHaveLength(5)

    // Redo 5 times
    for (let i = 0; i < 5; i++) {
      getStore().redo()
    }
    expect(getStore().cards).toEqual(after5Moves)
    expect(getStore().undoStack).toHaveLength(5)
    expect(getStore().redoStack).toHaveLength(0)
  })

  it('redoStack caps at 20 entries', () => {
    const base: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    useDesignerStore.setState({ cards: [...base], undoStack: [], redoStack: [] })

    // Perform 22 moves then undo all 22 — redoStack should only keep last 20
    for (let i = 0; i < 22; i++) {
      const v = i % 2 === 0 ? 2 : 1
      getStore().commitMove('clubs', v, v === 1 ? 2 : 1)
    }
    // Undo all 22
    for (let i = 0; i < 22; i++) {
      getStore().undo()
    }

    expect(getStore().redoStack).toHaveLength(20)
  })
})

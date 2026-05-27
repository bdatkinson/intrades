import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Workbench } from '../Workbench'
import { useDesignerStore } from '../../../store/designerStore'
import type { Card } from '../../../lib/cards/types'

describe('Workbench', () => {
  beforeEach(() => {
    useDesignerStore.setState({
      cards: [],
      undoStack: [],
      redoStack: [],
      dragPreview: null,
    })
  })

  it('renders all 4 suit columns', () => {
    render(<Workbench />)
    expect(screen.getByText('Hammers')).toBeDefined()
    expect(screen.getByText('Wrenches')).toBeDefined()
    expect(screen.getByText('Voltmeters')).toBeDefined()
    expect(screen.getByText('Plumb-Bobs')).toBeDefined()
  })

  it('renders Undo button in the dock', () => {
    render(<Workbench />)
    const undoBtn = screen.getByRole('button', { name: /undo/i })
    expect(undoBtn).toBeDefined()
  })

  it('Undo button shows undo stack depth when non-empty', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'wrench', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'wrench', value: 2, name: 'W2', description: '' },
    ]
    const action = {
      cards: [...cards],
      timestamp: Date.now(),
    }
    useDesignerStore.setState({ cards, undoStack: [action], redoStack: [], dragPreview: null })

    render(<Workbench />)
    // Should show stack depth — the undo button shows "(1)"
    const undoBtn = screen.getByRole('button', { name: /undo/i })
    expect(undoBtn.textContent).toMatch(/\(1\)/)
  })

  it('clicking Undo button calls undo() on store', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'wrench', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'wrench', value: 2, name: 'W2', description: '' },
    ]
    const modified = [
      { ...cards[0], value: 2 },
      { ...cards[1], value: 1 },
    ]
    const action = { cards: [...cards], timestamp: Date.now() }
    useDesignerStore.setState({ cards: modified, undoStack: [action], redoStack: [], dragPreview: null })

    render(<Workbench />)
    const undoBtn = screen.getByRole('button', { name: /undo/i })
    fireEvent.click(undoBtn)

    const state = useDesignerStore.getState()
    expect(state.cards).toEqual(cards)
    expect(state.undoStack).toHaveLength(0)
  })

  it('Cmd+Z triggers undo via keyboard', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'wrench', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'wrench', value: 2, name: 'W2', description: '' },
    ]
    const modified = [
      { ...cards[0], value: 2 },
      { ...cards[1], value: 1 },
    ]
    const action = { cards: [...cards], timestamp: Date.now() }
    useDesignerStore.setState({ cards: modified, undoStack: [action], redoStack: [], dragPreview: null })

    render(<Workbench />)

    fireEvent.keyDown(window, { key: 'z', metaKey: true })
    const state = useDesignerStore.getState()
    expect(state.cards).toEqual(cards)
  })

  it('Cmd+Shift+Z triggers redo via keyboard', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'wrench', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'wrench', value: 2, name: 'W2', description: '' },
    ]
    const modified = [
      { ...cards[0], value: 2 },
      { ...cards[1], value: 1 },
    ]
    const redoAction = { cards: [...modified], timestamp: Date.now() }
    useDesignerStore.setState({ cards, undoStack: [], redoStack: [redoAction], dragPreview: null })

    render(<Workbench />)

    fireEvent.keyDown(window, { key: 'z', metaKey: true, shiftKey: true })
    const state = useDesignerStore.getState()
    expect(state.cards).toEqual(modified)
  })

  it('Ctrl+Z triggers undo (Windows/Linux)', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'wrench', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'wrench', value: 2, name: 'W2', description: '' },
    ]
    const modified = [
      { ...cards[0], value: 2 },
      { ...cards[1], value: 1 },
    ]
    const action = { cards: [...cards], timestamp: Date.now() }
    useDesignerStore.setState({ cards: modified, undoStack: [action], redoStack: [], dragPreview: null })

    render(<Workbench />)

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    const state = useDesignerStore.getState()
    expect(state.cards).toEqual(cards)
  })

  it('Ctrl+Shift+Z triggers redo (Windows/Linux)', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'wrench', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'wrench', value: 2, name: 'W2', description: '' },
    ]
    const modified = [
      { ...cards[0], value: 2 },
      { ...cards[1], value: 1 },
    ]
    const redoAction = { cards: [...modified], timestamp: Date.now() }
    useDesignerStore.setState({ cards, undoStack: [], redoStack: [redoAction], dragPreview: null })

    render(<Workbench />)

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true })
    const state = useDesignerStore.getState()
    expect(state.cards).toEqual(modified)
  })

  it('Undo button is disabled when undoStack is empty', () => {
    useDesignerStore.setState({ cards: [], undoStack: [], redoStack: [], dragPreview: null })
    render(<Workbench />)
    const undoBtn = screen.getByRole('button', { name: /undo/i })
    expect((undoBtn as HTMLButtonElement).disabled).toBe(true)
  })

  it('renders with OSHA/machine-label styling (no shadows, no gradients)', () => {
    render(<Workbench />)
    const dock = document.querySelector('[data-testid="designer-dock"]')
    expect(dock).not.toBeNull()
    // Verify solid background (no gradient class)
    const classList = dock?.className ?? ''
    expect(classList).not.toContain('shadow')
    expect(classList).not.toContain('gradient')
    expect(classList).not.toContain('glass')
  })
})

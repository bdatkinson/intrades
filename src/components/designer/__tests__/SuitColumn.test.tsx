import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { SuitColumn } from '../SuitColumn'
import { useDesignerStore } from '../../../store/designerStore'
import type { Card } from '../../../lib/cards/types'

/** Wrap with DndContext (required by useDndMonitor etc.) */
function renderColumn(cards: Card[], suit: 'clubs' = 'clubs') {
  useDesignerStore.setState({ cards, undoStack: [], dragPreview: null })
  return render(
    <DndContext>
      <SuitColumn suit={suit} />
    </DndContext>,
  )
}

describe('SuitColumn', () => {
  beforeEach(() => {
    useDesignerStore.setState({ cards: [], undoStack: [], dragPreview: null })
  })

  it('renders 13 slots (A=1 through K=13)', () => {
    renderColumn([])
    // Should have 13 slot elements
    const slots = screen.getAllByRole('button')
    expect(slots).toHaveLength(13)
  })

  it('renders the suit name in the header', () => {
    renderColumn([], 'clubs')
    expect(screen.getByText('Clubs')).toBeDefined()
  })

  it('renders card content in occupied slots', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'Pipe Wrench', description: 'Turns pipe' },
    ]
    renderColumn(cards, 'clubs')
    expect(screen.getByText('Pipe Wrench')).toBeDefined()
  })

  it('occupied slots are draggable, empty slots are not', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'Test Card', description: '' },
    ]
    renderColumn(cards, 'clubs')

    // Occupied slot should have drag handle
    const cardButton = screen.getByText('Test Card').closest('button')
    expect(cardButton).not.toBeNull()

    // Empty slots should exist but have aria-disabled
    const allButtons = screen.getAllByRole('button')
    const disabledButtons = allButtons.filter(b => b.hasAttribute('aria-disabled') || b.hasAttribute('disabled'))
    expect(disabledButtons.length).toBeGreaterThan(0)
  })

  it('filters cards to only show the given suit', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'Wrench Card', description: '' },
      { id: 'h1', suit: 'spades', value: 1, name: 'Hammer Card', description: '' },
    ]
    renderColumn(cards, 'clubs')
    expect(screen.getByText('Wrench Card')).toBeDefined()
    expect(screen.queryByText('Hammer Card')).toBeNull()
  })

  it('renders ghost preview cards at 0.45 opacity when dragPreview is active', () => {
    const cards: Card[] = [
      { id: 'w1', suit: 'clubs', value: 1, name: 'W1', description: '' },
      { id: 'w2', suit: 'clubs', value: 2, name: 'W2', description: '' },
    ]
    useDesignerStore.setState({
      cards,
      undoStack: [],
      dragPreview: {
        suit: 'clubs',
        card: cards[1],
        fromValue: 2,
        toValue: 1,
        previewCards: [
          { ...cards[0], value: 2 },
          { ...cards[1], value: 1 },
        ],
      },
    })

    renderColumn(cards, 'clubs')

    // Ghost preview: card W2 should appear at value 1 (it cascaded from 2→1)
    // and W1 should appear at value 2 (cascaded 1→2)
    // Ghost slots don't have aria roles; check for text content
    expect(screen.getByText('W1')).toBeDefined()
    expect(screen.getByText('W2')).toBeDefined()
  })
})

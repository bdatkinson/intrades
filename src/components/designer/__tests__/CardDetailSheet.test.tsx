import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CardDetailSheet } from '../CardDetailSheet'
import { useDesignerStore } from '../../../store/designerStore'
import type { Card } from '../../../lib/cards/types'

const sampleCard: Card = {
  id: 'h1',
  suit: 'hammer',
  value: 1,
  name: 'Framing Hammer',
  description: 'Drive nails, pull lumber.',
}

function renderSheet(card: Card | null = sampleCard, onClose = vi.fn()) {
  return render(<CardDetailSheet card={card} onClose={onClose} />)
}

describe('CardDetailSheet', () => {
  beforeEach(() => {
    useDesignerStore.setState({
      cards: [sampleCard],
      undoStack: [],
      redoStack: [],
      dragPreview: null,
    })
  })

  // ─── Sheet visibility ──────────────────────────────────────────

  it('renders nothing when card is null', () => {
    const { container } = renderSheet(null)
    expect(container.innerHTML).toBe('')
  })

  it('renders the sheet when card is provided', () => {
    renderSheet()
    expect(screen.getByText('Framing Hammer')).toBeDefined()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderSheet(sampleCard, onClose)

    const closeBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalled()
  })

  // ─── Tabs ──────────────────────────────────────────────────────

  it('renders all four tabs: Scenario, Localize, Linked, Lineage', () => {
    renderSheet()
    expect(screen.getByRole('tab', { name: /scenario/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /localize/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /linked/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /lineage/i })).toBeDefined()
  })

  it('shows Scenario tab content by default', () => {
    renderSheet()
    expect(screen.getByText('Framing Hammer')).toBeDefined()
    expect(screen.getByText('Drive nails, pull lumber.')).toBeDefined()
  })

  // ─── Footer actions ────────────────────────────────────────────

  it('renders all four footer action buttons', () => {
    renderSheet()
    expect(screen.getByText(/share for remix/i)).toBeDefined()
    expect(screen.getByText(/share as prompt/i)).toBeDefined()
    expect(screen.getByText(/duplicate/i)).toBeDefined()
    expect(screen.getByText(/reset to default/i)).toBeDefined()
  })

  it('Share for Remix button triggers browser download of .intc file', async () => {
    // Mock URL.createObjectURL and link click
    const createObjectURL = vi.fn(() => 'blob:test')
    URL.createObjectURL = createObjectURL
    const clickSpy = vi.fn()
    HTMLAnchorElement.prototype.click = clickSpy

    renderSheet()

    const shareRemixBtn = screen.getByText(/share for remix/i)
    fireEvent.click(shareRemixBtn)

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()

    // Cleanup
    vi.restoreAllMocks()
  })

  it('Share as Prompt button triggers browser download of .md file', async () => {
    const createObjectURL = vi.fn(() => 'blob:test-md')
    URL.createObjectURL = createObjectURL
    const clickSpy = vi.fn()
    HTMLAnchorElement.prototype.click = clickSpy

    renderSheet()

    const sharePromptBtn = screen.getByText(/share as prompt/i)
    fireEvent.click(sharePromptBtn)

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()

    vi.restoreAllMocks()
  })

  it('Duplicate clones the card to the next empty slot in the same suit', () => {
    // Add a second card in the same suit at value 5 to test slot-finding
    useDesignerStore.setState({
      cards: [
        sampleCard, // hammer at value 1
        { id: 'h5', suit: 'hammer', value: 5, name: 'Ball-Peen', description: '' },
      ],
      undoStack: [],
      redoStack: [],
      dragPreview: null,
    })

    renderSheet()
    const dupBtn = screen.getByText(/duplicate/i)
    fireEvent.click(dupBtn)

    const state = useDesignerStore.getState()
    // Should have 3 cards (original 2 + duplicate)
    expect(state.cards).toHaveLength(3)
    // Duplicate should be at the lowest empty value in hammer suit (value 2)
    const dup = state.cards.find(c => c.id !== 'h1' && c.id !== 'h5')
    expect(dup).toBeDefined()
    expect(dup?.suit).toBe('hammer')
    expect(dup?.value).toBe(2) // next empty slot after value 1
  })

  it('Duplicate adds undo action to the stack', () => {
    renderSheet()
    const dupBtn = screen.getByText(/duplicate/i)
    fireEvent.click(dupBtn)

    const state = useDesignerStore.getState()
    expect(state.undoStack.length).toBeGreaterThan(0)
  })

  it('Reset to Default shows confirmation modal', () => {
    renderSheet()
    const resetBtn = screen.getByText(/reset to default/i)
    fireEvent.click(resetBtn)

    // Confirmation modal should appear
    expect(screen.getByText(/are you sure/i)).toBeDefined()
    expect(screen.getByText(/cancel/i)).toBeDefined()
    expect(screen.getByText(/confirm/i)).toBeDefined()
  })

  it('Reset to Default — cancel dismisses without changing card', () => {
    const onClose = vi.fn()
    renderSheet(sampleCard, onClose)

    const resetBtn = screen.getByText(/reset to default/i)
    fireEvent.click(resetBtn)

    // Click cancel
    const cancelBtn = screen.getByText(/cancel/i)
    fireEvent.click(cancelBtn)

    // Card should be unchanged
    const state = useDesignerStore.getState()
    const card = state.cards.find(c => c.id === 'h1')
    expect(card?.name).toBe('Framing Hammer')
  })

  it('Reset to Default — confirm reverts card to seed state', () => {
    // Modify the card first
    useDesignerStore.setState({
      cards: [{ ...sampleCard, name: 'Modified Name', description: 'Modified desc' }],
      undoStack: [],
      redoStack: [],
      dragPreview: null,
    })

    renderSheet()
    const resetBtn = screen.getByText(/reset to default/i)
    fireEvent.click(resetBtn)

    // Click confirm
    const confirmBtn = screen.getByText(/confirm/i)
    fireEvent.click(confirmBtn)

    // Card should be reverted to seed default
    const state = useDesignerStore.getState()
    const card = state.cards.find(c => c.id === 'h1')
    expect(card?.name).toBe('Framing Hammer')
    // Seed description for hammer/1
    expect(card?.description).toBe('Drive nails, pull lumber — the framing hammer is the backbone of rough carpentry.')
  })

  it('Reset to Default adds undo action', () => {
    useDesignerStore.setState({
      cards: [{ ...sampleCard, name: 'Modified Name' }],
      undoStack: [],
      redoStack: [],
      dragPreview: null,
    })

    renderSheet()
    const resetBtn = screen.getByText(/reset to default/i)
    fireEvent.click(resetBtn)

    const confirmBtn = screen.getByText(/confirm/i)
    fireEvent.click(confirmBtn)

    const state = useDesignerStore.getState()
    // Reset should push an undo snapshot
    expect(state.undoStack.length).toBeGreaterThan(0)
  })
})

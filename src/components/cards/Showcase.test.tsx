import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Showcase } from './Showcase'
import type { Card } from '../../lib/cards/types'

const PREVIEW_KEY = 'intrades-preview-cards'

function buildCards(): Card[] {
  return [
    { id: 'h1', suit: 'spades', value: 1, name: 'Framing Hammer', description: 'Drive nails, pull lumber.' },
    { id: 'h5', suit: 'spades', value: 5, name: 'Ball-Peen Hammer', description: 'Shape metal, set rivets.' },
    { id: 'w2', suit: 'clubs', value: 2, name: 'Pipe Wrench', description: 'Serrated jaw grip.' },
    { id: 'w6', suit: 'clubs', value: 6, name: 'Torque Wrench', description: 'Calibrated click.' },
    { id: 'v3', suit: 'diamonds', value: 3, name: 'Digital Multimeter', description: 'Measure voltage, current.' },
    { id: 'p4', suit: 'hearts', value: 4, name: 'Brass Plumb Bob', description: 'Gravity never lies.' },
  ]
}

describe('Showcase', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  function renderShowcase() {
    return render(
      <MemoryRouter>
        <Showcase />
      </MemoryRouter>,
    )
  }

  it('renders the Showcase heading', () => {
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()
    expect(screen.getByRole('heading', { name: /student preview/i })).toBeInTheDocument()
  })

  it('renders suit filter tabs for All, Spades, Clubs, Diamonds, Hearts', () => {
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    const tabBar = screen.getByRole('tablist')
    expect(tabBar).toBeInTheDocument()

    const tabs = within(tabBar).getAllByRole('tab')
    expect(tabs).toHaveLength(5)

    const tabNames = tabs.map((t) => t.textContent || '')
    expect(tabNames.some((t) => t.toLowerCase().includes('all'))).toBeTruthy()
    expect(tabNames.some((t) => t.toLowerCase().includes('spades'))).toBeTruthy()
    expect(tabNames.some((t) => t.toLowerCase().includes('clubs'))).toBeTruthy()
    expect(tabNames.some((t) => t.toLowerCase().includes('diamonds'))).toBeTruthy()
    expect(tabNames.some((t) => t.toLowerCase().includes('hearts'))).toBeTruthy()
  })

  it('shows all cards when All tab is selected (default)', () => {
    const cards = buildCards()
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(cards))
    renderShowcase()

    const cardElements = screen.getAllByRole('listitem')
    expect(cardElements).toHaveLength(cards.length)
  })

  it('filters to spades cards when spades tab is selected', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    const spadesTab = screen.getByRole('tab', { name: /spades/i })
    await user.click(spadesTab)

    const cardElements = screen.getAllByRole('listitem')
    expect(cardElements).toHaveLength(2) // h1 + h5
    for (const card of cardElements) {
      expect(card.getAttribute('data-suit')).toBe('spades')
    }
  })

  it('filters to clubs cards when clubs tab is selected', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    const clubsTab = screen.getByRole('tab', { name: /clubs/i })
    await user.click(clubsTab)

    const cardElements = screen.getAllByRole('listitem')
    expect(cardElements).toHaveLength(2) // w2 + w6
    for (const card of cardElements) {
      expect(card.getAttribute('data-suit')).toBe('clubs')
    }
  })

  it('shows "← Back to Designer" link when in preview mode', () => {
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    const backLink = screen.getByRole('link', { name: /back to designer/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink.getAttribute('href')).toBe('/designer')
  })

  it('does NOT show "Back to Designer" when no preview data (seed fallback)', () => {
    // No sessionStorage set — falls back to seed
    renderShowcase()

    const backLink = screen.queryByRole('link', { name: /back to designer/i })
    expect(backLink).toBeNull()
  })

  it('shows card count badges on suit tabs', () => {
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    // All tab should show 6 (total from buildCards)
    const allTab = screen.getByRole('tab', { name: /all/i })
    expect(allTab.textContent).toContain('6')

    // Each suit tab shows its count: 2 spades, 2 clubs, 1 diamonds, 1 hearts
    expect(screen.getByRole('tab', { name: /spades/i }).textContent).toContain('2')
    expect(screen.getByRole('tab', { name: /clubs/i }).textContent).toContain('2')
    expect(screen.getByRole('tab', { name: /diamonds/i }).textContent).toContain('1')
    expect(screen.getByRole('tab', { name: /hearts/i }).textContent).toContain('1')
  })

  it('updates aria-selected when switching tabs', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    const allTab = screen.getByRole('tab', { name: /all/i })
    expect(allTab.getAttribute('aria-selected')).toBe('true')

    const spadesTab = screen.getByRole('tab', { name: /spades/i })
    await user.click(spadesTab)
    expect(spadesTab.getAttribute('aria-selected')).toBe('true')
    expect(allTab.getAttribute('aria-selected')).toBe('false')
  })

  it('renders card names and descriptions in the grid', () => {
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    expect(screen.getByText('Framing Hammer')).toBeInTheDocument()
    expect(screen.getByText('Drive nails, pull lumber.')).toBeInTheDocument()
    expect(screen.getByText('Pipe Wrench')).toBeInTheDocument()
    expect(screen.getByText('Digital Multimeter')).toBeInTheDocument()
  })

  it('uses OSHA/machine-label styling — no shadows, no gradients', () => {
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    const container = document.querySelector('[data-testid="showcase-container"]')
    expect(container).not.toBeNull()
    const classList = container?.className ?? ''
    expect(classList).not.toContain('shadow')
    expect(classList).not.toContain('gradient')
    expect(classList).not.toContain('glass')
  })

  it('falls back to seed cards when sessionStorage is empty', () => {
    renderShowcase()

    // Seed cards should render — should have at least some cards
    const cardElements = screen.getAllByRole('listitem')
    expect(cardElements.length).toBeGreaterThan(0)
  })

  it('clears preview key from sessionStorage after reading', () => {
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    // After mount, the key should be removed so refresh falls back to seed
    expect(sessionStorage.getItem(PREVIEW_KEY)).toBeNull()
  })

  it('renders empty state when suit has no cards', async () => {
    const user = userEvent.setup()
    // Only wrench cards
    const wrenchOnly: Card[] = [
      { id: 'w2', suit: 'clubs', value: 2, name: 'Pipe Wrench', description: 'Serrated jaw.' },
    ]
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(wrenchOnly))
    renderShowcase()

    // Click spades tab — should show no cards
    const spadesTab = screen.getByRole('tab', { name: /spades/i })
    await user.click(spadesTab)

    expect(screen.getByText(/no cards/i)).toBeInTheDocument()
  })
})

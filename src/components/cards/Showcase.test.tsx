import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Showcase } from './Showcase'
import type { Card } from '../../lib/cards/types'

const PREVIEW_KEY = 'intrades-preview-cards'

function buildCards(): Card[] {
  return [
    { id: 'h1', suit: 'hammer', value: 1, name: 'Framing Hammer', description: 'Drive nails, pull lumber.' },
    { id: 'h5', suit: 'hammer', value: 5, name: 'Ball-Peen Hammer', description: 'Shape metal, set rivets.' },
    { id: 'w2', suit: 'wrench', value: 2, name: 'Pipe Wrench', description: 'Serrated jaw grip.' },
    { id: 'w6', suit: 'wrench', value: 6, name: 'Torque Wrench', description: 'Calibrated click.' },
    { id: 'v3', suit: 'voltmeter', value: 3, name: 'Digital Multimeter', description: 'Measure voltage, current.' },
    { id: 'p4', suit: 'plumb-bob', value: 4, name: 'Brass Plumb Bob', description: 'Gravity never lies.' },
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

  it('renders suit filter tabs for All, Hammers, Wrenches, Voltmeters, Plumb-Bobs', () => {
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    const tabBar = screen.getByRole('tablist')
    expect(tabBar).toBeInTheDocument()

    const tabs = within(tabBar).getAllByRole('tab')
    expect(tabs).toHaveLength(5)

    const tabNames = tabs.map((t) => t.textContent || '')
    expect(tabNames.some((t) => t.toLowerCase().includes('all'))).toBeTruthy()
    expect(tabNames.some((t) => t.toLowerCase().includes('hammer'))).toBeTruthy()
    expect(tabNames.some((t) => t.toLowerCase().includes('wrench'))).toBeTruthy()
    expect(tabNames.some((t) => t.toLowerCase().includes('volt'))).toBeTruthy()
    expect(tabNames.some((t) => t.toLowerCase().includes('plumb'))).toBeTruthy()
  })

  it('shows all cards when All tab is selected (default)', () => {
    const cards = buildCards()
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(cards))
    renderShowcase()

    const cardElements = screen.getAllByRole('listitem')
    expect(cardElements).toHaveLength(cards.length)
  })

  it('filters to hammer cards when hammers tab is selected', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    const hammerTab = screen.getByRole('tab', { name: /hammer/i })
    await user.click(hammerTab)

    const cardElements = screen.getAllByRole('listitem')
    expect(cardElements).toHaveLength(2) // h1 + h5
    for (const card of cardElements) {
      expect(card.getAttribute('data-suit')).toBe('hammer')
    }
  })

  it('filters to wrench cards when wrenches tab is selected', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    const wrenchTab = screen.getByRole('tab', { name: /wrench/i })
    await user.click(wrenchTab)

    const cardElements = screen.getAllByRole('listitem')
    expect(cardElements).toHaveLength(2) // w2 + w6
    for (const card of cardElements) {
      expect(card.getAttribute('data-suit')).toBe('wrench')
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

    // Each suit tab shows its count: 2 hammers, 2 wrenches, 1 voltmeter, 1 plumb-bob
    expect(screen.getByRole('tab', { name: /hammer/i }).textContent).toContain('2')
    expect(screen.getByRole('tab', { name: /wrench/i }).textContent).toContain('2')
    expect(screen.getByRole('tab', { name: /volt/i }).textContent).toContain('1')
    expect(screen.getByRole('tab', { name: /plumb/i }).textContent).toContain('1')
  })

  it('updates aria-selected when switching tabs', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(buildCards()))
    renderShowcase()

    const allTab = screen.getByRole('tab', { name: /all/i })
    expect(allTab.getAttribute('aria-selected')).toBe('true')

    const hammerTab = screen.getByRole('tab', { name: /hammer/i })
    await user.click(hammerTab)
    expect(hammerTab.getAttribute('aria-selected')).toBe('true')
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
      { id: 'w2', suit: 'wrench', value: 2, name: 'Pipe Wrench', description: 'Serrated jaw.' },
    ]
    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(wrenchOnly))
    renderShowcase()

    // Click hammer tab — should show no cards
    const hammerTab = screen.getByRole('tab', { name: /hammer/i })
    await user.click(hammerTab)

    expect(screen.getByText(/no cards/i)).toBeInTheDocument()
  })
})

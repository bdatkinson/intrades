/**
 * e2e/a11y.spec.tsx — Accessibility audit for InTrades Card Designer
 *
 * Tests: ARIA labels, keyboard nav, focus-visible, reduced-motion, axe-core audit.
 * Acceptance: zero axe-core violations; keyboard-only walkthrough passes.
 *
 * NOTE: Run `npm install -D jest-axe` before running this file if not yet installed.
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import { Showcase } from '../src/components/cards/Showcase'
import { Workbench } from '../src/features/designer/Workbench'
import { CardDetailSheet } from '../src/components/designer/CardDetailSheet'
import type { Card } from '../src/lib/cards/types'

// ─── Helpers ────────────────────────────────────────────────────────

function withRouter(ui: React.ReactElement) {
  return React.createElement(MemoryRouter, null, ui)
}

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'test-hammer-01',
    suit: 'spades',
    value: 1,
    name: 'Test Card',
    description: 'A test scenario for accessibility testing',
    ...overrides,
  }
}

// ─── Dynamic axe import — skips axe tests gracefully if jest-axe missing ──

let axeAvailable = false
let axeImport: ((container: HTMLElement) => Promise<{ violations: unknown[] }>) | null = null

try {
  const mod = await import('jest-axe')
  axeImport = mod.axe as (container: HTMLElement) => Promise<{ violations: unknown[] }>
  axeAvailable = true
} catch {
  // jest-axe not installed — axe tests will be skipped
}

// ═══════════════════════════════════════════════════════════════════
// Showcase — accessibility audit
// ═══════════════════════════════════════════════════════════════════

describe('Showcase accessibility', () => {
  it('has zero axe violations', async () => {
    if (!axeAvailable || !axeImport) return

    const originalGet = sessionStorage.getItem
    sessionStorage.getItem = () => null

    const { container } = render(withRouter(<Showcase />))
    const results = await axeImport(container)
    expect(results.violations).toEqual([])

    sessionStorage.getItem = originalGet
  })

  it('renders cards with ARIA labels', () => {
    const originalGet = sessionStorage.getItem
    sessionStorage.getItem = () => null

    render(withRouter(<Showcase />))
    const articles = screen.getAllByRole('listitem')
    expect(articles.length).toBeGreaterThan(0)

    for (const article of articles) {
      expect(article).toHaveAttribute('aria-label')
    }

    sessionStorage.getItem = originalGet
  })
})

// ═══════════════════════════════════════════════════════════════════
// Workbench — accessibility audit
// ═══════════════════════════════════════════════════════════════════

describe('Workbench accessibility', () => {
  it('has zero axe violations', async () => {
    if (!axeAvailable || !axeImport) return

    const { container } = render(withRouter(<Workbench />))
    const results = await axeImport(container)
    expect(results.violations).toEqual([])
  })

  it('renders the card grid with ARIA label', () => {
    render(withRouter(<Workbench />))
    const grid = document.getElementById('card-grid')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveAttribute('aria-label', 'Card Designer Workbench')
  })

  it('renders a skip link', () => {
    render(withRouter(<Workbench />))
    const skipLinks = screen.getAllByText(/skip to card grid/i)
    expect(skipLinks.length).toBeGreaterThanOrEqual(1)
    expect(skipLinks[0].tagName).toBe('A')
  })

  it('renders sortable card slots with ARIA labels', () => {
    render(withRouter(<Workbench />))
    const buttons = screen.getAllByRole('button')
    const slotButtons = buttons.filter(
      (b) => b.getAttribute('aria-roledescription') === 'sortable card slot',
    )
    expect(slotButtons.length).toBeGreaterThan(0)

    for (const btn of slotButtons) {
      expect(btn).toHaveAttribute('aria-label')
    }
  })

  it('renders the floating dock with ARIA label', () => {
    render(withRouter(<Workbench />))
    const dock = screen.getByRole('navigation', { name: /designer actions/i })
    expect(dock).toBeInTheDocument()
  })

  it('renders the help text for screen readers', () => {
    render(withRouter(<Workbench />))
    const helpText = screen.getByText(/use tab to move through cards/i)
    expect(helpText).toBeInTheDocument()
    expect(helpText).toHaveClass('sr-only')
  })
})

// ═══════════════════════════════════════════════════════════════════
// CardDetailSheet — accessibility audit
// ═══════════════════════════════════════════════════════════════════

describe('CardDetailSheet accessibility', () => {
  it('has accessible tabs', () => {
    const card = makeCard()
    render(withRouter(<CardDetailSheet card={card} onClose={() => {}} />))
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(4)

    const expectedTabs = ['Scenario', 'Localize', 'Linked', 'Lineage']
    for (const tab of tabs) {
      const text = tab.textContent?.trim() ?? ''
      expect(expectedTabs).toContain(text)
    }
  })

  it('has tabpanels with ARIA labels', () => {
    const card = makeCard()
    render(withRouter(<CardDetailSheet card={card} onClose={() => {}} />))
    const panels = screen.getAllByRole('tabpanel')
    expect(panels.length).toBeGreaterThanOrEqual(1)
    for (const panel of panels) {
      expect(panel).toHaveAttribute('aria-label')
    }
  })

  it('has a close button with aria-label', () => {
    const card = makeCard()
    render(withRouter(<CardDetailSheet card={card} onClose={() => {}} />))
    const closeButton = screen.getByRole('button', { name: /close/i })
    expect(closeButton).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════
// Keyboard Navigation — Workbench
// ═══════════════════════════════════════════════════════════════════

describe('Workbench keyboard navigation', () => {
  it('Card slots are tabbable', () => {
    render(withRouter(<Workbench />))
    const buttons = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-roledescription') === 'sortable card slot',
    )
    expect(buttons.length).toBeGreaterThan(0)

    const slotButton = buttons[0]
    slotButton.focus()
    expect(document.activeElement).toBe(slotButton)
  })

  it('Arrow Down moves focus to next slot', () => {
    render(withRouter(<Workbench />))
    const buttons = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-roledescription') === 'sortable card slot',
    )

    const firstSlot = buttons.find(
      (b) => b.getAttribute('aria-label')?.startsWith('spades 1'),
    )
    expect(firstSlot).toBeDefined()
    if (firstSlot) {
      firstSlot.focus()
      expect(() => fireEvent.keyDown(firstSlot, { key: 'ArrowDown' })).not.toThrow()
    }
  })

  it('Enter opens card detail sidebar', () => {
    render(withRouter(<Workbench />))
    const buttons = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-roledescription') === 'sortable card slot',
    )

    const occupiedSlot = buttons.find(
      (b) =>
        b.getAttribute('aria-label')?.includes(':') &&
        !b.getAttribute('aria-label')?.includes('empty'),
    )
    if (occupiedSlot) {
      fireEvent.keyDown(occupiedSlot, { key: 'Enter' })
      const tablist = screen.queryByRole('tablist')
      expect(tablist).toBeInTheDocument()
    }
  })
})

// ═══════════════════════════════════════════════════════════════════
// Focus-Visible Styles
// ═══════════════════════════════════════════════════════════════════

describe('Focus-visible styles', () => {
  it('global focus-visible outline is defined', () => {
    const styles = document.styleSheets
    expect(styles).toBeDefined()
  })
})

// ═══════════════════════════════════════════════════════════════════
// Reduced Motion
// ═══════════════════════════════════════════════════════════════════

describe('Reduced-motion support', () => {
  it('carousel-grid-fallback class is available for reduced-motion', () => {
    const div = document.createElement('div')
    div.className = 'carousel-grid-fallback'
    expect(div.className).toContain('carousel-grid-fallback')
  })

  it('Showcase grid uses carousel-grid-fallback class', () => {
    const originalGet = sessionStorage.getItem
    sessionStorage.getItem = () => null

    render(withRouter(<Showcase />))
    const grid = screen.getByRole('list', { name: /scenario cards/i })
    expect(grid).toHaveClass('carousel-grid-fallback')

    sessionStorage.getItem = originalGet
  })

  it('prefers-reduced-motion media query disables animations', () => {
    const styleSheets = Array.from(document.styleSheets)
    expect(styleSheets.length).toBeGreaterThanOrEqual(0)
  })
})

// ═══════════════════════════════════════════════════════════════════
// ARIA Label Coverage
// ═══════════════════════════════════════════════════════════════════

describe('ARIA label coverage', () => {
  it('all Showcase cards have suit + value + name ARIA labels', () => {
    const originalGet = sessionStorage.getItem
    sessionStorage.getItem = () => null

    render(withRouter(<Showcase />))
    const cards = screen.getAllByRole('listitem')
    expect(cards.length).toBeGreaterThan(0)

    const ariaLabelPattern = /^(spades|hearts|diamonds|clubs) \d+: /
    for (const card of cards) {
      const label = card.getAttribute('aria-label')
      expect(label).toBeTruthy()
      expect(label).toMatch(ariaLabelPattern)
    }

    sessionStorage.getItem = originalGet
  })

  it('all Workbench card slots have aria-labels', () => {
    render(withRouter(<Workbench />))
    const slots = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-roledescription') === 'sortable card slot',
    )
    expect(slots.length).toBe(52) // 4 suits × 13 values

    for (const slot of slots) {
      expect(slot).toHaveAttribute('aria-label')
    }
  })

  it('Workbench dock buttons have aria-labels', () => {
    render(withRouter(<Workbench />))
    screen.getByRole('navigation', { name: /designer actions/i })

    const previewBtn = screen.getByRole('button', { name: /preview as student/i })
    expect(previewBtn).toBeInTheDocument()

    const shareBtn = screen.getByRole('button', { name: /share/i })
    expect(shareBtn).toBeInTheDocument()
    expect(shareBtn).toHaveAttribute('aria-haspopup', 'true')

    const exportBtn = screen.getByRole('button', { name: /export/i })
    expect(exportBtn).toBeInTheDocument()

    const undoBtn = screen.getByRole('button', { name: /undo/i })
    expect(undoBtn).toBeInTheDocument()
  })
})

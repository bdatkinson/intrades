import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkeletonCard, SkeletonText, SkeletonCircle } from '../SkeletonCard'

describe('SkeletonCard', () => {
  it('renders with default card shape', () => {
    const { container } = render(<SkeletonCard />)
    const el = container.firstElementChild!
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders a pulsing animation class', () => {
    const { container } = render(<SkeletonCard />)
    const el = container.firstElementChild!
    expect(el.className).toMatch(/animate-pulse/)
  })

  it('accepts a custom className', () => {
    const { container } = render(<SkeletonCard className="my-custom" />)
    const el = container.firstElementChild!
    expect(el.className).toMatch(/my-custom/)
  })

  it('renders a card-shaped skeleton (rounded-lg, border)', () => {
    const { container } = render(<SkeletonCard />)
    const el = container.firstElementChild!
    expect(el.className).toMatch(/rounded-lg/)
  })

  it('renders at full width by default', () => {
    const { container } = render(<SkeletonCard />)
    const el = container.firstElementChild!
    expect(el.className).toMatch(/w-full/)
  })

  it('has a minimum height so cards look card-like', () => {
    const { container } = render(<SkeletonCard />)
    const el = container.firstElementChild!
    // card should be tall enough to resemble a mentor card
    const height = el.classList.toString()
    // we expect it to have some height-related class
    expect(el.className).toMatch(/min-h-|h-|py-|p-/)
  })

  it('has a data-testid for selection', () => {
    render(<SkeletonCard data-testid="my-skeleton" />)
    expect(screen.getByTestId('my-skeleton')).toBeInTheDocument()
  })
})

describe('SkeletonText', () => {
  it('renders as an inline-block text skeleton', () => {
    const { container } = render(<SkeletonText />)
    const el = container.firstElementChild!
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el.className).toMatch(/animate-pulse/)
  })

  it('renders with different width classes via lines prop', () => {
    const { container } = render(<SkeletonText lines={3} />)
    // Should render multiple skeleton lines
    const lines = container.querySelectorAll('[aria-hidden="true"]')
    expect(lines.length).toBeGreaterThanOrEqual(3)
  })

  it('each line has a rounded-full look', () => {
    const { container } = render(<SkeletonText lines={1} />)
    const el = container.firstElementChild!
    expect(el.className).toMatch(/rounded/)
  })
})

describe('SkeletonCircle', () => {
  it('renders a circular skeleton', () => {
    const { container } = render(<SkeletonCircle />)
    const el = container.firstElementChild!
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el.className).toMatch(/rounded-full/)
  })

  it('accepts a size prop', () => {
    const { container } = render(<SkeletonCircle size="lg" />)
    const el = container.firstElementChild!
    // Should have a size-related class
    expect(el.className).toMatch(/h-|w-/)
  })
})

describe('SkeletonCard count prop', () => {
  it('renders multiple skeleton cards when count > 1', () => {
    render(
      <div data-testid="grid">
        <SkeletonCard count={3} />
      </div>,
    )
    const grid = screen.getByTestId('grid')
    const cards = grid.querySelectorAll('[aria-hidden="true"]')
    expect(cards.length).toBe(3)
  })

  it('renders a single card when count is 1', () => {
    render(
      <div data-testid="grid">
        <SkeletonCard count={1} />
      </div>,
    )
    const grid = screen.getByTestId('grid')
    const cards = grid.querySelectorAll('[aria-hidden="true"]')
    expect(cards.length).toBe(1)
  })

  it('renders count=12 for a full grid loading state', () => {
    render(
      <div data-testid="grid">
        <SkeletonCard count={12} />
      </div>,
    )
    const grid = screen.getByTestId('grid')
    const cards = grid.querySelectorAll('[aria-hidden="true"]')
    expect(cards.length).toBe(12)
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MentorGrid from '../MentorGrid'

function renderGrid() {
  return render(
    <MemoryRouter>
      <MentorGrid />
    </MemoryRouter>,
  )
}

describe('MentorGrid', () => {
  // ── Header ──

  it('renders the page title', () => {
    renderGrid()
    expect(screen.getByRole('heading', { name: /mentor deck/i })).toBeInTheDocument()
  })

  // ── Filter tabs ──

  it('renders filter tabs for All + each suit', () => {
    renderGrid()
    const tablist = screen.getByRole('tablist')
    const tabs = within(tablist).getAllByRole('tab')
    expect(tabs).toHaveLength(5) // All + 4 suits
    expect(within(tablist).getByRole('tab', { name: /all/i })).toBeInTheDocument()
    expect(within(tablist).getByRole('tab', { name: /spades/i })).toBeInTheDocument()
    expect(within(tablist).getByRole('tab', { name: /hearts/i })).toBeInTheDocument()
    expect(within(tablist).getByRole('tab', { name: /diamonds/i })).toBeInTheDocument()
    expect(within(tablist).getByRole('tab', { name: /clubs/i })).toBeInTheDocument()
  })

  it('shows All as active by default', () => {
    renderGrid()
    const allTab = screen.getByRole('tab', { name: /all/i })
    expect(allTab).toHaveAttribute('aria-selected', 'true')
  })

  it('activates a suit tab on click and shows only that suit', async () => {
    const user = userEvent.setup()
    renderGrid()
    const spadesTab = screen.getByRole('tab', { name: /spades/i })
    await user.click(spadesTab)
    expect(spadesTab).toHaveAttribute('aria-selected', 'true')

    // Only spades mentors should be visible (3: Iron, Elena, Jax)
    const cards = screen.getAllByTestId(/^mentor-card-(?!start)/)
    expect(cards).toHaveLength(3)
  })

  // ── Search ──

  it('renders a search input', () => {
    renderGrid()
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('filters mentors by name', async () => {
    const user = userEvent.setup()
    renderGrid()
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'Iron')

    // Should show only Iron Thorne
    const cards = screen.getAllByTestId(/^mentor-card-(?!start)/)
    expect(cards).toHaveLength(1)
    expect(screen.getByText(/Jon "Iron" Thorne/)).toBeInTheDocument()
  })

  it('filters mentors by trade', async () => {
    const user = userEvent.setup()
    renderGrid()
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'Plumber')

    // Should show Sal Rossi (Master Plumber)
    const cards = screen.getAllByTestId(/^mentor-card-(?!start)/)
    expect(cards).toHaveLength(1)
    expect(screen.getByText(/Sal/i)).toBeInTheDocument()
  })

  it('searches case-insensitively', async () => {
    const user = userEvent.setup()
    renderGrid()
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'elena')

    expect(screen.getByText('Elena Rodriguez')).toBeInTheDocument()
  })

  it('shows empty state when search has no matches', async () => {
    const user = userEvent.setup()
    renderGrid()
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'xyzzy_no_match')

    expect(screen.getByText(/no mentors found/i)).toBeInTheDocument()
    expect(screen.queryByTestId(/^mentor-card-(?!start)/)).not.toBeInTheDocument()
  })

  // ── Suit sections ──

  it('renders suit section headers when viewing all mentors', () => {
    renderGrid()
    // Should have 4 section headers, one per suit
    const headings = screen.getAllByRole('heading', { level: 2 })
    // At least the 4 suit headings
    const suitHeadings = headings.filter((h) =>
      ['Tools & Technology', 'Interpersonal & Customer Service', 'Business Acumen', 'Safety, Compliance & Risk Management'].some(
        (name) => h.textContent?.includes(name),
      ),
    )
    expect(suitHeadings).toHaveLength(4)
  })

  it('shows all 12 mentor cards when All tab is active', () => {
    renderGrid()
    const cards = screen.getAllByTestId(/^mentor-card-(?!start)/)
    expect(cards).toHaveLength(12)
  })

  // ── Responsive grid ──

  it('has responsive grid classes', () => {
    renderGrid()
    const sections = screen.getAllByTestId('suit-section-grid')
    expect(sections.length).toBeGreaterThan(0)
    // Each grid should have responsive classes
    sections.forEach((grid) => {
      expect(grid.className).toMatch(/grid-cols-1/)
      expect(grid.className).toMatch(/sm:grid-cols-2/)
      expect(grid.className).toMatch(/md:grid-cols-3/)
    })
  })

  // ── Combining filter + search ──

  it('combines suit filter with search', async () => {
    const user = userEvent.setup()
    renderGrid()

    // Filter to spades first
    await user.click(screen.getByRole('tab', { name: /spades/i }))
    // Then search within spades
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'Welding')

    const cards = screen.getAllByTestId(/^mentor-card-(?!start)/)
    expect(cards).toHaveLength(1)
    expect(screen.getByText(/Iron/)).toBeInTheDocument()
  })
})

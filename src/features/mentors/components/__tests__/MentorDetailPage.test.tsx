import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import MentorDetailPage from '../MentorDetailPage'

// ─── Mock react-router-dom's useNavigate ─────────────────────────
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// ─── Helpers ─────────────────────────────────────────────────────

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/mentors/:id" element={<MentorDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

// ─── Tests ───────────────────────────────────────────────────────

describe('MentorDetailPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders the mentor name as heading', () => {
    renderAt('/mentors/iron-thorne')
    expect(
      screen.getByRole('heading', { name: /jon.*iron.*thorne/i }),
    ).toBeInTheDocument()
  })

  it('renders the mentor trade', () => {
    renderAt('/mentors/iron-thorne')
    expect(
      screen.getByText(/structural steel & welding/i),
    ).toBeInTheDocument()
  })

  it('renders the city and state', () => {
    renderAt('/mentors/iron-thorne')
    expect(screen.getByText(/pittsburgh, pa/i)).toBeInTheDocument()
  })

  it('renders the mentor background story', () => {
    renderAt('/mentors/iron-thorne')
    // Background should include key phrase
    expect(
      screen.getByText(/built a fabrication empire/i),
    ).toBeInTheDocument()
  })

  it('renders the personality description', () => {
    renderAt('/mentors/iron-thorne')
    expect(
      screen.getByText(/zero tolerance for excuses/i),
    ).toBeInTheDocument()
  })

  it('renders the "Why" quote', () => {
    renderAt('/mentors/sal-rossi')
    expect(
      screen.getByText(/we protect the health of the nation/i),
    ).toBeInTheDocument()
  })

  it('renders face card indicator (KING/QUEEN/JACK)', () => {
    renderAt('/mentors/iron-thorne')
    expect(screen.getByText('KING')).toBeInTheDocument()
  })

  it('renders suit symbol', () => {
    renderAt('/mentors/iron-thorne')
    // Spades symbol
    expect(screen.getByText('♠️')).toBeInTheDocument()
  })

  it('renders personality vibe badge', () => {
    renderAt('/mentors/iron-thorne')
    expect(screen.getByText(/gruff & intimidating/i)).toBeInTheDocument()
  })

  it('renders "Back to Mentors" link', () => {
    renderAt('/mentors/iron-thorne')
    expect(
      screen.getByRole('link', { name: /back to mentors/i }),
    ).toBeInTheDocument()
  })

  it('renders "Start Chat" button', () => {
    renderAt('/mentors/iron-thorne')
    expect(
      screen.getByRole('button', { name: /start chat/i }),
    ).toBeInTheDocument()
  })

  it('navigates to chat page when "Start Chat" is clicked', async () => {
    const user = userEvent.setup()
    renderAt('/mentors/iron-thorne')
    await user.click(screen.getByRole('button', { name: /start chat/i }))
    expect(mockNavigate).toHaveBeenCalledWith(
      '/mentors/iron-thorne/chat',
    )
  })

  it('shows not-found message for invalid mentor id', () => {
    renderAt('/mentors/nonexistent-mentor')
    expect(
      screen.getByText(/mentor not found/i),
    ).toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MentorCard from '../MentorCard'
import type { MentorPersona } from '../../types'
import { SUIT_DOMAINS } from '../../data/personas'

// ─── Mock useNavigate ────────────────────────────────────────────

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// ─── Helpers ─────────────────────────────────────────────────────

function renderCard(persona: MentorPersona) {
  return render(
    <MemoryRouter>
      <MentorCard persona={persona} />
    </MemoryRouter>,
  )
}

// Minimal fixture matching MentorPersona type
const ironThorne: MentorPersona = {
  id: 'iron-thorne',
  name: 'Jon "Iron" Thorne',
  nickname: 'Iron',
  card: { suit: 'spades', face: 'king' },
  city: 'Pittsburgh',
  state: 'PA',
  trade: 'Structural Steel & Welding',
  background: 'Long background story here...',
  personalityVibe: 'Gruff & Intimidating',
  personalityDescription: 'Iron Thorne speaks rarely...',
  whyQuote: 'It\'s about permanence.',
  systemPrompt: 'You are Jon "Iron" Thorne...',
  suitDomain: SUIT_DOMAINS.spades,
}

const mateoFlores: MentorPersona = {
  id: 'mateo-flores',
  name: 'Mateo Flores',
  card: { suit: 'hearts', face: 'jack' },
  city: 'Phoenix',
  state: 'AZ',
  trade: 'HVAC Service Tech',
  background: 'Mateo Flores is the guy...',
  personalityVibe: 'Resourceful & Charming',
  personalityDescription: 'Mateo is an optimist...',
  whyQuote: 'It\'s a puzzle.',
  systemPrompt: 'You are Mateo Flores...',
  suitDomain: SUIT_DOMAINS.hearts,
}

describe('MentorCard', () => {
  // ── Static content ──

  it('renders the face indicator (KING/QUEEN/JACK) with suit symbol', () => {
    renderCard(ironThorne)
    // Face rank + suit symbol
    const faceEl = screen.getByText(/king/i)
    expect(faceEl).toBeInTheDocument()
    // Suit symbol should be visible
    expect(screen.getByText('♠️')).toBeInTheDocument()
  })

  it('renders the mentor name in font-mono', () => {
    renderCard(ironThorne)
    const name = screen.getByText(/Jon "Iron" Thorne/)
    expect(name).toBeInTheDocument()
    expect(name.className).toContain('font-mono')
  })

  it('renders the trade', () => {
    renderCard(ironThorne)
    expect(screen.getByText('Structural Steel & Welding')).toBeInTheDocument()
  })

  it('renders city and state', () => {
    renderCard(ironThorne)
    expect(screen.getByText(/Pittsburgh, PA/)).toBeInTheDocument()
  })

  it('renders the personality badge (personalityVibe)', () => {
    renderCard(ironThorne)
    expect(screen.getByText('Gruff & Intimidating')).toBeInTheDocument()
  })

  it('renders the Why quote', () => {
    renderCard(ironThorne)
    expect(screen.getByText(/It's about permanence/)).toBeInTheDocument()
  })

  // ── Color accents per suit ──

  it('applies slate accent for spades suit', () => {
    renderCard(ironThorne)
    const card = screen.getByTestId('mentor-card-iron-thorne')
    expect(card.className).toContain('border-slate')
  })

  it('applies rose accent for hearts suit', () => {
    renderCard(mateoFlores)
    const card = screen.getByTestId('mentor-card-mateo-flores')
    expect(card.className).toContain('border-rose')
  })

  // ── Face indicator variation ──

  it('shows JACK for jack face', () => {
    renderCard(mateoFlores)
    expect(screen.getByText(/JACK/)).toBeInTheDocument()
  })

  // ── Hover behavior: Start Dialogue ──

  it('hides Start Dialogue by default', () => {
    renderCard(ironThorne)
    const button = screen.getByTestId('mentor-card-start-dialogue')
    // Should be present in DOM but visually hidden (opacity-0 or invisible)
    expect(button).toBeInTheDocument()
    expect(button.className).toContain('opacity-0')
  })

  it('reveals Start Dialogue on hover', async () => {
    const user = userEvent.setup()
    renderCard(ironThorne)
    const card = screen.getByTestId('mentor-card-iron-thorne')
    await user.hover(card)
    const button = screen.getByTestId('mentor-card-start-dialogue')
    // After hover, the group-hover class should make it visible
    // We can't easily test computed styles from group-hover in jsdom,
    // but we can verify the element has the group-hover class
    expect(button.className).toContain('group-hover:opacity-100')
  })

  // ── Different suit/face combinations ──

  it('displays correct face for queen rank', () => {
    const elena: MentorPersona = {
      ...ironThorne,
      id: 'elena-test',
      name: 'Elena Rodriguez',
      card: { suit: 'spades', face: 'queen' },
    }
    renderCard(elena)
    expect(screen.getByText(/QUEEN/)).toBeInTheDocument()
  })

  it('renders the card as a clickable element with button role', () => {
    renderCard(ironThorne)
    expect(screen.getByTestId('mentor-card-iron-thorne')).toHaveAttribute('role', 'button')
  })
})

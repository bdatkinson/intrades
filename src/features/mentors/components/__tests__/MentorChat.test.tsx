import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MentorChat from '../MentorChat'
import type { MentorPersona, MentorSession, DialogueMessage } from '../../types'
import type { AIMessage, AIOptions } from '../../../../types/ai'
import { SUIT_DOMAINS } from '../../data/personas'

// ─── Mock scrollIntoView (jsdom doesn't implement it) ─────────────

const scrollIntoViewMock = vi.fn()
Element.prototype.scrollIntoView = scrollIntoViewMock

// ─── Test fixtures ────────────────────────────────────────────────

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
  whyQuote: "It's about permanence.",
  systemPrompt:
    'You are Jon "Iron" Thorne, a structural steel and welding veteran.\n\n' +
    'OPENING: "...You showed up. That\'s step one. Most people don\'t. ' +
    "Let's talk about what keeps steel standing. What do you know about load paths?\"",
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
  whyQuote: "It's a puzzle.",
  systemPrompt:
    'You are Mateo Flores, an HVAC service tech.\n\n' +
    'OPENING: "Hey there. Ready to learn how to keep people comfortable? ' +
    "What's your experience with HVAC systems?\"",
  suitDomain: SUIT_DOMAINS.hearts,
}

const personaNoOpening: MentorPersona = {
  ...ironThorne,
  id: 'no-opening',
  systemPrompt: 'You are a mentor. No opening section here.',
}

// Create a session with pre-existing messages
function makeSession(messages: DialogueMessage[]): MentorSession {
  return {
    mentorId: 'iron-thorne',
    messages,
    gatesPassed: 0,
    startedAt: Date.now(),
  }
}

function makeMessage(
  overrides: Partial<DialogueMessage> = {},
): DialogueMessage {
  return {
    id: `msg-${Math.random().toString(36).slice(2, 8)}`,
    role: 'user',
    content: 'Test message',
    timestamp: Date.now(),
    ...overrides,
  }
}

// ─── AI Provider mock ─────────────────────────────────────────────

const mockAIProvider = {
  sendMessage: vi.fn(),
}

// ─── localStorage helpers ─────────────────────────────────────────

function clearChatStorage(personaId: string) {
  localStorage.removeItem(`mentor-chat-${personaId}`)
}

// ─── Tests ────────────────────────────────────────────────────────

describe('MentorChat', () => {
  beforeEach(() => {
    mockAIProvider.sendMessage.mockReset()
    scrollIntoViewMock.mockReset()
    localStorage.clear()
  })

  // ── Greeting ──────────────────────────────────────────────────

  describe('greeting', () => {
    it('renders the mentor greeting from system prompt OPENING when session is empty', () => {
      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      expect(
        screen.getByText(/You showed up/),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/What do you know about load paths/),
      ).toBeInTheDocument()
    })

    it('renders a fallback greeting when OPENING section is not in system prompt', () => {
      render(
        <MentorChat
          persona={personaNoOpening}
          aiProvider={mockAIProvider}
        />,
      )

      expect(
        screen.getByText(/ready to share what/i),
      ).toBeInTheDocument()
    })

    it('renders the greeting as a mentor message', () => {
      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const greeting = screen.getByText(/You showed up/)
      // Greeting should be inside a mentor message bubble (not user)
      const messageContainer = greeting.closest('[data-testid="chat-message"]')
      expect(messageContainer).toBeInTheDocument()
    })
  })

  // ── ChatMessage rendering ─────────────────────────────────────

  describe('chat messages', () => {
    it('renders user messages with their content', () => {
      const session = makeSession([
        makeMessage({ role: 'user', content: 'How do I weld overhead?' }),
      ])

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
          initialSession={session}
        />,
      )

      expect(
        screen.getByText('How do I weld overhead?'),
      ).toBeInTheDocument()
    })

    it('renders mentor messages with their content', () => {
      const session = makeSession([
        makeMessage({ role: 'mentor', content: 'Start with a tight arc.' }),
      ])

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
          initialSession={session}
        />,
      )

      expect(screen.getByText('Start with a tight arc.')).toBeInTheDocument()
    })

    it('applies suit color classes to mentor messages', () => {
      const session = makeSession([
        makeMessage({ role: 'mentor', content: 'Steel advice here.' }),
      ])

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
          initialSession={session}
        />,
      )

      const messageEl = screen
        .getByText('Steel advice here.')
        .closest('[data-testid="chat-message"]')
      // Spades → slate
      expect(messageEl?.className).toMatch(/border-slate|text-slate/)
    })

    it('applies hearts suit colors for hearts persona mentor messages', () => {
      const session = makeSession([
        makeMessage({ role: 'mentor', content: 'HVAC tip.' }),
      ])

      render(
        <MentorChat
          persona={mateoFlores}
          aiProvider={mockAIProvider}
          initialSession={session}
        />,
      )

      const messageEl = screen
        .getByText('HVAC tip.')
        .closest('[data-testid="chat-message"]')
      // Hearts → rose
      expect(messageEl?.className).toMatch(/border-rose|text-rose/)
    })

    it('renders multiple messages in order', () => {
      const session = makeSession([
        makeMessage({ role: 'user', content: 'First question' }),
        makeMessage({ role: 'mentor', content: 'First answer' }),
        makeMessage({ role: 'user', content: 'Second question' }),
      ])

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
          initialSession={session}
        />,
      )

      const messages = screen.getAllByTestId('chat-message')
      expect(messages.length).toBe(3)
      expect(messages[0]).toHaveTextContent('First question')
      expect(messages[1]).toHaveTextContent('First answer')
      expect(messages[2]).toHaveTextContent('Second question')
    })

    it('labels mentor messages with persona name', () => {
      const session = makeSession([
        makeMessage({ role: 'mentor', content: 'Advice.' }),
      ])

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
          initialSession={session}
        />,
      )

      expect(screen.getByText(/Iron/)).toBeInTheDocument()
    })
  })

  // ── QualityGateIndicator ───────────────────────────────────────

  describe('quality gate indicator', () => {
    it('shows a green indicator for a passed quality gate', () => {
      const session = makeSession([
        makeMessage({
          role: 'mentor',
          content: 'Good answer.',
          qualityGate: {
            type: 'understanding-check',
            passed: true,
            feedback: 'Solid reasoning.',
          },
        }),
      ])

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
          initialSession={session}
        />,
      )

      const indicator = screen.getByTestId('quality-gate-indicator')
      expect(indicator).toBeInTheDocument()
      // Green = passed
      expect(indicator.className).toContain('emerald')
    })

    it('shows a red indicator for a failed quality gate', () => {
      const session = makeSession([
        makeMessage({
          role: 'mentor',
          content: 'Try again.',
          qualityGate: {
            type: 'understanding-check',
            passed: false,
            feedback: 'Not specific enough.',
          },
        }),
      ])

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
          initialSession={session}
        />,
      )

      const indicator = screen.getByTestId('quality-gate-indicator')
      expect(indicator).toBeInTheDocument()
      // Red = failed
      expect(indicator.className).toContain('red')
    })

    it('does not show gate indicator for messages without qualityGate', () => {
      const session = makeSession([
        makeMessage({ role: 'mentor', content: 'No gate here.' }),
      ])

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
          initialSession={session}
        />,
      )

      expect(
        screen.queryByTestId('quality-gate-indicator'),
      ).not.toBeInTheDocument()
    })

    it('shows gate feedback text on hover or as accessible label', () => {
      const session = makeSession([
        makeMessage({
          role: 'mentor',
          content: 'Evaluated.',
          qualityGate: {
            type: 'understanding-check',
            passed: false,
            feedback: 'Not specific enough.',
          },
        }),
      ])

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
          initialSession={session}
        />,
      )

      expect(screen.getByText('Not specific enough.')).toBeInTheDocument()
    })
  })

  // ── Text input ─────────────────────────────────────────────────

  describe('text input and sending', () => {
    it('renders a text input and send button', () => {
      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      expect(
        screen.getByPlaceholderText(/type your message/i),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /send/i }),
      ).toBeInTheDocument()
    })

    it('allows typing a message in the input', async () => {
      const user = userEvent.setup()
      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const input = screen.getByPlaceholderText(/type your message/i)
      await user.type(input, 'How do I get started?')

      expect(input).toHaveValue('How do I get started?')
    })

    it('sends message when send button is clicked', async () => {
      const user = userEvent.setup()
      mockAIProvider.sendMessage.mockResolvedValue('Start with the basics.')

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const input = screen.getByPlaceholderText(/type your message/i)
      await user.type(input, 'How do I get started?')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(mockAIProvider.sendMessage).toHaveBeenCalledTimes(1)
      })
    })

    it('sends message when Enter key is pressed', async () => {
      const user = userEvent.setup()
      mockAIProvider.sendMessage.mockResolvedValue('Keep at it.')

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const input = screen.getByPlaceholderText(/type your message/i)
      await user.type(input, 'Testing enter{Enter}')

      await waitFor(() => {
        expect(mockAIProvider.sendMessage).toHaveBeenCalledTimes(1)
      })
    })

    it('does not send empty messages', async () => {
      const user = userEvent.setup()

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      await user.click(screen.getByRole('button', { name: /send/i }))

      expect(mockAIProvider.sendMessage).not.toHaveBeenCalled()
    })

    it('disables input and send button while loading', async () => {
      const user = userEvent.setup()
      // Make the AI response hang so we can observe loading state
      let resolvePromise!: (value: string) => void
      mockAIProvider.sendMessage.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve
        }),
      )

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const input = screen.getByPlaceholderText(/type your message/i)
      const sendBtn = screen.getByRole('button', { name: /send/i })
      await user.type(input, 'A question')
      await user.click(sendBtn)

      // Input should be disabled during loading
      await waitFor(() => {
        expect(input).toBeDisabled()
        expect(sendBtn).toBeDisabled()
      })

      // Clean up — resolve the promise
      resolvePromise('Answer received.')
    })

    it('clears input after sending', async () => {
      const user = userEvent.setup()
      mockAIProvider.sendMessage.mockResolvedValue('Got it.')

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const input = screen.getByPlaceholderText(/type your message/i)
      await user.type(input, 'Question')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })
  })

  // ── Loading state ──────────────────────────────────────────────

  describe('loading state', () => {
    it('shows a loading indicator while the AI is responding', async () => {
      const user = userEvent.setup()
      let resolvePromise!: (value: string) => void
      mockAIProvider.sendMessage.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve
        }),
      )

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const input = screen.getByPlaceholderText(/type your message/i)
      await user.type(input, 'Test')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(screen.getByTestId('chat-loading')).toBeInTheDocument()
      })

      // Clean up
      resolvePromise('Done.')
    })

    it('hides loading indicator after AI responds', async () => {
      const user = userEvent.setup()
      mockAIProvider.sendMessage.mockResolvedValue('Here is your answer.')

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const input = screen.getByPlaceholderText(/type your message/i)
      await user.type(input, 'Test')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(screen.queryByTestId('chat-loading')).not.toBeInTheDocument()
      })
    })
  })

  // ── Auto-scroll ────────────────────────────────────────────────

  describe('auto-scroll', () => {
    it('scrolls to bottom when new messages are added', async () => {
      const user = userEvent.setup()
      mockAIProvider.sendMessage.mockResolvedValue('Response text.')

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const input = screen.getByPlaceholderText(/type your message/i)
      await user.type(input, 'A question')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled()
      })
    })
  })

  // ── Session persistence ────────────────────────────────────────

  describe('session persistence', () => {
    it('saves session to localStorage after sending a message', async () => {
      const user = userEvent.setup()
      mockAIProvider.sendMessage.mockResolvedValue('Response.')

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const input = screen.getByPlaceholderText(/type your message/i)
      await user.type(input, 'Persist this')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        const stored = localStorage.getItem('mentor-chat-iron-thorne')
        expect(stored).not.toBeNull()
        const parsed = JSON.parse(stored!)
        expect(parsed.messages.length).toBeGreaterThan(0)
      })
    })

    it('restores session from localStorage on mount', async () => {
      // Pre-populate localStorage with a saved session
      const savedSession: MentorSession = {
        mentorId: 'iron-thorne',
        messages: [
          {
            id: 'saved-1',
            role: 'user',
            content: 'Saved question',
            timestamp: Date.now(),
          },
          {
            id: 'saved-2',
            role: 'mentor',
            content: 'Saved answer',
            timestamp: Date.now(),
          },
        ],
        gatesPassed: 1,
        startedAt: Date.now(),
      }
      localStorage.setItem(
        'mentor-chat-iron-thorne',
        JSON.stringify(savedSession),
      )

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      // Should show the saved messages, not the greeting
      expect(screen.getByText('Saved question')).toBeInTheDocument()
      expect(screen.getByText('Saved answer')).toBeInTheDocument()
      // Greeting should NOT appear since we have saved messages
      expect(
        screen.queryByText(/You showed up/),
      ).not.toBeInTheDocument()
    })

    it('uses initialSession prop when no localStorage data exists', () => {
      const session = makeSession([
        makeMessage({
          role: 'user',
          content: 'From initial session prop',
        }),
      ])

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
          initialSession={session}
        />,
      )

      expect(
        screen.getByText('From initial session prop'),
      ).toBeInTheDocument()
    })

    it('prefers localStorage over initialSession prop', () => {
      // localStorage has saved session
      const savedSession: MentorSession = {
        mentorId: 'iron-thorne',
        messages: [
          {
            id: 'saved-3',
            role: 'user',
            content: 'From localStorage',
            timestamp: Date.now(),
          },
        ],
        gatesPassed: 0,
        startedAt: Date.now(),
      }
      localStorage.setItem(
        'mentor-chat-iron-thorne',
        JSON.stringify(savedSession),
      )

      // initialSession prop says something different
      const propSession = makeSession([
        makeMessage({
          role: 'user',
          content: 'From prop',
        }),
      ])

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
          initialSession={propSession}
        />,
      )

      // localStorage wins
      expect(screen.getByText('From localStorage')).toBeInTheDocument()
      expect(screen.queryByText('From prop')).not.toBeInTheDocument()
    })

    it('uses separate localStorage keys per persona', () => {
      const ironSession: MentorSession = {
        mentorId: 'iron-thorne',
        messages: [makeMessage({ role: 'user', content: 'Iron session' })],
        gatesPassed: 0,
        startedAt: Date.now(),
      }
      const mateoSession: MentorSession = {
        mentorId: 'mateo-flores',
        messages: [makeMessage({ role: 'user', content: 'Mateo session' })],
        gatesPassed: 0,
        startedAt: Date.now(),
      }

      localStorage.setItem(
        'mentor-chat-iron-thorne',
        JSON.stringify(ironSession),
      )
      localStorage.setItem(
        'mentor-chat-mateo-flores',
        JSON.stringify(mateoSession),
      )

      render(
        <MentorChat
          persona={ironThorne}
          aiProvider={mockAIProvider}
        />,
      )

      expect(screen.getByText('Iron session')).toBeInTheDocument()
      expect(screen.queryByText('Mateo session')).not.toBeInTheDocument()
    })
  })

  // ── Error handling ─────────────────────────────────────────────

  describe('error handling', () => {
    it('displays an error message when AI call fails', async () => {
      const user = userEvent.setup()
      mockAIProvider.sendMessage.mockRejectedValue(
        new Error('AI service unavailable'),
      )

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const input = screen.getByPlaceholderText(/type your message/i)
      await user.type(input, 'Question')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/unavailable/i),
        ).toBeInTheDocument()
      })
    })

    it('re-enables input after error', async () => {
      const user = userEvent.setup()
      mockAIProvider.sendMessage.mockRejectedValue(new Error('Fail'))

      render(
        <MentorChat persona={ironThorne} aiProvider={mockAIProvider} />,
      )

      const input = screen.getByPlaceholderText(/type your message/i)
      await user.type(input, 'Question')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(input).not.toBeDisabled()
      })
    })
  })
})

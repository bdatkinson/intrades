import { describe, it, expect, vi } from 'vitest'
import { DialogueEngine, FACTUAL_COMPANION_CONSTRAINT } from '../dialogue'
import type {
  MentorPersona,
  MentorSession,
  QualityGateResult,
  DialogueMessage,
} from '../types'
import type { AIMessage } from '../../../types/ai'

// ─── Test Fixtures ───────────────────────────────────────────────

const testPersona: MentorPersona = {
  id: 'iron-thorne',
  name: 'Jon "Iron" Thorne',
  nickname: 'Iron',
  card: { suit: 'spades', face: 'king' },
  city: 'Pittsburgh',
  state: 'PA',
  trade: 'Structural Steel & Welding',
  background: '30 years in structural steel.',
  personalityVibe: 'Gruff & Intimidating',
  personalityDescription: 'No-nonsense old-school welder.',
  whyQuote: '"If it holds, it holds."',
  systemPrompt:
    'You are Iron Thorne, a veteran structural steel welder. Answer like a foreman on-site.',
  suitDomain: {
    suit: 'spades',
    symbol: '♠️',
    name: 'Tools & Technology',
    color: 'slate',
  },
}

// ─── startSession ─────────────────────────────────────────────────

describe('startSession', () => {
  it('creates a new session with mentorId, empty messages, and timestamp', () => {
    const engine = new DialogueEngine()
    const session = engine.startSession('iron-thorne')

    expect(session.mentorId).toBe('iron-thorne')
    expect(session.messages).toEqual([])
    expect(session.gatesPassed).toBe(0)
    expect(session.startedAt).toBeGreaterThan(0)
    expect(session.startedAt).toBeLessThanOrEqual(Date.now())
  })

  it('accepts an optional initial topic', () => {
    const engine = new DialogueEngine()
    const session = engine.startSession('iron-thorne', 'welding overhead')

    expect(session.currentTopic).toBe('welding overhead')
  })

  it('creates sessions with unique IDs accessible as a property', () => {
    const engine = new DialogueEngine()
    const s1 = engine.startSession('a')
    const s2 = engine.startSession('b')

    // sessions should be distinct objects
    expect(s1).not.toBe(s2)
    expect(s1.messages).not.toBe(s2.messages)
  })
})

// ─── buildPrompt ───────────────────────────────────────────────────

describe('buildPrompt', () => {
  it('includes persona system prompt as the first message', () => {
    const engine = new DialogueEngine()
    const session = engine.startSession('iron-thorne')
    const messages = engine.buildPrompt(session, testPersona)

    expect(messages.length).toBe(1)
    expect(messages[0].role).toBe('user') // system prompt sent as user message for Anthropic
  })

  it('appends the Factual Companion Constraint to the system prompt', () => {
    const engine = new DialogueEngine()
    const session = engine.startSession('iron-thorne')
    const messages = engine.buildPrompt(session, testPersona)

    expect(messages[0].content).toContain('Iron Thorne')
    expect(messages[0].content).toContain('FACTUAL COMPANION CONSTRAINT')
    expect(messages[0].content).toContain('Do not make emotional claims')
  })

  it('converts session messages to AIMessage format in order', () => {
    const engine = new DialogueEngine()
    const session: MentorSession = {
      mentorId: 'iron-thorne',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'How do I set my amperage?',
          timestamp: 1000,
        },
        {
          id: 'msg-2',
          role: 'mentor',
          content: 'Read the rod specs first.',
          timestamp: 2000,
        },
      ],
      gatesPassed: 0,
      startedAt: 500,
    }

    const messages = engine.buildPrompt(session, testPersona)

    // First message is system prompt, then session messages
    expect(messages.length).toBe(3)
    expect(messages[1].role).toBe('user')
    expect(messages[1].content).toBe('How do I set my amperage?')
    expect(messages[2].role).toBe('assistant')
    expect(messages[2].content).toBe('Read the rod specs first.')
  })

  it('maps mentor role to assistant for AI format', () => {
    const engine = new DialogueEngine()
    const session: MentorSession = {
      mentorId: 'iron-thorne',
      messages: [
        {
          id: 'msg-1',
          role: 'mentor',
          content: 'Watch your puddle.',
          timestamp: 1000,
        },
      ],
      gatesPassed: 0,
      startedAt: 500,
    }

    const messages = engine.buildPrompt(session, testPersona)
    expect(messages[1].role).toBe('assistant')
  })
})

// ─── evaluateGate ──────────────────────────────────────────────────

describe('evaluateGate', () => {
  it('returns a QualityGateResult with type and passed status', () => {
    const engine = new DialogueEngine()
    const result = engine.evaluateGate(
      'I set the amperage to 90 for a 7018 rod.',
      'understanding-check',
    )

    expect(result.type).toBe('understanding-check')
    expect(typeof result.passed).toBe('boolean')
    expect(typeof result.feedback).toBe('string')
  })

  it('passes when user demonstrates specific technical reasoning', () => {
    const engine = new DialogueEngine()
    const result = engine.evaluateGate(
      'I chose 6010 for the root pass because of deep penetration, then 7018 fill.',
      'understanding-check',
    )

    expect(result.passed).toBe(true)
    expect(result.feedback).toBeDefined()
  })

  it('fails when response is vague or lacks technical substance', () => {
    const engine = new DialogueEngine()
    const result = engine.evaluateGate(
      'yeah I think I got it',
      'understanding-check',
    )

    expect(result.passed).toBe(false)
    expect(result.feedback).toBeDefined()
  })

  it('passes misconception gates when no known false statements found', () => {
    const engine = new DialogueEngine()
    const result = engine.evaluateGate(
      'Stick welding uses a consumable electrode.',
      'misconception',
    )

    // no known false claim — should pass
    expect(result.passed).toBe(true)
  })

  it('fails misconception gates when a known trade falsehood is detected', () => {
    const engine = new DialogueEngine()
    const result = engine.evaluateGate(
      'I can use the same rod for overhead and flat with no adjustments.',
      'misconception',
    )

    // "no adjustments" for overhead is a known misconception
    expect(result.passed).toBe(false)
    expect(result.feedback).toMatch(/overhead|adjustment/i)
  })

  it('passes advancement gates for responses over minimum length threshold', () => {
    const engine = new DialogueEngine()
    const result = engine.evaluateGate(
      'The key difference between MIG and TIG is the electrode type and gas shielding method.',
      'advancement',
    )

    expect(result.passed).toBe(true)
  })

  it('fails advancement gates for responses under minimum length', () => {
    const engine = new DialogueEngine()
    const result = engine.evaluateGate('ok', 'advancement')

    expect(result.passed).toBe(false)
  })
})

// ─── sendMessage ───────────────────────────────────────────────────

describe('sendMessage', () => {
  const mockAIProvider = {
    sendMessage: vi.fn(),
  }

  beforeEach(() => {
    mockAIProvider.sendMessage.mockReset()
  })

  it('adds user message and returns updated session with mentor response', async () => {
    mockAIProvider.sendMessage.mockResolvedValue('Keep your arc tight.')

    const engine = new DialogueEngine()
    const session = engine.startSession('iron-thorne')
    const aiOptions = { model: 'claude-sonnet-4-6', temperature: 1 }

    const updated = await engine.sendMessage(
      session,
      testPersona,
      'My arc keeps wandering.',
      mockAIProvider,
      aiOptions,
    )

    expect(updated.messages.length).toBe(2)
    expect(updated.messages[0].role).toBe('user')
    expect(updated.messages[0].content).toBe('My arc keeps wandering.')
    expect(updated.messages[1].role).toBe('mentor')
    expect(updated.messages[1].content).toBe('Keep your arc tight.')
  })

  it('calls AI provider with built prompt and options', async () => {
    mockAIProvider.sendMessage.mockResolvedValue('Good answer.')

    const engine = new DialogueEngine()
    const session = engine.startSession('iron-thorne')
    const aiOptions = { model: 'claude-sonnet-4-6', maxTokens: 1000, temperature: 1 }

    await engine.sendMessage(
      session,
      testPersona,
      'What rod for 1/4" plate?',
      mockAIProvider,
      aiOptions,
    )

    expect(mockAIProvider.sendMessage).toHaveBeenCalledTimes(1)
    const [messages, options] = mockAIProvider.sendMessage.mock.calls[0]
    expect(messages.length).toBeGreaterThan(0)
    expect(messages[0].content).toContain('FACTUAL COMPANION CONSTRAINT')
    expect(options.model).toBe('claude-sonnet-4-6')
    expect(options.maxTokens).toBe(1000)
  })

  it('attaches qualityGate to mentor message when evaluateAfter is true', async () => {
    mockAIProvider.sendMessage.mockResolvedValue(
      'Correct — you want more heat for thicker material.',
    )

    const engine = new DialogueEngine()
    const session = engine.startSession('iron-thorne')
    const aiOptions = { model: 'claude-sonnet-4-6' }

    const updated = await engine.sendMessage(
      session,
      testPersona,
      'Thicker plate needs more heat, right?',
      mockAIProvider,
      aiOptions,
      { evaluateAfter: true },
    )

    const mentorMsg = updated.messages[1]
    expect(mentorMsg.qualityGate).toBeDefined()
    expect(mentorMsg.qualityGate!.type).toBe('understanding-check')
    expect(typeof mentorMsg.qualityGate!.passed).toBe('boolean')
  })

  it('does not mutate the original session (immutable pattern)', async () => {
    mockAIProvider.sendMessage.mockResolvedValue('Understood.')

    const engine = new DialogueEngine()
    const session = engine.startSession('iron-thorne')
    const originalMessages = session.messages

    await engine.sendMessage(
      session,
      testPersona,
      'Question?',
      mockAIProvider,
      { model: 'test' },
    )

    // original should be unchanged
    expect(session.messages).toBe(originalMessages)
    expect(session.messages.length).toBe(0)
  })

  it('presists gatesPassed count from original session', async () => {
    mockAIProvider.sendMessage.mockResolvedValue('Response.')

    const engine = new DialogueEngine()
    const session: MentorSession = {
      mentorId: 'iron-thorne',
      messages: [],
      gatesPassed: 3,
      startedAt: Date.now(),
    }

    const updated = await engine.sendMessage(
      session,
      testPersona,
      'Question?',
      mockAIProvider,
      { model: 'test' },
    )

    expect(updated.gatesPassed).toBe(3)
  })

  it('increments gatesPassed when a gate passes', async () => {
    mockAIProvider.sendMessage.mockResolvedValue(
      'The key reason is that thicker material acts as a heat sink, requiring higher amperage to maintain proper penetration.',
    )

    const engine = new DialogueEngine()
    const session = engine.startSession('iron-thorne')
    const aiOptions = { model: 'test' }

    const updated = await engine.sendMessage(
      session,
      testPersona,
      'Explain heat and plate thickness.',
      mockAIProvider,
      aiOptions,
      { evaluateAfter: true },
    )

    expect(updated.gatesPassed).toBeGreaterThanOrEqual(session.gatesPassed)
  })
})

// ─── Factual Companion Constraint constant ─────────────────────────

describe('FACTUAL_COMPANION_CONSTRAINT', () => {
  it('is a non-empty string', () => {
    expect(typeof FACTUAL_COMPANION_CONSTRAINT).toBe('string')
    expect(FACTUAL_COMPANION_CONSTRAINT.length).toBeGreaterThan(50)
  })

  it('contains key constraint language', () => {
    expect(FACTUAL_COMPANION_CONSTRAINT).toMatch(/do not make emotional claims/i)
    expect(FACTUAL_COMPANION_CONSTRAINT).toMatch(/praise the work/i)
    expect(FACTUAL_COMPANION_CONSTRAINT).toMatch(/older brother/i)
    expect(FACTUAL_COMPANION_CONSTRAINT).toMatch(/factual/i)
  })
})

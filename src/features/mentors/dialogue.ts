import type { MentorPersona, MentorSession, DialogueMessage, QualityGateResult } from './types'
import type { AIMessage, AIOptions } from '../../types/ai'

// ─── Factual Companion Constraint ──────────────────────────────────
// Inject this into every system prompt to enforce the Iron Companion
// pattern: no emotional claims, praise work not person, factual "older
// brother" tone.

export const FACTUAL_COMPANION_CONSTRAINT = [
  'FACTUAL COMPANION CONSTRAINT:',
  '- Do not make emotional claims about the user (e.g., "I\'m proud of you," "You have a gift").',
  '- Praise the work, not the person (e.g., "That weld held" not "You\'re a great welder").',
  '- Maintain a direct, factual, "older brother" tone — never therapist, never cheerleader.',
  '- Stay grounded in observable trade realities. If it can\'t be measured or seen on-site, don\'t say it.',
].join('\n')

// ─── AI Provider Interface (duck-typed for testability) ───────────

interface AIProvider {
  sendMessage(messages: AIMessage[], options: AIOptions): Promise<string>
}

// ─── Send Message Options ─────────────────────────────────────────

interface SendMessageOptions {
  /** If true, run evaluateGate on the user message and attach result. */
  evaluateAfter?: boolean
}

// ─── Gate Keywords ─────────────────────────────────────────────────
// Simple keyword-triggered gates until we wire up real LLM evaluation.

const GATE_PASS_SIGNALS = [
  'because', 'therefore', 'the reason', 'I chose', 'I set',
  'the difference', 'I learned', 'I adjusted', 'the key',
]

const GATE_FAIL_SIGNALS = [
  'yeah I think', 'I guess', 'maybe', 'sort of', 'kind of',
  'probably', 'not sure', "I don't know",
]

const MISCONCEPTION_PATTERNS: Array<{ pattern: RegExp; feedback: string }> = [
  {
    pattern: /no adjustments?.*overhead/i,
    feedback: 'Overhead welding requires technique adjustments — travel speed, angle, and often heat.',
  },
    {
      pattern: /same rod.*(flat|overhead|vertical)/i,
      feedback: 'Overhead and flat positions demand different rod choices and adjustments — you cannot treat them identically.',
    },
]

const MIN_ADVANCEMENT_LENGTH = 20

// ─── DialogueEngine ────────────────────────────────────────────────

export class DialogueEngine {
  /** Create a new mentor session. */
  startSession(mentorId: string, currentTopic?: string): MentorSession {
    return {
      mentorId,
      messages: [],
      gatesPassed: 0,
      startedAt: Date.now(),
      ...(currentTopic ? { currentTopic } : {}),
    }
  }

  /** Build an AIMessage[] from session + persona, injecting the Factual Companion Constraint. */
  buildPrompt(session: MentorSession, persona: MentorPersona): AIMessage[] {
    const systemContent =
      persona.systemPrompt + '\n\n' + FACTUAL_COMPANION_CONSTRAINT

    const messages: AIMessage[] = [
      { role: 'user', content: systemContent },
    ]

    for (const msg of session.messages) {
      messages.push({
        role: msg.role === 'mentor' ? 'assistant' : 'user',
        content: msg.content,
      })
    }

    return messages
  }

  /** Evaluate a quality gate against the user's last message content. */
  evaluateGate(
    lastUserContent: string,
    gateType: QualityGateResult['type'],
  ): QualityGateResult {
    const content = lastUserContent.trim()

    switch (gateType) {
      case 'understanding-check':
        return this.evaluateUnderstanding(content)
      case 'misconception':
        return this.evaluateMisconception(content)
      case 'advancement':
        return this.evaluateAdvancement(content)
    }
  }

  /** Send a user message through the mentor persona and return the updated session. */
  async sendMessage(
    session: MentorSession,
    persona: MentorPersona,
    userContent: string,
    aiProvider: AIProvider,
    aiOptions: AIOptions,
    opts?: SendMessageOptions,
  ): Promise<MentorSession> {
    const userMsg = this.createMessage('user', userContent)
    const messages = [...session.messages, userMsg]

    const prompt = this.buildPrompt(
      { ...session, messages },
      persona,
    )

    const response = await aiProvider.sendMessage(prompt, aiOptions)
    const mentorMsg = this.createMessage('mentor', response)

    let gatesPassed = session.gatesPassed

    if (opts?.evaluateAfter) {
      const gate = this.evaluateGate(userContent, 'understanding-check')
      mentorMsg.qualityGate = gate
      if (gate.passed) {
        gatesPassed += 1
      }
    }

    return {
      ...session,
      messages: [...messages, mentorMsg],
      gatesPassed,
    }
  }

  // ─── Private helpers ────────────────────────────────────────────

  private createMessage(
    role: 'user' | 'mentor',
    content: string,
  ): DialogueMessage {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role,
      content,
      timestamp: Date.now(),
    }
  }

  private evaluateUnderstanding(content: string): QualityGateResult {
    const hasPassSignal = GATE_PASS_SIGNALS.some((s) =>
      content.toLowerCase().includes(s.toLowerCase()),
    )
    const hasFailSignal = GATE_FAIL_SIGNALS.some((s) =>
      content.toLowerCase().includes(s.toLowerCase()),
    )

    // Priority: if both present, technical language wins
    if (hasPassSignal && !hasFailSignal) {
      return {
        type: 'understanding-check',
        passed: true,
        feedback: 'Good — you demonstrated specific technical reasoning.',
      }
    }

    if (hasFailSignal && !hasPassSignal) {
      return {
        type: 'understanding-check',
        passed: false,
        feedback: 'Try restating with specific terms — what exactly did you choose and why?',
      }
    }

    // Mixed or unclear signals — lean on length as tiebreaker
    const passed = content.length >= MIN_ADVANCEMENT_LENGTH
    return {
      type: 'understanding-check',
      passed,
      feedback: passed
        ? 'You provided some detail. Keep adding specifics.'
        : 'Can you go deeper? Name the tools, settings, or materials involved.',
    }
  }

  private evaluateMisconception(content: string): QualityGateResult {
    for (const { pattern, feedback } of MISCONCEPTION_PATTERNS) {
      if (pattern.test(content)) {
        return {
          type: 'misconception',
          passed: false,
          feedback,
        }
      }
    }

    return {
      type: 'misconception',
      passed: true,
      feedback: 'No known misconceptions detected.',
    }
  }

  private evaluateAdvancement(content: string): QualityGateResult {
    const passed = content.length >= MIN_ADVANCEMENT_LENGTH
    return {
      type: 'advancement',
      passed,
      feedback: passed
        ? 'Response meets minimum depth for advancement.'
        : 'Can you elaborate more? A few words is not enough to confirm understanding.',
    }
  }
}

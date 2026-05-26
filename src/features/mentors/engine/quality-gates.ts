import type { GateType, QualityGateResult } from '../types'
import type AIService from '../../../lib/ai-service'
import type { AIOptions } from '../../../types/ai'

// ─── Gate Criteria ──────────────────────────────────────────────

export interface GateCriteria {
  type: GateType
  name: string
  description: string
  evaluationPrompt: string
}

export const GATE_CRITERIA: Record<GateType, GateCriteria> = {
  'comprehension-check': {
    type: 'comprehension-check',
    name: 'Comprehension Check',
    description:
      'After explaining a concept, check whether the learner can explain it back in their own words — not just repeat the definition.',
    evaluationPrompt:
      'Evaluate whether the learner demonstrates genuine understanding of the concept. They should explain it in their own words, not just parrot the definition. Return JSON: { "passed": boolean, "feedback": "your reasoning in 1–2 sentences in the mentor\'s voice" }. Feedback should be Socratic — if they pass, confirm briefly; if they fail, ask a question that guides them toward understanding.',
  },
  'misconception-probe': {
    type: 'misconception-probe',
    name: 'Misconception Probe',
    description:
      'Detect whether the learner holds a wrong assumption or misconception about the concept. Does not advance until addressed.',
    evaluationPrompt:
      'Evaluate whether the learner\'s response contains any wrong assumptions or misconceptions about the concept. Look for conflation of terms, missing key distinctions, or incorrect cause-and-effect reasoning. Return JSON: { "passed": boolean, "feedback": "your reasoning in 1–2 sentences in the mentor\'s voice" }. If a misconception is found (passed=false), the feedback should name the misconception clearly and ask a targeted question to surface it — do not give the answer.',
  },
  'application-gate': {
    type: 'application-gate',
    name: 'Application Gate',
    description:
      'Present a scenario and ask how the learner would apply the concept. Check for practical, not just theoretical, understanding.',
    evaluationPrompt:
      'Evaluate whether the learner can apply the concept to a practical scenario. They should demonstrate working knowledge — not just recite theory. Return JSON: { "passed": boolean, "feedback": "your reasoning in 1–2 sentences in the mentor\'s voice" }. If they fail, the feedback should present a concrete scenario or counter-example that reveals the gap.',
  },
  'advancement-gate': {
    type: 'advancement-gate',
    name: 'Advancement Gate',
    description:
      'All three prior gates passed for the current topic — evaluate whether the learner is ready to unlock the next topic.',
    evaluationPrompt:
      'Evaluate whether the learner is ready to advance to the next topic. They should have passed comprehension, misconception, and application gates for the current topic. Return JSON: { "passed": boolean, "feedback": "your reasoning in 1–2 sentences in the mentor\'s voice" }. If passed, briefly summarize what they have mastered. If not, name the specific gap that remains.',
  },
}

// ─── Default AI Options for Gate Evaluation ─────────────────────

const GATE_EVAL_OPTIONS: AIOptions = {
  model: 'claude-sonnet-4-6',
  temperature: 0.3,
  maxTokens: 150,
}

// ─── Engine ─────────────────────────────────────────────────────

export class QualityGateEngine {
  private aiService: AIService

  constructor(aiService: AIService) {
    this.aiService = aiService
  }

  /**
   * Determine which quality gate should be active next given the
   * current session's gate-pass state. Returns null when all gates
   * including advancement are passed (topic complete).
   */
  getActiveGate(gatesPassed: Record<GateType, boolean>): GateType | null {
    if (!gatesPassed['comprehension-check']) return 'comprehension-check'
    if (!gatesPassed['misconception-probe']) return 'misconception-probe'
    if (!gatesPassed['application-gate']) return 'application-gate'
    if (!gatesPassed['advancement-gate']) return 'advancement-gate'
    return null
  }

  /**
   * Evaluate a learner's response against a specific quality gate
   * by calling a secondary AI. Returns a QualityGateResult with
   * pass/fail status and Socratic feedback.
   */
  async evaluateGate(
    type: GateType,
    topic: string,
    concept: string,
    learnerResponse: string,
  ): Promise<QualityGateResult> {
    const criteria = GATE_CRITERIA[type]
    const prompt = this.buildEvaluationPrompt(criteria, topic, concept, learnerResponse)

    try {
      const raw = await this.aiService.sendMessage(
        [{ role: 'user', content: prompt }],
        GATE_EVAL_OPTIONS,
      )
      const parsed = this.parseAIResponse(raw)
      return {
        type,
        passed: parsed.passed,
        feedback: parsed.feedback,
      }
    } catch (err) {
      return {
        type,
        passed: false,
        feedback: `Evaluation error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }
    }
  }

  private buildEvaluationPrompt(
    criteria: GateCriteria,
    topic: string,
    concept: string,
    learnerResponse: string,
  ): string {
    const gateTypeDisplay = criteria.name
    return [
      `${gateTypeDisplay} evaluation for topic: "${topic}"`,
      `Concept taught: "${concept}"`,
      `Learner response: "${learnerResponse}"`,
      '',
      criteria.evaluationPrompt,
    ].join('\n')
  }

  private parseAIResponse(raw: string): { passed: boolean; feedback?: string } {
    try {
      // Try to extract JSON from the response (may have surrounding text)
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON object found in response')
      }
      const parsed = JSON.parse(jsonMatch[0])
      return {
        passed: Boolean(parsed.passed),
        feedback: typeof parsed.feedback === 'string' ? parsed.feedback : undefined,
      }
    } catch {
      return {
        passed: false,
        feedback: `Evaluation error: could not parse response`,
      }
    }
  }
}

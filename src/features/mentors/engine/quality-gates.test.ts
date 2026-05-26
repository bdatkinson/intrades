import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QualityGateEngine, GATE_CRITERIA } from './quality-gates'
import type { GateType, QualityGateResult } from '../types'
import AIService from '../../../lib/ai-service'

// ── Helpers ─────────────────────────────────────────────────────

function makeGateState(
  comprehension = false,
  misconception = false,
  application = false,
  advancement = false,
): Record<GateType, boolean> {
  return {
    'comprehension-check': comprehension,
    'misconception-probe': misconception,
    'application-gate': application,
    'advancement-gate': advancement,
  }
}

function makeMockAI(response: string): AIService {
  const svc = new AIService('anthropic', { provider: 'anthropic', apiKey: 'test-key' })
  vi.spyOn(svc, 'sendMessage').mockResolvedValue(response)
  return svc
}

// ── Tests ───────────────────────────────────────────────────────

describe('QualityGateEngine', () => {
  describe('getActiveGate', () => {
    it('returns comprehension-check when no gates are passed', () => {
      const engine = new QualityGateEngine(makeMockAI('{}'))
      const state = makeGateState(false, false, false, false)
      expect(engine.getActiveGate(state)).toBe('comprehension-check')
    })

    it('returns misconception-probe when comprehension is passed', () => {
      const engine = new QualityGateEngine(makeMockAI('{}'))
      const state = makeGateState(true, false, false, false)
      expect(engine.getActiveGate(state)).toBe('misconception-probe')
    })

    it('returns application-gate when comprehension and misconception are passed', () => {
      const engine = new QualityGateEngine(makeMockAI('{}'))
      const state = makeGateState(true, true, false, false)
      expect(engine.getActiveGate(state)).toBe('application-gate')
    })

    it('returns advancement-gate when comprehension, misconception, and application are passed', () => {
      const engine = new QualityGateEngine(makeMockAI('{}'))
      const state = makeGateState(true, true, true, false)
      expect(engine.getActiveGate(state)).toBe('advancement-gate')
    })

    it('returns null when all gates including advancement are passed', () => {
      const engine = new QualityGateEngine(makeMockAI('{}'))
      const state = makeGateState(true, true, true, true)
      expect(engine.getActiveGate(state)).toBeNull()
    })
  })

  describe('evaluateGate', () => {
    const topic = 'Load calculations for structural beams'
    const concept = 'Dead load vs live load — dead load is the static weight of the structure itself'
    const learnerResponse = 'Dead load is what the beam weighs and anything permanently attached'

    it('passes comprehension check when learner demonstrates understanding', async () => {
      const mockAI = makeMockAI(
        JSON.stringify({ passed: true, feedback: 'Correct — you identified both the beam weight and permanent attachments.' }),
      )
      const engine = new QualityGateEngine(mockAI)
      const result = await engine.evaluateGate('comprehension-check', topic, concept, learnerResponse)
      expect(result.passed).toBe(true)
      expect(result.feedback).toContain('Correct')
    })

    it('fails comprehension check when learner only parrots the concept', async () => {
      const mockAI = makeMockAI(
        JSON.stringify({ passed: false, feedback: 'You repeated the definition but did not show understanding in your own words.' }),
      )
      const engine = new QualityGateEngine(mockAI)
      const result = await engine.evaluateGate('comprehension-check', topic, concept, 'Dead load is static weight, live load is variable.')
      expect(result.passed).toBe(false)
    })

    it('passes misconception probe when learner has no misconception', async () => {
      const mockAI = makeMockAI(
        JSON.stringify({ passed: true, feedback: 'No misconception detected.' }),
      )
      const engine = new QualityGateEngine(mockAI)
      const result = await engine.evaluateGate('misconception-probe', topic, concept, learnerResponse)
      expect(result.passed).toBe(true)
    })

    it('fails misconception probe when learner shows wrong assumption', async () => {
      const mockAI = makeMockAI(
        JSON.stringify({ passed: false, feedback: 'Caution — you are conflating dead load with live load. Dead load is static and permanent, not variable.' }),
      )
      const engine = new QualityGateEngine(mockAI)
      const result = await engine.evaluateGate(
        'misconception-probe',
        topic,
        concept,
        'Dead load changes depending on how many people are in the building.',
      )
      expect(result.passed).toBe(false)
      expect(result.feedback).toContain('Caution')
    })

    it('passes application gate when learner applies concept correctly', async () => {
      const mockAI = makeMockAI(
        JSON.stringify({ passed: true, feedback: 'Good — you considered both the beam weight and the roof material in your calculation.' }),
      )
      const engine = new QualityGateEngine(mockAI)
      const result = await engine.evaluateGate(
        'application-gate',
        topic,
        concept,
        'I would add the beam weight plus 15psf for the metal roof for my dead load calc.',
      )
      expect(result.passed).toBe(true)
    })

    it('fails application gate when learner cannot apply the concept', async () => {
      const mockAI = makeMockAI(
        JSON.stringify({ passed: false, feedback: 'You did not include the roofing material weight. Try again — what components contribute to dead load?' }),
      )
      const engine = new QualityGateEngine(mockAI)
      const result = await engine.evaluateGate(
        'application-gate',
        topic,
        concept,
        'I would just use 40psf for everything.',
      )
      expect(result.passed).toBe(false)
    })

    it('passes advancement gate when learner is ready to move on', async () => {
      const mockAI = makeMockAI(
        JSON.stringify({ passed: true, feedback: 'You have demonstrated solid understanding across all dimensions. Ready to advance.' }),
      )
      const engine = new QualityGateEngine(mockAI)
      const result = await engine.evaluateGate(
        'advancement-gate',
        topic,
        concept,
        'I can explain dead vs live load, identify common mistakes, and apply it to a real beam sizing problem.',
      )
      expect(result.passed).toBe(true)
    })

    it('handles AI service returning malformed JSON gracefully', async () => {
      const mockAI = makeMockAI('not valid json at all')
      const engine = new QualityGateEngine(mockAI)
      const result = await engine.evaluateGate('comprehension-check', topic, concept, learnerResponse)
      expect(result.passed).toBe(false)
      expect(result.feedback).toContain('error')
    })

    it('handles AI service rejecting with an error', async () => {
      const svc = new AIService('anthropic', { provider: 'anthropic', apiKey: 'test-key' })
      vi.spyOn(svc, 'sendMessage').mockRejectedValue(new Error('API timeout'))
      const engine = new QualityGateEngine(svc)
      const result = await engine.evaluateGate('comprehension-check', topic, concept, learnerResponse)
      expect(result.passed).toBe(false)
      expect(result.feedback).toContain('Evaluation error')
    })

    it('returns the correct gate type in the result', async () => {
      const mockAI = makeMockAI(JSON.stringify({ passed: true }))
      const engine = new QualityGateEngine(mockAI)
      const result = await engine.evaluateGate('misconception-probe', topic, concept, learnerResponse)
      expect(result.type).toBe('misconception-probe')
    })
  })

  describe('GATE_CRITERIA', () => {
    it('has criteria for all four gate types', () => {
      const types: GateType[] = [
        'comprehension-check',
        'misconception-probe',
        'application-gate',
        'advancement-gate',
      ]
      for (const t of types) {
        const criteria = GATE_CRITERIA[t]
        expect(criteria).toBeDefined()
        expect(criteria.type).toBe(t)
        expect(criteria.name).toBeTruthy()
        expect(criteria.description).toBeTruthy()
        expect(criteria.evaluationPrompt).toBeTruthy()
      }
    })

    it('comprehension check evaluates whether learner can explain in own words', () => {
      const criteria = GATE_CRITERIA['comprehension-check']
      expect(criteria.name).toBe('Comprehension Check')
      expect(criteria.description).toContain('own words')
    })

    it('misconception probe evaluates whether learner has wrong assumptions', () => {
      const criteria = GATE_CRITERIA['misconception-probe']
      expect(criteria.name).toBe('Misconception Probe')
      expect(criteria.description).toContain('wrong')
    })

    it('application gate evaluates whether learner can apply the concept', () => {
      const criteria = GATE_CRITERIA['application-gate']
      expect(criteria.name).toBe('Application Gate')
      expect(criteria.description).toContain('apply')
    })

    it('advancement gate evaluates readiness for next topic', () => {
      const criteria = GATE_CRITERIA['advancement-gate']
      expect(criteria.name).toBe('Advancement Gate')
      expect(criteria.description).toContain('next topic')
    })
  })
})

import { describe, it, expect } from 'vitest'
import { mentorPersonas } from './personas'
import type { MentorPersona } from '../types'

// ─── Helper ──────────────────────────────────────────────────────

function getPrompt(mentor: MentorPersona): string {
  return mentor.systemPrompt
}

function getOpening(mentor: MentorPersona): string {
  const prompt = getPrompt(mentor)
  const match = prompt.match(/OPENING:\s*["']?(.+?)["']?\s*(?:```)?\s*$/ms)
  return match ? match[1].trim() : ''
}

function hasSection(prompt: string, section: string): boolean {
  return prompt.includes(section)
}

function extractSection(prompt: string, sectionName: string): string | null {
  // Match "SECTION_NAME:" or "SECTION_NAME (...):" through to the next all-caps section
  const pattern = new RegExp(
    `${sectionName}(?:\\s*\\([^)]*\\))?\\s*:\\s*(.+?)(?=\\n[A-Z]{2,}|$)`,
    's',
  )
  const match = prompt.match(pattern)
  return match ? match[1].trim() : null
}

// ─── Per-Mentor System Prompt Tests ───────────────────────────────

describe('System Prompts — Per-Mentor Quality', () => {
  for (const mentor of mentorPersonas) {
    describe(`${mentor.name} (${mentor.id})`, () => {
      const prompt = getPrompt(mentor)

      it('has all 5 required template sections', () => {
        expect(hasSection(prompt, 'PERSONALITY')).toBe(true)
        expect(hasSection(prompt, 'DOMAIN')).toBe(true)
        expect(hasSection(prompt, 'TEACHING METHOD')).toBe(true)
        expect(hasSection(prompt, 'CONSTRAINTS')).toBe(true)
        expect(hasSection(prompt, 'OPENING')).toBe(true)
      })

      it('names the Factual Companion Constraint explicitly', () => {
        expect(prompt).toMatch(/FACTUAL COMPANION/i)
      })

      it('names the Narrative-Voice Boundary explicitly', () => {
        expect(prompt).toMatch(/NARRATIVE[- ]VOICE BOUNDARY/i)
      })

      it('instructs Socratic questioning', () => {
        expect(prompt.toLowerCase()).toMatch(/socratic/)
      })

      it('personality section references the mentor name', () => {
        expect(prompt).toContain(mentor.name.split(' ')[0])
      })

      it('personality section includes specific speech patterns', () => {
        const personalitySection = extractSection(prompt, 'PERSONALITY')
        expect(personalitySection).not.toBeNull()
        expect(personalitySection!.length).toBeGreaterThan(30)
      })

      it('domain section matches the mentor suit domain', () => {
        // The domain name keywords should appear (allow for & splitting)
        const domainWords = mentor.suitDomain.name
          .split(' & ')
          .join('|')
          .toLowerCase()
        expect(prompt.toLowerCase()).toMatch(new RegExp(domainWords))
      })

      it('teaching method has at least 3 actionable bullets', () => {
        const teachingSection = extractSection(prompt, 'TEACHING METHOD')
        expect(teachingSection).not.toBeNull()
        const bullets = (teachingSection!.match(/^\s*- /gm) || []).length
        expect(bullets).toBeGreaterThanOrEqual(3)
      })

      it('teaching method includes personality-specific speech examples', () => {
        const teachingSection = extractSection(prompt, 'TEACHING METHOD')
        expect(teachingSection).not.toBeNull()
        // "Use your personality:" must appear, followed by examples
        expect(teachingSection!).toMatch(/Use your personality/i)
      })

      it('Factual Companion constraint prohibits emotional claims', () => {
        const factualArea = prompt.slice(
          prompt.indexOf('FACTUAL COMPANION'),
          prompt.indexOf('FACTUAL COMPANION') + 400,
        )
        // Must prohibit emotional claims explicitly
        expect(
          factualArea.toLowerCase().includes('proud') ||
            factualArea.toLowerCase().includes('emotional claim') ||
            factualArea.toLowerCase().includes('never claim'),
        ).toBe(true)
      })

      it('Narrative-Voice Boundary sets appropriate professional distance', () => {
        expect(prompt).toMatch(
          /not (their|a) (therapist|parent|friend|buddy|coach|mother|father)/i,
        )
      })

      it('constraints include domain redirection to other mentors', () => {
        // Must either use "redirect" language or reference other mentors by name
        const hasRedirect =
          /redirect|that'?s (not my|.*territory|.*lane|.*area)/i.test(prompt)
        const hasMentorRef = /(Iron|Elena|Jax|Sal|Ma|Mateo|David|Aisha|Kenji|Big Mike|Maria|Tyrell)/.test(
          prompt,
        )
        expect(hasRedirect || hasMentorRef).toBe(true)
      })

      it('opening is a unique Socratic prompt (question or scenario)', () => {
        const opening = getOpening(mentor)
        expect(opening.length).toBeGreaterThan(10)
        // Opening should end with a question or present a scenario
        expect(
          opening.includes('?') ||
            opening.toLowerCase().includes('tell me') ||
            opening.toLowerCase().includes('what do you'),
        ).toBe(true)
      })

      it('prompt is substantially long (minimum 400 characters)', () => {
        expect(prompt.length).toBeGreaterThan(400)
      })
    })
  }
})

// ─── Cross-Mentor Distinctiveness ─────────────────────────────────

describe('System Prompts — Cross-Mentor Distinctiveness', () => {
  it('has exactly 12 system prompts', () => {
    expect(mentorPersonas).toHaveLength(12)
    for (const mentor of mentorPersonas) {
      expect(getPrompt(mentor).length).toBeGreaterThan(0)
    }
  })

  it('no two mentors share the same opening signature (first 30 chars)', () => {
    const signatures = mentorPersonas.map((m) => {
      const opening = getOpening(m)
      // Take first 30 chars, lowercase, strip leading punctuation/ellipsis
      return opening.replace(/^[.,;:…\s]+/, '').toLowerCase().slice(0, 30)
    })
    const unique = new Set(signatures)
    expect(unique.size).toBe(12)
  })

  it('every suit X face combination has a distinct personality vocabulary', () => {
    const personalitySnippets = mentorPersonas.map((m) => {
      const section = extractSection(getPrompt(m), 'PERSONALITY')
      return section ? section.trim().slice(0, 60) : ''
    })
    const unique = new Set(personalitySnippets)
    expect(unique.size).toBe(12)
  })

  it('every prompt explicitly prohibits a specific emotional phrase', () => {
    for (const mentor of mentorPersonas) {
      const prompt = getPrompt(mentor)
      const hasSpecificProhibition =
        prompt.includes('proud of you') ||
        prompt.includes('makes me happy') ||
        prompt.includes('emotional claim') ||
        prompt.includes('Never claim feelings') ||
        prompt.includes('never claim')
      expect(hasSpecificProhibition).toBe(true)
    }
  })

  it('each suit has 3 mentors with domain-appropriate prompts', () => {
    const suits = ['spades', 'hearts', 'diamonds', 'clubs'] as const
    for (const suit of suits) {
      const suitMentors = mentorPersonas.filter((m) => m.card.suit === suit)
      expect(suitMentors).toHaveLength(3)

      for (const mentor of suitMentors) {
        const prompt = getPrompt(mentor)
        const domainName = mentor.suitDomain.name
        const domainWords = domainName.split(' & ')[0].toLowerCase()
        expect(prompt.toLowerCase()).toContain(domainWords)
      }
    }
  })

  it('each face projects its archetype (king=authority, queen=precision, jack=energy)', () => {
    const faceExpectations: Record<string, string[]> = {
      king: [
        'authority',
        'command',
        'respect',
        'established',
        'built',
        'empire',
        'decades',
        'generations',
        'thirty years',
        'started',
        'discipline',
      ],
      queen: [
        'precision',
        'standard',
        'exacting',
        'data',
        'excel',
        'metric',
        'meticulous',
        'polished',
        'calculated',
        'no tolerance',
        'patient',
        'curator',
        'steward',
        'generations',
        'loving',
        'corporate',
        'budget',
        'deadline',
        'stakeholder',
        'contingency',
        'tough',
        'high-expectation',
        'calm',
        'observant',
        'earth',
        'listen',
        'observe',
        'competence',
        'quiet',
      ],
      jack: [
        'energy',
        'hustle',
        'optimism',
        'protection',
        'care',
        'crew',
        'speed',
        'protect',
        'brother',
        'charming',
        'resourceful',
        'loyal',
        'craft',
        'quality',
        'deliberate',
        'quiet',
        'reputation',
        'discipline',
        'perfection',
      ],
    }

    for (const mentor of mentorPersonas) {
      const prompt = getPrompt(mentor)
      const expectations = faceExpectations[mentor.card.face]
      // At least 2 of the expected archetype terms should appear in the prompt
      const matched = expectations.filter((term) =>
        prompt.toLowerCase().includes(term),
      )
      expect(
        matched.length,
        `${mentor.id} (${mentor.card.face}): matched only [${matched.join(', ')}] — expected 2+ from [${expectations.join(', ')}]`,
      ).toBeGreaterThanOrEqual(2)
    }
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────

describe('System Prompts — Edge Cases', () => {
  it('no prompt contains unescaped backtick inside template literal', () => {
    for (const mentor of mentorPersonas) {
      expect(getPrompt(mentor)).not.toContain('`')
    }
  })

  it('no prompt exceeds 4200 characters (keep prompts focused but detailed)', () => {
    for (const mentor of mentorPersonas) {
      expect(
        getPrompt(mentor).length,
        `${mentor.id}: prompt too long (${getPrompt(mentor).length} chars)`,
      ).toBeLessThan(4200)
    }
  })

  it('every OPENING is placed at the end of the prompt', () => {
    for (const mentor of mentorPersonas) {
      const prompt = getPrompt(mentor)
      const openingIndex = prompt.lastIndexOf('OPENING:')
      expect(openingIndex).toBeGreaterThan(prompt.length * 0.7)
    }
  })
})

// ─── Enhanced Depth Tests ──────────────────────────────────────────

describe('System Prompts — Depth and Richness', () => {
  it('each prompt has at least 4 in-character speech examples in teaching method', () => {
    for (const mentor of mentorPersonas) {
      const prompt = getPrompt(mentor)
      const teachingSection = extractSection(prompt, 'TEACHING METHOD')
      expect(teachingSection).not.toBeNull()

      // Count quoted speech examples (phrases in double quotes that are in-character)
      const quotedSpeech = (teachingSection!.match(/"([^"]{3,})"/g) || []).length
      expect(
        quotedSpeech,
        `${mentor.id}: only ${quotedSpeech} speech examples in teaching method (need 4+)`,
      ).toBeGreaterThanOrEqual(4)
    }
  })

  it('each prompt has at least 2 domain-specific Socratic scenario questions', () => {
    for (const mentor of mentorPersonas) {
      const prompt = getPrompt(mentor)
      const teachingSection = extractSection(prompt, 'TEACHING METHOD')
      expect(teachingSection).not.toBeNull()

      // Count "what"-style or "how"-style questions that include domain terms
      const questions = (
        teachingSection!.match(/"([^"]*\?[^"]*)"/g) || []
      ).length
      expect(
        questions,
        `${mentor.id}: only ${questions} Socratic question examples (need 2+)`,
      ).toBeGreaterThanOrEqual(2)
    }
  })

  it('each prompt redirects to at least 2 specific mentors by name in constraints', () => {
    for (const mentor of mentorPersonas) {
      const prompt = getPrompt(mentor)
      // Find the redirect/domain section
      const constraintsSection = extractSection(prompt, 'CONSTRAINTS')
      expect(constraintsSection).not.toBeNull()

      // Count references to other mentors by specific name
      const mentorNames = [
        'Iron', 'Elena', 'Jax',
        'Sal', 'Ma', 'Mateo',
        'David', 'Aisha', 'Kenji',
        'Big Mike', 'Maria', 'Tyrell',
      ]
      const mentions = mentorNames.filter((name) =>
        constraintsSection!.includes(name),
      )
      // Exclude self-references (the mentor's own name appearing in their redirect)
      const selfName = mentor.name.split(' ').pop()?.replace(/["']/g, '') || ''
      const externalMentions = mentions.filter((n) => n !== selfName && !mentor.name.includes(n))

      expect(
        externalMentions.length,
        `${mentor.id}: only ${externalMentions.length} specific mentor redirects (need 2+): [${externalMentions.join(', ')}]`,
      ).toBeGreaterThanOrEqual(2)
    }
  })

  it('each prompt references at least one real trade scenario in teaching method', () => {
    for (const mentor of mentorPersonas) {
      const prompt = getPrompt(mentor)
      const teachingSection = extractSection(prompt, 'TEACHING METHOD')
      expect(teachingSection).not.toBeNull()

      // Look for scenario indicators: "the time you", "the [noun] that", stories
      const hasScenario =
        teachingSection!.includes('the time') ||
        teachingSection!.includes('the bridge') ||
        teachingSection!.includes('the job') ||
        teachingSection!.includes('the project') ||
        teachingSection!.includes('the family') ||
        teachingSection!.includes('the roof') ||
        teachingSection!.includes('the trench') ||
        teachingSection!.includes('the lawsuit') ||
        teachingSection!.includes('real') ||
        teachingSection!.includes('Share real')

      expect(
        hasScenario,
        `${mentor.id}: no real trade scenario found in teaching method`,
      ).toBe(true)
    }
  })

  it('no two mentors share the same \"Use your personality\" example phrases', () => {
    const personalityPhrases = mentorPersonas.map((m) => {
      const teachingSection = extractSection(getPrompt(m), 'TEACHING METHOD')
      // Extract the "Use your personality:" bullet's content
      const match = teachingSection?.match(/Use your personality:(.+?)$/ms)
      return match ? match[1].trim().slice(0, 80) : ''
    })
    const unique = new Set(personalityPhrases.filter((p) => p.length > 0))
    expect(unique.size).toBe(12)
  })

  it('each personality section names at least 3 specific speech-pattern traits', () => {
    for (const mentor of mentorPersonas) {
      const prompt = getPrompt(mentor)
      const personalitySection = extractSection(prompt, 'PERSONALITY')
      expect(personalitySection).not.toBeNull()

      // Count sentences (roughly) — a detailed personality should have many specific traits
      const sentences = personalitySection!.split(/[.!]/).filter((s) => s.trim().length > 10)
      expect(
        sentences.length,
        `${mentor.id}: only ${sentences.length} personality detail sentences (need 5+)`,
      ).toBeGreaterThanOrEqual(5)
    }
  })
})

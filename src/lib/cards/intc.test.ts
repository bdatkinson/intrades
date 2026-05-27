import { describe, it, expect } from 'vitest'
import { Intc, IntcImportError, exportIntcDeck, downloadIntc, importIntc } from './intc'
import type { Card } from './types'

const sampleCards: Card[] = [
  { id: 'seed-hammer-1', suit: 'hammer', value: 1, name: 'Framing Hammer', description: 'Drive nails, pull lumber.' },
  { id: 'seed-wrench-2', suit: 'wrench', value: 2, name: 'Pipe Wrench', description: 'Serrated jaw grip.' },
  { id: 'seed-voltmeter-3', suit: 'voltmeter', value: 3, name: 'Digital Multimeter', description: 'Diagnostic workhorse.' },
]

// ─── Intc namespace (legacy) ─────────────────────────────────

describe('Intc.export', () => {
  it('returns a JSON string with version, cards, and meta', () => {
    const result = Intc.export(sampleCards, 'Test Author')
    const parsed = JSON.parse(result)

    expect(parsed.version).toBe(1)
    expect(parsed.cards).toHaveLength(3)
    expect(parsed.cards[0].id).toBe('seed-hammer-1')
    expect(parsed.meta.author).toBe('Test Author')
    expect(parsed.meta.created).toBeDefined()
    expect(typeof parsed.meta.created).toBe('string')
  })

  it('stamps created as ISO 8601', () => {
    const result = Intc.export(sampleCards, 'Author')
    const parsed = JSON.parse(result)
    const date = new Date(parsed.meta.created)
    expect(date.getTime()).toBeGreaterThan(0)
    expect(isNaN(date.getTime())).toBe(false)
  })

  it('handles empty cards array', () => {
    const result = Intc.export([], 'Author')
    const parsed = JSON.parse(result)
    expect(parsed.version).toBe(1)
    expect(parsed.cards).toHaveLength(0)
  })

  it('accepts an optional deck name in meta', () => {
    const result = Intc.export(sampleCards, 'Author', 'My Deck')
    const parsed = JSON.parse(result)
    expect(parsed.meta.name).toBe('My Deck')
  })
})

describe('Intc.import', () => {
  it('round-trips: export then import returns original cards', () => {
    const exported = Intc.export(sampleCards, 'Author')
    const imported = Intc.import(exported)
    expect(imported).toHaveLength(3)
    expect(imported[0]).toEqual(sampleCards[0])
    expect(imported[1]).toEqual(sampleCards[1])
  })

  it('throws IntcImportError for invalid JSON', () => {
    expect(() => Intc.import('not json')).toThrow('Invalid .intc file')
  })

  it('throws IntcImportError when version is missing', () => {
    const bad = JSON.stringify({ cards: sampleCards })
    expect(() => Intc.import(bad)).toThrow('Invalid .intc file')
  })

  it('throws IntcImportError when version is not 1', () => {
    const bad = JSON.stringify({ version: 2, cards: sampleCards })
    expect(() => Intc.import(bad)).toThrow('Unsupported .intc version')
  })

  it('throws IntcImportError for malformed cards', () => {
    const bad = JSON.stringify({ version: 1, cards: [{ id: 'x', suit: 'invalid', value: 99 }] })
    expect(() => Intc.import(bad)).toThrow('Invalid card data')
  })
})

// ─── Standalone functions (new API) ──────────────────────────

describe('exportIntcDeck', () => {
  it('builds a valid IntcFile with format version 1 and cards array', () => {
    const result = exportIntcDeck(sampleCards)
    expect(result.version).toBe(1)
    expect(result.cards).toHaveLength(3)
    expect(result.cards[0].id).toBe('seed-hammer-1')
  })

  it('accepts optional name and author metadata', () => {
    const result = exportIntcDeck(sampleCards, { name: 'Test Deck', author: 'Benjamin Atkinson' })
    expect(result.meta?.name).toBe('Test Deck')
    expect(result.meta?.author).toBe('Benjamin Atkinson')
  })

  it('stamps created timestamp in ISO 8601', () => {
    const result = exportIntcDeck(sampleCards, { author: 'Test' })
    expect(result.meta?.created).toBeDefined()
    expect(() => new Date(result.meta!.created!)).not.toThrow()
  })

  it('returns an empty meta when no options provided', () => {
    const result = exportIntcDeck(sampleCards)
    expect(result.meta).toBeUndefined()
  })
})

describe('importIntc', () => {
  it('validates and returns a valid IntcFile', () => {
    const exported = exportIntcDeck(sampleCards, { name: 'Test Deck', author: 'Test Author' })
    const imported = importIntc(exported)
    expect(imported.version).toBe(1)
    expect(imported.cards).toHaveLength(3)
    expect(imported.cards[0].id).toBe('seed-hammer-1')
    expect(imported.meta?.name).toBe('Test Deck')
    expect(imported.meta?.author).toBe('Test Author')
  })

  it('throws IntcImportError when version is not 1', () => {
    expect(() => importIntc({ version: 2, cards: sampleCards })).toThrow(IntcImportError)
  })

  it('throws IntcImportError when cards is missing or not an array', () => {
    expect(() => importIntc({ version: 1 })).toThrow(IntcImportError)
    expect(() => importIntc({ version: 1, cards: 'not-an-array' })).toThrow(IntcImportError)
  })

  it('throws IntcImportError when a card has invalid suit', () => {
    expect(() => importIntc({
      version: 1,
      cards: [{ id: 'x', suit: 'invalid-suit', value: 1, name: 'X', description: '' }],
    })).toThrow(IntcImportError)
  })

  it('throws IntcImportError when a card value is out of range', () => {
    expect(() => importIntc({
      version: 1,
      cards: [{ id: 'x', suit: 'hammer', value: 14, name: 'X', description: '' }],
    })).toThrow(IntcImportError)
  })
})

describe('IntcImportError', () => {
  it('is an instance of Error', () => {
    const err = new IntcImportError('test error', [{ path: 'cards', message: 'invalid' }])
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('IntcImportError')
  })

  it('carries structured issues array', () => {
    const issues = [
      { path: 'version', message: 'Expected literal 1, got 2' },
      { path: 'cards.0.suit', message: 'Invalid suit value' },
    ]
    const err = new IntcImportError('Schema validation failed', issues)
    expect(err.message).toBe('Schema validation failed')
    expect(err.issues).toEqual(issues)
  })
})

describe('downloadIntc', () => {
  it('triggers a download with the correct filename and content type', () => {
    const createdUrls: string[] = []
    const revokedUrls: string[] = []
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = (blob: Blob) => {
      const url = `blob:mock-${createdUrls.length}`
      createdUrls.push(url)
      return url
    }
    URL.revokeObjectURL = (url: string) => { revokedUrls.push(url) }

    // Mock anchor click
    const anchorClicks: { href: string; download: string }[] = []
    const originalCreateElement = document.createElement.bind(document)
    document.createElement = ((tag: string) => {
      if (tag === 'a') {
        const el = originalCreateElement('a')
        const originalClick = el.click.bind(el)
        el.click = () => {
          anchorClicks.push({ href: el.href, download: el.download })
          originalClick()
        }
        return el
      }
      return originalCreateElement(tag)
    }) as typeof document.createElement

    try {
      downloadIntc(sampleCards, { name: 'Test Deck', author: 'Test' }, 'test-deck.intc')
      expect(createdUrls).toHaveLength(1)
      expect(revokedUrls).toHaveLength(1)
      expect(anchorClicks).toHaveLength(1)
      expect(anchorClicks[0].download).toBe('test-deck.intc')
    } finally {
      URL.createObjectURL = originalCreateObjectURL
      URL.revokeObjectURL = originalRevokeObjectURL
      document.createElement = originalCreateElement
    }
  })

  it('uses a default filename when none provided', () => {
    const createdUrls: string[] = []
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = (_blob: Blob) => {
      const url = `blob:mock`
      createdUrls.push(url)
      return url
    }

    const anchorClicks: { download: string }[] = []
    const originalCreateElement = document.createElement.bind(document)
    document.createElement = ((tag: string) => {
      if (tag === 'a') {
        const el = originalCreateElement('a')
        const originalClick = el.click.bind(el)
        el.click = () => {
          anchorClicks.push({ download: el.download })
          originalClick()
        }
        return el
      }
      return originalCreateElement(tag)
    }) as typeof document.createElement

    try {
      downloadIntc(sampleCards)
      expect(anchorClicks[0].download).toBe('deck.intc')
    } finally {
      URL.createObjectURL = originalCreateObjectURL
      URL.revokeObjectURL = originalRevokeObjectURL
      document.createElement = originalCreateElement
    }
  })
})

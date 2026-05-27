import type { Card } from './types'
import { IntcFileSchema } from './schema'
import type { IntcFile } from './schema'
import { ZodError } from 'zod'

// ─── IntcImportError ────────────────────────────────────────────

/** Structured error thrown by importIntc() when validation fails. */
export class IntcImportError extends Error {
  name = 'IntcImportError' as const

  /** Validation issues — each with a path and message. */
  issues: Array<{ path: string; message: string }>

  constructor(message: string, issues: Array<{ path: string; message: string }> = []) {
    super(message)
    this.issues = issues
  }
}

// ─── exportIntcDeck ─────────────────────────────────────────────

export interface ExportOptions {
  name?: string
  author?: string
}

/**
 * Build a versioned .intc file object from a cards array.
 *
 * Format: `{ version: 1, cards: Card[], meta?: { name?, author?, created? } }`
 */
export function exportIntcDeck(cards: Card[], opts?: ExportOptions): IntcFile {
  const result: IntcFile = {
    version: 1 as const,
    cards,
  }

  if (opts && (opts.name || opts.author)) {
    result.meta = {
      ...(opts.name ? { name: opts.name } : {}),
      ...(opts.author ? { author: opts.author } : {}),
      created: new Date().toISOString(),
    }
  }

  return result
}

// ─── downloadIntc ───────────────────────────────────────────────

/**
 * Build and trigger a browser download of the deck as a `.intc` file.
 *
 * Creates a JSON Blob, attaches it to a hidden anchor element,
 * clicks it, and cleans up.
 */
export function downloadIntc(
  cards: Card[],
  opts?: ExportOptions,
  filename: string = 'deck.intc',
): void {
  const intc = exportIntcDeck(cards, opts)
  const json = JSON.stringify(intc, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── importIntc ─────────────────────────────────────────────────

/**
 * Validate and parse a raw .intc file payload.
 *
 * Returns the validated `IntcFile` on success.
 * Throws `IntcImportError` with structured issues on failure.
 */
export function importIntc(raw: unknown): IntcFile {
  const result = IntcFileSchema.safeParse(raw)

  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))
    throw new IntcImportError('Invalid .intc file: schema validation failed', issues)
  }

  return result.data
}

// ─── Legacy Intc namespace (for backward compat) ────────────────

/**
 * @deprecated Use the standalone functions (exportIntcDeck, downloadIntc, importIntc) instead.
 */
export const Intc = {
  export(cards: Card[], author: string, name?: string): string {
    const doc = exportIntcDeck(cards, { author, name })
    return JSON.stringify(doc, null, 2)
  },

  import(json: string): Card[] {
    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch {
      throw new IntcImportError('Invalid .intc file: not valid JSON')
    }

    if (typeof parsed !== 'object' || parsed === null || !('version' in parsed)) {
      throw new IntcImportError('Invalid .intc file: missing version')
    }

    const version = (parsed as Record<string, unknown>).version
    if (version !== 1) {
      throw new IntcImportError(`Unsupported .intc version: ${version}`)
    }

    try {
      const result = IntcFileSchema.parse(parsed)
      return result.cards
    } catch (err) {
      if (err instanceof ZodError) {
        throw new IntcImportError('Invalid card data in .intc file')
      }
      throw err
    }
  },
}

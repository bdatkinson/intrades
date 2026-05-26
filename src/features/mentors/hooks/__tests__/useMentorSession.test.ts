import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMentorSession } from '../useMentorSession'
import type { MentorSession, DialogueMessage } from '../../types'

// ─── localStorage mock ───────────────────────────────────────────

const createLocalStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string): string | null => {
      return store[key] ?? null
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
}

let localStorageMock: ReturnType<typeof createLocalStorageMock>

beforeEach(() => {
  localStorageMock = createLocalStorageMock()
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
})

// ─── Helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'mentor-chat-iron-thorne'

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

function makeSavedSession(): MentorSession {
  return {
    mentorId: 'iron-thorne',
    messages: [
      makeMessage({ role: 'user', content: 'How do I weld overhead?' }),
      makeMessage({
        role: 'mentor',
        content: 'You need to adjust your travel speed and angle.',
      }),
    ],
    gatesPassed: 1,
    currentTopic: 'Overhead Welding',
    startedAt: Date.now() - 3600000,
  }
}

// ─── Tests ───────────────────────────────────────────────────────

describe('useMentorSession', () => {
  // ─── Initial State ─────────────────────────────────────────────

  it('returns a fresh session when no saved session exists', () => {
    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne' }),
    )

    expect(result.current.session.mentorId).toBe('iron-thorne')
    expect(result.current.session.messages).toEqual([])
    expect(result.current.session.gatesPassed).toBe(0)
    expect(typeof result.current.session.startedAt).toBe('number')
    expect(result.current.hasSavedSession).toBe(false)
    expect(result.current.isResumed).toBe(false)
  })

  it('detects a saved session on mount', () => {
    const saved = makeSavedSession()
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(saved))

    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne' }),
    )

    expect(result.current.hasSavedSession).toBe(true)
    expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY)
  })

  it('does not auto-load saved session — starts fresh by default', () => {
    const saved = makeSavedSession()
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(saved))

    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne' }),
    )

    expect(result.current.session.messages).toEqual([])
    expect(result.current.session.gatesPassed).toBe(0)
    expect(result.current.isResumed).toBe(false)
  })

  it('sets isResumed when initialSession is provided', () => {
    const initial = makeSavedSession()

    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne', initialSession: initial }),
    )

    expect(result.current.session.messages).toEqual(initial.messages)
    expect(result.current.isResumed).toBe(true)
  })

  it('uses mentorId from initialSession if set', () => {
    const initial = makeSavedSession()

    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne', initialSession: initial }),
    )

    expect(result.current.session.mentorId).toBe('iron-thorne')
  })

  // ─── Resume Session ────────────────────────────────────────────

  it('resumeSession loads the saved session into active state', () => {
    const saved = makeSavedSession()
    // mockReturnValue (not Once) — check() consumes one call, resumeSession() needs the second
    localStorageMock.getItem.mockReturnValue(JSON.stringify(saved))

    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne' }),
    )

    act(() => {
      result.current.resumeSession()
    })

    expect(result.current.session.messages).toEqual(saved.messages)
    expect(result.current.session.gatesPassed).toBe(1)
    expect(result.current.session.currentTopic).toBe('Overhead Welding')
    expect(result.current.isResumed).toBe(true)
  })

  it('resumeSession is a no-op when no saved session exists', () => {
    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne' }),
    )

    const beforeSession = result.current.session

    act(() => {
      result.current.resumeSession()
    })

    expect(result.current.session).toBe(beforeSession)
  })

  // ─── Save / Auto-persist ───────────────────────────────────────

  it('auto-persists session to localStorage when session changes', () => {
    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne' }),
    )

    const updated: MentorSession = {
      ...result.current.session,
      messages: [makeMessage({ role: 'user', content: 'New message' })],
      gatesPassed: 1,
    }

    act(() => {
      result.current.setSession(updated)
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(updated),
    )
  })

  it('does not persist empty sessions (no messages)', () => {
    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne' }),
    )

    // Reset setItem call count from mount
    localStorageMock.setItem.mockClear()

    // Session with no messages shouldn't trigger save
    const emptySession: MentorSession = {
      mentorId: 'iron-thorne',
      messages: [],
      gatesPassed: 0,
      startedAt: Date.now(),
    }

    act(() => {
      result.current.setSession(emptySession)
    })

    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })

  // ─── Delete Session ────────────────────────────────────────────

  it('deleteSession clears localStorage and resets to fresh session', () => {
    const saved = makeSavedSession()
    // mockReturnValue (not Once) — check() + resumeSession() both call getItem
    localStorageMock.getItem.mockReturnValue(JSON.stringify(saved))

    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne' }),
    )

    // First resume
    act(() => {
      result.current.resumeSession()
    })

    expect(result.current.session.messages.length).toBeGreaterThan(0)

    // Then delete
    act(() => {
      result.current.deleteSession()
    })

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY)
    expect(result.current.session.messages).toEqual([])
    expect(result.current.session.gatesPassed).toBe(0)
    expect(result.current.hasSavedSession).toBe(false)
    expect(result.current.isResumed).toBe(false)
  })

  // ─── Corrupt Data Handling ─────────────────────────────────────

  it('handles corrupt localStorage data gracefully (hasSavedSession = false)', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-valid-json')

    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne' }),
    )

    expect(result.current.hasSavedSession).toBe(false)
    expect(result.current.session.messages).toEqual([])
  })

  it('handles invalid session shape (missing messages array)', () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ mentorId: 'iron-thorne', gatesPassed: 5 }),
    )

    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne' }),
    )

    expect(result.current.hasSavedSession).toBe(false)
  })

  it('handles invalid session shape (wrong mentorId)', () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify(makeSavedSession()),
    )

    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'different-mentor' }),
    )

    expect(result.current.hasSavedSession).toBe(false)
  })

  // ─── Multiple mentor sessions ──────────────────────────────────

  it('uses separate storage keys for different mentors', () => {
    const savedIron = makeSavedSession()
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedIron))

    renderHook(() => useMentorSession({ mentorId: 'iron-thorne' }))

    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      'mentor-chat-iron-thorne',
    )
  })

  // ─── Session startedAt preservation ────────────────────────────

  it('preserves startedAt when resuming a saved session', () => {
    const saved = makeSavedSession()
    saved.startedAt = 1700000000000
    // mockReturnValue (not Once) — check() consumes one call, resumeSession() needs the second
    localStorageMock.getItem.mockReturnValue(JSON.stringify(saved))

    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne' }),
    )

    act(() => {
      result.current.resumeSession()
    })

    expect(result.current.session.startedAt).toBe(1700000000000)
  })

  // ─── autoLoad option ───────────────────────────────────────────

  it('autoLoad: synchronously loads saved session on mount', () => {
    const saved = makeSavedSession()
    localStorageMock.getItem.mockReturnValue(JSON.stringify(saved))

    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne', autoLoad: true }),
    )

    expect(result.current.session.messages).toEqual(saved.messages)
    expect(result.current.session.gatesPassed).toBe(1)
    expect(result.current.isResumed).toBe(true)
    expect(result.current.hasSavedSession).toBe(false)
  })

  it('autoLoad: starts fresh when no saved session exists', () => {
    const { result } = renderHook(() =>
      useMentorSession({ mentorId: 'iron-thorne', autoLoad: true }),
    )

    expect(result.current.session.messages).toEqual([])
    expect(result.current.isResumed).toBe(false)
    expect(result.current.hasSavedSession).toBe(false)
  })

  it('autoLoad: localStorage takes precedence over initialSession', () => {
    const saved = makeSavedSession()
    localStorageMock.getItem.mockReturnValue(JSON.stringify(saved))

    const initial: MentorSession = {
      mentorId: 'iron-thorne',
      messages: [makeMessage({ content: 'From prop' })],
      gatesPassed: 0,
      startedAt: Date.now(),
    }

    const { result } = renderHook(() =>
      useMentorSession({
        mentorId: 'iron-thorne',
        autoLoad: true,
        initialSession: initial,
      }),
    )

    // Saved session should win
    expect(result.current.session.messages).toEqual(saved.messages)
    expect(result.current.session.gatesPassed).toBe(1)
  })

  it('autoLoad: uses initialSession when no saved session exists', () => {
    const initial: MentorSession = {
      mentorId: 'iron-thorne',
      messages: [makeMessage({ content: 'From prop' })],
      gatesPassed: 0,
      startedAt: Date.now(),
    }

    const { result } = renderHook(() =>
      useMentorSession({
        mentorId: 'iron-thorne',
        autoLoad: true,
        initialSession: initial,
      }),
    )

    expect(result.current.session.messages[0].content).toBe('From prop')
    expect(result.current.isResumed).toBe(true)
  })
})

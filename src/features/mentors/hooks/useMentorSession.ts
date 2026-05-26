import { useState, useEffect, useCallback, useRef } from 'react'
import type { MentorSession } from '../types'

// ─── Constants ───────────────────────────────────────────────────

const STORAGE_PREFIX = 'mentor-chat-'

// ─── localStorage abstraction ────────────────────────────────────

interface StorageAdapter {
  load(): MentorSession | null
  save(session: MentorSession): void
  remove(): void
  check(): boolean
}

function createStorageAdapter(mentorId: string): StorageAdapter {
  const key = `${STORAGE_PREFIX}${mentorId}`

  return {
    load(): MentorSession | null {
      try {
        const raw = localStorage.getItem(key)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        if (
          parsed &&
          typeof parsed.mentorId === 'string' &&
          parsed.mentorId === mentorId &&
          Array.isArray(parsed.messages)
        ) {
          return parsed as MentorSession
        }
        return null
      } catch {
        return null
      }
    },

    save(session: MentorSession): void {
      try {
        localStorage.setItem(key, JSON.stringify(session))
      } catch {
        // localStorage quota exceeded — silently fail
      }
    },

    remove(): void {
      localStorage.removeItem(key)
    },

    check(): boolean {
      return this.load() !== null
    },
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

function freshSession(mentorId: string): MentorSession {
  return {
    mentorId,
    messages: [],
    gatesPassed: 0,
    startedAt: Date.now(),
  }
}

// ─── Options & Return types ──────────────────────────────────────

interface UseMentorSessionOptions {
  mentorId: string
  initialSession?: MentorSession
  /** If true, auto-loads saved session on mount (synchronous). Default: false. */
  autoLoad?: boolean
}

interface UseMentorSessionReturn {
  session: MentorSession
  setSession: (session: MentorSession) => void
  hasSavedSession: boolean
  resumeSession: () => void
  deleteSession: () => void
  isResumed: boolean
}

// ─── Hook ────────────────────────────────────────────────────────

export function useMentorSession({
  mentorId,
  initialSession,
  autoLoad = false,
}: UseMentorSessionOptions): UseMentorSessionReturn {
  const storage = useRef(createStorageAdapter(mentorId))

  // hasSavedSession: check localStorage on mount (only for non-resumed starts)
  const [hasSavedSession, setHasSavedSession] = useState(() => {
    if (initialSession || autoLoad) return false
    return storage.current.check()
  })

  // Core session state
  const [session, setSessionState] = useState<MentorSession>(() => {
    if (autoLoad) {
      const saved = storage.current.load()
      if (saved) return { ...saved, mentorId }
    }
    if (initialSession) return { ...initialSession, mentorId }
    return freshSession(mentorId)
  })

  const [isResumed, setIsResumed] = useState(() => {
    if (autoLoad && storage.current.check()) return true
    if (initialSession != null) return true
    return false
  })

  // ── Auto-persist to localStorage ───────────────────────────────

  useEffect(() => {
    if (session.messages.length > 0) {
      storage.current.save(session)
    }
  }, [session])

  // ── Resume ─────────────────────────────────────────────────────

  const resumeSession = useCallback(() => {
    const saved = storage.current.load()
    if (!saved) return
    setSessionState({ ...saved, mentorId })
    setHasSavedSession(false)
    setIsResumed(true)
  }, [mentorId])

  // ── Delete ─────────────────────────────────────────────────────

  const deleteSession = useCallback(() => {
    storage.current.remove()
    setSessionState(freshSession(mentorId))
    setHasSavedSession(false)
    setIsResumed(false)
  }, [mentorId])

  // ── Set session (public setter) ────────────────────────────────

  const setSession = useCallback((newSession: MentorSession) => {
    setSessionState(newSession)
  }, [])

  return {
    session,
    setSession,
    hasSavedSession,
    resumeSession,
    deleteSession,
    isResumed,
  }
}

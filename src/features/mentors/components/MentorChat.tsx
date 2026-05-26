import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import type { MentorPersona, MentorSession, DialogueMessage, QualityGateResult, Suit } from '../types'
import { DialogueEngine } from '../dialogue'
import { useMentorSession } from '../hooks/useMentorSession'
import type { AIMessage, AIOptions } from '../../../types/ai'

// ─── AI Provider interface (duck-typed, matches dialogue.ts) ─────

interface AIProvider {
  sendMessage(messages: AIMessage[], options: AIOptions): Promise<string>
}

// ─── Suit color mapping ──────────────────────────────────────────

const suitColorMap: Record<
  Suit,
  { border: string; text: string; bg: string }
> = {
  spades: { border: 'border-slate-500', text: 'text-slate-300', bg: 'bg-slate-900/50' },
  hearts: { border: 'border-rose-500', text: 'text-rose-300', bg: 'bg-rose-950/50' },
  diamonds: { border: 'border-amber-500', text: 'text-amber-300', bg: 'bg-amber-950/50' },
  clubs: { border: 'border-emerald-500', text: 'text-emerald-300', bg: 'bg-emerald-950/50' },
}

// ─── Helpers ─────────────────────────────────────────────────────

const AI_OPTIONS: AIOptions = { model: 'claude-sonnet-4-6', temperature: 1 }

/**
 * Extract the mentor's opening greeting from the system prompt.
 * Looks for "OPENING:" followed by the quoted greeting text.
 */
function extractOpening(systemPrompt: string): string | null {
  const match = systemPrompt.match(/OPENING:\s*["\u201C]([^"]+)["\u201D]/)
  if (!match) return null
  return match[1].trim()
}

function getFallbackGreeting(persona: MentorPersona): string {
  return (
    `I'm ${persona.nickname ?? persona.name}. ` +
    `I've been in ${persona.trade.toLowerCase()} for a long time. ` +
    `Ready to share what I know — if you're ready to listen.`
  )
}

function getGreetingMessage(persona: MentorPersona): DialogueMessage {
  const opening = extractOpening(persona.systemPrompt)
  return {
    id: 'greeting',
    role: 'mentor',
    content: opening ?? getFallbackGreeting(persona),
    timestamp: Date.now(),
  }
}

// ─── QualityGateIndicator ────────────────────────────────────────

function QualityGateIndicator({ gate }: { gate: QualityGateResult }) {
  const colorClass = gate.passed
    ? 'bg-emerald-500 text-emerald-100'
    : 'bg-red-500 text-red-100'

  return (
    <div className="mt-2 flex items-start gap-2">
      <span
        data-testid="quality-gate-indicator"
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider ${colorClass}`}
      >
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            gate.passed ? 'bg-emerald-200' : 'bg-red-200'
          }`}
        />
        {gate.passed ? 'Pass' : 'Fail'}
      </span>
      {gate.feedback && (
        <span className="text-[11px] text-slate-500 leading-relaxed">
          {gate.feedback}
        </span>
      )}
    </div>
  )
}

// ─── ChatMessage ─────────────────────────────────────────────────

function ChatMessageBubble({
  message,
  persona,
  isLast,
}: {
  message: DialogueMessage
  persona: MentorPersona
  isLast: boolean
}) {
  const isMentor = message.role === 'mentor'
  const suit = persona.card.suit
  const colors = suitColorMap[suit]

  return (
    <div
      className={`flex ${isMentor ? 'justify-start' : 'justify-end'} mb-3`}
    >
      <div
        data-testid="chat-message"
        data-message-id={message.id}
        className={`max-w-[80%] rounded-lg border px-4 py-3 ${
          isMentor
            ? `${colors.border} ${colors.bg} ${colors.text}`
            : 'border-slate-700 bg-slate-800/50 text-slate-200'
        }`}
      >
        {isMentor && (
          <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
            {persona.nickname ?? persona.name}
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        {message.qualityGate && (
          <QualityGateIndicator gate={message.qualityGate} />
        )}
      </div>
    </div>
  )
}

// ─── MentorChat ──────────────────────────────────────────────────

interface MentorChatProps {
  persona: MentorPersona
  aiProvider?: AIProvider
  initialSession?: MentorSession
}

export default function MentorChat({
  persona,
  aiProvider,
  initialSession,
}: MentorChatProps) {
  const engineRef = useRef(new DialogueEngine())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Session state via useMentorSession hook (autoLoad: localStorage wins over initialSession) ──
  const { session, setSession } =
    useMentorSession({ mentorId: persona.id, initialSession, autoLoad: true })

  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine if we should show greeting (empty session)
  const showGreeting = session.messages.length === 0

  // ── Auto-scroll to bottom when messages change ─────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [session.messages, loading, scrollToBottom])

  // ── Send message ──────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const content = inputValue.trim()
    if (!content || loading) return

    setInputValue('')
    setError(null)
    setLoading(true)

    try {
      if (!aiProvider) {
        throw new Error('AI provider not configured')
      }

      const updated = await engineRef.current.sendMessage(
        session,
        persona,
        content,
        aiProvider,
        AI_OPTIONS,
        { evaluateAfter: true },
      )

      setSession(updated)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [inputValue, loading, session, persona, aiProvider, setSession])

  // ── Keyboard handler ──────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      data-testid="mentor-chat"
      className="flex flex-col h-full bg-slate-950"
    >
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {showGreeting && (
          <div className="mb-4">
            <ChatMessageBubble
              message={getGreetingMessage(persona)}
              persona={persona}
              isLast={false}
            />
          </div>
        )}

        {session.messages.map((msg, idx) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            persona={persona}
            isLast={idx === session.messages.length - 1}
          />
        ))}

        {/* Loading indicator */}
        {loading && (
          <div data-testid="chat-loading" className="flex justify-start mb-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              <span className="text-sm text-slate-400 font-mono">
                {persona.nickname ?? persona.name} is thinking...
              </span>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="flex justify-center mb-3">
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-300 font-mono">{error}</span>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 font-mono focus:border-slate-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !inputValue.trim()}
            aria-label="Send"
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 font-mono text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, RotateCcw } from 'lucide-react'
import { mentorPersonas, SUIT_DOMAINS } from '../data/personas'
import { useMentorSession } from '../hooks/useMentorSession'
import type { MentorPersona } from '../types'

// ─── Suit color mapping ──────────────────────────────────────────

const suitColors: Record<
  MentorPersona['card']['suit'],
  Record<string, string>
> = {
  spades: {
    border: 'border-slate-500',
    text: 'text-slate-300',
    bg: 'bg-slate-900',
    muted: 'text-slate-500',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
  hearts: {
    border: 'border-rose-500',
    text: 'text-rose-300',
    bg: 'bg-rose-950',
    muted: 'text-rose-500',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  diamonds: {
    border: 'border-amber-500',
    text: 'text-amber-300',
    bg: 'bg-amber-950',
    muted: 'text-amber-500',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  clubs: {
    border: 'border-emerald-500',
    text: 'text-emerald-300',
    bg: 'bg-emerald-950',
    muted: 'text-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
}

const faceLabel: Record<MentorPersona['card']['face'], string> = {
  king: 'KING',
  queen: 'QUEEN',
  jack: 'JACK',
}

// ─── MentorDetailPage ─────────────────────────────────────────────
// Route: /mentors/:id — mentor detail with Resume / Start Chat options.

export default function MentorDetailPage() {
  const { id } = useParams<{ id: string }>()

  const navigate = useNavigate()

  const { hasSavedSession, deleteSession } = useMentorSession({
    mentorId: id ?? '',
  })

  const persona = mentorPersonas.find((m) => m.id === id)

  if (!persona) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-slate-400 font-mono text-sm">Mentor not found</p>
        <Link
          to="/mentors"
          className="mt-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 font-mono transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Mentors
        </Link>
      </div>
    )
  }

  const { card, name, trade, city, state, personalityVibe, whyQuote, background } =
    persona
  const colors = suitColors[card.suit]
  const domain = SUIT_DOMAINS[card.suit]

  // Count saved exchanges for the resume button
  const exchangeCount = (() => {
    try {
      const raw = localStorage.getItem(`mentor-chat-${persona.id}`)
      if (!raw) return 0
      const parsed = JSON.parse(raw)
      return Math.floor((parsed.messages?.length ?? 0) / 2)
    } catch {
      return 0
    }
  })()

  const handleNewSession = () => {
    deleteSession()
  }

  return (
    <div className="max-w-2xl mx-auto" data-testid="mentor-detail">
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/mentors"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 font-mono transition-colors"
          aria-label="Back to Mentors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Mentors
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`text-xs font-mono font-semibold tracking-wider ${colors.muted}`}
          >
            {faceLabel[card.face]}
          </span>
          <span className="text-xl" aria-label={card.suit}>
            {domain.symbol}
          </span>
          <span
            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors.badge}`}
          >
            {personalityVibe}
          </span>
        </div>

        <h1
          role="heading"
          className={`font-mono font-semibold text-2xl ${colors.text} mb-1`}
        >
          {name}
        </h1>
        <p className="text-sm text-slate-400 mb-1">{trade}</p>
        <p className="text-xs text-slate-500">
          {city}, {state}
        </p>
      </div>

      {/* Suit domain */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-1">
          Domain
        </p>
        <p className={`text-sm font-mono ${colors.text}`}>{domain.name}</p>
      </div>

      {/* Background */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-2">
          Background
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">{background}</p>
      </div>

      {/* Personality description */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-2">
          Personality
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          {persona.personalityDescription}
        </p>
      </div>

      {/* Why quote */}
      <div className="mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-2">
          Why
        </p>
        <blockquote className="text-sm text-slate-400 italic leading-relaxed border-l-2 border-slate-700 pl-3">
          &ldquo;{whyQuote}&rdquo;
        </blockquote>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {hasSavedSession && (
          <button
            type="button"
            onClick={() => navigate(`/mentors/${persona.id}/chat`)}
            aria-label="Resume Session"
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border ${colors.border} ${colors.bg} ${colors.text} font-mono text-sm hover:brightness-125 transition-all`}
          >
            <RotateCcw className="h-4 w-4" />
            Resume Session
            {exchangeCount > 0 && (
              <span className="text-xs text-slate-500">
                ({exchangeCount} exchange{exchangeCount !== 1 ? 's' : ''})
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            handleNewSession()
            navigate(`/mentors/${persona.id}/chat`)
          }}
          aria-label="Start Chat"
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border ${colors.border} bg-slate-900 ${colors.text} font-mono text-sm hover:brightness-125 transition-all`}
        >
          <MessageCircle className="h-4 w-4" />
          Start Chat
        </button>
      </div>
    </div>
  )
}

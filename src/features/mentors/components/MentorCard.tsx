import { MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { MentorPersona, Suit } from '../types'
import { SUIT_DOMAINS } from '../data/personas'

// ─── Suit color mapping ──────────────────────────────────────────
// Maps suit to Tailwind color classes for card accents.
// spades=slate-blue, hearts=rose, diamonds=amber, clubs=emerald

const suitColorMap: Record<
  Suit,
  { border: string; text: string; bg: string; muted: string; badge: string }
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

const FACE_LABEL: Record<MentorPersona['card']['face'], string> = {
  king: 'KING',
  queen: 'QUEEN',
  jack: 'JACK',
}

// ─── Component ───────────────────────────────────────────────────

interface MentorCardProps {
  persona: MentorPersona
}

export default function MentorCard({ persona }: MentorCardProps) {
  const { card, name, trade, city, state, personalityVibe, whyQuote } = persona
  const colors = suitColorMap[card.suit]
  const domain = SUIT_DOMAINS[card.suit]
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/mentors/' + persona.id)
  }

  return (
    <article
      data-testid={'mentor-card-' + persona.id}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className={'group relative rounded-lg border ' + colors.border + ' ' + colors.bg + ' p-5 flex flex-col overflow-hidden transition-shadow hover:shadow-lg hover:shadow-slate-900/50 cursor-pointer'}
    >
      {/* Card header: face + suit */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={'text-xs font-mono font-semibold tracking-wider ' + colors.muted}
          >
            {FACE_LABEL[card.face]}
          </span>
          <span className="text-lg" aria-label={card.suit}>
            {domain.symbol}
          </span>
        </div>
        <span
          className={'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ' + colors.badge}
        >
          {personalityVibe}
        </span>
      </div>

      {/* Name */}
      <h3
        className={'font-mono font-semibold text-base ' + colors.text + ' leading-snug mb-1'}
      >
        {name}
      </h3>

      {/* Trade */}
      <p className="text-sm text-slate-400 mb-1">{trade}</p>

      {/* City, State */}
      <p className="text-xs text-slate-500 mb-3">
        {city}, {state}
      </p>

      {/* Why quote */}
      <blockquote className="text-sm text-slate-400 italic leading-relaxed flex-1 border-l-2 border-slate-700 pl-3">
        &ldquo;{whyQuote}&rdquo;
      </blockquote>

      {/* Hover overlay: Start Dialogue */}
      <div
        data-testid="mentor-card-start-dialogue"
        className="absolute inset-0 flex items-center justify-center bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <button
          type="button"
          onClick={handleClick}
          className={'flex items-center gap-2 px-4 py-2 rounded-md border ' + colors.border + ' ' + colors.bg + ' ' + colors.text + ' font-mono text-sm hover:brightness-125 transition-all'}
        >
          <MessageCircle className="w-4 h-4" />
          Start Dialogue
        </button>
      </div>
    </article>
  )
}

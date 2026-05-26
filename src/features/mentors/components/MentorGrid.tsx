import { useState, useMemo } from 'react'
import type { Suit, MentorPersona } from '../types'
import { mentorPersonas, SUIT_DOMAINS } from '../data/personas'
import MentorCard from './MentorCard'

// ─── Suit color mapping for section headers ───────────────────────
// Maps suit to Tailwind classes for SuitSection headers.
// spades=slate, hearts=rose, diamonds=amber, clubs=emerald

const suitHeaderColors: Record<Suit, { border: string; text: string; bg: string; muted: string }> = {
  spades: {
    border: 'border-slate-500',
    text: 'text-slate-300',
    bg: 'bg-slate-900',
    muted: 'text-slate-500',
  },
  hearts: {
    border: 'border-rose-500',
    text: 'text-rose-300',
    bg: 'bg-rose-950',
    muted: 'text-rose-500',
  },
  diamonds: {
    border: 'border-amber-500',
    text: 'text-amber-300',
    bg: 'bg-amber-950',
    muted: 'text-amber-500',
  },
  clubs: {
    border: 'border-emerald-500',
    text: 'text-emerald-300',
    bg: 'bg-emerald-950',
    muted: 'text-emerald-500',
  },
}

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']

type TabFilter = 'all' | Suit

// ─── SuitSection ──────────────────────────────────────────────────

function SuitSection({ suit, mentors }: { suit: Suit; mentors: MentorPersona[] }) {
  const domain = SUIT_DOMAINS[suit]
  const colors = suitHeaderColors[suit]

  return (
    <section className="mb-8">
      {/* Section header */}
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${colors.border}`}>
        <span className="text-lg" aria-label={suit}>
          {domain.symbol}
        </span>
        <h2 className={`font-mono text-sm font-semibold ${colors.text} tracking-wide uppercase`}>
          {domain.name}
        </h2>
        <span className={`text-xs ${colors.muted} font-mono`}>
          {mentors.length}
        </span>
      </div>

      {/* Card grid — responsive 1→2→3 columns */}
      <div
        data-testid="suit-section-grid"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      >
        {mentors.map((mentor) => (
          <MentorCard key={mentor.id} persona={mentor} />
        ))}
      </div>
    </section>
  )
}

// ─── MentorGrid ───────────────────────────────────────────────────

export default function MentorGrid() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Per-suit counts for tab badges
  const suitCounts = useMemo(() => {
    const counts: Record<Suit, number> = { spades: 0, hearts: 0, diamonds: 0, clubs: 0 }
    for (const m of mentorPersonas) {
      counts[m.card.suit]++
    }
    return counts
  }, [])

  // Filtered and grouped mentors
  const filteredMentors = useMemo(() => {
    let results = mentorPersonas

    // Apply suit filter
    if (activeTab !== 'all') {
      results = results.filter((m) => m.card.suit === activeTab)
    }

    // Apply search filter (name or trade, case-insensitive)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(q) || m.trade.toLowerCase().includes(q),
      )
    }

    return results
  }, [activeTab, searchQuery])

  // Group filtered mentors by suit (in suit display order)
  const groupedBySuit = useMemo(() => {
    const groups: { suit: Suit; mentors: MentorPersona[] }[] = []
    for (const suit of SUITS) {
      const suitMentors = filteredMentors.filter((m) => m.card.suit === suit)
      if (suitMentors.length > 0) {
        groups.push({ suit, mentors: suitMentors })
      }
    }
    return groups
  }, [filteredMentors])

  const totalVisible = filteredMentors.length

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-mono mb-1">Mentor Deck</h1>
        <p className="text-sm text-slate-400">
          12 face card mentors — choose your guide
        </p>
      </div>

      {/* Tab bar */}
      <div role="tablist" className="flex gap-1 mb-4 border-b border-slate-800">
        <TabButton
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          count={12}
        >
          All
        </TabButton>
        {SUITS.map((suit) => (
          <TabButton
            key={suit}
            active={activeTab === suit}
            onClick={() => setActiveTab(suit)}
            count={suitCounts[suit]}
          >
            {SUIT_DOMAINS[suit].symbol} {suit}
          </TabButton>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or trade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-slate-500 transition-colors"
        />
      </div>

      {/* Results count */}
      {searchQuery.trim() && (
        <p className="text-xs text-slate-500 mb-4">
          {totalVisible} mentor{totalVisible !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Mentor sections */}
      {groupedBySuit.length > 0 ? (
        groupedBySuit.map(({ suit, mentors }) => (
          <SuitSection key={suit} suit={suit} mentors={mentors} />
        ))
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500 font-mono text-sm">No mentors found</p>
          <p className="text-slate-600 text-xs mt-1">Try a different search or filter</p>
        </div>
      )}
    </div>
  )
}

// ─── Tab Button ───────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-4 py-2 text-sm font-mono rounded-t-md border transition-colors flex items-center gap-2 capitalize
        ${
          active
            ? 'border-slate-700 border-b-slate-950 bg-slate-900 text-slate-100'
            : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
        }`}
    >
      <span>{children}</span>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          active ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-600'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

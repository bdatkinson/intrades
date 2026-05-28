import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Card, Suit } from '../../lib/cards/types'
import { SUITS, SUIT_META } from '../../lib/cards/types'
import { createSeedCards } from '../../lib/cards/seed'
import { SuitEmblem } from './SuitEmblems'

const PREVIEW_KEY = 'intrades-preview-cards'

type TabFilter = 'all' | Suit

/**
 * Showcase — student-facing preview of designer cards.
 *
 * Reads cards from sessionStorage (set by Workbench Preview button).
 * Falls back to seed cards if no preview data is present.
 * Shows "← Back to Designer" link only when arrived via preview.
 *
 * Design: OSHA placard / machine-label — no shadows, no gradients, hard corners.
 */
export function Showcase() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all')

  // One-shot read from sessionStorage on mount
  const [cards] = useState<Card[]>(() => {
    try {
      const raw = sessionStorage.getItem(PREVIEW_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          sessionStorage.removeItem(PREVIEW_KEY)
          return parsed as Card[]
        }
      }
    } catch {
      // Corrupt data — fall through to seed
    }
    return createSeedCards()
  })

  // Track whether we came from preview (for back button visibility)
  const [wasPreview] = useState<boolean>(() => {
    const seed = createSeedCards()
    const seedIds = new Set(seed.map((c) => c.id))
    const hasPreviewOrigin = cards.some((c) => !seedIds.has(c.id))
    return hasPreviewOrigin || cards.length !== seed.length
  })

  // Filtered cards by active tab
  const filteredCards = useMemo(
    () =>
      activeTab === 'all'
        ? cards
        : cards.filter((c) => c.suit === activeTab),
    [cards, activeTab],
  )

  // Per-suit counts
  const suitCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const suit of SUITS) {
      counts[suit] = cards.filter((c) => c.suit === suit).length
    }
    return counts
  }, [cards])

  const totalCount = cards.length

  return (
    <div data-testid="showcase-container" className="bg-zinc-950">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-mono uppercase tracking-widest text-zinc-100 text-xl mb-1">
          Student Preview
        </h1>
        <p className="text-sm text-zinc-400 font-mono">
          {totalCount} card{totalCount !== 1 ? 's' : ''} — as your student will see them
        </p>
      </div>

      {/* Back to Designer — only when arrived via Preview */}
      {wasPreview && (
        <Link
          to="/designer"
          className="inline-flex items-center gap-2 mb-4 font-mono text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Back to Designer"
        >
          <span aria-hidden="true">&larr;</span>
          Back to Designer
        </Link>
      )}

      {/* Suit Filter Tabs */}
      <div role="tablist" className="flex gap-0 mb-6 border-b border-zinc-700">
        <ShowcaseTab
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          count={totalCount}
        >
          All
        </ShowcaseTab>
        {SUITS.map((suit) => (
          <ShowcaseTab
            key={suit}
            active={activeTab === suit}
            onClick={() => setActiveTab(suit)}
            count={suitCounts[suit]}
          >
            <SuitEmblem suit={suit} size={14} />
            <span className="capitalize">{SUIT_META[suit].label}</span>
          </ShowcaseTab>
        ))}
      </div>

      {/* Card Grid */}
      {filteredCards.length === 0 ? (
        <p className="text-zinc-500 font-mono text-sm py-8 text-center">
          No cards match the selected filter.
        </p>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 carousel-grid-fallback"
          role="list"
          aria-label="Scenario cards"
        >
          {filteredCards.map((card) => (
            <ShowcaseCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab Button ────────────────────────────────────────────────────

function ShowcaseTab({
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
      className={`px-3 py-2 text-sm font-mono rounded-none border-b-2 transition-colors flex items-center gap-1.5
        ${
          active
            ? 'border-amber-500 text-amber-400 -mb-[2px]'
            : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
        }`}
    >
      <span className="flex items-center gap-1">{children}</span>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-none font-mono ${
          active ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-800 text-zinc-600'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

// ─── Individual Card ───────────────────────────────────────────────

function ShowcaseCard({ card }: { card: Card }) {
  const meta = SUIT_META[card.suit]

  return (
    <div
      role="listitem"
      aria-label={`${meta.label.toLowerCase()} ${card.value}: ${card.name}`}
      data-suit={card.suit}
      className="border-2 border-zinc-700 bg-zinc-900 p-4 rounded-none"
      style={{
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <SuitEmblem suit={card.suit} size={20} />
        <span className="font-mono text-xs text-zinc-500 tabular-nums">
          {card.value}
        </span>
      </div>
      <h2 className="font-mono font-semibold text-sm text-zinc-200 mb-1">
        {card.name}
      </h2>
      <p className="text-xs text-zinc-400 leading-relaxed">
        {card.description}
      </p>
    </div>
  )
}

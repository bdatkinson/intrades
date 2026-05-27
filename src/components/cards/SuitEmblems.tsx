import type { Suit } from '../../lib/cards/types'

/** Inline SVG emblems for each card designer suit. */
export function SuitEmblem({ suit, size = 24 }: { suit: Suit; size?: number }) {
  switch (suit) {
    case 'hammer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 12l-4-4m0 0l-3 3m3-3l3-3m-3 3l-3 7m3-7l3 7" />
          <path d="M8 21l2-2" />
          <rect x="3" y="6" width="4" height="8" rx="1" />
        </svg>
      )
    case 'wrench':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    case 'voltmeter':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <path d="M16 8l-4 4" />
        </svg>
      )
    case 'plumb-bob':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v8" />
          <path d="M12 10l-6 6" />
          <path d="M12 10l6 6" />
          <path d="M7 19l-2 3" />
          <path d="M17 19l2 3" />
          <circle cx="12" cy="18" r="2" />
        </svg>
      )
  }
}

/** All four suit emblems inline */
export function SuitEmblems({ size = 24 }: { size?: number }) {
  return (
    <div className="flex gap-2" aria-label="Suit emblems">
      <SuitEmblem suit="hammer" size={size} />
      <SuitEmblem suit="wrench" size={size} />
      <SuitEmblem suit="voltmeter" size={size} />
      <SuitEmblem suit="plumb-bob" size={size} />
    </div>
  )
}

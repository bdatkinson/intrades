import type { Suit } from '../../lib/cards/types'

/** Inline SVG emblems for each playing card suit. */
export function SuitEmblem({ suit, size = 24 }: { suit: Suit; size?: number }) {
  switch (suit) {
    case 'spades':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="Spades">
          <path d="M12 2 C12 2 3 9 3 14 C3 17.3 5.7 20 9 20 C10.1 20 11.1 19.7 12 19.1 C11.5 20.4 11 21.3 10 22 L14 22 C13 21.3 12.5 20.4 12 19.1 C12.9 19.7 13.9 20 15 20 C18.3 20 21 17.3 21 14 C21 9 12 2 12 2Z" />
        </svg>
      )
    case 'hearts':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="Hearts">
          <path d="M12 21.593C11.426 21.071 2 13.793 2 8 C2 4.686 4.686 2 8 2 C9.858 2 11.505 2.865 12 4 C12.495 2.865 14.142 2 16 2 C19.314 2 22 4.686 22 8 C22 13.793 12.574 21.071 12 21.593Z" />
        </svg>
      )
    case 'diamonds':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="Diamonds">
          <path d="M12 2 L22 12 L12 22 L2 12 Z" />
        </svg>
      )
    case 'clubs':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="Clubs">
          <path d="M12 2 C10.3 2 9 3.3 9 5 C9 5.9 9.4 6.7 10 7.3 C8.6 7.1 7 7.9 6.3 9.2 C5.5 10.7 6 12.5 7.5 13.3 C6.9 13.1 6.2 13 5.5 13.2 L7 22 L17 22 L18.5 13.2 C17.8 13 17.1 13.1 16.5 13.3 C18 12.5 18.5 10.7 17.7 9.2 C17 7.9 15.4 7.1 14 7.3 C14.6 6.7 15 5.9 15 5 C15 3.3 13.7 2 12 2Z" />
        </svg>
      )
  }
}

/** All four suit emblems inline */
export function SuitEmblems({ size = 24 }: { size?: number }) {
  return (
    <div className="flex gap-2" aria-label="Suit emblems">
      <SuitEmblem suit="spades" size={size} />
      <SuitEmblem suit="hearts" size={size} />
      <SuitEmblem suit="diamonds" size={size} />
      <SuitEmblem suit="clubs" size={size} />
    </div>
  )
}

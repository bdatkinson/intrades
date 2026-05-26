import type { Suit } from './types';

/** Maps a suit to Tailwind color classes for accent borders and text. */
export const suitColorMap: Record<Suit, { border: string; text: string; bg: string; muted: string }> = {
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
};

export const suitSymbol: Record<Suit, string> = {
  spades: '♠️',
  hearts: '♥️',
  diamonds: '♦️',
  clubs: '♣️',
};

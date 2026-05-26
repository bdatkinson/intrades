import type { FaceCard } from '../types';

// --- 16 Face / Ace Cards ---
// 12 face cards (J/Q/K) mapped from mentor personas + 4 ace cards (capstones).
// Diamond face/ace cards = Business Readiness Track (BRT), active.
// All other face/ace cards = capstone, coming-soon.
export const faceCards: FaceCard[] = [
  // ── ♠️ Spades — Tools & Technology (capstone / coming-soon) ──
  {
    id: 'spades-jack',
    rank: 'jack',
    suit: 'spades',
    type: 'capstone',
    title: 'Jack of Spades: Jax Miller',
    status: 'coming-soon',
  },
  {
    id: 'spades-queen',
    rank: 'queen',
    suit: 'spades',
    type: 'capstone',
    title: 'Queen of Spades: Elena Rodriguez',
    status: 'coming-soon',
  },
  {
    id: 'spades-king',
    rank: 'king',
    suit: 'spades',
    type: 'capstone',
    title: 'King of Spades: Iron Thorne',
    status: 'coming-soon',
  },
  {
    id: 'spades-ace',
    rank: 'ace',
    suit: 'spades',
    type: 'capstone',
    title: 'Ace of Spades',
    status: 'coming-soon',
  },

  // ── ♥️ Hearts — Interpersonal & Customer Service (capstone / coming-soon) ──
  {
    id: 'hearts-jack',
    rank: 'jack',
    suit: 'hearts',
    type: 'capstone',
    title: 'Jack of Hearts: Mateo Flores',
    status: 'coming-soon',
  },
  {
    id: 'hearts-queen',
    rank: 'queen',
    suit: 'hearts',
    type: 'capstone',
    title: 'Queen of Hearts: Sarah Jenkins',
    status: 'coming-soon',
  },
  {
    id: 'hearts-king',
    rank: 'king',
    suit: 'hearts',
    type: 'capstone',
    title: 'King of Hearts: Sal Rossi',
    status: 'coming-soon',
  },
  {
    id: 'hearts-ace',
    rank: 'ace',
    suit: 'hearts',
    type: 'capstone',
    title: 'Ace of Hearts',
    status: 'coming-soon',
  },

  // ── ♦️ Diamonds — Business Acumen (BRT / active) ──
  {
    id: 'diamonds-jack',
    rank: 'jack',
    suit: 'diamonds',
    type: 'brt',
    title: 'J♦️  Select Business Name & Domain',
    status: 'active',
  },
  {
    id: 'diamonds-queen',
    rank: 'queen',
    suit: 'diamonds',
    type: 'brt',
    title: 'Q♦️  File for KY LLC',
    status: 'active',
  },
  {
    id: 'diamonds-king',
    rank: 'king',
    suit: 'diamonds',
    type: 'brt',
    title: 'K♦️  Bank Account & Insurance',
    status: 'active',
  },
  {
    id: 'diamonds-ace',
    rank: 'ace',
    suit: 'diamonds',
    type: 'brt',
    title: 'A♦️  Create Business Website',
    status: 'active',
  },

  // ── ♣️ Clubs — Safety, Compliance & Risk Management (capstone / coming-soon) ──
  {
    id: 'clubs-jack',
    rank: 'jack',
    suit: 'clubs',
    type: 'capstone',
    title: 'Jack of Clubs: Tyrell Washington',
    status: 'coming-soon',
  },
  {
    id: 'clubs-queen',
    rank: 'queen',
    suit: 'clubs',
    type: 'capstone',
    title: 'Queen of Clubs: Maria Lupita',
    status: 'coming-soon',
  },
  {
    id: 'clubs-king',
    rank: 'king',
    suit: 'clubs',
    type: 'capstone',
    title: 'King of Clubs: Big Mike Kowalski',
    status: 'coming-soon',
  },
  {
    id: 'clubs-ace',
    rank: 'ace',
    suit: 'clubs',
    type: 'capstone',
    title: 'Ace of Clubs',
    status: 'coming-soon',
  },
];

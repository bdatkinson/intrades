// --- Card Suit ---
// Suit domains in the InTrades mentoring deck:
//   spades   = Tools & Technology
//   hearts   = Interpersonal & Customer Service
//   diamonds = Business Acumen (includes Business Readiness Track)
//   clubs    = Safety, Compliance & Risk Management
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

// --- Card Rank ---
// 2–10 are pitfall scenario cards.
// jack, queen, king, ace are face cards (capstones or BRT steps).
export type CardRank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'jack' | 'queen' | 'king' | 'ace';

// --- Pitfall Scenario Card (number cards 2–10) ---
export interface ScenarioCard {
  /** Unique ID, e.g. "spades-3" */
  id: string;
  /** Numeric rank 2–10 */
  rank: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  /** Card suit */
  suit: Suit;
  /** Short scenario title, e.g. "The Van Black Hole" */
  title: string;
  /** Domain category matching the suit's theme */
  category: string;
  /** Full scenario text */
  description: string;
  /** Optional: which mentor persona teaches this scenario */
  mentorId?: string;
}

// --- Face / Ace Card ---
export interface FaceCard {
  /** Unique ID, e.g. "diamonds-jack" */
  id: string;
  /** Face or ace rank */
  rank: 'jack' | 'queen' | 'king' | 'ace';
  /** Card suit */
  suit: Suit;
  /** 'brt' for Diamond face cards (the Business Readiness Track), 'capstone' otherwise */
  type: 'capstone' | 'brt';
  /** Display title */
  title: string;
  /** Active or coming-soon placeholder */
  status: 'active' | 'coming-soon';
}

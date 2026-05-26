import { useState, useMemo } from 'react';
import type { Suit } from '../types';
import { scenarios } from '../data/scenarios';
import { faceCards } from '../data/faceCards';
import { suitSymbol } from '../utils';
import ScenarioCard from './ScenarioCard';
import ComingSoonCard from './ComingSoonCard';
import BRTCard from './BRTCard';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

type TabFilter = 'all' | Suit;

export default function DeckView() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  // Compute filtered cards
  const filteredScenarios = useMemo(
    () =>
      activeTab === 'all'
        ? scenarios
        : scenarios.filter((s) => s.suit === activeTab),
    [activeTab],
  );

  const filteredFaceCards = useMemo(
    () =>
      activeTab === 'all'
        ? faceCards
        : faceCards.filter((f) => f.suit === activeTab),
    [activeTab],
  );

  // Per-suit counts
  const suitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const suit of SUITS) {
      const scenarioCount = scenarios.filter((s) => s.suit === suit).length;
      const faceCount = faceCards.filter((f) => f.suit === suit).length;
      counts[suit] = scenarioCount + faceCount;
    }
    return counts;
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-mono mb-1">The Deck</h1>
        <p className="text-sm text-slate-400">
          52 cards — 36 pitfall scenarios, 12 face card mentors, 4 aces
        </p>
      </div>

      {/* Tab bar */}
      <div role="tablist" className="flex gap-1 mb-6 border-b border-slate-800 pb-0">
        <TabButton
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          count={52}
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
            {suitSymbol[suit]} {suit}
          </TabButton>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {/* Scenario cards (2-10) */}
        {filteredScenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}

        {/* Face/Ace cards */}
        {filteredFaceCards.map((faceCard) => {
          if (faceCard.type === 'brt') {
            return <BRTCard key={faceCard.id} faceCard={faceCard} />;
          }
          return <ComingSoonCard key={faceCard.id} faceCard={faceCard} />;
        })}
      </div>
    </div>
  );
}

// --- Tab Button ---

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
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
  );
}

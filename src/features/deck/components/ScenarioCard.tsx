import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { ScenarioCard as ScenarioCardType } from '../types';
import { suitColorMap, suitSymbol } from '../utils';

interface ScenarioCardProps {
  scenario: ScenarioCardType;
}

export default function ScenarioCard({ scenario }: ScenarioCardProps) {
  const [flipped, setFlipped] = useState(false);
  const colors = suitColorMap[scenario.suit];

  const toggleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
  }, []);

  const ariaLabel = `Scenario card: ${scenario.title} (${scenario.rank} of ${scenario.suit})`;

  return (
    <article
      className={`w-full min-h-[280px] cursor-pointer select-none [perspective:800px]`}
      data-testid={`scenario-${scenario.id}`}
      data-suit={scenario.suit}
      aria-label={ariaLabel}
      aria-expanded={flipped}
      onClick={toggleFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFlip();
        }
      }}
      tabIndex={0}
    >
      {/* 3D flip container */}
      <div
        data-flip-inner
        className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500 ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* ── Front Face ─────────────────────────────────────── */}
        <div
          data-face="front"
          className={`absolute inset-0 rounded-lg border ${colors.border} ${colors.bg} p-4 flex flex-col [backface-visibility:hidden]`}
        >
          {/* Header: rank + suit */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-mono font-semibold ${colors.text}`}>
              {scenario.rank}
            </span>
            <span className="text-lg" aria-label={scenario.suit}>
              {suitSymbol[scenario.suit]}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-mono font-semibold text-slate-100 leading-snug mb-1">
            {scenario.title}
          </h3>

          {/* Flip hint */}
          <span className={`text-xs ${colors.muted} mt-auto`}>
            Click to flip
          </span>
        </div>

        {/* ── Back Face ──────────────────────────────────────── */}
        <div
          data-face="back"
          className={`absolute inset-0 rounded-lg border ${colors.border} ${colors.bg} p-4 flex flex-col [backface-visibility:hidden] [transform:rotateY(180deg)]`}
        >
          {/* Category banner */}
          <span className={`text-xs font-mono ${colors.text} mb-2`}>
            {scenario.category}
          </span>

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed flex-1 overflow-y-auto mb-3">
            {scenario.description}
          </p>

          {/* Discuss with Mentor link */}
          <Link
            to={`/mentor/${scenario.mentorId || 'discuss'}`}
            className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold ${colors.text} hover:underline mt-auto`}
            aria-label={`Discuss with Mentor: ${scenario.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Discuss with Mentor
          </Link>
        </div>
      </div>
    </article>
  );
}

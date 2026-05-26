import type { ScenarioCard as ScenarioCardType } from '../types';
import { suitColorMap, suitSymbol } from '../utils';

interface ScenarioCardProps {
  scenario: ScenarioCardType;
}

export default function ScenarioCard({ scenario }: ScenarioCardProps) {
  const colors = suitColorMap[scenario.suit];

  return (
    <article
      className={`rounded-lg border ${colors.border} ${colors.bg} p-4 flex flex-col`}
      data-testid={`scenario-${scenario.id}`}
      data-suit={scenario.suit}
    >
      {/* Card header: rank + suit */}
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

      {/* Category */}
      <span className={`text-xs ${colors.muted} mb-2`}>
        {scenario.category}
      </span>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed flex-1">
        {scenario.description}
      </p>
    </article>
  );
}

import { ArrowRight } from 'lucide-react';
import type { FaceCard } from '../types';
import { suitColorMap, suitSymbol } from '../utils';

interface BRTCardProps {
  faceCard: FaceCard;
}

export default function BRTCard({ faceCard }: BRTCardProps) {
  const colors = suitColorMap[faceCard.suit];

  const brtRoute = (() => {
    switch (faceCard.rank) {
      case 'jack':
        return '/brt/name';
      case 'queen':
        return '/brt/llc';
      case 'king':
        return '/brt/bank-insurance';
      case 'ace':
        return '/brt/website';
    }
  })();

  return (
    <article
      className={`rounded-lg border ${colors.border} ${colors.bg} p-4 flex flex-col`}
      data-testid={`brt-${faceCard.id}`}
      data-suit={faceCard.suit}
    >
      {/* Card header: rank + suit + BRT badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-mono font-semibold ${colors.text}`}>
            {faceCard.rank.toUpperCase()}
          </span>
          <span className="text-lg" aria-label={faceCard.suit}>
            {suitSymbol[faceCard.suit]}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
          BRT
        </span>
      </div>

      {/* Title */}
      <h3 className={`text-sm font-mono font-semibold ${colors.text} leading-snug mb-2 flex-1`}>
        {faceCard.title}
      </h3>

      {/* Active indicator + link */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-800">
        <span className="text-xs text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Active
        </span>
        <a
          href={brtRoute}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
        >
          Start
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
}

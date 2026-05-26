import { Lock } from 'lucide-react';
import type { FaceCard } from '../types';
import { suitColorMap, suitSymbol } from '../utils';

interface ComingSoonCardProps {
  faceCard: FaceCard;
}

export default function ComingSoonCard({ faceCard }: ComingSoonCardProps) {
  const colors = suitColorMap[faceCard.suit];

  return (
    <article
      className={`rounded-lg border ${colors.border} ${colors.bg} p-4 flex flex-col items-center justify-center text-center min-h-[200px]`}
      data-testid={`face-${faceCard.id}`}
      data-suit={faceCard.suit}
    >
      {/* Suit emblem */}
      <span className="text-3xl mb-3" aria-label={faceCard.suit}>
        {suitSymbol[faceCard.suit]}
      </span>

      {/* Face rank indicator */}
      <span className={`text-xs font-mono uppercase tracking-widest ${colors.muted} mb-2`}>
        {faceCard.rank}
      </span>

      {/* Title */}
      <h3 className={`text-sm font-mono font-semibold ${colors.text} mb-3 leading-snug`}>
        {faceCard.title}
      </h3>

      {/* Coming Soon badge with lock */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700">
        <Lock className="w-3 h-3 text-slate-500" />
        <span className="text-xs text-slate-500 uppercase tracking-wider">
          Coming Soon
        </span>
      </div>
    </article>
  );
}

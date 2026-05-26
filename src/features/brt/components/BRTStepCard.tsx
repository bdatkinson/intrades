import { Check, Lock, Diamond } from 'lucide-react';
import type { BRTStep } from '../types';

interface BRTStepCardProps {
  step: BRTStep;
  onClick?: () => void;
}

export function BRTStepCard({ step, onClick }: BRTStepCardProps) {
  const isLocked = step.status === 'locked';

  return (
    <button
      role="button"
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={`flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4 text-left transition-colors ${
        isLocked
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:border-amber-600/50'
      }`}
    >
      {/* Card face + suit indicator */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <span className="font-mono text-xs text-amber-400">♦</span>
        <span className="font-mono text-sm font-semibold text-slate-200 capitalize">
          {step.card}
        </span>
      </div>

      {/* Title + subtitle */}
      <div className="flex-1 min-w-0">
        <h3 className="font-mono font-semibold text-sm text-slate-100">
          {step.title}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{step.subtitle}</p>
      </div>

      {/* Status badge */}
      <div className="flex-shrink-0 flex items-center gap-1.5">
        {step.status === 'completed' ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-mono">Done</span>
          </>
        ) : step.status === 'locked' ? (
          <>
            <Lock className="w-4 h-4 text-slate-600" />
            <span className="text-xs text-slate-600 font-mono">Locked</span>
          </>
        ) : (
          <>
            <Diamond className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-mono">Ready</span>
          </>
        )}
      </div>
    </button>
  );
}

import { Check, Lock, Diamond } from 'lucide-react';
import type { BRTStep } from '../types';

interface BRTStepperProps {
  steps: BRTStep[];
  activeStepId: string;
  onStepClick: (stepId: string) => void;
}

export function BRTStepper({ steps, activeStepId, onStepClick }: BRTStepperProps) {
  return (
    <nav aria-label="Business Readiness Track progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isCompleted = step.status === 'completed';
          const isLocked = step.status === 'locked' && !isActive && !isCompleted;
          const isClickable = !isLocked;

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step indicator */}
              <button
                role="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.id)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isLocked
                    ? 'cursor-not-allowed opacity-40'
                    : 'cursor-pointer hover:opacity-80'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-mono font-bold ${
                    isCompleted
                      ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400'
                      : isActive
                        ? 'border-amber-400 bg-amber-400/20 text-amber-400'
                        : 'border-slate-700 bg-slate-900 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{step.card.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono capitalize ${
                    isActive ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-slate-600'
                  }`}
                >
                  {step.card}
                </span>
                <span className="text-[10px] text-amber-400">♦</span>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  data-connector
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-emerald-400/50' : 'bg-slate-800'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

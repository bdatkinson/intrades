import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Diamond, ArrowRight } from 'lucide-react';
import { BRT_STEPS, type BRTStep } from './types';
import { BRTStepper } from './components/BRTStepper';
import { BRTStepCard } from './components/BRTStepCard';

export function BRTPage() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<BRTStep[]>(BRT_STEPS);

  const activeStep =
    steps.find((s) => s.status === 'active') ?? steps[0];

  function handleStepCardClick(step: BRTStep) {
    if (step.status === 'locked') return;
    navigate(step.route);
  }

  function handleStepperClick(stepId: string) {
    const step = steps.find((s) => s.id === stepId);
    if (step && step.status !== 'locked') {
      navigate(step.route);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Diamond className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-mono font-bold text-slate-100">
            Business Readiness Track
          </h1>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          A guided 4-step wizard to get your trade business legally formed,
          financially protected, and visible online. Complete each step in
          order to unlock the next.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <BRTStepper
          steps={steps}
          activeStepId={activeStep.id}
          onStepClick={handleStepperClick}
        />
      </div>

      {/* Step Cards */}
      <div className="space-y-3">
        {steps.map((step) => (
          <BRTStepCard
            key={step.id}
            step={step}
            onClick={() => handleStepCardClick(step)}
          />
        ))}
      </div>

      {/* Start CTA */}
      {activeStep && activeStep.status === 'active' && (
        <div className="flex justify-center">
          <button
            onClick={() => navigate(activeStep.route)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-sm font-semibold hover:bg-amber-500/20 transition-colors"
          >
            Start with {activeStep.title}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

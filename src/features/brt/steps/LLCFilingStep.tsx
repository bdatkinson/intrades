import { useState, useEffect, useCallback } from 'react';
import { Check, ExternalLink, Diamond } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface SubStep {
  id: string;
  number: number;
  title: string;
  description: string;
  externalLink?: {
    label: string;
    url: string;
  };
}

// ─── Data ───────────────────────────────────────────────────────────

const SUB_STEPS: SubStep[] = [
  {
    id: 'registered-agent',
    number: 1,
    title: 'Choose a Registered Agent',
    description:
      'A registered agent receives official legal and tax documents on behalf of your LLC. You can serve as your own agent, use a professional service ($50–$150/year), or designate another Kentucky resident.',
  },
  {
    id: 'articles-of-org',
    number: 2,
    title: 'File Articles of Organization',
    description:
      'Submit Articles of Organization to the Kentucky Secretary of State. Cost: $40 online. You\'ll need your LLC name, registered agent information, organizer name, and office address.',
    externalLink: {
      label: 'KY Secretary of State Business Filings',
      url: 'https://app.sos.ky.gov/ftbusinessfilings/',
    },
  },
  {
    id: 'ein',
    number: 3,
    title: 'Get an EIN from the IRS',
    description:
      'An Employer Identification Number (EIN) is free from the IRS. You\'ll need it to open a bank account, file taxes, and hire employees. The online application takes about 15 minutes.',
    externalLink: {
      label: 'IRS EIN Online Application',
      url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online',
    },
  },
  {
    id: 'ky-tax-registration',
    number: 4,
    title: 'KY Tax Registration',
    description:
      'Register with the Kentucky Department of Revenue for applicable state taxes. Most trades businesses need a sales tax permit and withholding account.',
  },
  {
    id: 'operating-agreement',
    number: 5,
    title: 'Create an Operating Agreement',
    description:
      'An operating agreement is an internal document that outlines ownership and operating procedures. Even single-member LLCs benefit from having one — it reinforces liability protection and clarifies decision-making.',
  },
];

const STORAGE_KEY = 'brt-llc-progress';

// ─── Component ──────────────────────────────────────────────────────

export function LLCFilingStep() {
  const [completed, setCompleted] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === SUB_STEPS.length) {
          return parsed;
        }
      }
    } catch {
      // Corrupt data — start fresh
    }
    return SUB_STEPS.map(() => false);
  });

  // Persist to localStorage whenever completed state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const toggleStep = useCallback((index: number) => {
    setCompleted((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const completedCount = completed.filter(Boolean).length;
  const totalCount = SUB_STEPS.length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex flex-col items-center">
            <span className="font-mono text-lg text-amber-400">♦</span>
            <span className="font-mono text-xs text-amber-400/60">Q</span>
          </div>
          <div>
            <h1 className="text-xl font-mono font-bold text-slate-100">
              Q♦️ File for KY LLC
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Step-by-step walkthrough to legally form your Kentucky LLC.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="flex items-center gap-3 text-sm font-mono text-slate-400"
          role="status"
          aria-label={`${completedCount} of ${totalCount} sub-steps complete`}
        >
          <span>
            {completedCount} of {totalCount} complete
          </span>
          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500/60 transition-all duration-300"
              style={{
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Sub-steps checklist */}
      <div className="space-y-4">
        {SUB_STEPS.map((step, index) => {
          const isDone = completed[index];

          return (
            <div
              key={step.id}
              className={`rounded-lg border p-4 transition-colors ${
                isDone
                  ? 'border-emerald-800/50 bg-emerald-950/20'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Step number */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold border ${
                    isDone
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <label
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30 accent-amber-500"
                      checked={isDone}
                      onChange={() => toggleStep(index)}
                      aria-label={step.title}
                    />
                    <div>
                      <span
                        className={`font-mono text-sm font-semibold ${
                          isDone
                            ? 'text-emerald-400 line-through'
                            : 'text-slate-100 group-hover:text-amber-400 transition-colors'
                        }`}
                      >
                        {step.title}
                      </span>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {step.description}
                      </p>

                      {step.externalLink && (
                        <a
                          href={step.externalLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {step.externalLink.label}
                        </a>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mentor tip — David Chang (K♦️) */}
      <div className="rounded-lg border border-amber-800/30 bg-amber-950/10 p-4">
        <div className="flex items-start gap-3">
          <Diamond className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-amber-400">
                David Chang
              </span>
              <span className="font-mono text-xs text-amber-400/50">K♦️</span>
            </div>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Think of your LLC as the operating system for your business. Get
              it right now, scale later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

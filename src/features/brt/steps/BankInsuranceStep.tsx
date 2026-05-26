import { useState } from 'react';
import {
  Building2,
  Shield,
  Landmark,
  FileText,
  IdCard,
  Wallet,
  Globe,
  Truck,
  Wrench,
  ExternalLink,
  MessageSquare,
  CheckSquare,
  Square,
} from 'lucide-react';

/** Bank checklist item identifiers */
type BankItem = 'opened-account' | 'debit-card' | 'online-banking';

/** Insurance checklist item identifiers */
type InsuranceItem = 'gl-quote' | 'compared-providers' | 'selected-policy';

export function BankInsuranceStep() {
  const [bankChecks, setBankChecks] = useState<Record<BankItem, boolean>>({
    'opened-account': false,
    'debit-card': false,
    'online-banking': false,
  });

  const [insuranceChecks, setInsuranceChecks] = useState<
    Record<InsuranceItem, boolean>
  >({
    'gl-quote': false,
    'compared-providers': false,
    'selected-policy': false,
  });

  function toggleBank(item: BankItem) {
    setBankChecks((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  function toggleInsurance(item: InsuranceItem) {
    setInsuranceChecks((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* ── Section A: Commercial Bank Account ────────────────── */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-mono font-bold text-slate-100">
            Commercial Bank Account
          </h2>
        </div>

        {/* Why */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono text-sm font-semibold text-amber-400">
              Why You Need a Separate Business Account
            </h3>
          </div>
          <ul className="space-y-1 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">•</span>
              <span>
                <strong>Liability protection</strong> — keeps your personal
                assets separate from your business. If your business gets sued,
                your personal bank account is protected.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">•</span>
              <span>
                <strong>Tax simplicity</strong> — makes it trivially easy to
                track business income and expenses at tax time. No more sorting
                through personal transactions.
              </span>
            </li>
          </ul>
        </div>

        {/* What to bring */}
        <div className="space-y-3">
          <h3 className="font-mono text-sm font-semibold text-slate-200">
            What to Bring to the Bank
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-3">
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">
                EIN letter from the IRS
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-3">
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">
                Articles of Organization
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-3">
              <IdCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">
                Government-issued ID
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-3">
              <Wallet className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">Initial deposit</span>
            </div>
          </div>
        </div>

        {/* Community bank recommendation */}
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-start gap-3">
            <Landmark className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-mono text-sm font-semibold text-emerald-400">
                InTrades Local Loop Tip
              </h4>
              <p className="text-sm text-slate-300 mt-1">
                We recommend{' '}
                <strong>community banks and credit unions</strong> over big
                national banks. They know your local market, are more likely to
                approve small business loans, and every dollar you deposit stays
                in your community. That's the Local Loop.
              </p>
            </div>
          </div>
        </div>

        {/* Bank checklist */}
        <div className="space-y-2">
          <h3 className="font-mono text-sm font-semibold text-slate-200">
            Checklist
          </h3>
          <div className="space-y-2">
            {(
              [
                [
                  'opened-account',
                  'Opened a business checking account',
                ] as const,
                ['debit-card', 'Got a business debit card'] as const,
                ['online-banking', 'Set up online banking'] as const,
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleBank(key)}
                className="flex items-center gap-3 w-full text-left rounded-lg border border-slate-800 bg-slate-900 p-3 hover:border-slate-700 transition-colors"
              >
                {bankChecks[key] ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    bankChecks[key] ? 'text-emerald-400 line-through' : 'text-slate-300'
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section B: Business Insurance ──────────────────────── */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-mono font-bold text-slate-100">
            Business Insurance
          </h2>
        </div>

        {/* Insurance types */}
        <div className="space-y-3">
          <h3 className="font-mono text-sm font-semibold text-slate-200">
            Insurance Types You'll Need
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-3">
              <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-sm text-slate-200 font-semibold">
                  General Liability
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Covers injuries, property damage, and advertising claims.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-3">
              <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-sm text-slate-200 font-semibold">
                  Workers' Comp
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Required if you have employees. Protects both you and them.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-3">
              <Truck className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-sm text-slate-200 font-semibold">
                  Commercial Auto
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Covers work trucks, vans, and trailers your business uses.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-3">
              <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-sm text-slate-200 font-semibold">
                  Tools & Equipment
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Protects your tools against theft, loss, and damage on the
                  job.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick-quote links */}
        <div className="space-y-3">
          <h3 className="font-mono text-sm font-semibold text-slate-200">
            Get a Quick Quote
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="https://www.thimble.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3 hover:border-amber-600/50 transition-colors group"
            >
              <span className="text-sm text-slate-200 font-mono font-semibold">
                Thimble
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </a>
            <a
              href="https://www.nextinsurance.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3 hover:border-amber-600/50 transition-colors group"
            >
              <span className="text-sm text-slate-200 font-mono font-semibold">
                NEXT Insurance
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </a>
            <a
              href="https://www.simplybusiness.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3 hover:border-amber-600/50 transition-colors group"
            >
              <span className="text-sm text-slate-200 font-mono font-semibold">
                Simply Business
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </a>
          </div>
          <p className="text-xs text-slate-500">
            Thimble offers pay-per-job insurance — especially useful when you're
            just starting out. No annual commitment.
          </p>
        </div>

        {/* Insurance checklist */}
        <div className="space-y-2">
          <h3 className="font-mono text-sm font-semibold text-slate-200">
            Checklist
          </h3>
          <div className="space-y-2">
            {(
              [
                [
                  'gl-quote',
                  'Got a General Liability quote',
                ] as const,
                [
                  'compared-providers',
                  'Compared at least 2 providers',
                ] as const,
                [
                  'selected-policy',
                  'Selected an insurance policy',
                ] as const,
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleInsurance(key)}
                className="flex items-center gap-3 w-full text-left rounded-lg border border-slate-800 bg-slate-900 p-3 hover:border-slate-700 transition-colors"
              >
                {insuranceChecks[key] ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    insuranceChecks[key]
                      ? 'text-emerald-400 line-through'
                      : 'text-slate-300'
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mentor Tip ────────────────────────────────────────── */}
      <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-purple-400">
                Big Mike
              </span>
              <span className="font-mono text-xs text-purple-600">K♣️</span>
            </div>
            <p className="text-sm text-slate-300 italic mt-1">
              "Don't cheap out on insurance. One lawsuit without it and you're
              done. That's not freedom, that's gambling."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

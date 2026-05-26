import { useState, useEffect, useCallback, useMemo } from 'react';
import { Diamond, Lightbulb, Check, ExternalLink, Globe } from 'lucide-react';

// ─── Suggestion generator ──────────────────────────────────────

interface NameSuggestion {
  label: string;
  pattern: string;
}

function generateSuggestions(trade: string, city: string): NameSuggestion[] {
  if (!trade.trim() || !city.trim()) return [];

  const cleanTrade = trade.trim();
  const cleanCity = city.trim();

  const patterns: NameSuggestion[] = [
    {
      label: `${cleanCity} ${cleanTrade} Services`,
      pattern: '[City] [Trade] Services',
    },
    {
      label: `${cleanCity} ${cleanTrade} Pros`,
      pattern: '[City] [Trade] Pros',
    },
    {
      label: `${cleanTrade} ${cleanCity} LLC`,
      pattern: '[Trade] [City] LLC',
    },
    {
      label: `${cleanCity} ${cleanTrade} Co.`,
      pattern: '[City] [Trade] Co.',
    },
  ];

  return patterns;
}

function nameToDomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .replace(/(.{0,60}).*/, '$1') + '.com';
}

// ─── localStorage helpers ───────────────────────────────────────

const STORAGE_KEY = 'brt-name';

interface SavedState {
  businessName: string;
  domain: string;
  trade: string;
  city: string;
}

function loadSavedState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { businessName: '', domain: '', trade: '', city: '' };
    const parsed = JSON.parse(raw);
    return {
      businessName: parsed.businessName ?? '',
      domain: parsed.domain ?? '',
      trade: parsed.trade ?? '',
      city: parsed.city ?? '',
    };
  } catch {
    return { businessName: '', domain: '', trade: '', city: '' };
  }
}

function saveState(state: SavedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Component ──────────────────────────────────────────────────

export function BusinessNameStep() {
  const saved = loadSavedState();

  const [businessName, setBusinessName] = useState(saved.businessName);
  const [domain, setDomain] = useState(saved.domain);
  const [trade, setTrade] = useState(saved.trade);
  const [city, setCity] = useState(saved.city);

  // Persist to localStorage whenever values change
  useEffect(() => {
    saveState({ businessName, domain, trade, city });
  }, [businessName, domain, trade, city]);

  // Auto-suggest domain from business name
  const [userEditedDomain, setUserEditedDomain] = useState(false);

  useEffect(() => {
    if (!userEditedDomain && businessName.trim()) {
      setDomain(nameToDomain(businessName));
    }
  }, [businessName, userEditedDomain]);

  // Generate suggestions from trade + city
  const suggestions = useMemo(
    () => generateSuggestions(trade, city),
    [trade, city],
  );

  const handleDomainChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserEditedDomain(true);
      setDomain(e.target.value);
    },
    [],
  );

  const handleSelectSuggestion = useCallback((suggestion: NameSuggestion) => {
    setBusinessName(suggestion.label);
    setUserEditedDomain(false);
  }, []);

  const isNameReady = businessName.trim().length > 0 && domain.trim().length > 0;

  return (
    <div className="max-w-2xl space-y-8">
      {/* ─── Header ─── */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl text-amber-400">J♦️</span>
          <h1 className="text-2xl font-mono font-bold text-slate-100">
            Select Business Name &amp; Domain
          </h1>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          Your name is how customers will find you, remember you, and trust
          you. Choose something clear, professional, and trade-relevant.
        </p>
      </div>

      {/* ─── Name Input ─── */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="brt-business-name"
            className="block font-mono text-sm font-semibold text-slate-200"
          >
            Business Name
          </label>
          <input
            id="brt-business-name"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Bluegrass Electrical"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 font-mono text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* Trade + City inputs for suggestion generation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="brt-trade"
              className="block font-mono text-xs font-semibold text-slate-400"
            >
              Your Trade
            </label>
            <input
              id="brt-trade"
              type="text"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              placeholder="e.g. Electrical"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="brt-city"
              className="block font-mono text-xs font-semibold text-slate-400"
            >
              Your City
            </label>
            <input
              id="brt-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Lexington"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="font-mono text-xs text-slate-500">
              Try these suggestions:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSelectSuggestion(s)}
                  className="rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 font-mono text-xs text-amber-300 hover:bg-amber-500/10 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Guidelines ─── */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <h2 className="font-mono text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Naming Guidelines
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <h3 className="font-mono text-xs font-semibold text-amber-400">
              Memorable
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Short, easy to spell, and sticks in customers' minds. Avoid
              numbers and hyphens if possible.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-mono text-xs font-semibold text-amber-400">
              Professional
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sounds like a company people want to hire. No jokes, slang, or
              overly casual names for your LLC.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-mono text-xs font-semibold text-amber-400">
              Trade-Relevant
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Makes it clear what you do. "Bluegrass HVAC" beats "B&K
              Enterprises" for a heating and cooling business.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <p className="font-mono text-xs text-slate-500 mb-2">
            Common patterns for trade businesses:
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-slate-300">
              [Name] [Trade] LLC
            </span>
            <span className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-slate-300">
              [City] [Trade] Services
            </span>
            <span className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-slate-300">
              [Trade] [City] Co.
            </span>
          </div>
        </div>
      </div>

      {/* ─── Domain Lookup ─── */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <h2 className="font-mono text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          Domain Name
        </h2>

        <div className="space-y-2">
          <label
            htmlFor="brt-domain"
            className="block font-mono text-xs font-semibold text-slate-400"
          >
            Your Domain
          </label>
          <input
            id="brt-domain"
            type="text"
            value={domain}
            onChange={handleDomainChange}
            placeholder="e.g. bluegrasselectrical.com"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 font-mono text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
          <p className="text-xs text-slate-500">
            A good domain matches your business name and ends in .com when
            possible.
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-xs text-slate-500">
            Check availability at these registrars:
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.namecheap.com/domains/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs text-amber-300 hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Search Namecheap
            </a>
            <a
              href="https://www.godaddy.com/domains"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs text-amber-300 hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Search GoDaddy
            </a>
          </div>
        </div>
      </div>

      {/* ─── Completion Indicator ─── */}
      {isNameReady && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-sm text-emerald-400">
            Name selected — Ready to continue
          </span>
        </div>
      )}

      {/* ─── Mentor Tip ─── */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs text-amber-400">Q♦️</span>
          <span className="font-mono text-xs font-semibold text-amber-300">
            Aisha Okonjo
          </span>
          <span className="text-xs text-amber-500">— Diamond Queen</span>
        </div>
        <p className="text-sm text-amber-200/80 italic leading-relaxed">
          "Your name is your first impression. Make it count. A clean,
          professional name tells customers you take your trade seriously
          before they ever see your work."
        </p>
      </div>
    </div>
  );
}

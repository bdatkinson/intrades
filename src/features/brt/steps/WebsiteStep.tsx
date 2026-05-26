import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react';

const TRADE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'HVAC',
  'Roofing',
  'Painting',
  'Landscaping',
  'Masonry',
  'Flooring',
  'Drywall',
];

const PLATFORMS = [
  {
    name: 'Carrd.co',
    description: 'Simplest option — one-page sites for $19/year',
    url: 'https://carrd.co',
  },
  {
    name: 'Google Business Profile',
    description: 'Free and essential — appear in local search and Maps',
    url: 'https://www.google.com/business/',
  },
  {
    name: 'Square Online',
    description: 'Free tier, good for service businesses with online booking',
    url: 'https://squareup.com/us/en/online-store',
  },
];

export function WebsiteStep() {
  const [businessName, setBusinessName] = useState(
    () => localStorage.getItem('brt-business-name') ?? '',
  );
  const [tagline, setTagline] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [serviceArea, setServiceArea] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [completed, setCompleted] = useState(false);

  function toggleService(service: string) {
    setServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    );
  }

  if (completed) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="rounded-lg border border-emerald-800 bg-emerald-900/20 p-8 text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-mono font-semibold text-emerald-300">
            Website Step Complete
          </h2>
          <p className="text-slate-400 text-sm">
            Your website content has been prepared. Choose a platform above to
            publish your site.
          </p>
          <Link
            to="/brt"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-mono text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Business Readiness
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        to="/brt"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 font-mono text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Business Readiness
      </Link>

      <h1 className="text-2xl font-mono font-bold text-slate-100">
        Create Business Website
      </h1>

      {/* Section 1: What your site needs */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <h2 className="text-lg font-mono font-semibold text-slate-100">
          What Your Site Needs
        </h2>
        <p className="text-slate-400 text-sm">
          Your minimum viable website should include these essentials:
        </p>
        <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside marker:text-amber-400">
          <li>Business Name + optional logo placeholder</li>
          <li>Services list (what you specialize in)</li>
          <li>Service area (city/county you serve)</li>
          <li>Phone number and email</li>
          <li>A &quot;Request a Quote&quot; call-to-action button</li>
        </ul>
      </section>

      {/* Section 2: Content Builder */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-6">
        <h2 className="text-lg font-mono font-semibold text-slate-100">
          Content Builder
        </h2>
        <p className="text-slate-400 text-sm">
          Fill in your website content below. Changes appear live in the
          preview.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="business-name"
              className="block text-sm font-mono text-slate-300 mb-1"
            >
              Business Name
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-none"
              placeholder="Your Business Name"
            />
          </div>

          <div>
            <label
              htmlFor="tagline"
              className="block text-sm font-mono text-slate-300 mb-1"
            >
              Tagline
            </label>
            <input
              id="tagline"
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-none"
              placeholder="A short slogan for your business"
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-mono text-slate-300 mb-2">
              Services
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRADE_CATEGORIES.map((service) => (
                <label
                  key={service}
                  className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={services.includes(service)}
                    onChange={() => toggleService(service)}
                    className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
                    aria-label={service}
                  />
                  {service}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="service-area"
              className="block text-sm font-mono text-slate-300 mb-1"
            >
              Service Area
            </label>
            <input
              id="service-area"
              type="text"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-none"
              placeholder="e.g., Lexington, KY"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-mono text-slate-300 mb-1"
              >
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-none"
                placeholder="(555) 555-0123"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-mono text-slate-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Platform Recommendations */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <h2 className="text-lg font-mono font-semibold text-slate-100">
          Platform Recommendations
        </h2>
        <p className="text-slate-400 text-sm">
          Choose a platform to host your site. All three work well for trade
          businesses.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className="rounded-md border border-slate-700 bg-slate-800/50 p-4 space-y-2"
            >
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono text-sm font-semibold"
              >
                {platform.name}
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-xs text-slate-400">{platform.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Live Preview */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <h2 className="text-lg font-mono font-semibold text-slate-100">
          Live Preview
        </h2>
        <div
          data-testid="website-preview"
          className="rounded-md border border-slate-700 bg-white text-slate-900 p-6 space-y-4 max-w-md mx-auto font-sans"
        >
          {/* Header */}
          <div className="text-center space-y-1">
            {businessName ? (
              <h3 className="text-lg font-bold">{businessName}</h3>
            ) : (
              <h3 className="text-lg font-bold text-slate-400 italic">
                Your Business Name
              </h3>
            )}
            {tagline && (
              <p className="text-sm text-slate-600">{tagline}</p>
            )}
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">
                Services
              </h4>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-0.5">
                {services.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Service Area */}
          {serviceArea && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-1">
                Service Area
              </h4>
              <p className="text-sm text-slate-600">{serviceArea}</p>
            </div>
          )}

          {/* Contact */}
          {(phone || email) && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-1">
                Contact
              </h4>
              {phone && (
                <p className="text-sm text-slate-600">{phone}</p>
              )}
              {email && (
                <p className="text-sm text-slate-600">{email}</p>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="text-center pt-2">
            <span className="inline-block rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
              Request a Quote
            </span>
          </div>
        </div>
      </section>

      {/* Kenji Sato Mentor Tip */}
      <div className="rounded-lg border border-amber-800/30 bg-amber-900/10 p-4 space-y-2">
        <p className="text-xs text-amber-400/70 font-mono uppercase tracking-wider">
          Kenji Sato — J♦️
        </p>
        <p className="text-sm text-slate-300 italic">
          &ldquo;A website is your digital storefront. Keep it clean. Like a
          good joint — no gaps, no filler.&rdquo;
        </p>
      </div>

      {/* Mark Complete */}
      <div className="flex justify-end">
        <button
          onClick={() => setCompleted(true)}
          disabled={!businessName.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-sm font-semibold hover:bg-amber-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Mark Complete
        </button>
      </div>
    </div>
  );
}

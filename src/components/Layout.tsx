import { Menu, X, LayoutDashboard, Layers, Briefcase } from 'lucide-react';
import { Outlet, NavLink } from 'react-router-dom';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: null },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/deck', label: 'The Deck', icon: Layers },
  { to: '/mentors', label: 'Mentors', icon: null },
  { to: '/brt', label: 'Business Readiness', icon: Briefcase },
] as const;

export default function Layout() {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="lg:hidden p-1 text-slate-400 hover:text-slate-200"
          aria-label={showSidebar ? 'Close sidebar' : 'Open sidebar'}
        >
          {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div>
          <h1 className="text-xl font-semibold font-mono tracking-tight">
            InTrades
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Skilled Trades Mentoring Platform
          </p>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`${showSidebar ? 'block' : 'hidden'} lg:block w-64 border-r border-slate-800 bg-slate-900/50 p-4 flex-shrink-0`}
        >
          <nav className="space-y-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setShowSidebar(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-mono transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-600 font-mono">
        &copy; {new Date().getFullYear()} InTrades
      </footer>
    </div>
  );
}

import { Layers, Wrench } from 'lucide-react';
import { Outlet, NavLink } from 'react-router-dom';
import { ErrorBoundary } from './ui/ErrorBoundary';

const NAV_ITEMS = [
  { to: '/designer', label: 'Card Designer', icon: Wrench },
  { to: '/deck', label: 'The Deck', icon: Layers },
] as const;

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold font-mono tracking-tight">
            InTrades
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Card Designer
          </p>
        </div>
        <nav className="flex items-center gap-2" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono transition-colors ${
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
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className="border-t border-slate-800 px-4 sm:px-6 py-3 text-center text-xs text-slate-600 font-mono">
        &copy; {new Date().getFullYear()} InTrades
      </footer>
    </div>
  );
}

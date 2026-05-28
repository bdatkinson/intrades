import { Layers, Wrench } from 'lucide-react';
import { Outlet, NavLink } from 'react-router-dom';
import { ErrorBoundary } from './ui/ErrorBoundary';

const NAV_ITEMS = [
  { to: '/designer', label: 'Card Designer', icon: Wrench },
  { to: '/deck', label: 'The Deck', icon: Layers },
] as const;

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-mono">
      <header className="border-b border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between font-mono">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold font-mono tracking-widest uppercase text-zinc-100">
            INTRADES
          </h1>
        </div>
        <nav className="flex items-center gap-2" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-none border text-sm font-mono transition-colors ${
                  isActive
                    ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                    : 'border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500'
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

      <footer className="border-t border-zinc-800 px-4 sm:px-6 py-3 text-center text-xs text-zinc-500 font-mono">
        &copy; {new Date().getFullYear()} InTrades
      </footer>
    </div>
  );
}

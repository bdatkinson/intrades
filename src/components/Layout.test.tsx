import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../features/auth/AuthProvider', () => ({
  useAuth: () => ({
    signOut: vi.fn(),
    user: null,
    loading: false,
    error: null,
  }),
}));

const { default: Layout } = await import('./Layout');

function renderLayout(initialRoute = '/designer') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Layout />
    </MemoryRouter>,
  );
}

describe('Layout', () => {
  it('renders header, main and footer', () => {
    renderLayout();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the InTrades heading', () => {
    renderLayout();
    expect(screen.getByRole('heading', { name: /intrades/i })).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /card designer/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /the deck/i })).toBeInTheDocument();
  });

  it('highlights the active nav link', () => {
    renderLayout('/deck');
    const deckLink = screen.getByRole('link', { name: /the deck/i });
    expect(deckLink.className).toContain('text-amber-400');
  });

  it('renders navigation links inline in the header bar', () => {
    renderLayout();
    const header = screen.getByRole('banner');
    const navLinks = header.querySelectorAll('a');
    expect(navLinks.length).toBe(2); // Card Designer + The Deck (Sign Out hidden when no user)
    // Nav links should be visible (no hidden/lg:hidden classes)
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav.className).not.toContain('hidden');
  });

  it('renders the Outlet for child routes', () => {
    renderLayout();
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
});

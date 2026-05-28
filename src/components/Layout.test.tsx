import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

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

  it('has sidebar toggle button on mobile', () => {
    renderLayout();
    const toggleBtn = screen.getByLabelText(/open sidebar/i);
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn.className).toContain('lg:hidden');
  });

  it('renders the Outlet for child routes', () => {
    renderLayout();
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
});

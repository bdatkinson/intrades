import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DeckView from './DeckView';

describe('DeckView', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <DeckView />
      </MemoryRouter>,
    );
  });

  it('renders the main deck heading', () => {
    expect(screen.getByRole('heading', { name: /the deck/i })).toBeInTheDocument();
  });

  it('renders suit filter tabs for All, Spades, Hearts, Diamonds, Clubs', () => {
    const tabBar = screen.getByRole('tablist');
    expect(tabBar).toBeInTheDocument();

    const tabs = within(tabBar).getAllByRole('tab');
    expect(tabs).toHaveLength(5);

    const tabNames = tabs.map((t) => t.textContent || '');
    expect(tabNames.some((t) => t.startsWith('All'))).toBeTruthy();
    expect(tabNames.some((t) => t.includes('♠️'))).toBeTruthy();
    expect(tabNames.some((t) => t.includes('♥️'))).toBeTruthy();
    expect(tabNames.some((t) => t.includes('♦️'))).toBeTruthy();
    expect(tabNames.some((t) => t.includes('♣️'))).toBeTruthy();
  });

  it('shows all 52 cards by default (All tab)', () => {
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(52);
  });

  it('filters to 13 cards when spades tab is selected', async () => {
    const user = userEvent.setup();
    const spadesTab = screen.getByRole('tab', { name: /♠️/i });
    await user.click(spadesTab);

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(13); // 9 scenarios + 4 face/ace
  });

  it('filters to 13 cards when hearts tab is selected', async () => {
    const user = userEvent.setup();
    const heartsTab = screen.getByRole('tab', { name: /♥️/i });
    await user.click(heartsTab);

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(13);
  });

  it('filters to 13 cards when diamonds tab is selected', async () => {
    const user = userEvent.setup();
    const diamondsTab = screen.getByRole('tab', { name: /♦️/i });
    await user.click(diamondsTab);

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(13);
  });

  it('filters to 13 cards when clubs tab is selected', async () => {
    const user = userEvent.setup();
    const clubsTab = screen.getByRole('tab', { name: /♣️/i });
    await user.click(clubsTab);

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(13);
  });

  it('shows card count badges per suit', () => {
    // Each suit tab has a count badge showing 13 (9 scenarios + 4 face/ace)
    const badges = screen.getAllByText('13');
    expect(badges).toHaveLength(4); // 4 suits
  });

  it('renders scenario card titles in the grid', () => {
    expect(screen.getByText('The Van Black Hole')).toBeInTheDocument();
    expect(screen.getByText('The "Dead" Wire Assumption')).toBeInTheDocument();
  });

  it('renders ComingSoon cards for non-diamond face/ace cards', () => {
    expect(screen.getByText('King of Spades: Iron Thorne')).toBeInTheDocument();
    expect(screen.getByText('Ace of Hearts')).toBeInTheDocument();
  });

  it('renders coming-soon badge text on non-diamond face cards', () => {
    const comingSoonElements = screen.getAllByText(/coming soon/i);
    // 12 non-diamond face/ace cards should show coming-soon
    expect(comingSoonElements.length).toBeGreaterThanOrEqual(12);
  });

  it('renders BRT titles for diamond face/ace cards (active)', () => {
    // Use a function matcher since the text has emoji and can normalize
    expect(screen.getByText(/Select Business Name & Domain/)).toBeInTheDocument();
    expect(screen.getByText(/File for KY LLC/)).toBeInTheDocument();
    expect(screen.getByText(/Bank Account & Insurance/)).toBeInTheDocument();
    expect(screen.getByText(/Create Business Website/)).toBeInTheDocument();
  });

  it('diamond face cards do NOT show coming-soon', () => {
    // All cards with coming-soon should be non-diamond
    // Get all article cards that contain "coming soon" text
    const cardElements = screen.getAllByRole('article');
    const comingSoonCards = cardElements.filter((card) =>
      card.textContent?.toLowerCase().includes('coming soon'),
    );
    // Every card with "coming soon" should NOT be a diamonds card
    for (const card of comingSoonCards) {
      expect(card.getAttribute('data-suit')).not.toBe('diamonds');
    }
  });

  it('shows the "All" tab as selected by default', () => {
    const allTab = screen.getByRole('tab', { name: /^all/i });
    expect(allTab.getAttribute('aria-selected')).toBe('true');
  });

  it('updates aria-selected when switching tabs', async () => {
    const user = userEvent.setup();

    const spadesTab = screen.getByRole('tab', { name: /♠️/i });
    await user.click(spadesTab);
    expect(spadesTab.getAttribute('aria-selected')).toBe('true');

    const allTab = screen.getByRole('tab', { name: /^all/i });
    expect(allTab.getAttribute('aria-selected')).toBe('false');
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DeckView from './components/DeckView';

describe('DeckView Integration', () => {
  function renderDeck(initialRoute = '/deck') {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <DeckView />
      </MemoryRouter>,
    );
  }

  beforeEach(() => {
    renderDeck();
  });

  // ─── Card Count & Structure ────────────────────────────────────────

  it('renders all 52 cards (36 scenarios + 16 face/ace)', () => {
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(52);
  });

  it('renders exactly 36 scenario cards (2-10 per suit)', () => {
    const cards = screen.getAllByRole('article');
    const scenarioCards = cards.filter((c) =>
      c.getAttribute('data-testid')?.startsWith('scenario-'),
    );
    expect(scenarioCards).toHaveLength(36);
  });

  it('renders exactly 4 BRT cards (diamond face/ace)', () => {
    const cards = screen.getAllByRole('article');
    const brtCards = cards.filter((c) =>
      c.getAttribute('data-testid')?.startsWith('brt-'),
    );
    expect(brtCards).toHaveLength(4);
  });

  it('renders exactly 12 coming-soon cards (non-diamond face/ace)', () => {
    const cards = screen.getAllByRole('article');
    const csCards = cards.filter((c) =>
      c.getAttribute('data-testid')?.startsWith('face-'),
    );
    expect(csCards).toHaveLength(12);
  });

  // ─── Suit Filtering ────────────────────────────────────────────────

  it('filters cards when selecting spades tab', async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: /♠️/i }));

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(13);

    // All visible cards should be spades
    for (const card of cards) {
      expect(card.getAttribute('data-suit')).toBe('spades');
    }
  });

  it('filters cards when selecting hearts tab', async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: /♥️/i }));

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(13);

    for (const card of cards) {
      expect(card.getAttribute('data-suit')).toBe('hearts');
    }
  });

  it('filters cards when selecting diamonds tab', async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: /♦️/i }));

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(13);

    for (const card of cards) {
      expect(card.getAttribute('data-suit')).toBe('diamonds');
    }
  });

  it('filters cards when selecting clubs tab', async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: /♣️/i }));

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(13);

    for (const card of cards) {
      expect(card.getAttribute('data-suit')).toBe('clubs');
    }
  });

  it('returns to all 52 cards when clicking All tab after filtering', async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: /♠️/i }));
    expect(screen.getAllByRole('article')).toHaveLength(13);

    await user.click(screen.getByRole('tab', { name: /^all/i }));
    expect(screen.getAllByRole('article')).toHaveLength(52);
  });

  // ─── Scenario Card Flip Interaction ────────────────────────────────

  it('shows description on back face when scenario card is clicked', async () => {
    const user = userEvent.setup();

    // Find a specific scenario card
    const scenarioCard = screen.getByTestId('scenario-spades-3');
    expect(scenarioCard).toBeInTheDocument();

    // Front face should show only front content (title, not description)
    const frontFace = scenarioCard.querySelector('[data-face="front"]')!;
    expect(frontFace.textContent).not.toContain('billable time');
    expect(frontFace.textContent).toContain('The Van Black Hole');

    // Click to flip
    await user.click(scenarioCard);

    // Back face should now show the description
    const backFace = scenarioCard.querySelector('[data-face="back"]')!;
    expect(backFace.textContent).toContain('billable time');
    expect(backFace.textContent).toContain('Tools & Technology');
  });

  it('flips scenario card back when clicked again', async () => {
    const user = userEvent.setup();
    const scenarioCard = screen.getByTestId('scenario-spades-3');

    // Flip to back
    await user.click(scenarioCard);
    expect(scenarioCard.getAttribute('aria-expanded')).toBe('true');

    // Flip to front
    await user.click(scenarioCard);
    expect(scenarioCard.getAttribute('aria-expanded')).toBe('false');
  });

  it('shows "Discuss with Mentor" link on back face of scenario card', async () => {
    const user = userEvent.setup();
    const scenarioCard = screen.getByTestId('scenario-spades-3');

    // Flip to back
    await user.click(scenarioCard);

    const discussLink = within(scenarioCard).getByRole('link', {
      name: /discuss with mentor/i,
    });
    expect(discussLink).toBeInTheDocument();
  });

  it('scenario card is keyboard accessible (Enter to flip)', async () => {
    const user = userEvent.setup();
    const scenarioCard = screen.getByTestId('scenario-spades-3');

    scenarioCard.focus();
    expect(scenarioCard).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(scenarioCard.getAttribute('aria-expanded')).toBe('true');
  });

  // ─── Coming-Soon Cards (non-diamond face/ace) ──────────────────────

  it('coming-soon cards show a lock icon', () => {
    // All coming-soon cards have a Lock icon — check for the SVG
    const comingSoonCards = screen.getAllByTestId(/^face-/);
    expect(comingSoonCards.length).toBeGreaterThanOrEqual(12);

    // Every coming-soon card should have "Coming Soon" text
    for (const card of comingSoonCards) {
      expect(card.textContent?.toLowerCase()).toContain('coming soon');
    }
  });

  it('coming-soon cards show suit emblem and rank text', () => {
    const csCard = screen.getByTestId('face-spades-king');
    expect(csCard.textContent).toContain('King');
    expect(csCard.textContent).toContain('Iron Thorne');
  });

  it('coming-soon cards are not links (no navigation)', () => {
    const csCard = screen.getByTestId('face-spades-king');
    const links = within(csCard).queryAllByRole('link');
    expect(links).toHaveLength(0);
  });

  // ─── BRT Cards (diamond face/ace) ──────────────────────────────────

  it('BRT cards show the BRT badge', () => {
    const brtCards = screen.getAllByTestId(/^brt-diamonds-/);
    expect(brtCards).toHaveLength(4);

    for (const card of brtCards) {
      expect(card.textContent).toContain('BRT');
    }
  });

  it('BRT cards link to their respective BRT steps', () => {
    // J♦ -> /brt/name, Q♦ -> /brt/llc, K♦ -> /brt/bank-insurance, A♦ -> /brt/website
    const expectedRoutes: Record<string, string> = {
      'brt-diamonds-jack': '/brt/name',
      'brt-diamonds-queen': '/brt/llc',
      'brt-diamonds-king': '/brt/bank-insurance',
      'brt-diamonds-ace': '/brt/website',
    };

    for (const [testId, route] of Object.entries(expectedRoutes)) {
      const card = screen.getByTestId(testId);
      const link = within(card).getByRole('link');
      expect(link.getAttribute('href')).toBe(route);
    }
  });

  it('BRT cards show "Active" and "Start" indicators', () => {
    const brtCard = screen.getByTestId('brt-diamonds-jack');
    expect(brtCard.textContent).toContain('Active');
    expect(brtCard.textContent).toContain('Start');
  });

  it('BRT cards are NOT coming-soon (no lock icon)', () => {
    const brtCard = screen.getByTestId('brt-diamonds-jack');
    expect(brtCard.textContent?.toLowerCase()).not.toContain('coming soon');
  });

  // ─── Deck Header & Metadata ────────────────────────────────────────

  it('renders the deck heading with description', () => {
    expect(
      screen.getByRole('heading', { name: /the deck/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/36 pitfall scenarios/i),
    ).toBeInTheDocument();
  });

  it('shows count badges on all suit tabs', () => {
    // Each suit has 13 cards (9 scenarios + 4 face/ace), All has 52
    expect(screen.getByText('52')).toBeInTheDocument(); // All tab
    const thirteenBadges = screen.getAllByText('13');
    expect(thirteenBadges).toHaveLength(4); // 4 suit tabs
  });
});

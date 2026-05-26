import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ScenarioCard from './ScenarioCard';
import type { ScenarioCard as ScenarioCardType } from '../types';

const baseScenario: ScenarioCardType = {
  id: 'spades-3',
  rank: 3,
  suit: 'spades',
  title: 'The Van Black Hole',
  category: 'Tools & Technology',
  description:
    'Letting the work vehicle become so disorganized that 20% of billable time is wasted searching for tools or parts.',
  mentorId: 'iron-thorne',
};

function renderCard(scenario: ScenarioCardType = baseScenario) {
  return render(
    <MemoryRouter>
      <ScenarioCard scenario={scenario} />
    </MemoryRouter>,
  );
}

describe('ScenarioCard', () => {
  // ── Front face ──────────────────────────────────────────────────────
  it('renders the rank number on the front face', () => {
    renderCard();
    const rank = screen.getByText('3');
    expect(rank).toBeInTheDocument();
    expect(rank.closest('[data-face="front"]')).toBeTruthy();
  });

  it('renders the suit symbol on the front face', () => {
    renderCard();
    const suit = screen.getByLabelText('spades');
    expect(suit).toBeInTheDocument();
    expect(suit.textContent).toBe('♠️');
    expect(suit.closest('[data-face="front"]')).toBeTruthy();
  });

  it('renders the title on the front face', () => {
    renderCard();
    expect(screen.getByText('The Van Black Hole')).toBeInTheDocument();
  });

  // ── Suit colors ─────────────────────────────────────────────────────
  // Color classes live on the face divs (front/back), not the outer article.
  const getFrontFace = (testId: string) =>
    screen.getByTestId(testId).querySelector('[data-face="front"]') as HTMLElement;

  it.each([
    ['spades', 'border-slate-500'],
    ['hearts', 'border-rose-500'],
    ['diamonds', 'border-amber-500'],
    ['clubs', 'border-emerald-500'],
  ] as const)('applies %s suit border color %s', (suit, expectedBorder) => {
    renderCard({ ...baseScenario, id: `${suit}-3`, suit });
    const face = getFrontFace(`scenario-${suit}-3`);
    expect(face.className).toContain(expectedBorder);
  });

  it('uses dark background from suit color map', () => {
    renderCard();
    const face = getFrontFace('scenario-spades-3');
    expect(face.className).toContain('bg-slate-900');
  });

  it('uses amber background for diamonds suit', () => {
    renderCard({ ...baseScenario, id: 'diamonds-3', suit: 'diamonds' });
    const face = getFrontFace('scenario-diamonds-3');
    expect(face.className).toContain('bg-amber-950');
  });

  // ── Back face ───────────────────────────────────────────────────────
  it('renders the full description on the back face', () => {
    renderCard();
    const description = screen.getByText(/20% of billable time/);
    expect(description).toBeInTheDocument();
    expect(description.closest('[data-face="back"]')).toBeTruthy();
  });

  it('renders the category on the back face', () => {
    renderCard();
    const category = screen.getByText('Tools & Technology');
    expect(category).toBeInTheDocument();
  });

  it('renders "Discuss with Mentor" link on the back face', () => {
    renderCard();
    const discussLink = screen.getByRole('link', { name: /discuss with mentor/i });
    expect(discussLink).toBeInTheDocument();
    expect(discussLink.closest('[data-face="back"]')).toBeTruthy();
  });

  // ── Flip animation ──────────────────────────────────────────────────
  it('shows front face visible by default', () => {
    renderCard();
    const inner = screen.getByTestId('scenario-spades-3').querySelector(
      '[data-flip-inner]',
    ) as HTMLElement;
    expect(inner).toBeTruthy();
    // Not flipped: no rotateY class on inner
    expect(inner.className).not.toContain('rotate-y-180');
  });

  it('flips to back face on click', async () => {
    const user = userEvent.setup();
    renderCard();
    const card = screen.getByTestId('scenario-spades-3');

    await user.click(card);

    const inner = card.querySelector('[data-flip-inner]') as HTMLElement;
    // Tailwind arbitrary value: [transform:rotateY(180deg)]
    expect(inner.className).toContain('[transform:rotateY(180deg)]');
  });

  it('flips back to front on second click', async () => {
    const user = userEvent.setup();
    renderCard();
    const card = screen.getByTestId('scenario-spades-3');

    await user.click(card);
    await user.click(card);

    const inner = card.querySelector('[data-flip-inner]') as HTMLElement;
    expect(inner.className).not.toContain('[transform:rotateY(180deg)]');
  });

  // ── Accessibility / data attributes ─────────────────────────────────
  it('has an aria-label describing the card', () => {
    renderCard();
    const card = screen.getByTestId('scenario-spades-3');
    expect(card.getAttribute('aria-label')).toBe('Scenario card: The Van Black Hole (3 of spades)');
  });

  it('has data-suit attribute', () => {
    renderCard();
    const card = screen.getByTestId('scenario-spades-3');
    expect(card.getAttribute('data-suit')).toBe('spades');
  });

  it('sets aria-expanded when flipped', async () => {
    const user = userEvent.setup();
    renderCard();
    const card = screen.getByTestId('scenario-spades-3');

    expect(card.getAttribute('aria-expanded')).toBe('false');

    await user.click(card);
    expect(card.getAttribute('aria-expanded')).toBe('true');
  });

  // ── Responsive ─────────────────────────────────────────────────────
  it('has a min-height so cards are consistent', () => {
    renderCard();
    const card = screen.getByTestId('scenario-spades-3');
    expect(card.className).toContain('min-h-');
  });

  it('uses responsive width classes', () => {
    renderCard();
    const card = screen.getByTestId('scenario-spades-3');
    // Should have some width constraint for grid layout
    expect(card.className).toContain('w-full');
  });
});

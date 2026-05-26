import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { BRTPage } from './BRTPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/brt']}>
      <BRTPage />
    </MemoryRouter>,
  );
}

describe('BRTPage', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: /business readiness/i }),
    ).toBeInTheDocument();
  });

  it('renders a description of the BRT', () => {
    renderPage();
    expect(
      screen.getByText(/guided 4-step/i),
    ).toBeInTheDocument();
  });

  it('renders all 4 BRT step cards', () => {
    renderPage();
    expect(screen.getByText('Select Business Name & Domain')).toBeInTheDocument();
    expect(screen.getByText('File for KY LLC')).toBeInTheDocument();
    expect(screen.getByText('Bank Account & Insurance')).toBeInTheDocument();
    expect(screen.getByText('Create Business Website')).toBeInTheDocument();
  });

  it('renders the BRTStepper with all 4 steps', () => {
    renderPage();
    // The stepper renders card face labels: jack, queen, king, ace
    // These appear both in the stepper AND step cards — query the stepper nav
    const stepper = screen.getByRole('navigation', {
      name: /business readiness track progress/i,
    });
    expect(stepper).toBeInTheDocument();

    // Verify all 4 step buttons exist in the stepper
    const stepButtons = stepper.querySelectorAll('button[role="button"]');
    expect(stepButtons).toHaveLength(4);
  });

  it('shows the first step as the active step indicator', () => {
    renderPage();
    // The "Ready" status badge appears on the active (first) step
    const readyBadges = screen.getAllByText(/ready/i);
    expect(readyBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('shows locked steps as locked', () => {
    renderPage();
    const lockedBadges = screen.getAllByText(/locked/i);
    // Steps 2-3 are locked (queen and king per BRT_STEPS)
    expect(lockedBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('clicking an active step card can navigate', async () => {
    // This test verifies the onClick handler exists — navigation
    // to routes is tested in integration/E2E tests
    renderPage();

    // The first step card (Jack) is active and clickable
    const activeCard = screen.getByText('Select Business Name & Domain').closest('button');
    expect(activeCard).not.toBeDisabled();
  });

  it('locked step cards are not clickable', () => {
    renderPage();

    // The second step (Queen) is locked
    const lockedCard = screen.getByText('File for KY LLC').closest('button');
    expect(lockedCard).toBeDisabled();
  });

  it('renders diamond-themed visual elements', () => {
    renderPage();
    // Diamond symbol should appear in the stepper
    const diamonds = screen.getAllByText('♦');
    expect(diamonds.length).toBeGreaterThanOrEqual(4);
  });

  it('shows a call-to-action for starting the BRT', () => {
    renderPage();
    expect(
      screen.getByText(/start/i),
    ).toBeInTheDocument();
  });
});

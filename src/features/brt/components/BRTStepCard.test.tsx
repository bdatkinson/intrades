import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { BRTStepCard } from './BRTStepCard';
import type { BRTStep } from '../types';

const activeStep: BRTStep = {
  id: 'brt-name',
  card: 'jack',
  title: 'Select Business Name & Domain',
  subtitle: 'Choose a name that works for your trade',
  status: 'active',
  route: '/brt/name',
};

const lockedStep: BRTStep = {
  id: 'brt-llc',
  card: 'queen',
  title: 'File for KY LLC',
  subtitle: 'Register your business with the state',
  status: 'locked',
  route: '/brt/llc',
};

const completedStep: BRTStep = {
  id: 'brt-bank-insurance',
  card: 'king',
  title: 'Bank Account & Insurance',
  subtitle: 'Set up your financial foundation',
  status: 'completed',
  route: '/brt/bank-insurance',
};

function renderCard(step: BRTStep, onClick?: () => void) {
  return render(
    <MemoryRouter>
      <BRTStepCard step={step} onClick={onClick} />
    </MemoryRouter>,
  );
}

describe('BRTStepCard', () => {
  it('renders step title and subtitle', () => {
    renderCard(activeStep);
    expect(screen.getByText('Select Business Name & Domain')).toBeInTheDocument();
    expect(screen.getByText('Choose a name that works for your trade')).toBeInTheDocument();
  });

  it('renders the card face label (Jack, Queen, King, Ace)', () => {
    renderCard(activeStep);
    expect(screen.getByText(/jack/i)).toBeInTheDocument();
  });

  it('shows a diamond suit symbol', () => {
    renderCard(activeStep);
    expect(screen.getByText('♦')).toBeInTheDocument();
  });

  it('renders the status badge for active step', () => {
    renderCard(activeStep);
    expect(screen.getByText(/ready/i)).toBeInTheDocument();
  });

  it('renders the status badge for locked step', () => {
    renderCard(lockedStep);
    expect(screen.getByText(/locked/i)).toBeInTheDocument();
  });

  it('renders the status badge for completed step', () => {
    renderCard(completedStep);
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });

  it('renders locked steps with reduced opacity', () => {
    renderCard(lockedStep);
    const card = screen.getByRole('button');
    expect(card.className).toMatch(/opacity/);
  });

  it('active steps are clickable', async () => {
    const handleClick = vi.fn();
    renderCard(activeStep, handleClick);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('locked steps are not clickable', async () => {
    const handleClick = vi.fn();
    renderCard(lockedStep, handleClick);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(0);
  });

  it('completed steps show a check icon', () => {
    renderCard(completedStep);
    // Looking for Lucide Check icon — it renders as an svg
    const card = screen.getByRole('button');
    expect(card.querySelector('svg')).toBeTruthy();
  });

  it('does not show check icon on active steps', () => {
    renderCard(activeStep);
    const card = screen.getByRole('button');
    // Active steps may have a different icon or none — but no check
    const svgs = card.querySelectorAll('svg');
    const hasCheck = Array.from(svgs).some((svg) =>
      svg.classList.contains('lucide-check'),
    );
    expect(hasCheck).toBe(false);
  });
});

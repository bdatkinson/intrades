import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BRTStepper } from './BRTStepper';
import { BRT_STEPS } from '../types';

describe('BRTStepper', () => {
  it('renders all 4 steps', () => {
    render(
      <BRTStepper
        steps={BRT_STEPS}
        activeStepId="brt-name"
        onStepClick={() => {}}
      />,
    );

    expect(screen.getByText(/jack/i)).toBeInTheDocument();
    expect(screen.getByText(/queen/i)).toBeInTheDocument();
    expect(screen.getByText(/king/i)).toBeInTheDocument();
    expect(screen.getByText(/ace/i)).toBeInTheDocument();
  });

  it('shows diamond symbols for each step', () => {
    render(
      <BRTStepper
        steps={BRT_STEPS}
        activeStepId="brt-name"
        onStepClick={() => {}}
      />,
    );

    const diamonds = screen.getAllByText('♦');
    expect(diamonds).toHaveLength(4);
  });

  it('highlights the active step differently', () => {
    render(
      <BRTStepper
        steps={BRT_STEPS}
        activeStepId="brt-name"
        onStepClick={() => {}}
      />,
    );

    // The active step's inner indicator circle should have amber coloring
    const steps = screen.getAllByRole('button');
    // First step (jack) is active — its inner circle has amber
    const activeCircle = steps[0].querySelector('div');
    expect(activeCircle?.className).toMatch(/amber/);
  });

  it('shows completed steps with a different indicator', () => {
    const stepsWithCompleted = BRT_STEPS.map((s) =>
      s.id === 'brt-name'
        ? { ...s, status: 'completed' as const }
        : s,
    );

    render(
      <BRTStepper
        steps={stepsWithCompleted}
        activeStepId="brt-llc"
        onStepClick={() => {}}
      />,
    );

    // Completed step should show check
    const completedStep = screen.getAllByRole('button')[0];
    expect(completedStep.querySelector('svg')).toBeTruthy();
  });

  it('shows locked steps as non-interactive', () => {
    render(
      <BRTStepper
        steps={BRT_STEPS}
        activeStepId="brt-name"
        onStepClick={() => {}}
      />,
    );

    // Steps 2-4 are locked (except the last which is also active in our fixtures)
    const lockedStep = screen.getAllByRole('button')[1]; // queen, locked
    expect(lockedStep).toBeDisabled();
  });

  it('calls onStepClick with step id when clicking an unlocked step', async () => {
    const handleClick = vi.fn();

    render(
      <BRTStepper
        steps={BRT_STEPS}
        activeStepId="brt-name"
        onStepClick={handleClick}
      />,
    );

    const steps = screen.getAllByRole('button');
    // First step (jack) is active/unlocked
    await userEvent.click(steps[0]);
    expect(handleClick).toHaveBeenCalledWith('brt-name');
  });

  it('does not call onStepClick when clicking a locked step', async () => {
    const handleClick = vi.fn();

    render(
      <BRTStepper
        steps={BRT_STEPS}
        activeStepId="brt-name"
        onStepClick={handleClick}
      />,
    );

    const steps = screen.getAllByRole('button');
    // Second step (queen) is locked
    await userEvent.click(steps[1]);
    expect(handleClick).toHaveBeenCalledTimes(0);
  });

  it('renders connector lines between steps', () => {
    render(
      <BRTStepper
        steps={BRT_STEPS}
        activeStepId="brt-name"
        onStepClick={() => {}}
      />,
    );

    // There should be 3 connectors between 4 steps
    const connectors = document.querySelectorAll('[data-connector]');
    expect(connectors).toHaveLength(3);
  });
});

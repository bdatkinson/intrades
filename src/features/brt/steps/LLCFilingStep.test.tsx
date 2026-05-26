import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LLCFilingStep } from './LLCFilingStep';

// Mock localStorage with a plain store (not vi.fn-based) so resetAllMocks
// doesn't wipe the implementation. getItem/setItem are mocked with vi.fn
// only for call spying; the actual store lives in a plain object.
const fakeStore: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => fakeStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    fakeStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete fakeStore[key];
  }),
  clear: vi.fn(() => {
    Object.keys(fakeStore).forEach((k) => delete fakeStore[k]);
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

function renderStep() {
  return render(<LLCFilingStep />);
}

describe('LLCFilingStep', () => {
  beforeEach(() => {
    // Clear the plain store (resetAllMocks wipes mock impls, so mock.clear() won't work)
    Object.keys(fakeStore).forEach((k) => delete fakeStore[k]);
    vi.resetAllMocks();
  });

  // ─── Rendering ───

  it('renders the step heading with Q♦️ indicator', () => {
    renderStep();
    expect(
      screen.getByRole('heading', { name: /Q.*File for KY LLC/i }),
    ).toBeInTheDocument();
    // Diamond suit indicator present in the badge area
    expect(screen.getByText('♦')).toBeInTheDocument();
    expect(screen.getByText('Q')).toBeInTheDocument();
  });

  it('renders all 5 sub-steps', () => {
    renderStep();

    expect(screen.getByText(/choose a registered agent/i)).toBeInTheDocument();
    expect(
      screen.getByText(/file articles of organization/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/get an ein from the irs/i)).toBeInTheDocument();
    expect(screen.getByText(/ky tax registration/i)).toBeInTheDocument();
    expect(screen.getByText(/create an operating agreement/i)).toBeInTheDocument();
  });

  it('renders a description for each sub-step', () => {
    renderStep();

    // Step 1: Registered Agent
    expect(
      screen.getByText(/registered agent receives official legal/i),
    ).toBeInTheDocument();

    // Step 2: Articles of Organization
    expect(screen.getByText(/\$40/)).toBeInTheDocument();

    // Step 3: EIN
    expect(
      screen.getByText(/free from the irs/i),
    ).toBeInTheDocument();

    // Step 5: Operating Agreement
    expect(
      screen.getByText(/internal document that outlines/i),
    ).toBeInTheDocument();
  });

  // ─── External links ───

  it('renders an external link to KY SOS business filings', () => {
    renderStep();

    const sosLink = screen.getByRole('link', {
      name: /ky secretary of state business filings/i,
    });
    expect(sosLink).toBeInTheDocument();
    expect(sosLink).toHaveAttribute(
      'href',
      'https://app.sos.ky.gov/ftbusinessfilings/',
    );
    expect(sosLink).toHaveAttribute('target', '_blank');
    expect(sosLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders an external link to IRS EIN application', () => {
    renderStep();

    const irsLink = screen.getByRole('link', {
      name: /irs ein online application/i,
    });
    expect(irsLink).toBeInTheDocument();
    expect(irsLink).toHaveAttribute(
      'href',
      'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online',
    );
    expect(irsLink).toHaveAttribute('target', '_blank');
  });

  // ─── Checklist interaction ───

  it('renders a checkbox for each sub-step', () => {
    renderStep();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(5);
  });

  it('checkboxes start unchecked', () => {
    renderStep();

    const checkboxes = screen.getAllByRole('checkbox');
    for (const cb of checkboxes) {
      expect(cb).not.toBeChecked();
    }
  });

  it('toggling a checkbox marks it checked', async () => {
    renderStep();

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
  });

  it('toggling a checked checkbox unmarks it', async () => {
    renderStep();

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
    await userEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
  });

  it('checkboxes are labeled with their step description', () => {
    renderStep();

    expect(
      screen.getByRole('checkbox', { name: /choose a registered agent/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /file articles of organization/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /get an ein from the irs/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /ky tax registration/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /create an operating agreement/i }),
    ).toBeInTheDocument();
  });

  // ─── localStorage persistence ───

  it('saves completed sub-steps to localStorage', async () => {
    renderStep();

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);
    await userEvent.click(checkboxes[2]);

    // React useEffect flushes asynchronously — wait for localStorage call
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'brt-llc-progress',
        expect.any(String),
      );
    });

    // Find the LAST call (after all clicks, React flushed all effects)
    const allCalls = localStorageMock.setItem.mock.calls.filter(
      (call: string[]) => call[0] === 'brt-llc-progress',
    );
    const lastCall = allCalls[allCalls.length - 1];
    const saved = JSON.parse(lastCall[1]);
    expect(saved[0]).toBe(true); // Step 1
    expect(saved[2]).toBe(true); // Step 3
    expect(saved[1]).toBe(false); // Step 2 not checked
  });

  it('loads previously saved progress from localStorage', () => {
    fakeStore['brt-llc-progress'] = JSON.stringify([
      true,
      false,
      true,
      false,
      false,
    ]);

    render(<LLCFilingStep />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
    expect(checkboxes[3]).not.toBeChecked();
    expect(checkboxes[4]).not.toBeChecked();
  });

  // ─── Progress indicator ───

  it('shows a progress count (e.g. "2 of 5 complete")', async () => {
    renderStep();

    // Initially 0 of 5 — text is split across multiple nodes so use aria-label
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', '0 of 5 sub-steps complete');

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);
    await userEvent.click(checkboxes[1]);

    expect(status).toHaveAttribute('aria-label', '2 of 5 sub-steps complete');
  });

  // ─── Mentor tip ───

  it('renders David Chang (K♦️) tip', () => {
    renderStep();

    expect(screen.getByText(/david chang/i)).toBeInTheDocument();
    expect(screen.getByText(/K♦️/i)).toBeInTheDocument();
    expect(
      screen.getByText(/think of your llc as the operating system/i),
    ).toBeInTheDocument();
  });

  // ─── Visual theme ───

  it('renders with Diamond/amber theme', () => {
    renderStep();

    // Diamond suit displayed in heading
    const diamonds = screen.getAllByText('♦');
    expect(diamonds.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the sub-step numbers (1-5)', () => {
    renderStep();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

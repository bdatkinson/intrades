import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BusinessNameStep } from './BusinessNameStep';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

function renderStep() {
  return render(<BusinessNameStep />);
}

describe('BusinessNameStep', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ─── Rendering ───

  it('renders the step heading with J♦️ indicator', () => {
    renderStep();
    expect(
      screen.getByRole('heading', { name: /select business name/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('J♦️')).toBeInTheDocument();
  });

  it('renders the step subtitle about choosing a name and domain', () => {
    renderStep();
    expect(
      screen.getByText(/your name is how customers will find you/i),
    ).toBeInTheDocument();
  });

  it('renders a text input for the business name', () => {
    renderStep();
    const nameInput = screen.getByRole('textbox', { name: /business name/i });
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute('placeholder');
  });

  it('renders a text input for trade type', () => {
    renderStep();
    const tradeInput = screen.getByRole('textbox', { name: /your trade/i });
    expect(tradeInput).toBeInTheDocument();
  });

  it('renders a text input for city', () => {
    renderStep();
    const cityInput = screen.getByRole('textbox', { name: /your city/i });
    expect(cityInput).toBeInTheDocument();
  });

  // ─── Name Guidelines ───

  it('renders a name guidelines section with tips', () => {
    renderStep();
    expect(
      screen.getByRole('heading', { name: /naming guidelines/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/memorable/i)).toBeInTheDocument();
    // "professional" appears in subtitle + guidelines heading + Aisha's tip
    const proMatches = screen.getAllByText(/professional/i);
    expect(proMatches.length).toBeGreaterThanOrEqual(2);
    const tradeMatches = screen.getAllByText(/trade-relevant/i);
    expect(tradeMatches.length).toBeGreaterThanOrEqual(2);
  });

  it('shows common naming patterns for inspiration', () => {
    renderStep();
    expect(
      screen.getByText(/\[Name\] \[Trade\] LLC/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/\[City\] \[Trade\] Services/),
    ).toBeInTheDocument();
  });

  // ─── Name Suggestions ───

  it('generates suggestions when trade and city are both entered', async () => {
    const user = userEvent.setup();
    renderStep();

    const tradeInput = screen.getByRole('textbox', { name: /your trade/i });
    const cityInput = screen.getByRole('textbox', { name: /your city/i });

    await user.type(tradeInput, 'Plumbing');
    await user.type(cityInput, 'Lexington');

    await waitFor(() => {
      // Pattern: "[City] [Trade] Services"
      expect(screen.getByText(/lexington plumbing services/i)).toBeInTheDocument();
      // Pattern: "[City] [Trade] Pros"
      expect(screen.getByText(/lexington plumbing pros/i)).toBeInTheDocument();
    });
  });

  it('does not show suggestions when trade or city is empty', () => {
    renderStep();

    // Suggestions section should not render when inputs are empty
    expect(screen.queryByText('Try these suggestions:')).not.toBeInTheDocument();
  });

  it('clicking a suggestion fills the business name input', async () => {
    const user = userEvent.setup();
    renderStep();

    const tradeInput = screen.getByRole('textbox', { name: /your trade/i });
    const cityInput = screen.getByRole('textbox', { name: /your city/i });

    await user.type(tradeInput, 'Electrical');
    await user.type(cityInput, 'Louisville');

    await waitFor(() => {
      expect(
        screen.getByText(/louisville electrical services/i),
      ).toBeInTheDocument();
    });

    const suggestionButton = screen.getByText(/louisville electrical services/i);
    await user.click(suggestionButton);

    const nameInput = screen.getByRole('textbox', { name: /business name/i });
    expect(nameInput).toHaveValue('Louisville Electrical Services');
  });

  it('allows typing a custom name instead of using a suggestion', async () => {
    const user = userEvent.setup();
    renderStep();

    const nameInput = screen.getByRole('textbox', { name: /business name/i });
    await user.type(nameInput, 'Bates Electric');

    expect(nameInput).toHaveValue('Bates Electric');
  });

  // ─── Domain Lookup ───

  it('renders a text input for a domain name', () => {
    renderStep();
    const domainInput = screen.getByRole('textbox', { name: /domain/i });
    expect(domainInput).toBeInTheDocument();
  });

  it('auto-suggests a domain based on the business name', async () => {
    const user = userEvent.setup();
    renderStep();

    const nameInput = screen.getByRole('textbox', { name: /business name/i });
    await user.type(nameInput, 'Bates Electric');

    await waitFor(() => {
      const domainInput = screen.getByRole('textbox', { name: /domain/i });
      expect(domainInput).toHaveValue('bateselectric.com');
    });
  });

  it('renders manual domain lookup links to registrars', () => {
    renderStep();

    const namecheapLink = screen.getByRole('link', { name: /search namecheap/i });
    expect(namecheapLink).toBeInTheDocument();
    expect(namecheapLink).toHaveAttribute('target', '_blank');
    expect(namecheapLink).toHaveAttribute('rel', 'noopener noreferrer');

    const godaddyLink = screen.getByRole('link', { name: /search godaddy/i });
    expect(godaddyLink).toBeInTheDocument();
    expect(godaddyLink).toHaveAttribute('target', '_blank');
    expect(godaddyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('allows manual domain name editing', async () => {
    const user = userEvent.setup();
    renderStep();

    const domainInput = screen.getByRole('textbox', { name: /domain/i });
    await user.clear(domainInput);
    await user.type(domainInput, 'bates-electric.com');

    expect(domainInput).toHaveValue('bates-electric.com');
  });

  // ─── localStorage Persistence ───

  it('saves business name and domain to localStorage', async () => {
    const user = userEvent.setup();
    renderStep();

    const nameInput = screen.getByRole('textbox', { name: /business name/i });
    await user.type(nameInput, 'Bates Electric');

    const domainInput = screen.getByRole('textbox', { name: /domain/i });
    await user.clear(domainInput);
    await user.type(domainInput, 'bateselectric.com');

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'brt-name',
      expect.stringContaining('Bates Electric'),
    );

    const savedCalls = localStorageMock.setItem.mock.calls.filter(
      (call: string[]) => call[0] === 'brt-name',
    );
    const saved = JSON.parse(savedCalls[savedCalls.length - 1][1]);
    expect(saved.businessName).toBe('Bates Electric');
    expect(saved.domain).toBe('bateselectric.com');
  });

  it('loads previously saved business name and domain from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        businessName: 'Bluegrass HVAC',
        domain: 'bluegrasshvac.com',
      }),
    );

    render(<BusinessNameStep key="fresh" />);

    const nameInput = screen.getByRole('textbox', { name: /business name/i });
    expect(nameInput).toHaveValue('Bluegrass HVAC');

    const domainInput = screen.getByRole('textbox', { name: /domain/i });
    expect(domainInput).toHaveValue('bluegrasshvac.com');
  });

  it('restores trade and city from saved state', () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({
        businessName: 'Bluegrass HVAC',
        domain: 'bluegrasshvac.com',
        trade: 'HVAC',
        city: 'Lexington',
      }),
    );

    render(<BusinessNameStep key="fresh" />);

    const tradeInput = screen.getByRole('textbox', { name: /your trade/i });
    expect(tradeInput).toHaveValue('HVAC');

    const cityInput = screen.getByRole('textbox', { name: /your city/i });
    expect(cityInput).toHaveValue('Lexington');
  });

  // ─── Completion Status ───

  it('does not show completion indicator when name is empty', () => {
    renderStep();
    expect(
      screen.queryByText(/name selected/i),
    ).not.toBeInTheDocument();
  });

  it('shows completion indicator when both name and domain are filled', async () => {
    const user = userEvent.setup();
    renderStep();

    const nameInput = screen.getByRole('textbox', { name: /business name/i });
    await user.type(nameInput, 'Bates Electric');

    const domainInput = screen.getByRole('textbox', { name: /domain/i });
    await user.clear(domainInput);
    await user.type(domainInput, 'bateselectric.com');

    await waitFor(() => {
      expect(screen.getByText(/ready/i)).toBeInTheDocument();
    });
  });

  // ─── Mentor Tip ───

  it('renders Aisha Okonjo (Q♦️) contextual tip', () => {
    renderStep();

    expect(screen.getByText(/aisha okonjo/i)).toBeInTheDocument();
    expect(screen.getByText('Q♦️')).toBeInTheDocument();
    expect(
      screen.getByText(/your name is your first impression/i),
    ).toBeInTheDocument();
  });

  // ─── Visual Theme ───

  it('renders with Diamond/amber theme', () => {
    renderStep();

    // J♦️ appears in heading, Q♦️ appears in mentor tip
    expect(screen.getByText('J♦️')).toBeInTheDocument();
    expect(screen.getByText('Q♦️')).toBeInTheDocument();
  });
});

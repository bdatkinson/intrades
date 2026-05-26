import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DeckView from '../deck/components/DeckView';
import { BRTPage } from '../brt/BRTPage';
import { BusinessNameStep } from '../brt/steps/BusinessNameStep';
import { LLCFilingStep } from '../brt/steps/LLCFilingStep';
import { BankInsuranceStep } from '../brt/steps/BankInsuranceStep';
import { WebsiteStep } from '../brt/steps/WebsiteStep';

// ─── Route resolution tests ────────────────────────────────────

function renderAt(path: string, Component: React.ComponentType) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Component />
    </MemoryRouter>,
  );
}

describe('Route: /deck', () => {
  it('renders the DeckView heading', () => {
    renderAt('/deck', DeckView);
    expect(screen.getByRole('heading', { name: /the deck/i })).toBeInTheDocument();
  });

  it('renders all 52 cards', () => {
    renderAt('/deck', DeckView);
    expect(screen.getAllByRole('article')).toHaveLength(52);
  });

  it('renders BRT links for diamond face cards', () => {
    renderAt('/deck', DeckView);
    // Diamond face cards should have navigation links to BRT steps
    const brtLinks = screen.getAllByText(/start/i);
    expect(brtLinks.length).toBeGreaterThanOrEqual(4);
  });
});

describe('Route: /brt', () => {
  it('renders the BRTPage heading', () => {
    renderAt('/brt', BRTPage);
    expect(
      screen.getByRole('heading', { name: /business readiness/i }),
    ).toBeInTheDocument();
  });

  it('renders all 4 BRT steps as cards', () => {
    renderAt('/brt', BRTPage);
    expect(screen.getByText('Select Business Name & Domain')).toBeInTheDocument();
    expect(screen.getByText('File for KY LLC')).toBeInTheDocument();
    expect(screen.getByText('Bank Account & Insurance')).toBeInTheDocument();
    expect(screen.getByText('Create Business Website')).toBeInTheDocument();
  });

  it('renders the stepper navigation', () => {
    renderAt('/brt', BRTPage);
    const stepper = screen.getByRole('navigation', {
      name: /business readiness track progress/i,
    });
    expect(stepper).toBeInTheDocument();
  });
});

describe('Route: /brt/name', () => {
  it('renders the BusinessNameStep heading', () => {
    renderAt('/brt/name', BusinessNameStep);
    expect(
      screen.getByRole('heading', { name: /select business name/i }),
    ).toBeInTheDocument();
  });

  it('renders the name input field', () => {
    renderAt('/brt/name', BusinessNameStep);
    expect(
      screen.getByPlaceholderText(/e\.g\. Bluegrass Electrical/i),
    ).toBeInTheDocument();
  });
});

describe('Route: /brt/llc', () => {
  it('renders the LLCFilingStep heading', () => {
    renderAt('/brt/llc', LLCFilingStep);
    expect(
      screen.getByRole('heading', { name: /file for ky llc/i }),
    ).toBeInTheDocument();
  });

  it('renders LLC filing checklist items', () => {
    renderAt('/brt/llc', LLCFilingStep);
    // "Registered Agent" and "Articles of Organization" appear both as headings and in descriptions
    const agentItems = screen.getAllByText(/registered agent/i);
    expect(agentItems.length).toBeGreaterThanOrEqual(1);
    const articlesItems = screen.getAllByText(/articles of organization/i);
    expect(articlesItems.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Route: /brt/bank-insurance', () => {
  it('renders the BankInsuranceStep heading', () => {
    renderAt('/brt/bank-insurance', BankInsuranceStep);
    expect(
      screen.getByRole('heading', { name: /bank account/i }),
    ).toBeInTheDocument();
  });

  it('renders both bank and insurance sections', () => {
    renderAt('/brt/bank-insurance', BankInsuranceStep);
    expect(screen.getByText(/commercial bank account/i)).toBeInTheDocument();
    expect(screen.getByText(/business insurance/i)).toBeInTheDocument();
  });
});

describe('Route: /brt/website', () => {
  it('renders the WebsiteStep heading', () => {
    renderAt('/brt/website', WebsiteStep);
    expect(
      screen.getByRole('heading', { name: /create business website/i }),
    ).toBeInTheDocument();
  });

  it('renders website content builder sections', () => {
    renderAt('/brt/website', WebsiteStep);
    expect(screen.getByText(/what your site needs/i)).toBeInTheDocument();
  });
});

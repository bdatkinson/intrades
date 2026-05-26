import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { BankInsuranceStep } from './BankInsuranceStep';

function renderStep() {
  return render(
    <MemoryRouter>
      <BankInsuranceStep />
    </MemoryRouter>,
  );
}

describe('BankInsuranceStep', () => {
  // ── Section A: Bank Account ──────────────────────────────────
  it('renders the Bank Account section heading', () => {
    renderStep();
    expect(
      screen.getByRole('heading', { name: /commercial bank account/i }),
    ).toBeInTheDocument();
  });

  it('explains why a separate business account is needed', () => {
    renderStep();
    expect(
      screen.getByText(/liability protection/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/tax simplicity/i),
    ).toBeInTheDocument();
  });

  it('lists what to bring to the bank', () => {
    renderStep();
    expect(screen.getByText(/EIN letter/i)).toBeInTheDocument();
    expect(screen.getByText(/Articles of Organization/i)).toBeInTheDocument();
    expect(screen.getByText(/government-issued ID/i)).toBeInTheDocument();
    expect(screen.getByText(/initial deposit/i)).toBeInTheDocument();
  });

  it('recommends community banks and credit unions', () => {
    renderStep();
    expect(
      screen.getByText(/community banks/i),
    ).toBeInTheDocument();
  });

  it('renders the bank checklist with three items', () => {
    renderStep();
    expect(
      screen.getByRole('button', { name: /opened a business checking account/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /got a business debit card/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /set up online banking/i }),
    ).toBeInTheDocument();
  });

  it('allows toggling bank checklist items', async () => {
    const user = userEvent.setup();
    renderStep();

    const opened = screen.getByRole('button', {
      name: /opened a business checking account/i,
    });

    // Initially unchecked (strikethrough not applied = text-slate-300, not text-emerald-400)
    expect(opened.querySelector('span.text-slate-300')).toBeTruthy();

    await user.click(opened);
    // After click: checked style applied
    expect(opened.querySelector('span.text-emerald-400')).toBeTruthy();

    await user.click(opened);
    // After second click: unchecked again
    expect(opened.querySelector('span.text-slate-300')).toBeTruthy();
  });

  // ── Section B: Insurance ────────────────────────────────────
  it('renders the Insurance section heading', () => {
    renderStep();
    expect(
      screen.getByRole('heading', { name: /business insurance/i }),
    ).toBeInTheDocument();
  });

  it('lists the four insurance types needed', () => {
    renderStep();
    // "General Liability" appears both in insurance types AND checklist
    const glElements = screen.getAllByText(/General Liability/i);
    expect(glElements.length).toBeGreaterThanOrEqual(2); // one in types, one in checklist

    expect(screen.getByText(/Workers' Comp/i)).toBeInTheDocument();
    expect(screen.getByText(/Commercial Auto/i)).toBeInTheDocument();
    expect(screen.getByText(/Tools & Equipment/i)).toBeInTheDocument();
  });

  it('renders quick-quote provider links', () => {
    renderStep();
    const thimble = screen.getByRole('link', { name: /thimble/i });
    expect(thimble).toHaveAttribute('href', 'https://www.thimble.com/');

    const nextInsurance = screen.getByRole('link', { name: /next insurance/i });
    expect(nextInsurance).toHaveAttribute(
      'href',
      'https://www.nextinsurance.com/',
    );

    const simplyBusiness = screen.getByRole('link', { name: /simply business/i });
    expect(simplyBusiness).toHaveAttribute(
      'href',
      'https://www.simplybusiness.com/',
    );
  });

  it('renders the insurance checklist with three items', () => {
    renderStep();
    expect(
      screen.getByRole('button', { name: /got a general liability quote/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /compared at least 2 providers/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /selected an insurance policy/i }),
    ).toBeInTheDocument();
  });

  // ── Mentor Tip ──────────────────────────────────────────────
  it('renders the mentor tip from Big Mike', () => {
    renderStep();
    expect(screen.getByText(/Big Mike/i)).toBeInTheDocument();
    expect(screen.getByText(/K♣️/)).toBeInTheDocument();
    expect(
      screen.getByText(/one lawsuit without it and you're done/i),
    ).toBeInTheDocument();
  });
});

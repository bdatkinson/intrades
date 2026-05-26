import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { WebsiteStep } from './WebsiteStep';

function renderStep() {
  return render(
    <MemoryRouter>
      <WebsiteStep />
    </MemoryRouter>,
  );
}

describe('WebsiteStep', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ─── Section Headers ──────────────────────────────────────────

  it('renders the step heading', () => {
    renderStep();
    expect(
      screen.getByRole('heading', { name: /create business website/i }),
    ).toBeInTheDocument();
  });

  it('renders the minimum viable website section', () => {
    renderStep();
    expect(
      screen.getByRole('heading', { name: /what your site needs/i }),
    ).toBeInTheDocument();
  });

  it('renders the content builder section', () => {
    renderStep();
    expect(
      screen.getByRole('heading', { name: /content builder/i }),
    ).toBeInTheDocument();
  });

  it('renders the platform recommendations section', () => {
    renderStep();
    expect(
      screen.getByRole('heading', { name: /platform recommendations/i }),
    ).toBeInTheDocument();
  });

  it('renders the live preview section', () => {
    renderStep();
    expect(
      screen.getByRole('heading', { name: /live preview/i }),
    ).toBeInTheDocument();
  });

  // ─── Minimum Viable Website (Section 1) ───────────────────────

  it('lists the minimum viable website requirements', () => {
    renderStep();
    // Use getAllByText since "Business Name" appears in list AND label AND preview
    expect(screen.getAllByText(/business name/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/services list/i)).toBeInTheDocument();
    expect(screen.getByText(/phone number and email/i)).toBeInTheDocument();
    // "Request a Quote" appears in the list item AND the live preview button
    expect(screen.getAllByText(/request a quote/i).length).toBeGreaterThanOrEqual(1);
  });

  // ─── Content Builder Form (Section 2) ─────────────────────────

  it('renders business name input field', () => {
    renderStep();
    expect(
      screen.getByLabelText(/business name/i),
    ).toBeInTheDocument();
  });

  it('renders tagline input field', () => {
    renderStep();
    expect(
      screen.getByLabelText(/tagline/i),
    ).toBeInTheDocument();
  });

  it('renders service area input field', () => {
    renderStep();
    expect(
      screen.getByLabelText(/service area/i),
    ).toBeInTheDocument();
  });

  it('renders phone number input field', () => {
    renderStep();
    expect(
      screen.getByLabelText(/phone/i),
    ).toBeInTheDocument();
  });

  it('renders email input field', () => {
    renderStep();
    expect(
      screen.getByLabelText(/email/i),
    ).toBeInTheDocument();
  });

  it('renders trade services multi-select checkboxes', () => {
    renderStep();
    // Should show common trade categories as checkboxes
    expect(screen.getByLabelText(/plumbing/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/electrical/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/carpentry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hvac/i)).toBeInTheDocument();
  });

  it('allows selecting multiple services', async () => {
    renderStep();
    const plumbing = screen.getByLabelText(/plumbing/i);
    const electrical = screen.getByLabelText(/electrical/i);

    await userEvent.click(plumbing);
    await userEvent.click(electrical);

    expect(plumbing).toBeChecked();
    expect(electrical).toBeChecked();
  });

  // ─── Business name pre-fill from localStorage ─────────────────

  it('pre-fills business name from localStorage when available', () => {
    localStorage.setItem('brt-business-name', 'Atkinson Electric');
    renderStep();
    const nameInput = screen.getByLabelText(
      /business name/i,
    ) as HTMLInputElement;
    expect(nameInput.value).toBe('Atkinson Electric');
  });

  it('leaves business name empty when localStorage has no value', () => {
    renderStep();
    const nameInput = screen.getByLabelText(
      /business name/i,
    ) as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });

  // ─── Platform Recommendations (Section 3) ─────────────────────

  it('shows Carrd.co recommendation with external link', () => {
    renderStep();
    expect(screen.getByText(/carrd/i)).toBeInTheDocument();
    const carrdLink = screen.getByRole('link', { name: /carrd/i });
    expect(carrdLink).toHaveAttribute('href', 'https://carrd.co');
  });

  it('shows Google Business Profile recommendation with link', () => {
    renderStep();
    expect(screen.getByText(/google business profile/i)).toBeInTheDocument();
    const gbpLink = screen.getByRole('link', {
      name: /google business profile/i,
    });
    expect(gbpLink).toHaveAttribute(
      'href',
      'https://www.google.com/business/',
    );
  });

  it('shows Square Online recommendation with external link', () => {
    renderStep();
    expect(screen.getByText(/square online/i)).toBeInTheDocument();
    const squareLink = screen.getByRole('link', {
      name: /square online/i,
    });
    expect(squareLink).toHaveAttribute(
      'href',
      'https://squareup.com/us/en/online-store',
    );
  });

  // ─── Live Preview (Section 4) ─────────────────────────────────

  it('renders a live preview area', () => {
    renderStep();
    const preview = screen.getByTestId('website-preview');
    expect(preview).toBeInTheDocument();
  });

  it('live preview shows the business name as user types', async () => {
    renderStep();
    const nameInput = screen.getByLabelText(/business name/i);
    await userEvent.type(nameInput, 'Atkinson Electric');

    const preview = screen.getByTestId('website-preview');
    expect(preview).toHaveTextContent('Atkinson Electric');
  });

  it('live preview shows the tagline as user types', async () => {
    renderStep();
    const taglineInput = screen.getByLabelText(/tagline/i);
    await userEvent.type(taglineInput, 'Power You Can Trust');

    const preview = screen.getByTestId('website-preview');
    expect(preview).toHaveTextContent('Power You Can Trust');
  });

  it('live preview shows selected services', async () => {
    renderStep();
    await userEvent.click(screen.getByLabelText(/plumbing/i));

    const preview = screen.getByTestId('website-preview');
    expect(preview).toHaveTextContent(/plumbing/i);
  });

  it('live preview shows service area', async () => {
    renderStep();
    const areaInput = screen.getByLabelText(/service area/i);
    await userEvent.type(areaInput, 'Lexington, KY');

    const preview = screen.getByTestId('website-preview');
    expect(preview).toHaveTextContent('Lexington, KY');
  });

  it('live preview shows contact info', async () => {
    renderStep();
    await userEvent.type(
      screen.getByLabelText(/phone/i),
      '(859) 555-0142',
    );
    await userEvent.type(
      screen.getByLabelText(/email/i),
      'info@atkinsonelectric.com',
    );

    const preview = screen.getByTestId('website-preview');
    expect(preview).toHaveTextContent('(859) 555-0142');
    expect(preview).toHaveTextContent('info@atkinsonelectric.com');
  });

  it('live preview shows a Request a Quote call-to-action', () => {
    renderStep();
    const preview = screen.getByTestId('website-preview');
    expect(preview).toHaveTextContent(/request a quote/i);
  });

  it('updates live preview as services are toggled on and off', async () => {
    renderStep();
    const plumbing = screen.getByLabelText(/plumbing/i);
    const hvac = screen.getByLabelText(/hvac/i);

    await userEvent.click(plumbing);
    await userEvent.click(hvac);

    const preview = screen.getByTestId('website-preview');
    expect(preview).toHaveTextContent(/plumbing/i);
    expect(preview).toHaveTextContent(/hvac/i);

    await userEvent.click(plumbing); // toggle off
    expect(preview).not.toHaveTextContent(/plumbing/i);
    expect(preview).toHaveTextContent(/hvac/i);
  });

  // ─── Kenji Sato mentor tip ────────────────────────────────────

  it('shows Kenji Sato mentor tip', () => {
    renderStep();
    expect(screen.getByText(/kenji sato/i)).toBeInTheDocument();
    expect(
      screen.getByText(/digital storefront/i),
    ).toBeInTheDocument();
  });

  // ─── Completion ───────────────────────────────────────────────

  it('has a mark complete button', () => {
    renderStep();
    expect(
      screen.getByRole('button', { name: /mark complete/i }),
    ).toBeInTheDocument();
  });

  it('disables mark complete button when business name is empty', () => {
    renderStep();
    const button = screen.getByRole('button', { name: /mark complete/i });
    expect(button).toBeDisabled();
  });

  it('enables mark complete button when business name is filled', async () => {
    renderStep();
    await userEvent.type(
      screen.getByLabelText(/business name/i),
      'My Business',
    );
    const button = screen.getByRole('button', { name: /mark complete/i });
    expect(button).not.toBeDisabled();
  });

  it('shows a completion message when mark complete is clicked', async () => {
    renderStep();
    await userEvent.type(
      screen.getByLabelText(/business name/i),
      'My Business',
    );
    await userEvent.click(
      screen.getByRole('button', { name: /mark complete/i }),
    );
    expect(
      screen.getByText(/website step complete/i),
    ).toBeInTheDocument();
  });

  // ─── Responsive layout ────────────────────────────────────────

  it('renders a back link to the BRT overview', () => {
    renderStep();
    const backLink = screen.getByRole('link', {
      name: /back to business readiness/i,
    });
    expect(backLink).toHaveAttribute('href', '/brt');
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BRTPage } from './BRTPage';
import { BusinessNameStep } from './steps/BusinessNameStep';
import { LLCFilingStep } from './steps/LLCFilingStep';
import { BankInsuranceStep } from './steps/BankInsuranceStep';
import { WebsiteStep } from './steps/WebsiteStep';

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Renders the full BRT flow with all routes in a MemoryRouter.
 * Components render with their own internal localStorage persistence.
 */
function renderBRTApp(initialRoute = '/brt') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/brt" element={<BRTPage />} />
        <Route path="/brt/name" element={<BusinessNameStep />} />
        <Route path="/brt/llc" element={<LLCFilingStep />} />
        <Route path="/brt/bank-insurance" element={<BankInsuranceStep />} />
        <Route path="/brt/website" element={<WebsiteStep />} />
      </Routes>
    </MemoryRouter>,
  );
}

/**
 * Clear BRT-related localStorage between tests to prevent state leakage.
 */
function clearBRTStorage() {
  localStorage.removeItem('brt-progress');
  localStorage.removeItem('brt-name');
  localStorage.removeItem('brt-llc-progress');
  localStorage.removeItem('brt-bank-insurance-progress');
  localStorage.removeItem('brt-website-progress');
}

describe('BRT Integration', () => {
  beforeEach(() => {
    clearBRTStorage();
  });

  afterEach(() => {
    clearBRTStorage();
  });

  // ─── BRTPage Overview ──────────────────────────────────────────────

  describe('BRT overview page', () => {
    it('renders all 4 BRT step cards', () => {
      renderBRTApp();

      expect(
        screen.getByText('Select Business Name & Domain'),
      ).toBeInTheDocument();
      expect(screen.getByText('File for KY LLC')).toBeInTheDocument();
      expect(screen.getByText('Bank Account & Insurance')).toBeInTheDocument();
      expect(screen.getByText('Create Business Website')).toBeInTheDocument();
    });

    it('shows the first step as active/ready and rest as locked', () => {
      renderBRTApp();

      // First step should be ready
      const readyBadges = screen.getAllByText(/ready/i);
      expect(readyBadges.length).toBeGreaterThanOrEqual(1);

      // Steps 2-4 should be locked
      const lockedBadges = screen.getAllByText(/locked/i);
      expect(lockedBadges.length).toBeGreaterThanOrEqual(3);
    });

    it('renders the progress stepper', () => {
      renderBRTApp();

      const stepper = screen.getByRole('navigation', {
        name: /business readiness track progress/i,
      });
      expect(stepper).toBeInTheDocument();

      // Verify 4 stepper buttons
      const stepButtons = stepper.querySelectorAll('button');
      expect(stepButtons).toHaveLength(4);
    });

    it('shows call-to-action for the first step', () => {
      renderBRTApp();
      expect(screen.getByText(/start/i)).toBeInTheDocument();
    });

    it('locked step cards are disabled', () => {
      renderBRTApp();

      const llcCard = screen.getByText('File for KY LLC').closest('button');
      expect(llcCard).toBeDisabled();
    });
  });

  // ─── Step 1: Business Name ─────────────────────────────────────────

  describe('Step 1: Business Name & Domain', () => {
    it('renders the business name step', () => {
      renderBRTApp('/brt/name');

      expect(
        screen.getByRole('heading', { name: /select business name/i }),
      ).toBeInTheDocument();
    });

    it('allows entering a business name and domain', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt/name');

      const nameInput = screen.getByLabelText(/business name/i);
      await user.type(nameInput, 'Bluegrass Electrical');

      expect(nameInput).toHaveValue('Bluegrass Electrical');
    });

    it('auto-generates domain from business name', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt/name');

      const nameInput = screen.getByLabelText(/business name/i);
      await user.type(nameInput, 'Bluegrass Electrical');

      const domainInput = screen.getByLabelText(/your domain/i);
      expect(domainInput).toHaveValue('bluegrasselectrical.com');
    });

    it('shows name completion indicator when name and domain are filled', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt/name');

      const nameInput = screen.getByLabelText(/business name/i);
      await user.type(nameInput, 'Bluegrass Electrical');

      // Should show "Ready to continue" indicator
      expect(
        screen.getByText(/ready to continue/i),
      ).toBeInTheDocument();
    });

    it('generates suggestions when trade and city are filled', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt/name');

      const tradeInput = screen.getByLabelText(/your trade/i);
      const cityInput = screen.getByLabelText(/your city/i);

      await user.type(tradeInput, 'Electrical');
      await user.type(cityInput, 'Lexington');

      // Should show suggestion buttons
      expect(screen.getByText('Try these suggestions:')).toBeInTheDocument();
      expect(
        screen.getByText('Lexington Electrical Services'),
      ).toBeInTheDocument();
    });

    it('persists name selection to localStorage', async () => {
      const user = userEvent.setup();
      const { unmount } = renderBRTApp('/brt/name');

      const nameInput = screen.getByLabelText(/business name/i);
      await user.type(nameInput, 'Bluegrass HVAC');

      // Read back from localStorage
      const saved = JSON.parse(localStorage.getItem('brt-name') || '{}');
      expect(saved.businessName).toBe('Bluegrass HVAC');

      // Unmount and re-mount — state should persist
      unmount();
      renderBRTApp('/brt/name');

      const restoredInput = screen.getByLabelText(/business name/i);
      expect(restoredInput).toHaveValue('Bluegrass HVAC');
    });

    it('shows Aisha Okonjo mentor tip', () => {
      renderBRTApp('/brt/name');
      expect(screen.getByText('Aisha Okonjo')).toBeInTheDocument();
    });

    it('renders naming guidelines section', () => {
      renderBRTApp('/brt/name');
      expect(screen.getByText('Naming Guidelines')).toBeInTheDocument();
      expect(screen.getByText('Memorable')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Trade-Relevant')).toBeInTheDocument();
    });

    it('shows domain registrar links', () => {
      renderBRTApp('/brt/name');
      expect(screen.getByText('Search Namecheap')).toBeInTheDocument();
      expect(screen.getByText('Search GoDaddy')).toBeInTheDocument();
    });
  });

  // ─── Step 2: LLC Filing ────────────────────────────────────────────

  describe('Step 2: KY LLC Filing', () => {
    it('renders the LLC filing step', () => {
      renderBRTApp('/brt/llc');

      expect(
        screen.getByRole('heading', { name: /file for ky llc/i }),
      ).toBeInTheDocument();
    });

    it('renders all 5 sub-steps', () => {
      renderBRTApp('/brt/llc');

      expect(screen.getByText('Choose a Registered Agent')).toBeInTheDocument();
      expect(
        screen.getByText('File Articles of Organization'),
      ).toBeInTheDocument();
      expect(screen.getByText('Get an EIN from the IRS')).toBeInTheDocument();
      expect(screen.getByText('KY Tax Registration')).toBeInTheDocument();
      expect(
        screen.getByText('Create an Operating Agreement'),
      ).toBeInTheDocument();
    });

    it('shows initial progress of 0 of 5 complete', () => {
      renderBRTApp('/brt/llc');

      // The progress bar uses role="status" with aria-label
      const progressStatus = screen.getByRole('status');
      expect(progressStatus).toHaveAttribute(
        'aria-label',
        '0 of 5 sub-steps complete',
      );
    });

    it('tracks sub-step completion and updates progress', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt/llc');

      // Check first sub-step
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(5);

      await user.click(checkboxes[0]);

      const progressStatus = screen.getByRole('status');
      expect(progressStatus).toHaveAttribute(
        'aria-label',
        '1 of 5 sub-steps complete',
      );
    });

    it('supports completing all sub-steps', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt/llc');

      const checkboxes = screen.getAllByRole('checkbox');

      for (const checkbox of checkboxes) {
        await user.click(checkbox);
      }

      const progressStatus = screen.getByRole('status');
      expect(progressStatus).toHaveAttribute(
        'aria-label',
        '5 of 5 sub-steps complete',
      );
    });

    it('persists sub-step progress to localStorage', async () => {
      const user = userEvent.setup();
      const { unmount } = renderBRTApp('/brt/llc');

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // Complete first sub-step
      await user.click(checkboxes[2]); // Complete third sub-step

      // Verify localStorage
      const saved = JSON.parse(localStorage.getItem('brt-llc-progress') || '[]');
      expect(saved[0]).toBe(true);
      expect(saved[1]).toBe(false);
      expect(saved[2]).toBe(true);

      // Unmount and re-mount
      unmount();
      renderBRTApp('/brt/llc');

      // Check that progress is restored
      const restoredCheckboxes = screen.getAllByRole('checkbox');
      expect(restoredCheckboxes[0]).toBeChecked();
      expect(restoredCheckboxes[1]).not.toBeChecked();
      expect(restoredCheckboxes[2]).toBeChecked();
    });

    it('shows David Chang mentor tip', () => {
      renderBRTApp('/brt/llc');
      expect(screen.getByText('David Chang')).toBeInTheDocument();
    });

    it('completing a sub-step shows checkmark instead of number', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt/llc');

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      // The numbered circle should be replaced by a check icon
      // The check div has different styling than the number container
      const completedSteps = screen.getAllByText(/choose a registered agent/i);
      const parentCard = completedSteps[0].closest('[class*="rounded-lg"]');
      expect(parentCard?.className).toContain('border-emerald');
    });

    it('shows external links for sub-steps that have them', () => {
      renderBRTApp('/brt/llc');

      // Articles of Organization has an external link
      expect(
        screen.getByText('KY Secretary of State Business Filings'),
      ).toBeInTheDocument();

      // EIN has an external link
      expect(
        screen.getByText('IRS EIN Online Application'),
      ).toBeInTheDocument();
    });
  });

  // ─── Step 3: Bank & Insurance ──────────────────────────────────────

  describe('Step 3: Bank Account & Insurance', () => {
    it('renders the bank and insurance step', () => {
      renderBRTApp('/brt/bank-insurance');

      expect(
        screen.getByRole('heading', { name: /commercial bank account/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /business insurance/i }),
      ).toBeInTheDocument();
    });

    it('renders bank account section', () => {
      renderBRTApp('/brt/bank-insurance');

      expect(
        screen.getByText(/commercial bank account/i),
      ).toBeInTheDocument();
    });

    it('renders insurance section with provider links', () => {
      renderBRTApp('/brt/bank-insurance');

      expect(screen.getByText(/business insurance/i)).toBeInTheDocument();
      expect(screen.getByText('Thimble')).toBeInTheDocument();
      expect(screen.getByText('NEXT Insurance')).toBeInTheDocument();
    });

    it('renders checklist with checkboxes', () => {
      renderBRTApp('/brt/bank-insurance');

      // BankInsuranceStep uses buttons (not checkboxes) for its checklist
      const checklistButtons = screen.getAllByRole('button', {
        name: /opened a business|got a business|set up online|got a general|compared at least|selected an insurance/i,
      });
      expect(checklistButtons).toHaveLength(6);
    });

    it('tracks checklist completion', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt/bank-insurance');

      const firstBtn = screen.getByRole('button', {
        name: /opened a business checking account/i,
      });
      const secondBtn = screen.getByRole('button', {
        name: /got a business debit card/i,
      });

      await user.click(firstBtn);
      await user.click(secondBtn);

      // After clicking, text should show line-through styling via the emerald color class
      expect(firstBtn.className).toContain('border-slate-800');
      expect(secondBtn.className).toContain('border-slate-800');
    });

    it('shows Big Mike mentor tip', () => {
      renderBRTApp('/brt/bank-insurance');
      expect(screen.getByText('Big Mike')).toBeInTheDocument();
    });
  });

  // ─── Step 4: Website ───────────────────────────────────────────────

  describe('Step 4: Business Website', () => {
    it('renders the website step', () => {
      renderBRTApp('/brt/website');

      expect(
        screen.getByRole('heading', { name: /create business website/i }),
      ).toBeInTheDocument();
    });

    it('renders the content builder form', () => {
      renderBRTApp('/brt/website');

      // Business name input (pre-filled from Step 1 if available)
      expect(
        screen.getByLabelText(/business name/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/tagline/i),
      ).toBeInTheDocument();
    });

    it('renders platform recommendations', () => {
      renderBRTApp('/brt/website');

      expect(screen.getByText('Carrd.co')).toBeInTheDocument();
      expect(screen.getByText('Google Business Profile')).toBeInTheDocument();
      expect(screen.getByText('Square Online')).toBeInTheDocument();
    });

    it('renders website preview section', () => {
      renderBRTApp('/brt/website');

      expect(screen.getByText(/live preview/i)).toBeInTheDocument();
    });

    it('pre-fills business name if stored from Step 1', async () => {
      // Simulate that Step 1 was completed (WebsiteStep reads from 'brt-business-name')
      localStorage.setItem('brt-business-name', 'Bluegrass HVAC');

      renderBRTApp('/brt/website');

      const nameInput = screen.getByLabelText(/business name/i);
      expect(nameInput).toHaveValue('Bluegrass HVAC');
    });

    it('updates live preview when content changes', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt/website');

      const nameInput = screen.getByLabelText(/business name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Test Business');

      // The preview should reflect the name
      const preview = screen.getByTestId('website-preview');
      expect(within(preview).getByText('Test Business')).toBeInTheDocument();
    });

    it('shows Kenji Sato mentor tip', () => {
      renderBRTApp('/brt/website');
      expect(screen.getByText(/Kenji Sato/)).toBeInTheDocument();
    });
  });

  // ─── Full Flow Navigation ──────────────────────────────────────────

  describe('BRT multi-step flow', () => {
    it('navigates from overview to Step 1 via start CTA', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt');

      // Click the "Start with Select Business Name & Domain" button
      const startButton = screen.getByRole('button', {
        name: /start with select business name & domain/i,
      });
      await user.click(startButton);

      // Should now be on Step 1
      expect(
        screen.getByRole('heading', { name: /select business name/i }),
      ).toBeInTheDocument();
    });

    it('navigates between steps and preserves state', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt');

      // Navigate to Step 1 and fill it in
      const startButton = screen.getByRole('button', {
        name: /start with select business name & domain/i,
      });
      await user.click(startButton);

      const nameInput = screen.getByLabelText(/business name/i);
      await user.type(nameInput, 'Test HVAC');

      // Navigate to Step 2 (directly via URL change)
      const { unmount } = renderBRTApp('/brt/llc');

      // Verify Step 2 rendered
      expect(
        screen.getByRole('heading', { name: /file for ky llc/i }),
      ).toBeInTheDocument();

      // Step 1 data should still be in localStorage
      const savedName = JSON.parse(localStorage.getItem('brt-name') || '{}');
      expect(savedName.businessName).toBe('Test HVAC');
    });

    it('completing all Step 2 sub-steps shows 5/5 status', async () => {
      const user = userEvent.setup();
      renderBRTApp('/brt/llc');

      const checkboxes = screen.getAllByRole('checkbox');
      for (const cb of checkboxes) {
        await user.click(cb);
      }

      const progressStatus = screen.getByRole('status');
      expect(progressStatus).toHaveAttribute(
        'aria-label',
        '5 of 5 sub-steps complete',
      );
    });
  });

  // ─── Error/Edge Cases ──────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles corrupt localStorage for LLC step gracefully', () => {
      localStorage.setItem('brt-llc-progress', 'not-valid');
      renderBRTApp('/brt/llc');

      // Should render with all sub-steps unchecked
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(5);
      for (const cb of checkboxes) {
        expect(cb).not.toBeChecked();
      }
    });

    it('handles empty localStorage for name step gracefully', () => {
      renderBRTApp('/brt/name');

      const nameInput = screen.getByLabelText(/business name/i);
      expect(nameInput).toHaveValue('');
    });

    it('does not show suggestions when trade/city are empty', () => {
      renderBRTApp('/brt/name');

      expect(
        screen.queryByText('Try these suggestions:'),
      ).not.toBeInTheDocument();
    });

    it('shows no completion indicator without name + domain', () => {
      renderBRTApp('/brt/name');

      expect(
        screen.queryByText(/ready to continue/i),
      ).not.toBeInTheDocument();
    });
  });
});

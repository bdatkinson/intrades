// ─── Business Readiness Track (BRT) Type System ──────────────────
// Guided 4-step wizard for business formation.
// Diamond face cards: J♦ → Q♦ → K♦ → A♦

/** A single step in the Business Readiness Track wizard */
export interface BRTStep {
  /** Unique step identifier, e.g. "brt-name" */
  id: string;
  /** The Diamond face card this step maps to */
  card: 'jack' | 'queen' | 'king' | 'ace';
  /** Step display title */
  title: string;
  /** Short description shown below the title */
  subtitle: string;
  /** Current step state — locked until previous step is complete */
  status: 'locked' | 'active' | 'completed';
  /** React Router path for this step */
  route: string;
}

/** Ordered BRT step definitions */
export const BRT_STEPS: BRTStep[] = [
  {
    id: 'brt-name',
    card: 'jack',
    title: 'Select Business Name & Domain',
    subtitle: 'Choose a name that works for your trade',
    status: 'active',
    route: '/brt/name',
  },
  {
    id: 'brt-llc',
    card: 'queen',
    title: 'File for KY LLC',
    subtitle: 'Register your business with the state',
    status: 'locked',
    route: '/brt/llc',
  },
  {
    id: 'brt-bank-insurance',
    card: 'king',
    title: 'Bank Account & Insurance',
    subtitle: 'Set up your financial foundation',
    status: 'locked',
    route: '/brt/bank-insurance',
  },
  {
    id: 'brt-website',
    card: 'ace',
    title: 'Create Business Website',
    subtitle: 'Build your digital storefront',
    status: 'active',
    route: '/brt/website',
  },
];

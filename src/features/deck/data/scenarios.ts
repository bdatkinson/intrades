import type { ScenarioCard } from '../types';

// --- 36 Pitfall Scenario Cards ---
// 9 per suit, ranks 2–10. Sourced from the scenario-cards-deck.md architecture doc.
export const scenarios: ScenarioCard[] = [
  // ── ♠️ Spades — Tools & Technology ──────────────────────────────────
  {
    id: 'spades-2',
    rank: 2,
    suit: 'spades',
    title: 'The "Mental Note" Mistake',
    category: 'Tools & Technology',
    description:
      'Failing to write down a client\'s specific request or a measurement, trusting memory instead, and inevitably getting it wrong during execution.',
  },
  {
    id: 'spades-3',
    rank: 3,
    suit: 'spades',
    title: 'The Van Black Hole',
    category: 'Tools & Technology',
    description:
      'Letting the work vehicle become so disorganized that 20% of billable time is wasted searching for tools or parts that are "somewhere in the back."',
  },
  {
    id: 'spades-4',
    rank: 4,
    suit: 'spades',
    title: 'The Supply Run Drain',
    category: 'Tools & Technology',
    description:
      'Starting the day without checking inventory, resulting in three separate trips to the supply house for minor items like screws or caulk.',
  },
  {
    id: 'spades-5',
    rank: 5,
    suit: 'spades',
    title: 'The "I\'ll Do It Later" Logs',
    category: 'Tools & Technology',
    description:
      'Failing to log hours or materials immediately after a job, leading to guesswork at the end of the week and lost revenue.',
  },
  {
    id: 'spades-6',
    rank: 6,
    suit: 'spades',
    title: 'The Phantom Arrival',
    category: 'Tools & Technology',
    description:
      'Telling a client "I\'ll be there between 8 and 12" and showing up at 11:55 AM without calling to give an ETA update.',
  },
  {
    id: 'spades-7',
    rank: 7,
    suit: 'spades',
    title: 'Ignoring Manufacturer Specs',
    category: 'Tools & Technology',
    description:
      'Assuming you know how a new material works (e.g., cure times or mixing ratios) without reading the technical data sheet.',
  },
  {
    id: 'spades-8',
    rank: 8,
    suit: 'spades',
    title: 'The Site Cleanup Fail',
    category: 'Tools & Technology',
    description:
      'Doing excellent technical work but leaving drywall dust, wire clippings, or footprints behind, which becomes the only thing the client remembers.',
  },
  {
    id: 'spades-9',
    rank: 9,
    suit: 'spades',
    title: 'Battery Roulette',
    category: 'Tools & Technology',
    description:
      'Arriving at a job site with cordless tools but no fully charged batteries and no charger in the truck.',
  },
  {
    id: 'spades-10',
    rank: 10,
    suit: 'spades',
    title: 'Improvised Tool Use',
    category: 'Tools & Technology',
    description:
      'Using a screwdriver as a chisel or a wrench as a hammer, damaging the tool and risking injury.',
  },

  // ── ♥️ Hearts — Interpersonal & Customer Service ────────────────────
  {
    id: 'hearts-2',
    rank: 2,
    suit: 'hearts',
    title: 'The Jargon Barrier',
    category: 'Interpersonal & Customer Service',
    description:
      'Explaining a problem to a homeowner using strictly technical terms (e.g., "The delta-T is off on the plenum") causing confusion and mistrust.',
  },
  {
    id: 'hearts-3',
    rank: 3,
    suit: 'hearts',
    title: 'The "Not My Job" Attitude',
    category: 'Interpersonal & Customer Service',
    description:
      'Refusing to help a team member move a heavy object or clean up because it falls outside your specific trade description.',
  },
  {
    id: 'hearts-4',
    rank: 4,
    suit: 'hearts',
    title: 'Broadcasting Frustration',
    category: 'Interpersonal & Customer Service',
    description:
      'Swearing or venting about the project complications loud enough for the client (or their neighbors) to hear.',
  },
  {
    id: 'hearts-5',
    rank: 5,
    suit: 'hearts',
    title: 'The Defensive Crouch',
    category: 'Interpersonal & Customer Service',
    description:
      'Reacting to a foreman\'s critique of your work with excuses rather than asking, "How can I do it better next time?"',
  },
  {
    id: 'hearts-6',
    rank: 6,
    suit: 'hearts',
    title: 'Disrespecting the "Gatekeeper"',
    category: 'Interpersonal & Customer Service',
    description:
      'Being polite to the property owner but rude or dismissive to their assistant, spouse, or property manager.',
  },
  {
    id: 'hearts-7',
    rank: 7,
    suit: 'hearts',
    title: 'The Smartphone Zombie',
    category: 'Interpersonal & Customer Service',
    description:
      'Being seen by the client scrolling social media or texting extensively while on the clock.',
  },
  {
    id: 'hearts-8',
    rank: 8,
    suit: 'hearts',
    title: 'Over-Promising Timelines',
    category: 'Interpersonal & Customer Service',
    description:
      'Telling a client a job will take two days to make them happy, knowing deep down it requires four.',
  },
  {
    id: 'hearts-9',
    rank: 9,
    suit: 'hearts',
    title: 'Ignoring Non-Verbal Cues',
    category: 'Interpersonal & Customer Service',
    description:
      'Continuing to talk or sell services when the client clearly looks rushed, annoyed, or uncomfortable.',
  },
  {
    id: 'hearts-10',
    rank: 10,
    suit: 'hearts',
    title: 'Appearance Apathy',
    category: 'Interpersonal & Customer Service',
    description:
      'Arriving at an occupied residential job looking disheveled or smelling of strong odors (cigarettes, sweat, etc.), which impacts perceived professionalism.',
  },

  // ── ♦️ Diamonds — Business Acumen ───────────────────────────────────
  {
    id: 'diamonds-2',
    rank: 2,
    suit: 'diamonds',
    title: 'The Revenue vs. Profit Trap',
    category: 'Business Acumen',
    description:
      'Confusing the check amount with personal income, forgetting to set aside money for taxes, insurance, and overhead.',
  },
  {
    id: 'diamonds-3',
    rank: 3,
    suit: 'diamonds',
    title: 'Underbidding to Win',
    category: 'Business Acumen',
    description:
      'Dropping the price so low to get the job that you end up working for less than minimum wage once expenses are covered.',
  },
  {
    id: 'diamonds-4',
    rank: 4,
    suit: 'diamonds',
    title: 'The "Handshake" Deal',
    category: 'Business Acumen',
    description:
      'Starting a substantial job without a signed contract or a deposit, leaving no recourse if the client refuses to pay.',
  },
  {
    id: 'diamonds-5',
    rank: 5,
    suit: 'diamonds',
    title: 'Tool Debt',
    category: 'Business Acumen',
    description:
      'Buying the most expensive, top-tier brand tools on credit before the business has the cash flow to support the payments.',
  },
  {
    id: 'diamonds-6',
    rank: 6,
    suit: 'diamonds',
    title: 'Receipt Shoeboxing',
    category: 'Business Acumen',
    description:
      'Throwing receipts on the dashboard and fading them in the sun, making tax season a nightmare and losing deductions.',
  },
  {
    id: 'diamonds-7',
    rank: 7,
    suit: 'diamonds',
    title: 'Discounting Experience',
    category: 'Business Acumen',
    description:
      'Apologizing for your price when a client objects, rather than confidently explaining the value and expertise you provide.',
  },
  {
    id: 'diamonds-8',
    rank: 8,
    suit: 'diamonds',
    title: 'Ignoring Vehicle Costs',
    category: 'Business Acumen',
    description:
      'Failing to factor in vehicle wear and tear, fuel, and insurance into the hourly or project rate.',
  },
  {
    id: 'diamonds-9',
    rank: 9,
    suit: 'diamonds',
    title: 'Billing Surprise',
    category: 'Business Acumen',
    description:
      'Presenting a final invoice significantly higher than the estimate without having communicated the extra costs during the project.',
  },
  {
    id: 'diamonds-10',
    rank: 10,
    suit: 'diamonds',
    title: 'Commingling Funds',
    category: 'Business Acumen',
    description:
      'Using the business debit card for personal lunch or gas for a personal vehicle, piercing the corporate veil and muddying accounting.',
  },

  // ── ♣️ Clubs — Safety, Compliance & Risk Management ─────────────────
  {
    id: 'clubs-2',
    rank: 2,
    suit: 'clubs',
    title: 'The Guard Removal',
    category: 'Safety, Compliance & Risk Management',
    description:
      'Taking the safety guard off a grinder or saw because "it gets in the way," leading to a high risk of severe injury.',
  },
  {
    id: 'clubs-3',
    rank: 3,
    suit: 'clubs',
    title: 'The "Hero" Lift',
    category: 'Safety, Compliance & Risk Management',
    description:
      'Attempting to lift a heavy boiler, beam, or unit alone to prove strength, resulting in a debilitating back injury.',
  },
  {
    id: 'clubs-4',
    rank: 4,
    suit: 'clubs',
    title: 'The "Dead" Wire Assumption',
    category: 'Safety, Compliance & Risk Management',
    description:
      'Touching a wire or component assuming the breaker is off without testing it with a multimeter or voltage sniffer first.',
  },
  {
    id: 'clubs-5',
    rank: 5,
    suit: 'clubs',
    title: 'PPE Fatigue',
    category: 'Safety, Compliance & Risk Management',
    description:
      'Removing safety glasses or ear protection because it\'s hot or uncomfortable "just for this one quick cut."',
  },
  {
    id: 'clubs-6',
    rank: 6,
    suit: 'clubs',
    title: 'Code Guessing',
    category: 'Safety, Compliance & Risk Management',
    description:
      'Installing something based on "how we did it at the last company" rather than verifying the current local building codes.',
  },
  {
    id: 'clubs-7',
    rank: 7,
    suit: 'clubs',
    title: 'Ladder Laziness',
    category: 'Safety, Compliance & Risk Management',
    description:
      'Using the top step of a stepladder or leaning a ladder at an unsafe angle to avoid going back to the truck for the right size.',
  },
  {
    id: 'clubs-8',
    rank: 8,
    suit: 'clubs',
    title: 'Blind Cutting',
    category: 'Safety, Compliance & Risk Management',
    description:
      'Cutting into a wall or floor without checking for pipes, wires, or ducts behind the surface.',
  },
  {
    id: 'clubs-9',
    rank: 9,
    suit: 'clubs',
    title: 'Ignoring Fatigue',
    category: 'Safety, Compliance & Risk Management',
    description:
      'Pushing through exhaustion to finish a job, which is statistically when the majority of severe technical errors and injuries occur.',
  },
  {
    id: 'clubs-10',
    rank: 10,
    suit: 'clubs',
    title: 'Scope Creep Silence',
    category: 'Safety, Compliance & Risk Management',
    description:
      'Agreeing to "just fix this one other little thing" while on-site without documenting a change order or adjusting the timeline.',
  },
];

import type { Card, Suit } from './types'

/**
 * Seed cards — scenario cards for values 1-10 per suit (11/12/13 reserved for mentor face cards).
 *
 * Suit themes:
 *   spades   — Structural / Heavy Work / Building
 *   hearts   — Service / Relationships / Care
 *   diamonds — Business / Tech / Efficiency
 *   clubs    — Hustle / Contracting / Resilience
 */
export function createSeedCards(): Card[] {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
  const cards: Card[] = []

  const names: Record<Suit, string[]> = {
    spades: [
      'Reading Blueprints',
      'Material Estimation',
      'Structural Load Math',
      'Site Safety Protocol',
      'Concrete Mix & Pour',
      'Steel Fab Tolerances',
      'Scaffold Setup',
      'Excavation & Grade',
      'Welding Certification',
      'Heavy Equipment Pre-Op',
    ],
    hearts: [
      'Customer First Call',
      'Service Call Etiquette',
      'Listening to the Problem',
      'Managing Expectations',
      'Following Up After the Job',
      'Handling a Callback',
      'Estimating on the Spot',
      'Building Repeat Business',
      'Earning the Referral',
      'Conflict De-escalation',
    ],
    diamonds: [
      'Job Costing Basics',
      'Writing a Clean Estimate',
      'Calculating Margin',
      'Invoice & Collections',
      'Reading a P&L',
      'Tax & Entity Basics',
      'Change Order Management',
      'Cash Flow Planning',
      'Insurance & Liability',
      'Scaling to First Employee',
    ],
    clubs: [
      'Morning Truck Setup',
      'Tool Accountability',
      'Jobsite Communication',
      'Subcontractor Coordination',
      'Punch List Close-Out',
      'Working in Bad Weather',
      'Staying on Schedule',
      'Handling a Bad Inspection',
      'Recovering a Blown Budget',
      'Winning the Next Bid',
    ],
  }

  const descriptions: Record<Suit, string[]> = {
    spades: [
      'Understand plan views, sections, and details before you touch a tool.',
      'Count it twice, order once. Waste is margin you never had.',
      'Dead loads, live loads, and why the numbers matter before concrete sets.',
      'OSHA isn\'t paperwork — it\'s the protocol that gets everyone home.',
      'Slump test, water-cement ratio, and the window you cannot miss.',
      'Plus/minus 1/32nd inch isn\'t a suggestion. It\'s the spec.',
      'Erect it right or it fails under load. Scaffold is life safety.',
      'Grade controls water. Water controls everything else on a job.',
      'The certification is the baseline. The bead is your reputation.',
      'Walk around. Check the hydraulics. Sign the sheet. No shortcuts.',
    ],
    hearts: [
      'The first call sets the tone for the whole job. Own it.',
      'You are in their home. Act like it.',
      'Let them finish talking. The problem they describe and the problem they have are different.',
      'Under-promise, over-deliver. Every time.',
      'One text the day after close-out earns the next job.',
      'They called back. Own it, fix it, say nothing about their dog.',
      'Know your numbers well enough to quote from the driveway.',
      'Loyalty is built between jobs, not during them.',
      'The referral is the highest compliment. Ask for it.',
      'Lower your voice when they raise theirs. Always.',
    ],
    diamonds: [
      'Labor + material + overhead + profit = a real number. Not a guess.',
      'A clean estimate is a professional document. Sloppy bids lose.',
      'Gross margin vs. net margin. Know both before you bid.',
      'Net 30 is not a suggestion. Know when to stop work.',
      'If you can\'t read a P&L you are flying blind.',
      'LLC protects your house. Know when to file.',
      'Every change order is signed before the work starts. Period.',
      'Cash flow kills more businesses than bad work does.',
      'One lawsuit can end a company. Insurance is not optional.',
      'Your first hire is the hardest decision and the most important.',
    ],
    clubs: [
      'Tools organized, van stocked, gas in the tank. The night before.',
      'Every tool that leaves the van gets logged. Every one.',
      'Say what you\'ll do, do what you said, tell them you did it.',
      'Your sub\'s problem on your job is your problem. Act like it.',
      'Walk it with the customer, sign it off, collect.',
      'Weather doesn\'t care about your schedule. Have a plan.',
      'Schedule slips happen. Communication about it is non-negotiable.',
      'A bad inspection is feedback. Fix it fast and don\'t argue.',
      'A blown budget is a lesson. Write down what happened.',
      'The bid you win at the right number beats the bid you win to keep busy.',
    ],
  }

  for (const suit of suits) {
    for (let i = 0; i < 10; i++) {
      const value = i + 1
      cards.push({
        id: `seed-${suit}-${value}`,
        suit,
        value,
        name: names[suit][i],
        description: descriptions[suit][i],
      })
    }
  }

  return cards
}

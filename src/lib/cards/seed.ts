import type { Card, Suit } from './types'

/**
 * 12 seed cards — 3 per suit.
 *
 * Distribution:
 *  Hammer:  values 1, 5, 9   (Tools & Tech)
 *  Wrench:  values 2, 6, 10  (Diagnostics)
 *  Voltmeter: values 3, 7, 11 (Install/Maintain)
 *  Plumb-Bob: values 4, 8, 12 (Layout/Measure)
 */
export function createSeedCards(): Card[] {
  const suits: Suit[] = ['hammer', 'wrench', 'voltmeter', 'plumb-bob']
  const cards: Card[] = []

  const names: Record<Suit, string[]> = {
    hammer: ['Framing Hammer', 'Ball-Peen Hammer', 'Sledge Hammer'],
    wrench: ['Pipe Wrench', 'Torque Wrench', 'Adjustable Wrench'],
    voltmeter: ['Digital Multimeter', 'Clamp Meter', 'Voltage Tester'],
    'plumb-bob': ['Brass Plumb Bob', 'Laser Level', 'Chalk Line'],
  }

  const descriptions: Record<Suit, string[]> = {
    hammer: [
      'Drive nails, pull lumber — the framing hammer is the backbone of rough carpentry.',
      'Rounded peen for shaping metal and setting rivets without marring.',
      'Heavy head, long handle. For demolition and driving stakes.',
    ],
    wrench: [
      'Serrated jaw grip. Turn pipe, not strip it. Every plumber carries one.',
      'Calibrated click. Torque head bolts to spec — no guesswork.',
      'One tool, infinite sizes. The crescent wrench lives in every truck.',
    ],
    voltmeter: [
      'Measure voltage, current, resistance. The diagnostic workhorse.',
      'Clamp around a conductor, read amps without breaking the circuit.',
      'Quick-contact tester — is it live or dead? Answer in seconds.',
    ],
    'plumb-bob': [
      'Gravity never lies. Brass bob on braided line finds true vertical.',
      'Self-leveling crosshair. Red beam, green beam, square every room.',
      'Snap a straight line across 100 feet. Dust it blue, stretch it tight.',
    ],
  }

  for (const suit of suits) {
    for (let i = 0; i < 3; i++) {
      const value = suits.indexOf(suit) + 1 + i * 4
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

import type { Card, Suit } from './types'
import { getMentorByCard } from '../mentors/personas'

/**
 * 52 seed cards — 13 per suit.
 *
 * Suits:
 *  spades   (Structural / Heavy Work)
 *  hearts   (Precision / Service / Relationships)
 *  diamonds (Business / Tech / Efficiency)
 *  clubs    (Hustle / Contracting / Resilience)
 *
 * Values 1-10: tool/skill cards
 * Values 11-13: face cards (Jack, Queen, King) — wired to mentor personas
 */
export function createSeedCards(): Card[] {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']
  const cards: Card[] = []

  const toolNames: Record<Suit, string[]> = {
    spades: [
      'Framing Hammer', 'Chalk Line', 'Speed Square',
      'Circular Saw', 'Ball-Peen Hammer', 'Scaffolding',
      'Spirit Level', 'Sledge Hammer', 'Transit Level',
      'Rebar Bender',
    ],
    hearts: [
      'Brass Plumb Bob', 'Basin Wrench', 'Copper Cutter',
      'Soldering Torch', 'Laser Level', 'Putty Knife',
      'Trowel', 'Chalk Line', 'Moisture Meter',
      'Fish Tape',
    ],
    diamonds: [
      'Digital Multimeter', 'Wire Strippers', 'Conduit Bender',
      'Clamp Meter', 'Cable Tester', 'Thermal Camera',
      'Panel Schedule', 'Voltage Tester', 'Megohmmeter',
      'PLC Programmer',
    ],
    clubs: [
      'Tape Measure', 'Utility Knife', 'Nail Gun',
      'Sawzall', 'Adjustable Wrench', 'Caulk Gun',
      'Roofing Hatchet', 'Torque Wrench', 'Pipe Wrench',
      'Compactor',
    ],
  }

  const toolDescriptions: Record<Suit, string[]> = {
    spades: [
      'Drive nails, pull lumber — the framing hammer is the backbone of rough carpentry.',
      'Snap a straight line across 100 feet. Dust it blue, stretch it tight.',
      'Mark rafters, check square, scribe angles — fits in your pouch.',
      'Rip plywood, crosscut studs. The circular saw does the heavy cutting.',
      'Rounded peen for shaping metal and setting rivets without marring.',
      'Work at height safely. Scaffold systems make vertical access possible.',
      'Gravity never lies. Check level, check plumb, check your work.',
      'Heavy head, long handle. For demolition and driving stakes.',
      'Set elevations, shoot grades. The transit keeps the site on level.',
      'Shape and bend reinforcing steel for concrete structures.',
    ],
    hearts: [
      'Gravity never lies. Brass bob on braided line finds true vertical.',
      'Reach behind a sink to tighten supply nuts nobody else can reach.',
      'Clean cuts on copper pipe. No burrs, no leaks, every time.',
      'Sweat a joint right and it lasts a lifetime. Silver solder, clean flux.',
      'Self-leveling crosshair. Red beam, green beam, square every room.',
      'Smooth filler, feather edges. Restoration starts with patience.',
      'Spread mortar, shape plaster. The trowel is an extension of your hand.',
      'Mark reference lines for tile, trim, and layout work.',
      'Know what you can\'t see. Moisture behind walls tells the real story.',
      'Pull wire through walls and conduit. Finesse, not force.',
    ],
    diamonds: [
      'Measure voltage, current, resistance. The diagnostic workhorse.',
      'Strip insulation cleanly without nicking the conductor.',
      'Bend EMT to spec — offsets, kicks, saddles. Geometry in steel.',
      'Clamp around a conductor, read amps without breaking the circuit.',
      'Verify data cable runs. Continuity, mapping, certification.',
      'See heat signatures. Find overloaded circuits before they find you.',
      'Document every breaker, every circuit. The panel schedule is the map.',
      'Quick-contact tester — is it live or dead? Answer in seconds.',
      'Test insulation resistance. Megohms tell you if the wire is safe.',
      'Program ladder logic. Automate sequences. Control the process.',
    ],
    clubs: [
      'Measure twice, cut once. The most-used tool in any trade.',
      'Score, snap, trim. The utility knife handles a thousand tasks.',
      'Drive nails fast. Framing, sheathing, decking — speed wins.',
      'Reciprocating saw cuts through anything. Demo\'s best friend.',
      'One tool, infinite sizes. The crescent wrench lives in every truck.',
      'Seal gaps, joints, and trim. Clean lines make clean work.',
      'Nail shingles, cut felt, pry caps. The roofer\'s multi-tool.',
      'Calibrated click. Torque head bolts to spec — no guesswork.',
      'Serrated jaw grip. Turn pipe, not strip it. Every plumber carries one.',
      'Compact soil, prep base. Solid ground under every hardscape.',
    ],
  }

  // Tool cards: values 1-10
  for (const suit of suits) {
    for (let i = 0; i < 10; i++) {
      const value = i + 1
      cards.push({
        id: `seed-${suit}-${value}`,
        suit,
        value,
        name: toolNames[suit][i],
        description: toolDescriptions[suit][i],
      })
    }
  }

  // Face cards: values 11-13, wired to mentor personas
  const faceValues = [11, 12, 13] as const
  for (const suit of suits) {
    for (const value of faceValues) {
      const mentor = getMentorByCard(suit, value)
      if (mentor) {
        cards.push({
          id: `seed-${suit}-${value}`,
          suit,
          value,
          name: mentor.name,
          description: mentor.trade,
          mentorId: mentor.id,
        })
      }
    }
  }

  return cards
}

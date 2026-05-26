import { describe, it, expect } from 'vitest';
import { scenarios } from './scenarios';
import type { ScenarioCard } from '../types';

describe('scenario card fixtures', () => {
  it('loads exactly 36 scenarios', () => {
    expect(scenarios).toHaveLength(36);
  });

  it('has exactly 9 scenarios per suit', () => {
    const suits = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
    for (const suit of suits) {
      const suitScenarios = scenarios.filter((s) => s.suit === suit);
      expect(suitScenarios).toHaveLength(9);
    }
  });

  it('has no duplicate IDs', () => {
    const ids = scenarios.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every scenario has all required fields', () => {
    for (const scenario of scenarios) {
      expect(scenario).toHaveProperty('id');
      expect(scenario).toHaveProperty('rank');
      expect(scenario).toHaveProperty('suit');
      expect(scenario).toHaveProperty('title');
      expect(scenario).toHaveProperty('category');
      expect(scenario).toHaveProperty('description');

      expect(typeof scenario.id).toBe('string');
      expect(typeof scenario.rank).toBe('number');
      expect(typeof scenario.suit).toBe('string');
      expect(typeof scenario.title).toBe('string');
      expect(typeof scenario.category).toBe('string');
      expect(typeof scenario.description).toBe('string');

      expect(scenario.id.length).toBeGreaterThan(0);
      expect(scenario.title.length).toBeGreaterThan(0);
      expect(scenario.category.length).toBeGreaterThan(0);
      expect(scenario.description.length).toBeGreaterThan(0);
    }
  });

  it('every scenario rank is between 2 and 10 (pitfall scenarios)', () => {
    for (const scenario of scenarios) {
      expect(scenario.rank).toBeGreaterThanOrEqual(2);
      expect(scenario.rank).toBeLessThanOrEqual(10);
    }
  });

  it('only uses valid suits', () => {
    const validSuits = ['spades', 'hearts', 'diamonds', 'clubs'];
    for (const scenario of scenarios) {
      expect(validSuits).toContain(scenario.suit);
    }
  });

  it('scenarios match the expected category per suit', () => {
    const suitCategories: Record<string, string> = {
      spades: 'Tools & Technology',
      hearts: 'Interpersonal & Customer Service',
      diamonds: 'Business Acumen',
      clubs: 'Safety, Compliance & Risk Management',
    };

    for (const scenario of scenarios) {
      expect(scenario.category).toBe(suitCategories[scenario.suit]);
    }
  });

  it('scenario IDs follow the expected naming convention', () => {
    // IDs should be like "spades-2", "hearts-7", etc.
    const idPattern = /^(spades|hearts|diamonds|clubs)-(2|3|4|5|6|7|8|9|10)$/;
    for (const scenario of scenarios) {
      expect(scenario.id).toMatch(idPattern);
    }
  });
});

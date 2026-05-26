import { describe, it, expect } from 'vitest';
import { faceCards } from './faceCards';
import type { FaceCard } from '../types';

describe('face card fixtures', () => {
  it('loads exactly 16 face/ace cards', () => {
    expect(faceCards).toHaveLength(16);
  });

  it('has exactly 4 face/ace cards per suit', () => {
    const suits = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
    for (const suit of suits) {
      const suitCards = faceCards.filter((c) => c.suit === suit);
      expect(suitCards).toHaveLength(4);
    }
  });

  it('has exactly 3 face cards (jack/queen/king) + 1 ace per suit', () => {
    for (const suit of ['spades', 'hearts', 'diamonds', 'clubs'] as const) {
      const suitCards = faceCards.filter((c) => c.suit === suit);
      const faces = suitCards.filter((c) => c.rank !== 'ace');
      const aces = suitCards.filter((c) => c.rank === 'ace');
      expect(faces).toHaveLength(3);
      expect(aces).toHaveLength(1);
    }
  });

  it('has no duplicate IDs', () => {
    const ids = faceCards.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every face card has all required fields', () => {
    for (const card of faceCards) {
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('rank');
      expect(card).toHaveProperty('suit');
      expect(card).toHaveProperty('type');
      expect(card).toHaveProperty('title');
      expect(card).toHaveProperty('status');

      expect(typeof card.id).toBe('string');
      expect(['jack', 'queen', 'king', 'ace']).toContain(card.rank);
      expect(typeof card.suit).toBe('string');
      expect(['capstone', 'brt']).toContain(card.type);
      expect(typeof card.title).toBe('string');
      expect(['active', 'coming-soon']).toContain(card.status);

      expect(card.id.length).toBeGreaterThan(0);
      expect(card.title.length).toBeGreaterThan(0);
    }
  });

  it('IDs follow suit-rank convention', () => {
    const idPattern = /^(spades|hearts|diamonds|clubs)-(jack|queen|king|ace)$/;
    for (const card of faceCards) {
      expect(card.id).toMatch(idPattern);
    }
  });

  it('diamond face/ace cards are BRT type and active', () => {
    const diamondCards = faceCards.filter((c) => c.suit === 'diamonds');
    expect(diamondCards).toHaveLength(4);
    for (const card of diamondCards) {
      expect(card.type).toBe('brt');
      expect(card.status).toBe('active');
    }
  });

  it('non-diamond face/ace cards are capstone type and coming-soon', () => {
    const nonDiamond = faceCards.filter((c) => c.suit !== 'diamonds');
    expect(nonDiamond).toHaveLength(12);
    for (const card of nonDiamond) {
      expect(card.type).toBe('capstone');
      expect(card.status).toBe('coming-soon');
    }
  });
});

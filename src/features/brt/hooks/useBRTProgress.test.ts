import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBRTProgress } from './useBRTProgress';

// ─── localStorage mock ───────────────────────────────────────────

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string): string | null => {
      return store[key] ?? null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
};

let localStorageMock: ReturnType<typeof createLocalStorageMock>;

beforeEach(() => {
  localStorageMock = createLocalStorageMock();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

// ─── Tests ────────────────────────────────────────────────────────

describe('useBRTProgress', () => {
  // ─── Initial State ─────────────────────────────────────────────

  it('returns steps for all 4 BRT milestones', () => {
    const { result } = renderHook(() => useBRTProgress());

    expect(result.current.steps).toHaveProperty('brt-name');
    expect(result.current.steps).toHaveProperty('brt-llc');
    expect(result.current.steps).toHaveProperty('brt-bank-insurance');
    expect(result.current.steps).toHaveProperty('brt-website');
  });

  it('has first step completed=false and all others locked=false initially', () => {
    const { result } = renderHook(() => useBRTProgress());

    // Step 1 (brt-name): not completed
    expect(result.current.steps['brt-name'].completed).toBe(false);
    // Step 2 (brt-llc): locked because step 1 not done
    expect(result.current.isStepUnlocked('brt-llc')).toBe(false);
    // Step 3 (brt-bank-insurance): locked
    expect(result.current.isStepUnlocked('brt-bank-insurance')).toBe(false);
    // Step 4 (brt-website): locked
    expect(result.current.isStepUnlocked('brt-website')).toBe(false);
  });

  it('first step is always unlocked', () => {
    const { result } = renderHook(() => useBRTProgress());

    expect(result.current.isStepUnlocked('brt-name')).toBe(true);
  });

  // ─── Step Completion Unlocks Next Step ─────────────────────────

  it('completing step 1 (name) unlocks step 2 (llc)', () => {
    const { result } = renderHook(() => useBRTProgress());

    act(() => {
      result.current.completeStep('brt-name');
    });

    expect(result.current.steps['brt-name'].completed).toBe(true);
    expect(result.current.isStepUnlocked('brt-llc')).toBe(true);
    expect(result.current.isStepUnlocked('brt-bank-insurance')).toBe(false);
  });

  it('completing step 1 then step 2 unlocks step 3', () => {
    const { result } = renderHook(() => useBRTProgress());

    act(() => {
      result.current.completeStep('brt-name');
      result.current.completeStep('brt-llc');
    });

    expect(result.current.steps['brt-name'].completed).toBe(true);
    expect(result.current.steps['brt-llc'].completed).toBe(true);
    expect(result.current.isStepUnlocked('brt-bank-insurance')).toBe(true);
  });

  it('completing all 4 steps unlocks everything', () => {
    const { result } = renderHook(() => useBRTProgress());

    act(() => {
      result.current.completeStep('brt-name');
      result.current.completeStep('brt-llc');
      result.current.completeStep('brt-bank-insurance');
      result.current.completeStep('brt-website');
    });

    expect(result.current.steps['brt-name'].completed).toBe(true);
    expect(result.current.steps['brt-llc'].completed).toBe(true);
    expect(result.current.steps['brt-bank-insurance'].completed).toBe(true);
    expect(result.current.steps['brt-website'].completed).toBe(true);
  });

  // ─── Sub-Step Completion ───────────────────────────────────────

  it('tracks sub-step completion within a step', () => {
    const { result } = renderHook(() => useBRTProgress());

    act(() => {
      result.current.completeSubStep('brt-llc', 'registered-agent');
    });

    expect(
      result.current.steps['brt-llc'].subSteps['registered-agent'],
    ).toBe(true);
    expect(
      result.current.steps['brt-llc'].subSteps['articles-of-org'],
    ).toBe(false);
  });

  it('completing all sub-steps marks the step as complete', () => {
    const { result } = renderHook(() => useBRTProgress());

    const llcSubSteps = [
      'registered-agent',
      'articles-of-org',
      'ein',
      'ky-tax-registration',
      'operating-agreement',
    ];

    act(() => {
      llcSubSteps.forEach((id) => {
        result.current.completeSubStep('brt-llc', id);
      });
    });

    expect(result.current.steps['brt-llc'].completed).toBe(true);
  });

  it('completing sub-steps in bank-insurance step works', () => {
    const { result } = renderHook(() => useBRTProgress());

    act(() => {
      result.current.completeSubStep('brt-bank-insurance', 'opened-account');
      result.current.completeSubStep('brt-bank-insurance', 'debit-card');
    });

    expect(
      result.current.steps['brt-bank-insurance'].subSteps['opened-account'],
    ).toBe(true);
    expect(
      result.current.steps['brt-bank-insurance'].subSteps['debit-card'],
    ).toBe(true);
    expect(
      result.current.steps['brt-bank-insurance'].subSteps['online-banking'],
    ).toBe(false);
  });

  // ─── Progress Percentage ───────────────────────────────────────

  it('getProgress returns 0 when nothing is complete', () => {
    const { result } = renderHook(() => useBRTProgress());

    expect(result.current.getProgress()).toBe(0);
  });

  it('getProgress returns 25% after one step complete', () => {
    const { result } = renderHook(() => useBRTProgress());

    act(() => {
      result.current.completeStep('brt-name');
    });

    expect(result.current.getProgress()).toBe(25);
  });

  it('getProgress returns 50% after two steps complete', () => {
    const { result } = renderHook(() => useBRTProgress());

    act(() => {
      result.current.completeStep('brt-name');
      result.current.completeStep('brt-llc');
    });

    expect(result.current.getProgress()).toBe(50);
  });

  it('getProgress returns 100% after all four steps complete', () => {
    const { result } = renderHook(() => useBRTProgress());

    act(() => {
      result.current.completeStep('brt-name');
      result.current.completeStep('brt-llc');
      result.current.completeStep('brt-bank-insurance');
      result.current.completeStep('brt-website');
    });

    expect(result.current.getProgress()).toBe(100);
  });

  // ─── localStorage Persistence ──────────────────────────────────

  it('persists progress to localStorage on changes', () => {
    const { result } = renderHook(() => useBRTProgress());

    act(() => {
      result.current.completeStep('brt-name');
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
    const calls = localStorageMock.setItem.mock.calls.filter(
      (c: string[]) => c[0] === 'brt-progress',
    );
    expect(calls.length).toBeGreaterThan(0);
  });

  it('loads progress from localStorage on mount', () => {
    const saved = {
      steps: {
        'brt-name': { completed: true, subSteps: {} },
        'brt-llc': {
          completed: true,
          subSteps: {
            'registered-agent': true,
            'articles-of-org': true,
            ein: true,
            'ky-tax-registration': true,
            'operating-agreement': true,
          },
        },
        'brt-bank-insurance': { completed: false, subSteps: {} },
        'brt-website': { completed: false, subSteps: {} },
      },
    };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(saved));

    const { result } = renderHook(() => useBRTProgress());

    expect(result.current.steps['brt-name'].completed).toBe(true);
    expect(result.current.steps['brt-llc'].completed).toBe(true);
    expect(result.current.isStepUnlocked('brt-bank-insurance')).toBe(true);
  });

  it('handles corrupt localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-valid-json');

    const { result } = renderHook(() => useBRTProgress());

    // Should fall back to initial state — first step unlocked
    expect(result.current.isStepUnlocked('brt-name')).toBe(true);
    expect(result.current.steps['brt-name'].completed).toBe(false);
  });

  // ─── Reset ─────────────────────────────────────────────────────

  it('reset clears all progress', () => {
    const { result } = renderHook(() => useBRTProgress());

    act(() => {
      result.current.completeStep('brt-name');
      result.current.completeStep('brt-llc');
    });

    expect(result.current.getProgress()).toBe(50);

    act(() => {
      result.current.reset();
    });

    expect(result.current.getProgress()).toBe(0);
    expect(result.current.steps['brt-name'].completed).toBe(false);
    expect(result.current.steps['brt-llc'].completed).toBe(false);
  });

  it('reset removes data from localStorage', () => {
    const { result } = renderHook(() => useBRTProgress());

    act(() => {
      result.current.completeStep('brt-name');
    });

    act(() => {
      result.current.reset();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('brt-progress');
  });
});

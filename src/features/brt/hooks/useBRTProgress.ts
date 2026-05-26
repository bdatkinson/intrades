import { useState, useEffect, useCallback, useMemo } from 'react';

// ─── Types ──────────────────────────────────────────────────────────

interface StepProgress {
  completed: boolean;
  subSteps: Record<string, boolean>;
}

interface BRTProgressData {
  steps: Record<string, StepProgress>;
}

const STORAGE_KEY = 'brt-progress';

// ─── Constants ──────────────────────────────────────────────────────

const STEP_IDS = ['brt-name', 'brt-llc', 'brt-bank-insurance', 'brt-website'];

/** Sub-step IDs for steps that have them. */
const STEP_SUB_STEPS: Record<string, string[]> = {
  'brt-llc': [
    'registered-agent',
    'articles-of-org',
    'ein',
    'ky-tax-registration',
    'operating-agreement',
  ],
  'brt-bank-insurance': [
    'opened-account',
    'debit-card',
    'online-banking',
    'gl-quote',
    'compared-providers',
    'selected-policy',
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────

function buildInitialSteps(): Record<string, StepProgress> {
  const steps: Record<string, StepProgress> = {};
  for (const id of STEP_IDS) {
    const subStepIds = STEP_SUB_STEPS[id] ?? [];
    const subSteps: Record<string, boolean> = {};
    for (const subId of subStepIds) {
      subSteps[subId] = false;
    }
    steps[id] = { completed: false, subSteps };
  }
  return steps;
}

function loadFromStorage(): BRTProgressData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic validation — must have a steps object
    if (parsed && typeof parsed.steps === 'object' && parsed.steps !== null) {
      return parsed as BRTProgressData;
    }
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(data: BRTProgressData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function areAllSubStepsComplete(subSteps: Record<string, boolean>): boolean {
  const ids = Object.keys(subSteps);
  if (ids.length === 0) return false; // steps with no sub-steps can't auto-complete
  return ids.every((id) => subSteps[id]);
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useBRTProgress() {
  const [steps, setSteps] = useState<Record<string, StepProgress>>(() => {
    const saved = loadFromStorage();
    if (saved) {
      // Merge with initial to ensure all keys exist
      const initial = buildInitialSteps();
      for (const id of STEP_IDS) {
        if (saved.steps[id]) {
          initial[id] = {
            completed: saved.steps[id].completed ?? false,
            subSteps: {
              ...initial[id].subSteps,
              ...(saved.steps[id].subSteps ?? {}),
            },
          };
        }
      }
      return initial;
    }
    return buildInitialSteps();
  });

  // Persist to localStorage whenever steps change
  useEffect(() => {
    saveToStorage({ steps });
  }, [steps]);

  const completeStep = useCallback((stepId: string) => {
    setSteps((prev) => {
      if (!prev[stepId]) return prev;
      return {
        ...prev,
        [stepId]: { ...prev[stepId], completed: true },
      };
    });
  }, []);

  const completeSubStep = useCallback((stepId: string, subStepId: string) => {
    setSteps((prev) => {
      if (!prev[stepId] || !(subStepId in prev[stepId].subSteps)) {
        return prev;
      }
      const updatedSubSteps = {
        ...prev[stepId].subSteps,
        [subStepId]: true,
      };
      const allDone = areAllSubStepsComplete(updatedSubSteps);
      return {
        ...prev,
        [stepId]: {
          ...prev[stepId],
          subSteps: updatedSubSteps,
          completed: allDone,
        },
      };
    });
  }, []);

  const isStepUnlocked = useCallback(
    (stepId: string): boolean => {
      const index = STEP_IDS.indexOf(stepId);
      if (index === -1) return false;
      if (index === 0) return true;
      const prevStepId = STEP_IDS[index - 1];
      return steps[prevStepId]?.completed === true;
    },
    [steps],
  );

  const getProgress = useCallback((): number => {
    const completedCount = STEP_IDS.filter(
      (id) => steps[id]?.completed === true,
    ).length;
    return Math.round((completedCount / STEP_IDS.length) * 100);
  }, [steps]);

  const reset = useCallback(() => {
    setSteps(buildInitialSteps());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    steps,
    completeStep,
    completeSubStep,
    isStepUnlocked,
    getProgress,
    reset,
    STEP_IDS,
    STEP_SUB_STEPS,
  };
}

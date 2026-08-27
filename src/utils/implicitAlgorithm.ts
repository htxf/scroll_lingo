import { UserKnowledgeState } from '../types';

export interface TelemetryMetrics {
  postId: string;
  dwellTimeMs: number;
  lookupsCount: number;
  knownMarkedCount: number;
}

export const NEXT_LEVEL_MAP: Record<string, 'N0' | 'N5' | 'N4' | 'N3'> = {
  N0: 'N5',
  N5: 'N4',
  N4: 'N3',
  N3: 'N3',
};

export const PREV_LEVEL_MAP: Record<string, 'N0' | 'N5' | 'N4' | 'N3'> = {
  N0: 'N0',
  N5: 'N0',
  N4: 'N5',
  N3: 'N4',
};

/**
 * Pure evaluation function for the implicit level adjustment algorithm.
 */
export function evaluateImplicitProgress(
  metrics: TelemetryMetrics,
  currentState: UserKnowledgeState
): 'N0' | 'N5' | 'N4' | 'N3' {
  const { lookupsCount, knownMarkedCount } = metrics;

  // Fast promotion criteria
  if (knownMarkedCount >= 3 && lookupsCount <= 1) {
    return NEXT_LEVEL_MAP[currentState.baselineLevel] || currentState.baselineLevel;
  }

  // Milestone promotion criteria
  if (currentState.totalWordsMastered >= 5 && currentState.baselineLevel === 'N0') {
    return 'N5';
  }
  if (currentState.totalWordsMastered >= 15 && currentState.baselineLevel === 'N5') {
    return 'N4';
  }
  if (currentState.totalWordsMastered >= 35 && currentState.baselineLevel === 'N4') {
    return 'N3';
  }

  // High friction demotion criteria
  if (lookupsCount >= 4 && currentState.baselineLevel !== 'N0') {
    return PREV_LEVEL_MAP[currentState.baselineLevel] || currentState.baselineLevel;
  }

  return currentState.baselineLevel;
}

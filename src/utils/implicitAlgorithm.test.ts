import { describe, it, expect } from 'vitest';
import { evaluateImplicitProgress } from './implicitAlgorithm';
import { UserKnowledgeState } from '../types';

describe('implicitAlgorithm - evaluateImplicitProgress', () => {
  const createMockState = (overrides: Partial<UserKnowledgeState> = {}): UserKnowledgeState => ({
    deviceUuid: 'dev-1',
    baselineLevel: 'N5',
    explicitKnownWords: new Set<string>(),
    explicitFocusWords: new Set<string>(),
    interestCategories: ['coffee'],
    totalPostsRead: 5,
    totalWordsMastered: 0,
    lastActiveTimestamp: Date.now(),
    ...overrides,
  });

  it('should promote N5 to N4 when user marks 3+ words known with low lookups', () => {
    const state = createMockState({ baselineLevel: 'N5' });
    const metrics = { postId: 'p1', dwellTimeMs: 8000, lookupsCount: 0, knownMarkedCount: 3 };

    const newLevel = evaluateImplicitProgress(metrics, state);
    expect(newLevel).toBe('N4');
  });

  it('should demote N4 to N5 when user experiences high lookup friction (4+ lookups)', () => {
    const state = createMockState({ baselineLevel: 'N4' });
    const metrics = { postId: 'p2', dwellTimeMs: 18000, lookupsCount: 4, knownMarkedCount: 0 };

    const newLevel = evaluateImplicitProgress(metrics, state);
    expect(newLevel).toBe('N5');
  });

  it('should automatically promote N5 to N4 when totalWordsMastered reaches 15', () => {
    const state = createMockState({ baselineLevel: 'N5', totalWordsMastered: 15 });
    const metrics = { postId: 'p3', dwellTimeMs: 5000, lookupsCount: 1, knownMarkedCount: 1 };

    const newLevel = evaluateImplicitProgress(metrics, state);
    expect(newLevel).toBe('N4');
  });
});

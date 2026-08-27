import { describe, it, expect } from 'vitest';
import { mergeUserKnowledgeStates } from './syncMerger';
import { UserKnowledgeState } from '../types';

describe('syncMerger - mergeUserKnowledgeStates', () => {
  const deviceState: UserKnowledgeState = {
    userId: undefined,
    deviceUuid: 'dev-phone',
    baselineLevel: 'N5',
    explicitKnownWords: new Set(['朝', '珈琲']),
    explicitFocusWords: new Set(['浅煎り']),
    interestCategories: ['coffee'],
    totalPostsRead: 10,
    totalWordsMastered: 2,
    lastActiveTimestamp: 1000,
  };

  const cloudState: UserKnowledgeState = {
    userId: 'user_cloud_123',
    deviceUuid: 'dev-pc',
    baselineLevel: 'N4',
    explicitKnownWords: new Set(['最高', '珈琲']),
    explicitFocusWords: new Set(['新機能']),
    interestCategories: ['tech'],
    totalPostsRead: 25,
    totalWordsMastered: 2,
    lastActiveTimestamp: 2000,
  };

  it('should perform set union merge for known words without data loss', () => {
    const merged = mergeUserKnowledgeStates(deviceState, cloudState);

    expect(merged.explicitKnownWords.has('朝')).toBe(true);
    expect(merged.explicitKnownWords.has('最高')).toBe(true);
    expect(merged.explicitKnownWords.has('珈琲')).toBe(true);
    expect(merged.totalWordsMastered).toBe(3);
  });

  it('should keep the highest baseline level between device and cloud', () => {
    const merged = mergeUserKnowledgeStates(deviceState, cloudState);
    expect(merged.baselineLevel).toBe('N4');
  });

  it('should union interest categories and pick latest timestamp', () => {
    const merged = mergeUserKnowledgeStates(deviceState, cloudState);
    expect(merged.interestCategories).toEqual(['coffee', 'tech']);
    expect(merged.lastActiveTimestamp).toBe(2000);
    expect(merged.userId).toBe('user_cloud_123');
  });
});

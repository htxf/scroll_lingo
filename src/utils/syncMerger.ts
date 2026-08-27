import { UserKnowledgeState } from '../types';

export const LEVEL_HIERARCHY: Record<string, number> = {
  N0: 0,
  N5: 1,
  N4: 2,
  N3: 3,
};

/**
 * Pure CRDT-inspired Set Union merge function for multi-device synchronization.
 *
 * Guarantees zero loss of guest learning progress when authenticating or syncing
 * across multiple devices.
 */
export function mergeUserKnowledgeStates(
  deviceState: UserKnowledgeState,
  cloudState: UserKnowledgeState
): UserKnowledgeState {
  // 1. Set Union for explicitKnownWords: Device Union Cloud
  const mergedKnownWords = new Set<string>([
    ...Array.from(deviceState.explicitKnownWords),
    ...Array.from(cloudState.explicitKnownWords),
  ]);

  // 2. Set Union for explicitFocusWords, subtracting known words
  const mergedFocusWords = new Set<string>([
    ...Array.from(deviceState.explicitFocusWords),
    ...Array.from(cloudState.explicitFocusWords),
  ]);
  mergedKnownWords.forEach((word) => mergedFocusWords.delete(word));

  // 3. Baseline level: Take the highest level achieved between device and cloud
  const deviceRank = LEVEL_HIERARCHY[deviceState.baselineLevel] ?? 0;
  const cloudRank = LEVEL_HIERARCHY[cloudState.baselineLevel] ?? 0;
  const mergedLevel: 'N0' | 'N5' | 'N4' | 'N3' =
    deviceRank >= cloudRank ? deviceState.baselineLevel : cloudState.baselineLevel;

  // 4. Union interest categories
  const mergedCategories = Array.from(
    new Set([...deviceState.interestCategories, ...cloudState.interestCategories])
  );

  return {
    userId: cloudState.userId || deviceState.userId,
    deviceUuid: deviceState.deviceUuid,
    baselineLevel: mergedLevel,
    explicitKnownWords: mergedKnownWords,
    explicitFocusWords: mergedFocusWords,
    interestCategories: mergedCategories,
    totalPostsRead: Math.max(deviceState.totalPostsRead, cloudState.totalPostsRead),
    totalWordsMastered: mergedKnownWords.size,
    lastActiveTimestamp: Math.max(
      deviceState.lastActiveTimestamp,
      cloudState.lastActiveTimestamp
    ),
  };
}

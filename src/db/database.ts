import Dexie, { type EntityTable } from 'dexie';
import { Post, UserKnowledgeState } from '../types';
import { INITIAL_SEED_POSTS } from './seedPosts';

export interface SavedWordEntity {
  id: string;
  lemma: string;
  surface: string;
  reading: string;
  definitionZh: string;
  level: string;
  contextSentence: string;
  addedAt: number;
}

export interface UserStateEntity {
  id: string; // 'current_user'
  deviceUuid: string;
  baselineLevel: 'N0' | 'N5' | 'N4' | 'N3';
  explicitKnownWords: string[]; // Serialized for Dexie IndexedDB
  explicitFocusWords: string[];
  interestCategories: string[];
  totalPostsRead: number;
  totalWordsMastered: number;
  lastActiveTimestamp: number;
  hasCompletedOnboarding?: boolean;
}

class ScrollLingoDatabase extends Dexie {
  posts!: EntityTable<Post, 'id'>;
  userState!: EntityTable<UserStateEntity, 'id'>;
  savedWords!: EntityTable<SavedWordEntity, 'id'>;

  constructor() {
    super('ScrollLingoDB');
    this.version(3).stores({
      posts: 'id, category, level, createdAt',
      userState: 'id',
      savedWords: 'id, lemma, addedAt',
    });
  }
}

export const db = new ScrollLingoDatabase();

/** Helper function to initialize database seed data */
export async function initializeDatabase(): Promise<void> {
  // Use bulkPut to update existing seed posts with latest sourceContext without deleting custom ones
  await db.posts.bulkPut(INITIAL_SEED_POSTS);

  const existingState = await db.userState.get('current_user');
  if (!existingState) {
    const defaultState: UserStateEntity = {
      id: 'current_user',
      deviceUuid: crypto.randomUUID(),
      baselineLevel: 'N0', // Default strictly to N0 for true beginners
      explicitKnownWords: [],
      explicitFocusWords: [],
      interestCategories: ['lifestyle', 'coffee', 'tech', 'sports', 'food'],
      totalPostsRead: 0,
      totalWordsMastered: 0,
      lastActiveTimestamp: Date.now(),
      hasCompletedOnboarding: false,
    };
    await db.userState.add(defaultState);
  } else {
    // Force baseline level to N0 if user has zero mastered words for true beginner start
    if (!existingState.explicitKnownWords || existingState.explicitKnownWords.length === 0) {
      existingState.baselineLevel = 'N0';
      await db.userState.put(existingState);
    }
  }
}

/** Helper function to convert DB UserStateEntity to domain UserKnowledgeState */
export function toUserKnowledgeState(entity: UserStateEntity): UserKnowledgeState {
  return {
    deviceUuid: entity.deviceUuid,
    baselineLevel: entity.baselineLevel || 'N0',
    explicitKnownWords: new Set(entity.explicitKnownWords || []),
    explicitFocusWords: new Set(entity.explicitFocusWords || []),
    interestCategories: entity.interestCategories || ['lifestyle', 'coffee', 'tech', 'sports', 'food'],
    totalPostsRead: entity.totalPostsRead || 0,
    totalWordsMastered: entity.totalWordsMastered || 0,
    lastActiveTimestamp: entity.lastActiveTimestamp || Date.now(),
    hasCompletedOnboarding: entity.hasCompletedOnboarding ?? false,
  };
}

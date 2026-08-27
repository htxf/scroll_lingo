import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db, initializeDatabase, toUserKnowledgeState } from './database';

describe('ScrollLingo Database Initialization', () => {
  beforeEach(async () => {
    await db.posts.clear();
    await db.userState.clear();
  });

  it('should initialize seed posts and default user state when empty', async () => {
    await initializeDatabase();

    const postsCount = await db.posts.count();
    expect(postsCount).toBeGreaterThan(0);

    const userStateEntity = await db.userState.get('current_user');
    expect(userStateEntity).toBeDefined();
    expect(userStateEntity?.baselineLevel).toBe('N0');
    
    if (userStateEntity) {
      const domainState = toUserKnowledgeState(userStateEntity);
      expect(domainState.baselineLevel).toBe('N0');
    }
  });

  it('should not duplicate seed posts on subsequent initialization calls', async () => {
    await initializeDatabase();
    const firstCount = await db.posts.count();

    await initializeDatabase();
    const secondCount = await db.posts.count();

    expect(secondCount).toBe(firstCount);
  });
});

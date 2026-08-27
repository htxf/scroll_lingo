import { describe, it, expect } from 'vitest';
import { rankPostsForInFeedSRS, SRS_INTERVALS_MS } from './srsEngine';
import { Post, UserKnowledgeState } from '../types';
import { SavedWordEntity } from '../db/database';

describe('srsEngine - rankPostsForInFeedSRS', () => {
  const createMockPost = (id: string, lemmas: string[]): Post => ({
    id,
    persona: {
      id: 'p1',
      name: 'Ken',
      handle: '@ken',
      avatarUrl: '',
      category: 'coffee',
      bioZh: '',
    },
    contentJa: '内容',
    translationZh: '翻译',
    category: 'coffee',
    level: 'N5',
    likesCount: 10,
    repostsCount: 1,
    createdAt: '1m ago',
    tokens: lemmas.map((l, idx) => ({
      id: `t_${idx}`,
      surface: l,
      reading: l,
      romaji: l,
      lemma: l,
      pos: '名词',
      level: 'N5',
      definitionZh: '释义',
    })),
    comments: [],
  });

  const mockUserState: UserKnowledgeState = {
    deviceUuid: 'dev-1',
    baselineLevel: 'N5',
    explicitKnownWords: new Set<string>(),
    explicitFocusWords: new Set<string>(['浅煎り']),
    interestCategories: ['coffee'],
    totalPostsRead: 0,
    totalWordsMastered: 0,
    lastActiveTimestamp: Date.now(),
  };

  it('should rank posts with target due SRS review words higher', () => {
    const postNormal = createMockPost('post_normal', ['最高', '朝']);
    const postWithTarget = createMockPost('post_target', ['浅煎り', '豆']);

    const now = Date.now();
    const savedWords: SavedWordEntity[] = [
      {
        id: 's1',
        lemma: '浅煎り',
        surface: '浅煎り',
        reading: 'あさいり',
        definitionZh: '浅度烘焙',
        level: 'N4',
        contextSentence: '浅煎りの豆',
        addedAt: now - SRS_INTERVALS_MS.DAY_1 * 1.1, // Due for review
      },
    ];

    const ranked = rankPostsForInFeedSRS([postNormal, postWithTarget], mockUserState, savedWords, now);

    expect(ranked[0]?.id).toBe('post_target');
  });
});

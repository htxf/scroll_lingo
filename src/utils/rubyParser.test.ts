import { describe, it, expect } from 'vitest';
import { shouldShowFurigana } from './rubyParser';
import { Token, UserKnowledgeState } from '../types';

describe('rubyParser - shouldShowFurigana', () => {
  const createMockToken = (overrides: Partial<Token> = {}): Token => ({
    id: 'test_1',
    surface: '朝',
    reading: 'あさ',
    romaji: 'asa',
    lemma: '朝',
    pos: '名词',
    level: 'N5',
    definitionZh: '早晨',
    ...overrides,
  });

  const createMockState = (overrides: Partial<UserKnowledgeState> = {}): UserKnowledgeState => ({
    deviceUuid: 'mock-device',
    baselineLevel: 'N5',
    explicitKnownWords: new Set<string>(),
    explicitFocusWords: new Set<string>(),
    interestCategories: ['coffee'],
    totalPostsRead: 0,
    totalWordsMastered: 0,
    lastActiveTimestamp: Date.now(),
    ...overrides,
  });

  it('should hide furigana if token has no reading or is identical to surface', () => {
    const tokenWithoutReading = createMockToken({ reading: '' });
    const kanaToken = createMockToken({ surface: 'です', reading: 'です' });
    const state = createMockState({ baselineLevel: 'N5' });

    expect(shouldShowFurigana(tokenWithoutReading, state)).toBe(false);
    expect(shouldShowFurigana(kanaToken, state)).toBe(false);
  });

  it('should hide furigana if token level <= user baseline level', () => {
    const n5Token = createMockToken({ level: 'N5' });
    const state = createMockState({ baselineLevel: 'N5' });

    expect(shouldShowFurigana(n5Token, state)).toBe(false);
  });

  it('should show furigana if token level > user baseline level', () => {
    const n4Token = createMockToken({ level: 'N4' });
    const state = createMockState({ baselineLevel: 'N5' });

    expect(shouldShowFurigana(n4Token, state)).toBe(true);
  });

  it('should hide furigana if token is in explicitKnownWords, overriding level difference', () => {
    const n3Token = createMockToken({ surface: '新機能', lemma: '新機能', level: 'N3' });
    const state = createMockState({
      baselineLevel: 'N5',
      explicitKnownWords: new Set(['新機能']),
    });

    expect(shouldShowFurigana(n3Token, state)).toBe(false);
  });

  it('should show furigana if token is in explicitFocusWords, overriding baseline level', () => {
    const n5Token = createMockToken({ surface: '朝', lemma: '朝', level: 'N5' });
    const state = createMockState({
      baselineLevel: 'N5',
      explicitFocusWords: new Set(['朝']),
    });

    expect(shouldShowFurigana(n5Token, state)).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { shouldShowFurigana, getPostPhoneticText } from './rubyParser';
import { Post, Token, UserKnowledgeState } from '../types';

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

describe('rubyParser - getPostPhoneticText', () => {
  it('should convert all Kanji surfaces to their explicit readings for 100% pure Japanese speech', () => {
    const mockPost: Post = {
      id: 'post_1',
      category: 'coffee',
      level: 'N5',
      contentJa: '朝の珈琲。いい香り。☕️✨',
      translationZh: '早晨的咖啡。真香。',
      createdAt: '1小时前',
      likesCount: 12,
      repostsCount: 2,
      comments: [],
      persona: { id: 'p1', name: 'Kissa', handle: '@kissa', avatarUrl: '☕', bioZh: 'Bio', category: 'coffee' },
      tokens: [
        { id: '1', surface: '朝', reading: 'あさ', romaji: 'asa', lemma: '朝', pos: '名词', level: 'N5', definitionZh: '早晨' },
        { id: '2', surface: 'の', reading: 'の', romaji: 'no', lemma: 'の', pos: '助词', level: 'N5', definitionZh: '的' },
        { id: '3', surface: '珈琲', reading: 'コーヒー', romaji: 'kōhī', lemma: '珈琲', pos: '名词', level: 'N5', definitionZh: '咖啡' },
        { id: '4', surface: '。', reading: '。', romaji: '', lemma: '。', pos: '标点', level: 'N5', definitionZh: '' },
        { id: '5', surface: 'いい', reading: 'いい', romaji: 'ii', lemma: 'いい', pos: '形容词', level: 'N5', definitionZh: '好的' },
        { id: '6', surface: '香り', reading: 'かおり', romaji: 'kaori', lemma: '香り', pos: '名词', level: 'N5', definitionZh: '香气' },
        { id: '7', surface: '。', reading: '。', romaji: '', lemma: '。', pos: '标点', level: 'N5', definitionZh: '' },
      ],
    };

    const phoneticText = getPostPhoneticText(mockPost);
    expect(phoneticText).toBe('あさのコーヒー。いいかおり。');
  });

  it('should fallback to contentJa if tokens array is empty', () => {
    const mockPost: Post = {
      id: 'post_empty',
      category: 'lifestyle',
      level: 'N0',
      contentJa: 'あ！ねこ！',
      translationZh: '啊！猫！',
      createdAt: '1小时前',
      likesCount: 5,
      repostsCount: 0,
      comments: [],
      persona: { id: 'p2', name: 'Cat', handle: '@cat', avatarUrl: '🐱', bioZh: 'Bio', category: 'lifestyle' },
      tokens: [],
    };

    expect(getPostPhoneticText(mockPost)).toBe('あ！ねこ！');
  });
});

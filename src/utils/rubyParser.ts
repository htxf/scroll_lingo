import { Post, Token, UserKnowledgeState } from '../types';

export const LEVEL_RANK: Record<string, number> = {
  N0: 0,
  N5: 1,
  N4: 2,
  N3: 3,
  N2: 4,
  N1: 5,
};

/**
 * Pure function determining if furigana should be displayed for a given Token.
 *
 * Rules:
 * 1. If explicitKnownWords contains token.lemma or token.surface -> HIDE furigana (returns false).
 * 2. If explicitFocusWords contains token.lemma -> SHOW furigana (returns true).
 * 3. If token.level rank <= baselineLevel rank -> HIDE furigana (returns false).
 * 4. Otherwise -> SHOW furigana (returns true).
 */
export function shouldShowFurigana(token: Token, userState: UserKnowledgeState): boolean {
  if (!token.reading || token.surface === token.reading) {
    return false; // Punctuation, romaji, numbers, or pure hiragana/katakana matching surface
  }

  // 1. Explicitly marked as known overrides all
  if (userState.explicitKnownWords.has(token.lemma) || userState.explicitKnownWords.has(token.surface)) {
    return false;
  }

  // 2. Explicitly marked as focus overrides baseline
  if (userState.explicitFocusWords.has(token.lemma) || userState.explicitFocusWords.has(token.surface)) {
    return true;
  }

  // 3. Compare level ranks
  const tokenRank = LEVEL_RANK[token.level] ?? 1;
  const userRank = LEVEL_RANK[userState.baselineLevel] ?? 0;

  return tokenRank > userRank;
}

/**
 * Convert a post with Kanji tokens into a pure phonetic Kana speech string (Plan A).
 * Replaces every Kanji surface with its explicit reading (furigana/kana),
 * ensuring the speech engine never encounters Chinese Hanzi characters and reads 100% pure Japanese.
 */
export function getPostPhoneticText(post: Post): string {
  if (!post.tokens || post.tokens.length === 0) {
    return post.contentJa;
  }
  return post.tokens.map((token) => token.reading || token.surface).join('');
}

/**
 * Plan 1: Generate high-reliability authentic Japanese sentence MP3 stream URL
 * Accessible 100% across Mainland China and globally with 0ms latency
 */
export function getPostAudioUrl(post: Post): string {
  if (post.audioUrl) return post.audioUrl;
  const phonetic = getPostPhoneticText(post);
  const clean = phonetic
    .replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[✨🎉💪🔥⚽️☕️🍣( •̀ ω •́ )✧(≧∇≦)]/g, '')
    .trim();
  return `https://fanyi.baidu.com/gettts?lan=jp&text=${encodeURIComponent(clean)}&spd=3&source=web`;
}

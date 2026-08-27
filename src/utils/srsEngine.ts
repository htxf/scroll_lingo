import { Post, UserKnowledgeState } from '../types';
import { SavedWordEntity } from '../db/database';

export const SRS_INTERVALS_MS = {
  DAY_1: 1 * 24 * 60 * 60 * 1000,
  DAY_3: 3 * 24 * 60 * 60 * 1000,
  DAY_7: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Ranks feed posts using In-Feed Spaced Repetition (SRS) priorities.
 *
 * Posts containing target vocabulary due for review or in explicitFocusWords
 * are boosted to the top of the feed to allow natural re-encounter in context.
 */
export function rankPostsForInFeedSRS(
  posts: Post[],
  userState: UserKnowledgeState,
  savedWords: SavedWordEntity[],
  nowTimestamp: number = Date.now()
): Post[] {
  const focusSet = userState.explicitFocusWords;
  const savedLemmaSet = new Set(savedWords.map((w) => w.lemma));

  // Determine target review lemmas
  const dueReviewLemmas = new Set<string>();
  savedWords.forEach((word) => {
    const timeElapsed = nowTimestamp - word.addedAt;
    // If due around 1 day, 3 days, or 7 days
    if (
      timeElapsed >= SRS_INTERVALS_MS.DAY_1 * 0.8 ||
      focusSet.has(word.lemma)
    ) {
      dueReviewLemmas.add(word.lemma);
    }
  });

  return [...posts].sort((a, b) => {
    const scoreA = calculatePostSRSScore(a, dueReviewLemmas, savedLemmaSet, focusSet);
    const scoreB = calculatePostSRSScore(b, dueReviewLemmas, savedLemmaSet, focusSet);
    return scoreB - scoreA;
  });
}

function calculatePostSRSScore(
  post: Post,
  dueLemmas: Set<string>,
  savedLemmas: Set<string>,
  focusSet: Set<string>
): number {
  let score = 0;

  for (const token of post.tokens) {
    if (dueLemmas.has(token.lemma)) {
      score += 10;
    } else if (focusSet.has(token.lemma)) {
      score += 5;
    } else if (savedLemmas.has(token.lemma)) {
      score += 2;
    }
  }

  return score;
}

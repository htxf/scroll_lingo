# Specification: scroll_lingo

> **Status**: Ready for Agent  
> **Target Repo**: `d:/Projects/scroll_lingo`  
> **Architectural Framework**: React 19 + TypeScript (Matt Pocock Paradigm) + Vite + Dexie.js (IndexedDB)

---

## Problem Statement

Traditional vocabulary memorization tools (e.g., Anki, Memrise) impose high friction, task fatigue, and cognitive load on "fake zero-foundation" and "fragmented" language learners. Learners who have specific personal interests (e.g., football, coffee, tech) resist rote memorization and quickly abandon rigid study regimens. They need an immersive, zero-friction environment where language acquisition happens naturally while indulging in daily "social media scrolling" habits.

---

## Solution

`scroll_lingo` is a mobile-first H5/PWA application disguised as a Twitter/X social media feed. AI virtual personas post interest-tailored bilingual short-form posts (currently focused on Japanese). 

Key features include:
1. **Progressive Furigana Degradation**: Dynamically hides/shows `<ruby>` readings based on the user's baseline level (e.g., N5) and explicit word mastery.
2. **0ms Interactive Token Cards**: Tapping any word instantly pops up a reading, POS, lemma, definition, and Pitch Accent diagram, with an on-demand "AI Grammar Teacher" for deeper contextual analysis.
3. **In-Feed SRS**: Spaced repetition naturally embedded into the social feed recommendation algorithm (target vocabulary re-occurs in new posts at 1/3/7 day intervals).
4. **Interactive Comments & Audio**: Bilingual comments with clickable token lookup and zero-latency Web Speech API (`ja-JP`) audio playback.
5. **Guest First & Seamless Sync**: 100% offline-ready IndexedDB storage for guests, with CRDT Union Merge data sync upon user authentication.

---

## User Stories

1. **As a new learner**, I want to pick 1–3 interest topics (e.g., ⚽ Football, ☕ Coffee, 💻 Coding) during a 3-second onboarding flow, so that my feed is immediately filled with content I actually care about.
2. **As a learner with basic prior knowledge**, I want to pick a 3-card feel test baseline (e.g., N5/N4/N3), so that the initial furigana annotations match my current reading level.
3. **As a user scrolling the feed**, I want the UI to look and feel like Twitter/X (with avatars, handles, timestamps, likes, and repost counts), so that learning feels like casual social media browsing.
4. **As a user reading a Japanese post**, I want furigana above kanji to hide automatically for words I already know, so that I am gradually nudged to read native Japanese script.
5. **As a user encountering an unfamiliar word**, I want to tap the word and instantly see a pop-up card showing its reading, pitch accent curve, part of speech, and Chinese definition without any loading lag.
6. **As a user confused by complex grammar**, I want to tap "AI Teacher Deep Breakdown" on a card, so that an LLM provides a contextual breakdown of sentence structure and verb conjugations.
7. **As a user wanting to hear correct pronunciation**, I want to tap a speaker icon on any word or post, so that high-quality native `ja-JP` speech plays with 0ms latency via Web Speech API.
8. **As a learner practicing pitch accent**, I want pitch accent types (`① 头高`, `⓪ 平板`, etc.) and pitch curves visually drawn on word cards, so that I internalize correct Japanese intonation.
9. **As a user exploring post discussions**, I want to open the comment section and tap on comments to inspect vocabulary, so that I can learn authentic internet slang and conversational Japanese.
10. **As a user who marked a word as "learning"**, I want future feed posts over the next 1/3/7 days to naturally feature that word in new contexts, so that I review vocabulary without grinding flashcards.
11. **As a user reviewing past lookups**, I want to open a "Bookmarks" tab disguised as Twitter Saved Posts, so that I can quickly review all my looked-up words in their original sentence contexts.
12. **As an offline mobile user**, I want all posts, user knowledge states, and offline dictionaries to be saved locally via IndexedDB (Dexie.js), so that I can scroll and learn without an internet connection.
13. **As a user who notices a parsing error**, I want to tap a "Report Wrong Furigana" button on a card, so that the error is flagged for automated LLM re-annotation and admin review.
14. **As a guest user creating an account later**, I want my offline progress (mastered words, baseline level) to merge seamlessly with my cloud account using a set union algorithm, so that I never lose my learning data.
15. **As a content administrator**, I want an Admin CMS with automated RSS-to-LLM pipelines and MeCab/LLM dual-parser validation, so that fresh, 99.9% accurate Japanese content is continuously ingested into the corpus.

---

## Implementation Decisions

### Module Boundaries
1. **Frontend Core (`src/components/`, `src/reader/`)**:
   - `RubyTokenText`: Pure rendering component decorating raw tokens into `<ruby>` / `<rt>` HTML nodes according to user state.
   - `InteractiveCard`: Modal drawer presenting instant token data and triggering asynchronous AI Teacher queries.
   - `PitchAccentView`: SVG/CSS component rendering intonation contours.
2. **State & Storage Engine (`src/db/`, `src/hooks/`)**:
   - `Dexie` IndexedDB schema storing `posts`, `personas`, `userKnowledgeState`, and `savedVocab`.
   - `useUserKnowledge` React hook managing state transitions.
3. **Algorithms (`src/utils/`)**:
   - `rubyParser.ts`: `shouldShowFurigana(token, userState): boolean` pure function.
   - `srsEngine.ts`: Calculates target word re-occurrence priorities for feed generation.
   - `syncMerger.ts`: Idempotent Set Union algorithm for multi-device synchronization:
     $$\text{knownWords}_{\text{merged}} = \text{knownWords}_{\text{device}} \cup \text{knownWords}_{\text{cloud}}$$

### Core Domain Interfaces (Excerpt from Prototype Schema)

```typescript
export type PitchAccentType = 'heiban' | 'atamadaka' | 'nakadaka' | 'odaka';

export interface Token {
  id: string;
  surface: string;
  reading: string;
  romaji: string;
  lemma: string;
  pos: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  definitionZh: string;
  pitchAccent?: { pattern: PitchAccentType; pitchNotation: string };
}

export interface UserKnowledgeState {
  deviceUuid: string;
  baselineLevel: 'N5' | 'N4' | 'N3';
  explicitKnownWords: Set<string>;
  explicitFocusWords: Set<string>;
  interestCategories: string[];
  lastActiveTimestamp: number;
}
```

---

## Testing Decisions

### Seam Architecture & Strategy
Tests must focus exclusively on **external behaviors** at high-level integration seams, avoiding implementation detail testing.

#### Seam 1: Furigana Rendering Seam (`rubyParser.test.ts`)
- **Focus**: Verify `shouldShowFurigana(token, userState)` returns exact boolean flags across all level matrix combinations, explicit known overrides, and explicit focus overrides.
- **Test cases**:
  - Token level N5 vs User level N5 -> Returns `false` (hidden by default).
  - Token level N3 vs User level N5 -> Returns `true` (shown).
  - Explicitly marked in `explicitKnownWords` -> Returns `false` regardless of level difference.
  - Explicitly marked in `explicitFocusWords` -> Returns `true` regardless of level difference.

#### Seam 2: Multi-Device Sync Seam (`syncMerger.test.ts`)
- **Focus**: Verify guest-to-cloud data reconciliation is idempotent and lossless.
- **Test cases**:
  - Merging two disjoint sets of known words produces complete union.
  - Merging overlapping sets deduplicates correctly without side effects.

#### Seam 3: SRS Feed Recommendation Seam (`srsEngine.test.ts`)
- **Focus**: Verify posts containing target review vocabulary are prioritized when interval thresholds (1/3/7 days) are reached.

---

## Out of Scope

1. **Video/Audio Streaming Posts**: Initial release focuses exclusively on short text and static image posts.
2. **Direct Messaging (DMs) & User Social Networking**: All social interactions (comments, reposts, likes) are simulated by AI personas to maintain a zero-pressure learning environment.
3. **Synchronous Multiplayer Classrooms**: No live audio rooms or real-time multiplayer features in v1.0.

---

## Further Notes

- **Matt Pocock TypeScript Rules**: All domain schemas enforce `strict: true`, zero `any` usage, explicit discriminated unions, and immutable updates.
- **PWA & Offline First**: Manifest and Service Worker caching ensure complete offline operation for pre-loaded feed items and dictionary lookups.

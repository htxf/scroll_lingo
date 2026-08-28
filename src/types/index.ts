/**
 * scroll_lingo Domain Types
 * Matt Pocock Strict Paradigm
 */

export type PitchAccentType = 'heiban' | 'atamadaka' | 'nakadaka' | 'odaka';

export interface PitchAccent {
  pattern: PitchAccentType;
  pitchNotation: string; // e.g. "0", "1", "2"
}

export type JLPTLevel = 'N0' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface Token {
  id: string; // Unique Token Hash
  surface: string; // 表面型 (e.g. 行きます)
  reading: string; // 读音假名 (e.g. いきます)
  romaji: string; // 罗马音 (e.g. ikimasu)
  lemma: string; // 词汇原形 (e.g. 行く)
  pos: string; // 词性 (e.g. 动词-自五)
  level: JLPTLevel; // JLPT Level including N0 for True Beginners
  definitionZh: string; // 基础中文释义
  pitchAccent?: PitchAccent;
}

export interface Persona {
  id: string;
  name: string;
  handle: string; // e.g. @coffee_master_ken
  avatarUrl: string;
  category: 'sports' | 'tech' | 'coffee' | 'gaming' | 'food' | 'lifestyle';
  bioZh: string;
}

export interface Comment {
  id: string;
  persona: Persona;
  contentJa: string;
  tokens: Token[];
  contentZh: string;
  likesCount: number;
  createdAt: string;
}

export interface Post {
  id: string;
  persona: Persona;
  titleJa?: string;
  contentJa: string;
  tokens: Token[];
  translationZh: string;
  imageUrl?: string;
  audioUrl?: string; // Plan 1: Pre-computed / Static Authentic Japanese MP3 Audio URL
  category: string;
  level: JLPTLevel;
  likesCount: number;
  repostsCount: number;
  comments: Comment[];
  createdAt: string;
  targetVocabIds?: string[];
  legoBlocks?: { text: string; color: string; labelZh: string }[]; // Lego sentence block structure for N0/N5
}

export interface UserKnowledgeState {
  userId?: string;
  deviceUuid: string;
  baselineLevel: 'N0' | 'N5' | 'N4' | 'N3';
  explicitKnownWords: Set<string>;
  explicitFocusWords: Set<string>;
  interestCategories: string[];
  totalPostsRead: number;
  totalWordsMastered: number;
  lastActiveTimestamp: number;
  hasCompletedOnboarding?: boolean;
}

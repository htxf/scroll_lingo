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

export type LanguageCode = 'ja' | 'en' | 'ko';

export interface PhoneticAnnotation {
  reading: string;        // 日语假名 / 英语音标 / 韩语连音
  romajiOrIpa?: string;   // 罗马音 / 国际音标
  pitchOrStress?: string; // 日语声调型 / 英语重音位置
}

export interface Token {
  id: string; // Unique Token Hash
  surface: string; // 表面型 (e.g. 行きます / Coffee / 커피)
  reading: string; // 读音假名或音标 (e.g. いきます / ˈkɒfi / 커피)
  romaji: string; // 罗马音或简易注音 (e.g. ikimasu / kah-fee / keopi)
  lemma: string; // 词汇原形 (e.g. 行く / go / 가다)
  pos: string; // 词性 (e.g. 动词-自五 / 名词 / 动作)
  level: JLPTLevel; // JLPT Level or CEFR A1~C2
  definitionZh: string; // 基础中文释义
  pitchAccent?: PitchAccent;
  phonetic?: PhoneticAnnotation; // 通用多语种注音扩展
  lang?: LanguageCode;
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

/** 真实热点原始背景与出处 (Dual-Layer 折叠层) */
export interface HotTopicSourceContext {
  originTitle: string;        // 热搜原始标题 (例: "OpenAI 发布新一代轻量模型")
  originSnippet?: string;     // 原始摘要或原推短文
  originUrl?: string;         // 原始出处链接 (如微博/少数派/Reddit)
  sourcePlatform?: string;    // 'weibo' | 'sspai' | 'zhihu' | 'reddit' | 'hupu'
  culturalNoteZh?: string;    // 文化背景或热梗解读
}

export interface Post {
  id: string;
  persona: Persona;
  titleJa?: string;
  contentJa: string;
  tokens: Token[];
  translationZh: string;
  imageUrl?: string;
  audioUrl?: string; // Pre-computed / Static Authentic MP3 Audio URL
  category: string;
  level: JLPTLevel;
  likesCount: number;
  repostsCount: number;
  comments: Comment[];
  createdAt: string;
  targetVocabIds?: string[];
  legoBlocks?: { text: string; color: string; labelZh: string }[]; // Lego sentence block structure for N0/N5
  sourceContext?: HotTopicSourceContext; // Dual-Layer 热点分层背景与溯源链接
  lang?: LanguageCode; // 语言标识 (默认 'ja')
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

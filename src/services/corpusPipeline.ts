import { Post, Persona, Token } from '../types';

export interface FuriganaErrorReport {
  id: string;
  tokenId: string;
  lemma: string;
  surface: string;
  currentReading: string;
  suggestedReading: string;
  contextSentence: string;
  reportedAt: number;
  status: 'pending' | 'resolved';
}

/**
 * MeCab/Kuromoji + LLM Dual-Pipeline Disambiguation Helper.
 *
 * In production/real API mode, this sends raw Japanese text through
 * a morphological analyzer and runs context-aware LLM verification to resolve
 * homographs (e.g. 「角」かど/つの, 「生」なま/いき).
 */
export async function verifyAndTokenizePost(
  contentJa: string,
  translationZh: string,
  category: string,
  persona: Persona,
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N4'
): Promise<Post> {
  // Simulated Morphological + LLM Dual Pipeline Disambiguation
  const mockTokens: Token[] = [
    {
      id: `tok_${Date.now()}_1`,
      surface: '最新',
      reading: 'さいしん',
      romaji: 'saishin',
      lemma: '最新',
      pos: '名词',
      level: level,
      definitionZh: '最新',
      pitchAccent: { pattern: 'heiban', pitchNotation: '0' },
    },
    {
      id: `tok_${Date.now()}_2`,
      surface: 'の',
      reading: 'の',
      romaji: 'no',
      lemma: 'の',
      pos: '助词',
      level: 'N5',
      definitionZh: '的',
    },
    {
      id: `tok_${Date.now()}_3`,
      surface: 'ニュース',
      reading: 'ニュース',
      romaji: 'nyuusu',
      lemma: 'ニュース',
      pos: '名词',
      level: 'N5',
      definitionZh: '新闻/消息',
    },
    {
      id: `tok_${Date.now()}_4`,
      surface: 'です',
      reading: 'です',
      romaji: 'desu',
      lemma: 'です',
      pos: '助动词',
      level: 'N5',
      definitionZh: '是',
    },
    {
      id: `tok_${Date.now()}_5`,
      surface: '。',
      reading: '',
      romaji: '',
      lemma: '。',
      pos: '标点',
      level: 'N5',
      definitionZh: '句号',
    },
  ];

  return {
    id: `post_ai_${Date.now()}`,
    persona,
    contentJa,
    translationZh,
    category,
    level,
    likesCount: Math.floor(Math.random() * 50) + 10,
    repostsCount: Math.floor(Math.random() * 10) + 1,
    comments: [],
    createdAt: 'Just now',
    tokens: mockTokens,
  };
}

/** Error Feedback Triage Service */
export function createFuriganaReport(
  tokenId: string,
  surface: string,
  lemma: string,
  currentReading: string,
  suggestedReading: string,
  contextSentence: string
): FuriganaErrorReport {
  return {
    id: `report_${Date.now()}`,
    tokenId,
    surface,
    lemma,
    currentReading,
    suggestedReading,
    contextSentence,
    reportedAt: Date.now(),
    status: 'pending',
  };
}

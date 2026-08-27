import { describe, it, expect } from 'vitest';
import { verifyAndTokenizePost, createFuriganaReport } from './corpusPipeline';
import { Persona } from '../types';

describe('corpusPipeline Service', () => {
  const mockPersona: Persona = {
    id: 'p1',
    name: 'Yuki',
    handle: '@yuki',
    avatarUrl: '',
    category: 'tech',
    bioZh: '',
  };

  it('should generate pre-tokenized post structure with dual-pipeline disambiguation', async () => {
    const post = await verifyAndTokenizePost('最新のニュースです。', '这是最新新闻。', 'tech', mockPersona, 'N4');

    expect(post.id).toContain('post_ai_');
    expect(post.tokens.length).toBeGreaterThan(0);
    expect(post.persona.name).toBe('Yuki');
    expect(post.tokens[0]?.reading).toBe('さいしん');
  });

  it('should create a valid furigana error report item', () => {
    const report = createFuriganaReport('t1', '角', '角', 'つの', 'かど', '街の角');

    expect(report.status).toBe('pending');
    expect(report.surface).toBe('角');
    expect(report.suggestedReading).toBe('かど');
  });
});

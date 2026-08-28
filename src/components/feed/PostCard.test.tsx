import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from './PostCard';
import { Post, UserKnowledgeState } from '../../types';

describe('PostCard Component', () => {
  const mockPost: Post = {
    id: 'p1',
    persona: {
      id: 'per1',
      name: 'Ken ☕',
      handle: '@coffee_ken',
      avatarUrl: 'http://example.com/avatar.jpg',
      category: 'coffee',
      bioZh: 'Bio',
    },
    contentJa: '朝の珈琲。',
    translationZh: '早晨的咖啡。',
    category: 'coffee',
    level: 'N5',
    likesCount: 10,
    repostsCount: 2,
    createdAt: '10m ago',
    tokens: [
      { id: 't1', surface: '朝', reading: 'あさ', romaji: 'asa', lemma: '朝', pos: '名词', level: 'N5', definitionZh: '早晨' },
      { id: 't2', surface: 'の', reading: 'の', romaji: 'no', lemma: 'の', pos: '助词', level: 'N5', definitionZh: '的' },
      { id: 't3', surface: '珈琲', reading: 'コーヒー', romaji: 'kōhī', lemma: '珈琲', pos: '名词', level: 'N5', definitionZh: '咖啡' },
      { id: 't4', surface: '。', reading: '。', romaji: '', lemma: '。', pos: '标点', level: 'N5', definitionZh: '' },
    ],
    comments: [],
  };

  const mockUserState: UserKnowledgeState = {
    deviceUuid: 'dev-1',
    baselineLevel: 'N5',
    explicitKnownWords: new Set<string>(),
    explicitFocusWords: new Set<string>(),
    interestCategories: ['coffee'],
    totalPostsRead: 0,
    totalWordsMastered: 0,
    lastActiveTimestamp: Date.now(),
  };

  it('should render post content, persona info, and level badge', () => {
    render(
      <PostCard
        post={mockPost}
        userState={mockUserState}
        onTokenClick={vi.fn()}
        onSpeakText={vi.fn()}
      />
    );

    expect(screen.getByText('Ken ☕')).not.toBeNull();
    expect(screen.getByText(/@coffee_ken/)).not.toBeNull();
    expect(screen.getByText('N5 入门')).not.toBeNull();
  });

  it('should toggle pure twitter vs study mode when clicking mode button', () => {
    render(
      <PostCard
        post={mockPost}
        userState={mockUserState}
        onTokenClick={vi.fn()}
        onSpeakText={vi.fn()}
      />
    );

    const modeButton = screen.getByText('解析');
    fireEvent.click(modeButton);

    expect(screen.getByText('纯享')).not.toBeNull();
  });

  it('should trigger onSpeakText with pure phonetic Kana reading text (Plan A)', () => {
    const handleSpeak = vi.fn();
    render(
      <PostCard
        post={mockPost}
        userState={mockUserState}
        onTokenClick={vi.fn()}
        onSpeakText={handleSpeak}
      />
    );

    const speakerButton = screen.getByTitle('朗读推文');
    fireEvent.click(speakerButton);

    expect(handleSpeak).toHaveBeenCalledWith('あさのコーヒー。');
  });
});

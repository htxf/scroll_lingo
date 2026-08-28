import { useState } from 'react';
import { Post, Token, UserKnowledgeState } from '../../types';
import { PersonaHeader } from './PersonaHeader';
import { ActionButtons } from './ActionButtons';
import { RubyTokenText } from '../reader/RubyTokenText';
import { getPostPhoneticText } from '../../utils/rubyParser';

interface PostCardProps {
  post: Post;
  userState: UserKnowledgeState;
  onTokenClick: (token: Token) => void;
  onSpeakText: (text: string) => void;
  onStopText?: () => void;
  isPlayingAudio?: boolean;
  onBookmarkPost?: (post: Post) => void;
}

export function PostCard({
  post,
  userState,
  onTokenClick,
  onSpeakText,
  onStopText,
  isPlayingAudio = false,
  onBookmarkPost,
}: PostCardProps) {
  // Default to pure native Twitter mode (clean, no clutter)
  const [isStudyMode, setIsStudyMode] = useState(false);

  const handleAudioToggle = () => {
    if (isPlayingAudio && onStopText) {
      onStopText();
    } else {
      // Plan A: Speak using pure Kana reading transliteration, completely eliminating Chinese character mispronunciation
      const phoneticText = getPostPhoneticText(post);
      onSpeakText(phoneticText);
    }
  };

  return (
    <article
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header Block: Persona Identity & Level/Topic Badge */}
      <PersonaHeader persona={post.persona} createdAt={post.createdAt} level={post.level} />

      {/* Media Block: Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post media"
          style={{
            width: '100%',
            maxHeight: '220px',
            objectFit: 'cover',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--border-color)',
          }}
        />
      )}

      {/* Primary Japanese Content: Native Plain Text by default vs Inline Study Mode */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '2px 0',
        }}
      >
        <div style={{ flex: 1, fontSize: '16px', fontFamily: 'var(--font-japanese)' }}>
          {isStudyMode ? (
            <RubyTokenText tokens={post.tokens} userState={userState} onTokenClick={onTokenClick} isStudyMode={isStudyMode} />
          ) : (
            <span style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>{post.contentJa}</span>
          )}
        </div>

        {/* Speaker Play/Pause Button (🔊 when stopped, ⏸ when playing) */}
        <button
          onClick={handleAudioToggle}
          style={{
            background: isPlayingAudio ? 'var(--accent-secondary)' : 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            color: isPlayingAudio ? '#ffffff' : 'var(--text-secondary)',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          title={isPlayingAudio ? '暂停朗读' : '朗读推文'}
        >
          {isPlayingAudio ? '⏸' : '🔊'}
        </button>
      </div>

      {/* Chinese Translation */}
      {isStudyMode && (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginTop: '2px',
            lineHeight: '1.5',
          }}
        >
          {post.translationZh}
        </div>
      )}

      {/* Footer Actions: Single Bookmark Button on Left, Mode Switch on Right */}
      <ActionButtons
        isStudyMode={isStudyMode}
        onToggleStudyMode={() => setIsStudyMode((prev) => !prev)}
        onBookmarkPost={() => onBookmarkPost?.(post)}
      />
    </article>
  );
}

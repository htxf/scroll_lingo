import { useState } from 'react';
import { Post, Token, Persona, UserKnowledgeState } from '../../types';
import { PersonaHeader } from './PersonaHeader';
import { ActionButtons } from './ActionButtons';
import { RubyTokenText } from '../reader/RubyTokenText';

interface PostCardProps {
  post: Post;
  userState: UserKnowledgeState;
  onTokenClick: (token: Token) => void;
  onSpeakPost: (post: Post) => void;
  onStopText?: () => void;
  isPlayingAudio?: boolean;
  onBookmarkPost?: (post: Post) => void;
  selectedTokenId?: string | null;
  onPersonaClick?: (persona: Persona) => void;
}

export function PostCard({
  post,
  userState,
  onTokenClick,
  onSpeakPost,
  onStopText,
  isPlayingAudio = false,
  onBookmarkPost,
  selectedTokenId,
  onPersonaClick,
}: PostCardProps) {
  // Default to pure native Twitter mode (clean, no clutter)
  const [isStudyMode, setIsStudyMode] = useState(false);

  const handleAudioToggle = () => {
    if (isPlayingAudio && onStopText) {
      onStopText();
    } else {
      onSpeakPost(post);
    }
  };

  return (
    <article
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header Block: Persona Identity & Native Topic Badge */}
      <PersonaHeader
        persona={post.persona}
        createdAt={post.createdAt}
        level={post.level}
        sourcePlatform={post.sourceContext?.sourcePlatform}
        onPersonaClick={onPersonaClick}
      />

      {/* Subtle Hot Topic Context Anchor (Gives N0 beginners immediate real-world meaning) */}
      {post.sourceContext && (
        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            padding: '4px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>热点:</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.sourceContext.originTitle}</span>
        </div>
      )}

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

      {/* Primary Japanese Content */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
          padding: '2px 0',
        }}
      >
        <div style={{ flex: 1, fontSize: '16px', fontFamily: 'var(--font-japanese)' }}>
          {isStudyMode ? (
            <RubyTokenText
              tokens={post.tokens}
              userState={userState}
              onTokenClick={onTokenClick}
              isStudyMode={isStudyMode}
              selectedTokenId={selectedTokenId}
            />
          ) : (
            <span style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>{post.contentJa}</span>
          )}
        </div>

        {/* Speaker Play/Pause Button */}
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
            transition: 'background-color 0.15s ease, color 0.15s ease',
          }}
          title={isPlayingAudio ? '暂停朗读' : '朗读推文'}
        >
          {isPlayingAudio ? '⏸' : '🔊'}
        </button>
      </div>

      {/* Clean Chinese Translation without harsh colored left border */}
      {isStudyMode && (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '8px',
          }}
        >
          {post.translationZh}
        </div>
      )}

      {/* Footer Actions */}
      <ActionButtons
        isStudyMode={isStudyMode}
        onToggleStudyMode={() => setIsStudyMode((prev) => !prev)}
        onBookmarkPost={() => onBookmarkPost?.(post)}
      />
    </article>
  );
}

import { useState, useRef } from 'react';
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
  onMarkMastered?: (post: Post) => void;
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
  onMarkMastered,
  selectedTokenId,
  onPersonaClick,
}: PostCardProps) {
  // Default to pure native Twitter mode (clean, no clutter)
  const [isStudyMode, setIsStudyMode] = useState(false);

  // Swipe Gesture Engine (Left -> Bookmark, Right -> Master)
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    if (!touch) return;
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // Detect gesture direction on first significant movement
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isHorizontalSwipe.current = true;
      } else if (Math.abs(deltaY) > 10) {
        isHorizontalSwipe.current = false;
      }
    }

    if (isHorizontalSwipe.current) {
      // Apply elastic damping
      const damping = 0.45;
      const clampedOffset = Math.max(-90, Math.min(90, deltaX * damping));
      setDragOffset(clampedOffset);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current) {
      if (dragOffset <= -45) {
        // Swiped Left -> Bookmark
        onBookmarkPost?.(post);
      } else if (dragOffset >= 45) {
        // Swiped Right -> Master
        onMarkMastered?.(post);
      }
    }
    setIsDragging(false);
    setDragOffset(0);
    isHorizontalSwipe.current = null;
  };

  const handleAudioToggle = () => {
    if (isPlayingAudio && onStopText) {
      onStopText();
    } else {
      onSpeakPost(post);
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--border-radius-md)' }}>
      {/* Background Gesture Action Cue */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor:
            dragOffset < -10
              ? 'rgba(244, 33, 46, 0.2)' // Left Swipe -> Red Bookmark
              : dragOffset > 10
              ? 'rgba(0, 186, 124, 0.2)' // Right Swipe -> Green Master
              : 'transparent',
          display: 'flex',
          justifyContent: dragOffset < 0 ? 'flex-end' : 'flex-start',
          alignItems: 'center',
          padding: '0 24px',
          borderRadius: 'var(--border-radius-md)',
          transition: isDragging ? 'none' : 'background-color 0.2s ease',
        }}
      >
        {dragOffset < -20 && (
          <span style={{ fontSize: '20px', color: 'var(--accent-danger)', fontWeight: 700 }}>
            ❤️ 收藏
          </span>
        )}
        {dragOffset > 20 && (
          <span style={{ fontSize: '20px', color: 'var(--accent-secondary)', fontWeight: 700 }}>
            ✓ 掌握
          </span>
        )}
      </div>

      {/* Main Card Surface */}
      <article
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          boxShadow: 'var(--shadow-sm)',
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s var(--ease-spring)',
          willChange: 'transform',
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
  </div>
  );
}

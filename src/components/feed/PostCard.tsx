import { useState } from 'react';
import { Post, Token, UserKnowledgeState } from '../../types';
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
}

export function PostCard({
  post,
  userState,
  onTokenClick,
  onSpeakPost,
  onStopText,
  isPlayingAudio = false,
  onBookmarkPost,
}: PostCardProps) {
  // Default to pure native Twitter mode (clean, no clutter)
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isContextExpanded, setIsContextExpanded] = useState(false);

  const handleAudioToggle = () => {
    if (isPlayingAudio && onStopText) {
      onStopText();
    } else {
      onSpeakPost(post);
    }
  };

  const getPlatformLabel = (platform?: string) => {
    switch (platform) {
      case 'weibo': return '🔥 微博热搜';
      case 'sspai': return '⚡️ 少数派';
      case 'zhihu': return '💡 知乎热榜';
      case 'hupu': return '🏀 虎扑热帖';
      case 'bili': return '📺 B站热门';
      case 'reddit': return '🌐 Reddit';
      default: return '📰 实时热点';
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

      {/* Lego Blocks for N0/N5 micro structures */}
      {isStudyMode && post.legoBlocks && post.legoBlocks.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
          {post.legoBlocks.map((block, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderLeft: `3px solid ${block.color}`,
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{block.text}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>({block.labelZh})</span>
            </div>
          ))}
        </div>
      )}

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

      {/* Dual-Layer Hot Topic Origin & Cultural Context Expander */}
      {post.sourceContext && (
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px dashed var(--border-color)',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setIsContextExpanded((prev) => !prev)}
            style={{
              width: '100%',
              padding: '8px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{getPlatformLabel(post.sourceContext.sourcePlatform)}</span>
              <span style={{ color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {post.sourceContext.originTitle}
              </span>
            </span>
            <span>{isContextExpanded ? '收起 ▴' : '热点原文 ▾'}</span>
          </button>

          {isContextExpanded && (
            <div
              style={{
                padding: '8px 12px 10px 12px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                lineHeight: '1.5',
              }}
            >
              {post.sourceContext.originSnippet && (
                <div style={{ color: 'var(--text-primary)' }}>
                  {post.sourceContext.originSnippet}
                </div>
              )}

              {post.sourceContext.culturalNoteZh && (
                <div style={{ fontSize: '11px', color: 'var(--accent-secondary)' }}>
                  💡 语境解析：{post.sourceContext.culturalNoteZh}
                </div>
              )}

              {post.sourceContext.originUrl && (
                <a
                  href={post.sourceContext.originUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '11px',
                    color: 'var(--accent-primary)',
                    textDecoration: 'none',
                    alignSelf: 'flex-start',
                  }}
                >
                  查看热点出处 ↗
                </a>
              )}
            </div>
          )}
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

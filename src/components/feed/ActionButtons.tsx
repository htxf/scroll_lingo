import { useState } from 'react';

interface ActionButtonsProps {
  isStudyMode: boolean;
  onToggleStudyMode: () => void;
  onBookmarkPost: () => void;
}

export function ActionButtons({
  isStudyMode,
  onToggleStudyMode,
  onBookmarkPost,
}: ActionButtonsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkToggle = () => {
    setIsBookmarked((prev) => !prev);
    onBookmarkPost();
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '8px',
        marginTop: '4px',
      }}
    >
      {/* Left Action: Single Pure Bookmark / Unbookmark Toggle */}
      <button
        onClick={handleBookmarkToggle}
        style={{
          background: 'none',
          border: 'none',
          color: isBookmarked ? 'var(--accent-danger)' : 'var(--text-secondary)',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          padding: '2px 4px',
          transition: 'all 0.15s ease',
          fontWeight: isBookmarked ? 500 : 'normal',
        }}
        title={isBookmarked ? '取消收藏' : '收藏本帖及生词'}
      >
        <span style={{ fontSize: '14px' }}>{isBookmarked ? '❤️' : '🤍'}</span>
        <span>{isBookmarked ? '已收藏' : '收藏'}</span>
      </button>

      {/* Right Tool Control: Clean Mode Toggle */}
      <button
        onClick={onToggleStudyMode}
        style={{
          padding: '4px 12px',
          borderRadius: 'var(--border-radius-full)',
          border: isStudyMode ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
          backgroundColor: isStudyMode ? 'rgba(29, 155, 240, 0.15)' : 'var(--bg-tertiary)',
          color: isStudyMode ? 'var(--accent-primary)' : 'var(--text-secondary)',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
        title="切换推文纯净阅读 / 拆词学习模式"
      >
        <span>{isStudyMode ? '📖 纯享' : '👓 拆词'}</span>
      </button>
    </div>
  );
}

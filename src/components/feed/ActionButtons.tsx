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

      {/* Right Tool Control: Clean Mode Toggle (解析 vs 纯享) */}
      <button
        onClick={onToggleStudyMode}
        style={{
          padding: '3px 10px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          backgroundColor: isStudyMode ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
          color: isStudyMode ? '#ffffff' : 'var(--text-secondary)',
          fontSize: '11px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="切换推文纯享模式 / 深度解析模式"
      >
        {isStudyMode ? '纯享' : '解析'}
      </button>
    </div>
  );
}

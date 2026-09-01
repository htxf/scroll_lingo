import { SavedWordEntity } from '../../db/database';
import { useSpeech } from '../../hooks/useSpeech';

interface BookmarksTabProps {
  savedWords: SavedWordEntity[];
  onRemoveWord: (id: string) => void;
  onMarkKnown: (lemma: string) => void;
}

export function BookmarksTab({ savedWords, onRemoveWord, onMarkKnown }: BookmarksTabProps) {
  const { speak, playingId } = useSpeech();

  if (savedWords.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--border-color)',
          marginTop: 'var(--space-2)',
        }}
      >
        <span style={{ fontSize: '32px' }}>🔖</span>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
          生词书签库为空
        </div>
        <p style={{ fontSize: '12px', maxWidth: '280px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          在推文或词卡中收藏生词，将在此集中温故复习。
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          生词本 ({savedWords.length})
        </h2>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          In-Feed SRS 智能复现
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {savedWords.map((word) => {
          const isPlaying = playingId === `saved_${word.id}`;
          return (
            <div
              key={word.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 'var(--space-3)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Left Content Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-japanese)', color: 'var(--text-primary)' }}>
                    {word.surface}
                  </span>
                  {word.reading && word.reading !== word.surface && (
                    <span style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {word.reading}
                    </span>
                  )}
                  <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: 'var(--border-radius-xs)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {word.level}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {word.definitionZh}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => speak(word.surface, `saved_${word.id}`)}
                  style={{
                    background: isPlaying ? 'var(--accent-secondary)' : 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: isPlaying ? '#ffffff' : 'var(--text-secondary)',
                  }}
                  title="发音"
                >
                  🔊
                </button>

                <button
                  onClick={() => onMarkKnown(word.lemma)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--border-radius-full)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--accent-secondary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  title="掌握并移入已掌握库"
                >
                  ✓ 掌握
                </button>

                <button
                  onClick={() => onRemoveWord(word.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title="移出生词本"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

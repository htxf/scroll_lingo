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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {savedWords.map((word) => {
          const isPlaying = playingId === `saved_${word.id}`;
          return (
            <div
              key={word.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-japanese)', color: 'var(--text-primary)' }}>
                    {word.surface}
                  </span>
                  {word.reading && word.reading !== word.surface && (
                    <span style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {word.reading}
                    </span>
                  )}
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--border-radius-xs)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {word.level}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <button
                    onClick={() => speak(word.surface, `saved_${word.id}`)}
                    style={{
                      background: isPlaying ? 'var(--accent-secondary)' : 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: isPlaying ? '#ffffff' : 'var(--text-secondary)',
                    }}
                    title="朗读发音"
                  >
                    🔊
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
                    title="删除"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: '1.4' }}>
                {word.definitionZh}
              </div>

              {word.contextSentence && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-japanese)', marginTop: '2px', lineHeight: '1.4' }}>
                  语境: 「{word.contextSentence}」
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-1)' }}>
                <button
                  onClick={() => onMarkKnown(word.lemma)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--border-radius-full)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--accent-secondary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ✓ 标为已掌握
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { SavedWordEntity } from '../../db/database';

interface BookmarksTabProps {
  savedWords: SavedWordEntity[];
  onRemoveWord: (id: string) => void;
  onMarkKnown: (lemma: string) => void;
}

export function BookmarksTab({ savedWords, onRemoveWord, onMarkKnown }: BookmarksTabProps) {
  if (savedWords.length === 0) {
    return (
      <div
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
          生词书签库为空
        </div>
        <p style={{ fontSize: '12px', maxWidth: '280px', lineHeight: '1.5' }}>
          在推文或词卡中点击「收藏」或「设为重点关注」，生词将在此集中复习。
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          生词书签库 ({savedWords.length})
        </h2>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          In-Feed SRS 重现中
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {savedWords.map((word) => (
          <div
            key={word.id}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-japanese)', color: 'var(--text-primary)' }}>
                  {word.surface}
                </span>
                {word.reading && word.reading !== word.surface && (
                  <span style={{ fontSize: '13px', color: 'var(--accent-primary)' }}>
                    【{word.reading}】
                  </span>
                )}
                <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                  {word.level}
                </span>
              </div>

              <button
                onClick={() => onRemoveWord(word.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}
                title="删除书签"
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
              {word.definitionZh}
            </div>

            {word.contextSentence && (
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-japanese)', marginTop: '2px' }}>
                语境: 「{word.contextSentence}」
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                onClick={() => onMarkKnown(word.lemma)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--accent-secondary)',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                标为已掌握
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

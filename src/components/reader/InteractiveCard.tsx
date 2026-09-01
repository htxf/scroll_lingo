import { useEffect } from 'react';
import { Token, UserKnowledgeState, PitchAccent } from '../../types';
import { useSpeech } from '../../hooks/useSpeech';
import { PitchAccentView } from './PitchAccentView';

interface InteractiveCardProps {
  token: Token | null;
  userState: UserKnowledgeState;
  onClose: () => void;
  onToggleKnown: (lemma: string) => void;
  onToggleFocus: (lemma: string) => void;
}

export function InteractiveCard({
  token,
  userState,
  onClose,
  onToggleKnown,
  onToggleFocus,
}: InteractiveCardProps) {
  const { speak, stop, playingId } = useSpeech();
  const isPlaying = Boolean(playingId);

  // Stop audio immediately when token changes or modal unmounts
  useEffect(() => {
    return () => {
      stop();
    };
  }, [token?.id, stop]);

  if (!token) return null;

  const isKnown = userState.explicitKnownWords.has(token.lemma) || userState.explicitKnownWords.has(token.surface);
  const isFocus = userState.explicitFocusWords.has(token.lemma) || userState.explicitFocusWords.has(token.surface);

  const isKanaToken = token.level === 'N0' || token.surface.length <= 2;
  const hasLemmaForm = Boolean(token.lemma && token.lemma !== token.surface);

  const handleSpeechToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(token.surface, `card_${token.id}`);
    }
  };

  const handleCardClose = () => {
    stop();
    onClose();
  };

  // Fallback pitch accent if pitchAccent object is not explicitly attached
  const activePitchAccent: PitchAccent = token.pitchAccent || {
    pattern: token.surface.length <= 2 ? 'atamadaka' : 'heiban',
    pitchNotation: token.surface.length <= 2 ? '1' : '0',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'var(--glass-blur)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3000,
        padding: 'var(--space-4)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
      onClick={handleCardClose}
    >
      <div
        className="animate-modal"
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '88vh',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          boxShadow: 'var(--shadow-md)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          userSelect: 'text',
          margin: 'auto 0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Type, Level and Clear Close '✕' Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 700 }}>
              {isKanaToken ? '假名卡' : '词汇解析'}
            </span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--border-radius-full)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--accent-primary)',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {token.level === 'N0' ? 'N0 萌芽' : `JLPT ${token.level}`}
            </span>
          </div>

          <button
            onClick={handleCardClose}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            title="关闭卡片"
          >
            ✕
          </button>
        </div>

        {/* Word Display Block */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-primary)',
            padding: '14px 16px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span
                style={{
                  fontSize: isKanaToken ? '34px' : '26px',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-japanese)',
                  color: 'var(--text-primary)',
                }}
              >
                {token.surface}
              </span>
              {token.reading && token.reading !== token.surface && (
                <span style={{ fontSize: '15px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                  {token.reading}
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{token.romaji}</div>
          </div>

          {/* Speaker Audio Play/Pause Button */}
          <button
            onClick={handleSpeechToggle}
            title={isPlaying ? '暂停发音' : '朗读发音'}
            style={{
              background: isPlaying ? 'var(--accent-secondary)' : 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            {isPlaying ? '⏸' : '🔊'}
          </button>
        </div>

        {/* Pitch Accent Diagram View */}
        {token.reading && (
          <PitchAccentView reading={token.reading} pitchAccent={activePitchAccent} />
        )}

        {/* Definition */}
        <div style={{ background: 'var(--bg-tertiary)', padding: '12px 14px', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: '1.4' }}>
            {token.definitionZh || '暂无释义'}
          </div>
        </div>

        {/* Action Toggles: 已掌握 / 已关注 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
          <button
            onClick={() => onToggleKnown(token.lemma)}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--border-radius-sm)',
              border: isKnown ? '1px solid var(--accent-secondary)' : '1px solid var(--border-color)',
              backgroundColor: isKnown ? 'var(--accent-secondary)' : 'var(--bg-tertiary)',
              color: isKnown ? '#ffffff' : 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
              minHeight: '44px',
            }}
          >
            {isKnown ? '✓ 已掌握' : '标为掌握'}
          </button>

          <button
            onClick={() => onToggleFocus(token.lemma)}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--border-radius-sm)',
              border: isFocus ? '1px solid var(--accent-warning)' : '1px solid var(--border-color)',
              backgroundColor: isFocus ? 'var(--accent-warning)' : 'var(--bg-tertiary)',
              color: isFocus ? '#000000' : 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
              minHeight: '44px',
            }}
          >
            {isFocus ? '★ 已关注' : '关注此词'}
          </button>
        </div>

        {/* Concise Grammar Lemma Hint (Only if inflected form exists) */}
        {hasLemmaForm && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                padding: '8px 12px',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}
            >
              词汇原形：<strong style={{ color: 'var(--text-primary)' }}>{token.lemma}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

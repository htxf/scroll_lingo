import { useState } from 'react';
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
  const [aiBreakdown, setAiBreakdown] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { speak, stop, playingId } = useSpeech();
  const isPlaying = Boolean(playingId);

  if (!token) return null;

  const isKnown = userState.explicitKnownWords.has(token.lemma) || userState.explicitKnownWords.has(token.surface);
  const isFocus = userState.explicitFocusWords.has(token.lemma) || userState.explicitFocusWords.has(token.surface);

  const isKanaToken = token.level === 'N0' || token.surface.length <= 2;

  const simplifyPos = (pos: string) => {
    if (pos.includes('动词')) return '动作';
    if (pos.includes('名词')) return '名词';
    if (pos.includes('形容词') || pos.includes('描述')) return '描述';
    if (pos.includes('感叹')) return '感叹';
    if (pos.includes('代词')) return '代词';
    if (pos.includes('助词')) return '助词';
    return pos;
  };

  const handleAiDeepDive = () => {
    setIsAiLoading(true);
    setAiBreakdown(null);

    setTimeout(() => {
      setAiBreakdown(
        `【句式解构】\n` +
        `• 含义：${token.definitionZh}\n` +
        `• 语境：高频社交表达，无需记忆复杂变形。`
      );
      setIsAiLoading(false);
    }, 400);
  };

  const handleSpeechToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(token.surface, token.id);
    }
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'var(--glass-blur)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '88vh',
          backgroundColor: 'var(--bg-secondary)',
          borderTopLeftRadius: 'var(--border-radius-lg)',
          borderTopRightRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '20px 20px 36px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-md)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Type, Level and Clear Close '✕' Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {isKanaToken ? '假名卡' : '词汇卡'} · {simplifyPos(token.pos)}
            </span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--border-radius-full)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--accent-primary)',
                fontSize: '11px',
                fontWeight: 'bold',
              }}
            >
              {token.level === 'N0' ? 'N0' : token.level}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
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
            padding: '16px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span
                style={{
                  fontSize: isKanaToken ? '36px' : '26px',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-japanese)',
                  color: 'var(--text-primary)',
                }}
              >
                {token.surface}
              </span>
              {token.reading && token.reading !== token.surface && (
                <span style={{ fontSize: '16px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
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
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'all 0.15s ease',
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
        <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>
            {token.definitionZh || '暂无释义'}
          </div>
        </div>

        {/* Action Toggles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={() => onToggleKnown(token.lemma)}
            style={{
              padding: '10px',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              backgroundColor: isKnown ? 'var(--accent-secondary)' : 'var(--bg-tertiary)',
              color: isKnown ? '#ffffff' : 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isKnown ? '已掌握' : '标为掌握'}
          </button>

          <button
            onClick={() => onToggleFocus(token.lemma)}
            style={{
              padding: '10px',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              backgroundColor: isFocus ? 'var(--accent-warning)' : 'var(--bg-tertiary)',
              color: isFocus ? '#000000' : 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isFocus ? '已关注' : '关注此词'}
          </button>
        </div>

        {/* AI Deep Breakdown Section */}
        <div style={{ marginTop: '2px' }}>
          {!aiBreakdown && !isAiLoading && (
            <button
              onClick={handleAiDeepDive}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              AI 语法解构
            </button>
          )}

          {isAiLoading && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '6px' }}>
              正在解析...
            </div>
          )}

          {aiBreakdown && (
            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '10px 12px',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
                color: 'var(--text-primary)',
              }}
            >
              {aiBreakdown}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Token, UserKnowledgeState } from '../../types';
import { shouldShowFurigana } from '../../utils/rubyParser';

interface RubyTokenTextProps {
  tokens: Token[];
  userState: UserKnowledgeState;
  onTokenClick?: (token: Token) => void;
  isStudyMode?: boolean;
}

export function RubyTokenText({ tokens, userState, onTokenClick, isStudyMode = true }: RubyTokenTextProps) {
  // Helper to test if a token surface is pure punctuation or emoji
  const isPunctuationOrEmoji = (token: Token) => {
    if (token.pos === '标点') return true;
    const cleanSurface = token.surface.trim();
    // Match common punctuation and emoji symbols
    return /^[\p{P}\p{S}\s！。、？「」『』✨☕️🍣🎉💪🔥⚽️]+$/u.test(cleanSurface);
  };

  // Color coding by layman POS category for Lego blocks
  const getPosColor = (pos: string) => {
    if (pos.includes('动词') || pos.includes('动作')) return { bg: 'rgba(244, 33, 46, 0.1)', border: '#f4212e', text: '#f4212e', label: '动作' };
    if (pos.includes('名词') || pos.includes('物品')) return { bg: 'rgba(0, 186, 124, 0.1)', border: '#00ba7c', text: '#00ba7c', label: '名词' };
    if (pos.includes('形容') || pos.includes('描述')) return { bg: 'rgba(255, 212, 0, 0.12)', border: '#ffd400', text: '#d9a400', label: '描述' };
    if (pos.includes('感叹') || pos.includes('代词')) return { bg: 'rgba(29, 155, 240, 0.1)', border: '#1d9bf0', text: '#1d9bf0', label: '感叹' };
    return { bg: 'rgba(255, 255, 255, 0.05)', border: 'var(--border-color)', text: 'var(--text-secondary)', label: pos };
  };

  return (
    <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: isStudyMode ? '6px 4px' : '0', alignItems: 'baseline', lineHeight: isStudyMode ? '1.8' : '2.2' }}>
      {tokens.map((token) => {
        const isPunctuation = isPunctuationOrEmoji(token);
        const isInteractive = !isPunctuation && Boolean(token.definitionZh || token.reading);
        const showFurigana = shouldShowFurigana(token, userState);
        const colorInfo = getPosColor(token.pos);

        const handleClick = (e: React.MouseEvent) => {
          if (isInteractive && onTokenClick) {
            e.stopPropagation();
            onTokenClick(token);
          }
        };

        // If not in study mode OR if it's punctuation/emoji, render plain clean inline text
        if (!isStudyMode || isPunctuation) {
          return (
            <span
              key={token.id}
              onClick={handleClick}
              style={{
                cursor: isInteractive ? 'pointer' : 'default',
                color: 'var(--text-primary)',
                padding: '0 1px',
              }}
            >
              {token.surface}
            </span>
          );
        }

        // In Study Mode (Only for real vocabulary tokens): Render as Inline Lego Block Pill
        return (
          <div
            key={token.id}
            onClick={handleClick}
            style={{
              cursor: isInteractive ? 'pointer' : 'default',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: colorInfo.bg,
              borderLeft: `3px solid ${colorInfo.border}`,
              borderTop: '1px solid var(--border-color)',
              borderRight: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)',
              padding: '2px 6px',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              margin: '2px 0',
            }}
            title={isInteractive ? `👆 点击解构发音与释义: ${token.surface} (${token.reading})` : undefined}
          >
            {/* Japanese Text with Optional Furigana */}
            {showFurigana ? (
              <ruby style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)', fontWeight: 'bold', fontSize: '16px' }}>
                {token.surface}
                <rt style={{ color: 'var(--accent-primary)', fontSize: '0.65em', fontWeight: 'bold' }}>
                  {token.reading}
                </rt>
              </ruby>
            ) : (
              <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)', fontWeight: 'bold', fontSize: '16px' }}>
                {token.surface}
              </span>
            )}

            {/* Tiny Syntax Label under the token block */}
            {token.pos && (
              <span style={{ fontSize: '9px', color: colorInfo.text, fontWeight: 'bold', marginTop: '1px' }}>
                {colorInfo.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

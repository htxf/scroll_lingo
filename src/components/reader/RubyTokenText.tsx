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

  return (
    <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: isStudyMode ? '6px 4px' : '0', alignItems: 'baseline', lineHeight: isStudyMode ? '1.8' : '2.2' }}>
      {tokens.map((token) => {
        const isPunctuation = isPunctuationOrEmoji(token);
        const isInteractive = !isPunctuation && Boolean(token.definitionZh || token.reading);
        const showFurigana = shouldShowFurigana(token, userState);

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

        // In Study Mode (Only for real vocabulary tokens): Render as Clean Modern Pill
        return (
          <span
            key={token.id}
            onClick={handleClick}
            style={{
              cursor: isInteractive ? 'pointer' : 'default',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              padding: '2px 7px',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              margin: '1px 2px',
              verticalAlign: 'middle',
            }}
            title={isInteractive ? `点击解构发音与释义: ${token.surface}` : undefined}
          >
            {/* Japanese Text with Optional Furigana */}
            {showFurigana ? (
              <ruby style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)', fontWeight: 600, fontSize: '15px', lineHeight: '1.2' }}>
                {token.surface}
                <rt style={{ color: 'var(--accent-primary)', fontSize: '0.62em', fontWeight: 600, paddingBottom: '1px' }}>
                  {token.reading}
                </rt>
              </ruby>
            ) : (
              <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-japanese)', fontWeight: 600, fontSize: '15px', lineHeight: '1.2' }}>
                {token.surface}
              </span>
            )}

            {/* Tiny POS hint */}
            {token.pos && (
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px', lineHeight: '1' }}>
                {token.pos.replace('词', '')}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

import { Token, UserKnowledgeState } from '../../types';
import { shouldShowFurigana } from '../../utils/rubyParser';

interface RubyTokenTextProps {
  tokens: Token[];
  userState: UserKnowledgeState;
  onTokenClick?: (token: Token) => void;
  isStudyMode?: boolean;
  selectedTokenId?: string | null;
}

export function RubyTokenText({ tokens, userState, onTokenClick, isStudyMode = true, selectedTokenId }: RubyTokenTextProps) {
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
        const isSelected = selectedTokenId === token.id;

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
              backgroundColor: isSelected ? 'rgba(29, 155, 240, 0.22)' : 'var(--bg-tertiary)',
              border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              boxShadow: isSelected ? '0 0 10px rgba(29, 155, 240, 0.3)' : 'none',
              padding: '3px 8px',
              borderRadius: '6px',
              transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
              margin: '2px 3px',
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
          </span>
        );
      })}
    </div>
  );
}

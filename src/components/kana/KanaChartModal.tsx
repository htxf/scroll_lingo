import { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';

interface KanaChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KanaItem {
  hira: string;
  kata: string;
  romaji: string;
}

export function KanaChartModal({ isOpen, onClose }: KanaChartModalProps) {
  const { speak, playingId } = useSpeech();
  const [activeKana, setActiveKana] = useState<string | null>(null);

  if (!isOpen) return null;

  const kanaRows: { rowName: string; items: (KanaItem | null)[] }[] = [
    {
      rowName: '清音 A行',
      items: [
        { hira: 'あ', kata: 'ア', romaji: 'a' },
        { hira: 'い', kata: 'イ', romaji: 'i' },
        { hira: 'う', kata: 'ウ', romaji: 'u' },
        { hira: 'え', kata: 'エ', romaji: 'e' },
        { hira: 'お', kata: 'オ', romaji: 'o' },
      ],
    },
    {
      rowName: 'K行',
      items: [
        { hira: 'か', kata: 'カ', romaji: 'ka' },
        { hira: 'き', kata: 'キ', romaji: 'ki' },
        { hira: 'く', kata: 'ク', romaji: 'ku' },
        { hira: 'け', kata: 'ケ', romaji: 'ke' },
        { hira: 'こ', kata: 'コ', romaji: 'ko' },
      ],
    },
    {
      rowName: 'S行',
      items: [
        { hira: 'さ', kata: 'サ', romaji: 'sa' },
        { hira: 'し', kata: 'シ', romaji: 'shi' },
        { hira: 'す', kata: 'ス', romaji: 'su' },
        { hira: 'せ', kata: 'セ', romaji: 'se' },
        { hira: 'そ', kata: 'ソ', romaji: 'so' },
      ],
    },
    {
      rowName: 'T行',
      items: [
        { hira: 'た', kata: 'タ', romaji: 'ta' },
        { hira: 'ち', kata: 'チ', romaji: 'chi' },
        { hira: 'つ', kata: 'ツ', romaji: 'tsu' },
        { hira: 'て', kata: 'テ', romaji: 'te' },
        { hira: 'と', kata: 'ト', romaji: 'to' },
      ],
    },
    {
      rowName: 'N行',
      items: [
        { hira: 'な', kata: 'ナ', romaji: 'na' },
        { hira: 'に', kata: 'ニ', romaji: 'ni' },
        { hira: 'ぬ', kata: 'ヌ', romaji: 'nu' },
        { hira: 'ね', kata: 'ネ', romaji: 'ne' },
        { hira: 'の', kata: 'ノ', romaji: 'no' },
      ],
    },
    {
      rowName: 'H行',
      items: [
        { hira: 'は', kata: 'ハ', romaji: 'ha' },
        { hira: 'ひ', kata: 'ヒ', romaji: 'hi' },
        { hira: 'ふ', kata: 'フ', romaji: 'fu' },
        { hira: 'へ', kata: 'ヘ', romaji: 'he' },
        { hira: 'ほ', kata: 'ホ', romaji: 'ho' },
      ],
    },
    {
      rowName: 'M行',
      items: [
        { hira: 'ま', kata: 'マ', romaji: 'ma' },
        { hira: 'み', kata: 'ミ', romaji: 'mi' },
        { hira: 'む', kata: 'ム', romaji: 'mu' },
        { hira: 'め', kata: 'メ', romaji: 'me' },
        { hira: 'も', kata: 'モ', romaji: 'mo' },
      ],
    },
    {
      rowName: 'Y行',
      items: [
        { hira: 'や', kata: 'ヤ', romaji: 'ya' },
        null,
        { hira: 'ゆ', kata: 'ユ', romaji: 'yu' },
        null,
        { hira: 'よ', kata: 'ヨ', romaji: 'yo' },
      ],
    },
    {
      rowName: 'R行',
      items: [
        { hira: 'ら', kata: 'ラ', romaji: 'ra' },
        { hira: 'り', kata: 'リ', romaji: 'ri' },
        { hira: 'る', kata: 'ル', romaji: 'ru' },
        { hira: 'れ', kata: 'レ', romaji: 're' },
        { hira: 'ろ', kata: 'ロ', romaji: 'ro' },
      ],
    },
    {
      rowName: 'W/N行',
      items: [
        { hira: 'わ', kata: 'ワ', romaji: 'wa' },
        null,
        null,
        null,
        { hira: 'を', kata: 'ヲ', romaji: 'wo' },
      ],
    },
  ];

  const handleKanaClick = (hira: string) => {
    setActiveKana(hira);
    speak(hira, `kana_${hira}`);
    setTimeout(() => {
      setActiveKana((prev) => (prev === hira ? null : prev));
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'var(--glass-blur)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2500,
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        className="animate-modal"
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          boxShadow: 'var(--shadow-md)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              五十音图点读卡
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              点击假名即时发音 (平假名 / 片假名 / 罗马音)
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Kana Matrix Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {kanaRows.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {row.rowName}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {row.items.map((item, cIdx) => {
                  if (!item) {
                    return <div key={cIdx} style={{ height: '52px' }} />;
                  }
                  const isSelected = activeKana === item.hira || playingId === `kana_${item.hira}`;
                  return (
                    <button
                      key={cIdx}
                      onClick={() => handleKanaClick(item.hira)}
                      style={{
                        backgroundColor: isSelected ? 'rgba(29, 155, 240, 0.18)' : 'var(--bg-primary)',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '8px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 0 10px rgba(29, 155, 240, 0.25)' : 'none',
                        transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          fontFamily: 'var(--font-japanese)',
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                          lineHeight: '1.1',
                        }}
                      >
                        {item.hira}{' '}
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 400 }}>
                          {item.kata}
                        </span>
                      </span>
                      <span style={{ fontSize: '10px', color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                        {item.romaji}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

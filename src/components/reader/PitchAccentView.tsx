import { PitchAccent } from '../../types';

interface PitchAccentViewProps {
  reading: string;
  pitchAccent?: PitchAccent;
}

export function PitchAccentView({ reading, pitchAccent }: PitchAccentViewProps) {
  if (!pitchAccent || !reading) return null;

  const patternMap: Record<string, { label: string; color: string }> = {
    heiban: { label: '⓪ 平板型', color: 'var(--accent-secondary)' },
    atamadaka: { label: '① 头高型', color: 'var(--accent-danger)' },
    nakadaka: { label: '② 中高型', color: 'var(--accent-primary)' },
    odaka: { label: '③ 尾高型', color: 'var(--accent-warning)' },
  };

  const info = patternMap[pitchAccent.pattern] || {
    label: `${pitchAccent.pitchNotation} 型`,
    color: 'var(--accent-primary)',
  };

  // Convert reading string into morae characters array
  const morae = Array.from(reading);
  const totalMorae = morae.length;

  // Determine High (1) / Low (0) pitch height array based on pattern
  const pitchHeights: number[] = [];
  const accentIndex = parseInt(pitchAccent.pitchNotation, 10) || 0;

  for (let i = 0; i < totalMorae; i++) {
    const moraPos = i + 1; // 1-indexed position
    if (pitchAccent.pattern === 'atamadaka') {
      pitchHeights.push(moraPos === 1 ? 1 : 0);
    } else if (pitchAccent.pattern === 'heiban') {
      pitchHeights.push(moraPos === 1 ? 0 : 1);
    } else if (pitchAccent.pattern === 'odaka') {
      pitchHeights.push(moraPos === 1 ? 0 : 1);
    } else if (pitchAccent.pattern === 'nakadaka') {
      pitchHeights.push(moraPos > 1 && moraPos <= accentIndex ? 1 : 0);
    } else {
      pitchHeights.push(moraPos === 1 ? 0 : 1);
    }
  }

  const moraWidth = 28;
  const svgWidth = Math.max(totalMorae * moraWidth, 80);
  const highY = 8;
  const lowY = 24;

  const points = pitchHeights.map((h, i) => ({
    x: i * moraWidth + moraWidth / 2,
    y: h === 1 ? highY : lowY,
  }));

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {/* Pattern Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 'var(--border-radius-xs)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: info.color,
            border: `1px solid ${info.color}`,
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          {info.label}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          声调音高曲线
        </span>
      </div>

      {/* Pitch Curve SVG Diagram */}
      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '10px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <svg width={svgWidth} height={40} style={{ overflow: 'visible' }}>
          {/* Reference High/Low Dashed Guidelines */}
          <line x1="0" y1={highY} x2={svgWidth} y2={highY} stroke="var(--border-color)" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="0" y1={lowY} x2={svgWidth} y2={lowY} stroke="var(--border-color)" strokeDasharray="3 3" strokeWidth="1" />

          {/* Pitch connecting line */}
          <path d={pathD} fill="none" stroke={info.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots and Kana labels */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle cx={pt.x} cy={pt.y} r="4" fill={info.color} />
              <circle cx={pt.x} cy={pt.y} r="2" fill="#ffffff" />
              <text
                x={pt.x}
                y={36}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize="12"
                fontWeight="500"
                fontFamily="var(--font-japanese)"
              >
                {morae[idx]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

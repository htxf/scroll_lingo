import { Persona, JLPTLevel } from '../../types';

interface PersonaHeaderProps {
  persona: Persona;
  createdAt: string;
  level?: JLPTLevel;
  onPersonaClick?: (persona: Persona) => void;
}

export function PersonaHeader({ persona, createdAt, onPersonaClick }: PersonaHeaderProps) {
  const categoryBadgeMap: Record<string, string> = {
    coffee: '咖啡',
    tech: '科技',
    sports: '体育',
    gaming: '游戏',
    food: '美食',
    lifestyle: '日常',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        onClick={() => onPersonaClick?.(persona)}
      >
        <img
          src={persona.avatarUrl}
          alt={persona.name}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid var(--border-color)',
          }}
        />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {persona.name}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
            <span>{persona.handle}</span>
            <span>·</span>
            <span>{createdAt}</span>
          </div>
        </div>
      </div>

      {/* Pure Subdued Category Tag */}
      <span
        style={{
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '10px',
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          fontWeight: 400,
        }}
      >
        #{categoryBadgeMap[persona.category] || persona.category}
      </span>
    </div>
  );
}

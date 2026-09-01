import { Persona } from '../../types';

interface PersonaProfileModalProps {
  persona: Persona | null;
  onClose: () => void;
}

export function PersonaProfileModal({ persona, onClose }: PersonaProfileModalProps) {
  if (!persona) return null;

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
        zIndex: 2800,
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        className="animate-modal"
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          boxShadow: 'var(--shadow-md)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Avatar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <img
            src={persona.avatarUrl}
            alt={persona.name}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--border-color)',
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>

        {/* User Identity */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {persona.name}
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {persona.handle}
          </div>
        </div>

        {/* Bio */}
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            padding: '12px 14px',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '13px',
            color: 'var(--text-primary)',
            lineHeight: '1.5',
          }}
        >
          {persona.bioZh || '致力于地道日语言语感习得与实时热点锐评。'}
        </div>

        {/* Category Focus Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>专栏领域:</span>
          <span
            style={{
              fontSize: '12px',
              padding: '3px 10px',
              borderRadius: 'var(--border-radius-full)',
              backgroundColor: 'rgba(29, 155, 240, 0.15)',
              color: 'var(--accent-primary)',
              fontWeight: 600,
            }}
          >
            #{persona.category}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          style={{
            padding: '12px',
            borderRadius: 'var(--border-radius-full)',
            border: 'none',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: '4px',
            minHeight: '44px',
          }}
        >
          关注博主并在 Feed 中优先推送
        </button>
      </div>
    </div>
  );
}

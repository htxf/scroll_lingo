import { useState, useRef } from 'react';
import { Persona } from '../../types';

interface PersonaProfileModalProps {
  persona: Persona | null;
  onClose: () => void;
}

export function PersonaProfileModal({ persona, onClose }: PersonaProfileModalProps) {
  // Drag down to dismiss gesture state
  const [dragY, setDragY] = useState(0);
  const touchStartY = useRef(0);

  if (!persona) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartY.current = touch.clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      const deltaY = touch.clientY - touchStartY.current;
      if (deltaY > 0) {
        setDragY(deltaY * 0.6); // Damped downward pull
      }
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 70) {
      onClose();
    }
    setDragY(0);
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
        zIndex: 2800,
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        className="animate-modal"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: 'var(--space-4) var(--space-5) var(--space-5) var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          boxShadow: 'var(--shadow-md)',
          transform: `translateY(${dragY}px)`,
          transition: dragY === 0 ? 'transform 0.2s var(--ease-spring)' : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS-style Top Drag Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--text-muted)', opacity: 0.6 }} />
        </div>

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

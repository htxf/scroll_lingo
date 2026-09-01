export type NavTab = 'feed' | 'bookmarks' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  savedCount: number;
}

export function BottomNav({ activeTab, onTabChange, savedCount }: BottomNavProps) {
  const navItems: { id: NavTab; label: string; icon: string; badge?: number }[] = [
    { id: 'feed', label: '动态', icon: '🏠' },
    { id: 'bookmarks', label: '书签', icon: '🔖', badge: savedCount },
    { id: 'profile', label: '档案', icon: '👤' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '6px 12px 10px 12px',
        zIndex: 1000,
      }}
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              background: isActive ? 'rgba(29, 155, 240, 0.12)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--border-radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              position: 'relative',
              padding: '6px 20px',
              transition: 'background-color 0.15s ease, color 0.15s ease',
              minWidth: '72px',
              minHeight: '48px',
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: '1' }}>{item.icon}</span>
            <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 500, letterSpacing: '0.2px' }}>
              {item.label}
            </span>

            {item.badge !== undefined && item.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '14px',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  borderRadius: 'var(--border-radius-full)',
                  padding: '1px 5px',
                  lineHeight: '1.2',
                  boxShadow: '0 0 6px rgba(29, 155, 240, 0.4)',
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

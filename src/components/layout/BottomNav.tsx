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
        padding: '8px 0',
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
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              position: 'relative',
              padding: '4px 16px',
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span style={{ fontSize: '11px', fontWeight: isActive ? 'bold' : 'normal' }}>
              {item.label}
            </span>

            {item.badge !== undefined && item.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '12px',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  padding: '1px 5px',
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

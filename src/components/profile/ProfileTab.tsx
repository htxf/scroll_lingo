import { UserKnowledgeState } from '../../types';

interface ProfileTabProps {
  userState: UserKnowledgeState;
  onOpenOnboarding: () => void;
  onOpenAuth: () => void;
}

export function ProfileTab({ userState, onOpenOnboarding, onOpenAuth }: ProfileTabProps) {
  const isCloudSynced = Boolean(userState.userId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Profile Card */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: isCloudSynced ? 'rgba(0, 186, 124, 0.15)' : 'var(--bg-tertiary)',
              border: `1px solid ${isCloudSynced ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
              color: isCloudSynced ? 'var(--accent-secondary)' : 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            {isCloudSynced ? '☁️' : '👤'}
          </div>

          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isCloudSynced ? userState.userId : '游客档案'}
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isCloudSynced ? '已开启云端多端实时同步' : `设备 ID: ${userState.deviceUuid.slice(0, 12)}...`}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: 'var(--space-3)', borderRadius: 'var(--border-radius-sm)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-secondary)' }}>
              {userState.totalWordsMastered}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>掌握词汇</div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: 'var(--space-3)', borderRadius: 'var(--border-radius-sm)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: '1.25' }}>
              {userState.baselineLevel === 'N0' ? 'N0 萌芽' : `JLPT ${userState.baselineLevel}`}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>当前基线</div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: 'var(--space-3)', borderRadius: 'var(--border-radius-sm)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-warning)' }}>
              {userState.explicitFocusWords.size}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>重点生词</div>
          </div>
        </div>
      </div>

      {/* Account Cloud Sync Section */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
          多设备云端同步
        </h3>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {isCloudSynced
            ? '当前账号已关联 Supabase Auth。跨设备词汇掌握度与学习偏好实时同步。'
            : '开启云端同步后，本地掌握生词与推文偏好将自动与云端安全合并。'}
        </p>

        {!isCloudSynced && (
          <button
            onClick={onOpenAuth}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--border-radius-full)',
              border: 'none',
              backgroundColor: 'var(--accent-secondary)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '42px',
            }}
          >
            开启多设备云端同步
          </button>
        )}
      </div>

      {/* Preferences Section */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
          偏好与算法基线
        </h3>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <div>关注领域: <strong style={{ color: 'var(--text-primary)' }}>{userState.interestCategories.join('、')}</strong></div>
          <div>算法判定: <strong style={{ color: 'var(--accent-secondary)' }}>隐性动态调节开启</strong></div>
        </div>

        <button
          onClick={onOpenOnboarding}
          style={{
            padding: '10px',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 'var(--space-1)',
            minHeight: '40px',
          }}
        >
          重新设置兴趣与感官基线
        </button>
      </div>
    </div>
  );
}

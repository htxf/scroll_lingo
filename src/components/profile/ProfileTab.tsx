import { UserKnowledgeState } from '../../types';

interface ProfileTabProps {
  userState: UserKnowledgeState;
  onOpenOnboarding: () => void;
  onOpenAuth: () => void;
}

export function ProfileTab({ userState, onOpenOnboarding, onOpenAuth }: ProfileTabProps) {
  const isCloudSynced = Boolean(userState.userId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Profile Card */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {isCloudSynced ? '云' : '客'}
          </div>

          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {isCloudSynced ? userState.userId : '游客账号'}
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isCloudSynced ? '已开启云端无损同步' : `设备 ID: ${userState.deviceUuid.slice(0, 13)}...`}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '8px' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
              {userState.totalWordsMastered}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>掌握词汇</div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
              {userState.baselineLevel === 'N0' ? 'N0 萌芽' : `JLPT ${userState.baselineLevel}`}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>当前基线</div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-warning)' }}>
              {userState.explicitFocusWords.size}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>重点关注</div>
          </div>
        </div>
      </div>

      {/* Account Cloud Sync Section */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          多设备云端同步
        </h3>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {isCloudSynced
            ? '当前账号已关联 Supabase Auth。跨设备学习进度实时并集同步。'
            : '开启云端同步后，积累的掌握词汇将自动与云端账号并集合并。'}
        </p>

        {!isCloudSynced && (
          <button
            onClick={onOpenAuth}
            style={{
              padding: '10px',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              backgroundColor: 'var(--accent-secondary)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
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
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          学习偏好与重设
        </h3>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>关注领域: <strong>{userState.interestCategories.join(', ')}</strong></div>
          <div>算法判定: <strong style={{ color: 'var(--accent-secondary)' }}>隐性动态调节开启</strong></div>
        </div>

        <button
          onClick={onOpenOnboarding}
          style={{
            padding: '8px',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            marginTop: '4px',
          }}
        >
          重新设置兴趣与感官基线
        </button>
      </div>
    </div>
  );
}

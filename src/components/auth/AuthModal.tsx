import { useState } from 'react';
import { UserKnowledgeState } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
  userState: UserKnowledgeState;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess, userState }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSendMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setTimeout(() => {
        onLoginSuccess(email);
        setIsSent(false);
      }, 1000);
    }, 800);
  };

  const handleQuickOAuth = (provider: string) => {
    onLoginSuccess(`${provider.toLowerCase()}_user@scrolllingo.app`);
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
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              多设备云端同步
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Supabase Auth 免密无缝同步
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Sync Safety Notice */}
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            padding: '10px 12px',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '12px',
            color: 'var(--text-primary)',
            lineHeight: '1.5',
          }}
        >
          登录后，您积累的 <strong>{userState.explicitKnownWords.size} 个掌握词汇</strong> 将自动与云端合并。
        </div>

        {/* OAuth Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={() => handleQuickOAuth('Google')}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 'var(--border-radius-full)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Google 账号一键登录
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>或使用邮箱链接</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* Magic Link Form */}
        <form onSubmit={handleSendMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="输入邮箱地址 (e.g. user@example.com)"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '13px',
            }}
          />

          <button
            type="submit"
            disabled={isSending || isSent}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {isSending ? '正在发送...' : isSent ? '已成功同步' : '发送 Magic Link 验证'}
          </button>
        </form>
      </div>
    </div>
  );
}

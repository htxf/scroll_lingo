import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModal } from './AuthModal';
import { UserKnowledgeState } from '../../types';

describe('AuthModal Component', () => {
  const mockUserState: UserKnowledgeState = {
    deviceUuid: 'dev-1',
    baselineLevel: 'N5',
    explicitKnownWords: new Set(['朝']),
    explicitFocusWords: new Set<string>(),
    interestCategories: ['coffee'],
    totalPostsRead: 0,
    totalWordsMastered: 1,
    lastActiveTimestamp: Date.now(),
  };

  it('should render auth modal with sync safety notice and OAuth options', () => {
    const handleLogin = vi.fn();
    render(
      <AuthModal
        isOpen={true}
        onClose={vi.fn()}
        onLoginSuccess={handleLogin}
        userState={mockUserState}
      />
    );

    expect(screen.getByText('多设备云端同步')).not.toBeNull();

    // Click Google OAuth
    fireEvent.click(screen.getByText(/Google 账号一键登录/));
    expect(handleLogin).toHaveBeenCalledWith('google_user@scrolllingo.app');
  });
});

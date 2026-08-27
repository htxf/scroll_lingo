import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { OfflineBadge } from './OfflineBadge';

describe('OfflineBadge Component', () => {
  it('should render null when online and show banner when offline event fires', () => {
    const { container } = render(<OfflineBadge />);
    expect(container.firstChild).toBeNull(); // Initially online in test environment

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText(/离线无网模式/)).not.toBeNull();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(container.firstChild).toBeNull();
  });
});

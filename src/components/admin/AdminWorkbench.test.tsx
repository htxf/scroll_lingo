import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminWorkbench } from './AdminWorkbench';

describe('AdminWorkbench Component', () => {
  it('should render admin workbench header and tab switching', () => {
    render(<AdminWorkbench isOpen={true} onClose={vi.fn()} onAddPost={vi.fn()} />);

    expect(screen.getByText('语料管理后台')).not.toBeNull();

    // Switch to error reports tab
    fireEvent.click(screen.getByText(/错读反馈/));
    expect(screen.getByText(/待审核/)).not.toBeNull();

    // Switch to personas tab
    fireEvent.click(screen.getByText('AI 博主'));
    expect(screen.getByText('Ken | 咖啡研究员')).not.toBeNull();
  });
});

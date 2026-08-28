import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingModal } from './OnboardingModal';

describe('OnboardingModal Component', () => {
  it('should render step 1 interest category selection and allow navigation to step 2', () => {
    const handleComplete = vi.fn();
    render(<OnboardingModal isOpen={true} onComplete={handleComplete} />);

    expect(screen.getByText('选择感兴趣的话题')).not.toBeNull();

    const nextButton = screen.getByText('下一步：难度设置');
    fireEvent.click(nextButton);

    expect(screen.getByText('选择感官基线')).not.toBeNull();
  });

  it('should trigger onComplete with selected categories and baseline level', () => {
    const handleComplete = vi.fn();
    render(
      <OnboardingModal
        isOpen={true}
        onComplete={handleComplete}
        initialCategories={['lifestyle', 'coffee', 'tech']}
      />
    );

    // Go to step 2
    fireEvent.click(screen.getByText('下一步：难度设置'));

    // Click finish
    fireEvent.click(screen.getByText('进入应用'));

    expect(handleComplete).toHaveBeenCalledWith(['lifestyle', 'coffee', 'tech'], 'N0');
  });
});

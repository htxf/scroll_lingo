import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PitchAccentView } from './PitchAccentView';

describe('PitchAccentView', () => {
  it('should render pattern badge and SVG curve when pitchAccent is provided', () => {
    const { container } = render(
      <PitchAccentView
        reading="あさいり"
        pitchAccent={{ pattern: 'heiban', pitchNotation: '0' }}
      />
    );

    expect(container.textContent).toContain('⓪ 平板型');
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('path')).not.toBeNull();
  });

  it('should return null if pitchAccent is missing', () => {
    const { container } = render(<PitchAccentView reading="あさいり" />);
    expect(container.firstChild).toBeNull();
  });
});

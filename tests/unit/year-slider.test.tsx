import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { YearSlider } from '../../src/view/controls/YearSlider';

describe('YearSlider Component (CC8.3b)', () => {
  it('renders only text with year when years has 1 item and no slider component', () => {
    const html = renderToString(
      <YearSlider years={[2024]} value={2024} onChange={() => {}} />
    );

    expect(html).toContain('2024');
    expect(html).not.toContain('data-slot="slider"');
    expect(html).not.toContain('role="slider"');
  });

  it('renders current year as text and index-mapped slider for multiple years', () => {
    const years = [2010, 2012, 2015, 2020];
    const html = renderToString(
      <YearSlider years={years} value={2015} onChange={() => {}} />
    );

    expect(html).toContain('2015');
    expect(html).toContain('data-slot="slider"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="3"');
    expect(html).toContain('aria-valuetext="2015"');
  });

  it('sets aria-valuetext to current year string for screen readers', () => {
    const years = [2018, 2020, 2022, 2024];
    const html = renderToString(
      <YearSlider years={years} value={2022} onChange={() => {}} />
    );

    expect(html).toContain('aria-valuetext="2022"');
  });

  it('meets min 44px touch target requirement and strictly uses design tokens', () => {
    const years = [2020, 2021, 2022, 2023, 2024];
    const html = renderToString(
      <YearSlider years={years} value={2024} onChange={() => {}} />
    );

    // Check min 44px touch area indicator or classes
    expect(html).toMatch(/min-h-\[44px\]|before:-inset-3|-inset-3|h-\[44px\]/);

    // Confirm token styles and absence of forbidden styles
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(html).not.toContain('shadow-');
    expect(html).not.toMatch(/rounded-(sm|md|lg|xl|2xl|3xl|full)/);
  });
});

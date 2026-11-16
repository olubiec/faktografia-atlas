import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { buildProfile } from '../../src/core/profile/profile';
import { ProfileSheet } from '../../src/view/profile/ProfileSheet';
import profileSample from '../fixtures/synthetic/profile-sample.json';

describe('N-26 stopka profilu nie jest landmarkiem contentinfo', () => {
  const profile = buildProfile(
    '0201011',
    profileSample.indicators as any,
    profileSample.valuesById as any,
    profileSample.units as any,
  );
  const html = renderToString(
    <ProfileSheet profile={profile} units={profileSample.units as any} onClose={() => {}} />,
  );

  it('nie zawiera elementu <footer>', () => {
    expect(html).not.toContain('<footer');
  });

  it('zawiera div z data-slot="profile-footer" i źródło GUS', () => {
    expect(html).toContain('data-slot="profile-footer"');
    expect(html).toContain('Źródło: GUS');
  });
});

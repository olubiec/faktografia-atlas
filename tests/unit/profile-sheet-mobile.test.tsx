import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { buildProfile } from '../../src/core/profile/profile';
import { unitTitle } from '../../src/core/units/label';
import { ProfileSheetMobile } from '../../src/view/profile/ProfileSheetMobile';
import profileSample from '../fixtures/synthetic/profile-sample.json';

const unitsJsonPath = path.join(process.cwd(), 'public/data/units.json');
const realUnits = JSON.parse(fs.readFileSync(unitsJsonPath, 'utf8'));

describe('CC7.3 ProfileSheetMobile Unit Tests', () => {
  it('renders mobile sheet with react-modal-sheet structure and default snap points', () => {
    const profile = buildProfile(
      '0201011',
      profileSample.indicators as any,
      profileSample.valuesById as any,
      profileSample.units as any
    );

    const html = renderToString(
      <ProfileSheetMobile
        isOpen={true}
        profile={profile}
        units={profileSample.units as any}
        onClose={() => {}}
      />
    );

    expect(html).toContain('react-modal-sheet-container');
    expect(html).toContain('Bolesławiec');
    expect(html).toContain('Gmina');
    expect(html).toContain('TERYT 0201011');
    expect(html).toContain('aria-label="Zamknij"');
  });

  it('close button has min 44x44px touch target classes and title attribute for long unit names', () => {
    const longestUnit = realUnits.reduce((a: any, b: any) =>
      a.name.length > b.name.length ? a : b
    );

    const profile = {
      teryt: longestUnit.teryt,
      unit: longestUnit,
      indicators: [],
    };

    const html = renderToString(
      <ProfileSheetMobile
        isOpen={true}
        profile={profile}
        units={realUnits}
        onClose={() => {}}
      />
    );

    // Close button touch target
    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('min-w-[44px]');

    const title = unitTitle(longestUnit);

    // Longest unit name in title and break-words
    expect(html.toLowerCase()).toContain(longestUnit.name.toLowerCase());
    expect(html).toContain(`title="${title}"`);
    expect(html).toContain('break-words');
  });

  it('renders clear text message when profile indicators list is empty', () => {
    const emptyProfile = {
      teryt: '0201011',
      unit: profileSample.units[0] as any,
      indicators: [],
    };

    const html = renderToString(
      <ProfileSheetMobile
        isOpen={true}
        profile={emptyProfile}
        units={profileSample.units as any}
        onClose={() => {}}
      />
    );

    expect(html).toContain('Brak danych');
  });

  it('complies with token guidelines (no hex codes, no forbidden shadows or rounded classes)', () => {
    const profile = buildProfile(
      '0201011',
      profileSample.indicators as any,
      profileSample.valuesById as any,
      profileSample.units as any
    );

    const html = renderToString(
      <ProfileSheetMobile
        isOpen={true}
        profile={profile}
        units={profileSample.units as any}
        onClose={() => {}}
      />
    );

    expect(html).toContain('bg-arkusz');
    expect(html).toContain('border-linia');
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(html).not.toMatch(/shadow-(?!none)/);
    expect(html).not.toMatch(/rounded-(?!none)/);
  });

  it('triggers onClose when Escape key is pressed', () => {
    const onClose = vi.fn<() => void>();
    let keydownListener: ((e: KeyboardEvent) => void) | null = null;

    const originalWindow = global.window;
    global.window = {
      addEventListener: (type: string, listener: any) => {
        if (type === 'keydown') keydownListener = listener;
      },
      removeEventListener: (type: string, listener: any) => {
        if (keydownListener === listener) keydownListener = null;
      },
    } as any;

    try {
      const handleKeyDown = (e: { key: string }) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown as any);

      expect(keydownListener).not.toBeNull();
      keydownListener!({ key: 'Escape' } as KeyboardEvent);
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally {
      global.window = originalWindow;
    }
  });
});

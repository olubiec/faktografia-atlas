import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { buildProfile } from '../../src/core/profile/profile';
import { ProfileSheet } from '../../src/view/profile/ProfileSheet';
import { ProfileIndicatorRow } from '../../src/view/profile/ProfileIndicatorRow';
import profileSample from '../fixtures/synthetic/profile-sample.json';

const unitsJsonPath = path.join(process.cwd(), 'public/data/units.json');
const indicatorsJsonPath = path.join(process.cwd(), 'config/indicators.json');
const realUnits = JSON.parse(fs.readFileSync(unitsJsonPath, 'utf8'));
const realIndicators = JSON.parse(fs.readFileSync(indicatorsJsonPath, 'utf8'));

describe('CC7.2a ProfileSheet & ProfileIndicatorRow Unit Tests', () => {
  it('renders header with unit name as title, level and TERYT in small text, and close button with aria-label and 44px touch target', () => {
    const profile = buildProfile(
      '0201011',
      profileSample.indicators as any,
      profileSample.valuesById as any,
      profileSample.units as any,
    );

    const html = renderToString(
      <ProfileSheet
        profile={profile}
        units={profileSample.units as any}
        onClose={() => {}}
      />
    );

    // Title & header text
    expect(html).toContain('Bolesławiec');
    expect(html).toContain('Gmina');
    expect(html).toContain('TERYT 0201011');

    // Close button attributes
    expect(html).toContain('aria-label="Zamknij"');
    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('min-w-[44px]');
  });

  it('groups indicators by group name and renders rows correctly', () => {
    const profile = buildProfile(
      '0201011',
      profileSample.indicators as any,
      profileSample.valuesById as any,
      profileSample.units as any,
    );

    const html = renderToString(
      <ProfileSheet
        profile={profile}
        units={profileSample.units as any}
        onClose={() => {}}
      />
    );

    // Group header
    expect(html).toContain('Test');

    // Values formatted via formatValue (with non-breaking spaces and units)
    expect(html).toContain('150');
    expect(html).toContain('pkt');
    expect(html).toContain('5,0');
    expect(html).toContain('%');
    expect(html).toContain('500');
    expect(html).toContain('osob');

    // Year display
    expect(html).toContain('2023');

    // Rank display: "1. miejsce wśród 3" or "2. miejsce wśród 4" etc.
    expect(html).toContain('miejsce wśród');
  });

  it('handles neutral indicators without words "lepsze/gorsze"', () => {
    const profile = buildProfile(
      '0201011',
      profileSample.indicators as any,
      profileSample.valuesById as any,
      profileSample.units as any,
    );

    const neutralItem = profile.indicators.find((i) => i.neutral)!;
    expect(neutralItem).toBeDefined();

    const htmlRow = renderToString(
      <ProfileIndicatorRow item={neutralItem} units={profileSample.units as any} />
    );

    expect(htmlRow).not.toContain('lepsze');
    expect(htmlRow).not.toContain('gorsze');
  });

  it('renders "brak danych" for missing values and never "0"', () => {
    const profile = buildProfile(
      '0202011',
      profileSample.indicators as any,
      profileSample.valuesById as any,
      profileSample.units as any,
    );

    const missingItem = profile.indicators.find((i) => i.indicatorId === 'ind-neutral')!;
    expect(missingItem.value).toBeNull();

    const htmlRow = renderToString(
      <ProfileIndicatorRow item={missingItem} units={profileSample.units as any} />
    );

    expect(htmlRow).toContain('brak danych');
    expect(htmlRow).not.toMatch(/>0</);
  });

  it('renders "dane dla powiatu ..." for indicator values inherited from parent (fromParent)', () => {
    const profile = buildProfile(
      '0201011',
      profileSample.indicators as any,
      profileSample.valuesById as any,
      profileSample.units as any,
    );

    const parentItem = profile.indicators.find((i) => i.fromParent)!;
    expect(parentItem).toBeDefined();
    expect(parentItem.fromParent).toBe('0201');

    const htmlRow = renderToString(
      <ProfileIndicatorRow item={parentItem} units={profileSample.units as any} />
    );

    expect(htmlRow).toContain('dane dla powiatu bolesławiecki');
  });

  it('renders source via formatSource at bottom and indicator footnotes under row when present', () => {
    const profile = buildProfile(
      '0201011',
      profileSample.indicators as any,
      profileSample.valuesById as any,
      profileSample.units as any,
    );

    const html = renderToString(
      <ProfileSheet
        profile={profile}
        units={profileSample.units as any}
        onClose={() => {}}
      />
    );

    // Source footer
    expect(html).toContain('Źródło: GUS, BDL, 2023');

    // Footnote test
    const itemWithFootnote = {
      ...profile.indicators[0],
      indicator: {
        ...profile.indicators[0].indicator,
        footnote: 'bez firm do 9 pracowników',
      },
    };

    const htmlRow = renderToString(
      <ProfileIndicatorRow item={itemWithFootnote} units={profileSample.units as any} />
    );

    expect(htmlRow).toContain('bez firm do 9 pracowników');
  });

  it('complies with STYL.md §5: uses bg-arkusz, border-linia, 440px max width, no shadows or rounded corners', () => {
    const profile = buildProfile(
      '0201011',
      profileSample.indicators as any,
      profileSample.valuesById as any,
      profileSample.units as any,
    );

    const html = renderToString(
      <ProfileSheet
        profile={profile}
        units={profileSample.units as any}
        onClose={() => {}}
      />
    );

    expect(html).toContain('bg-arkusz');
    expect(html).toContain('border-linia');
    expect(html).toContain('max-w-[440px]');
    expect(html).not.toMatch(/shadow-(?!none)/);
    expect(html).not.toMatch(/rounded-(?!none)/);
  });

  it('handles longest unit name and longest indicator name without breaking', () => {
    const longestUnit = realUnits.reduce((a: any, b: any) =>
      a.name.length > b.name.length ? a : b
    );
    const longestIndicator = realIndicators.reduce((a: any, b: any) =>
      a.name.length > b.name.length ? a : b
    );

    const mockProfile = {
      teryt: longestUnit.teryt,
      unit: longestUnit,
      indicators: [
        {
          indicatorId: longestIndicator.id,
          indicator: longestIndicator,
          year: 2023,
          value: 123.45,
          rankNational: 12,
          rankVoivodeship: 2,
          totalNational: 380,
          totalVoivodeship: 30,
          neutral: false,
        },
      ],
    };

    const html = renderToString(
      <ProfileSheet
        profile={mockProfile}
        units={realUnits}
        onClose={() => {}}
      />
    );

    expect(html).toContain(longestUnit.name);
    expect(html).toContain(longestIndicator.name);
    expect(html).toContain('break-words');
  });
});

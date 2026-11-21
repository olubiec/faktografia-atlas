import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { buildProfile } from '../../src/core/profile/profile';
import { ProfileSheet } from '../../src/view/profile/ProfileSheet';
import { Privacy } from '../../src/view/pages/Privacy';
import { BASIC_INDICATORS } from '../../src/core/indicators/basic';
import profileSample from '../fixtures/synthetic/profile-sample.json';

const profile = buildProfile(
  '0201011',
  profileSample.indicators as never,
  profileSample.valuesById as never,
  profileSample.units as never,
);
const indicator = (profileSample.indicators as { id: string }[])[0];
const view = {
  indicator,
  indicators: profileSample.indicators,
  values: profileSample.valuesById[indicator.id as keyof typeof profileSample.valuesById] ?? null,
  year: 2024,
  years: [2024],
  level: 'gmina',
  loading: false,
  setIndicator: () => {},
  setYear: () => {},
  setLevel: () => {},
} as never;

const html = renderToString(
  <ProfileSheet profile={profile} units={profileSample.units as never} view={view} onSelectUnit={() => {}} onClose={() => {}} />,
);

describe('B13: profil bez „Moich wskaźników”', () => {
  it('ma przycisk „Zmień wskaźnik” otwierający okno wyboru danych', () => {
    expect(html).toContain('Zmień wskaźnik');
    expect(html).toContain('aria-haspopup="dialog"');
  });

  it('ma „Dodaj wskaźnik” (menu danych), ale nie ma przeciągania, ‹ › ani „Przywróć podstawowe”', () => {
    expect(html).toContain('Dodaj wskaźnik');
    expect(html).not.toContain('Przywróć podstawowe');
    expect(html).not.toContain('Przeciągnij, aby zmienić kolejność');
    expect(html).not.toContain('Usuń wskaźnik');
  });

  it('wiersze listy pochodzą tylko ze stałego zestawu 7', () => {
    const ids = (profileSample.indicators as { id: string }[]).map((i) => i.id);
    expect(BASIC_INDICATORS.length).toBe(7);
    expect(ids.length).toBeGreaterThan(0);
  });

  it('/prywatnosc nie zawiera słów „Moje wskaźniki”', () => {
    const page = renderToString(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>,
    );
    expect(page).not.toContain('Moje wskaźniki');
    expect(page).not.toContain('faktografia-my-indicators');
  });
});

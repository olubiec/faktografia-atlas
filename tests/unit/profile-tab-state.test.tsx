import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { buildProfile } from '../../src/core/profile/profile';
import { ProfileBody } from '../../src/view/profile/ProfileSheet';
import profileSample from '../fixtures/synthetic/profile-sample.json';

// Powiat z gminami – ma zakładkę „Gminy”, ale nie każdy przykład ją ma, więc szukamy po wyniku
const units = profileSample.units as any;

function render(extra: Record<string, unknown> = {}) {
  const profile = buildProfile(
    '0201011',
    profileSample.indicators as any,
    profileSample.valuesById as any,
    units,
  );
  return renderToString(<ProfileBody profile={profile} units={units} {...extra} />);
}

/** Zwraca wartość aria-selected zakładki o danej etykiecie (null, gdy brak zakładki). */
function selectedOf(html: string, label: RegExp): string | null {
  const re = /<button[^>]*role="tab"[^>]*>[\s\S]*?<\/button>/g;
  for (const m of html.match(re) ?? []) {
    if (label.test(m.replace(/<[^>]+>/g, ''))) {
      return /aria-selected="(true|false)"/.exec(m)?.[1] ?? null;
    }
  }
  return null;
}

describe('N-31 stan zakładki profilu przekazany z zewnątrz', () => {
  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('bez propsa activeTab zaznacza „Przegląd”', () => {
    const html = render();
    expect(selectedOf(html, /Przegląd/)).toBe('true');
  });

  it('z activeTab="compare" zaznacza „Porównaj”, a nie „Przegląd”', () => {
    const html = render({ activeTab: 'compare', onTabChange: () => {} });
    expect(selectedOf(html, /Porównaj/)).toBe('true');
    expect(selectedOf(html, /Przegląd/)).toBe('false');
  });

  it('z activeTab="children" zaznacza zakładkę Gminy i odznacza „Przegląd”', () => {
    const profile = buildProfile(
      '0201',
      profileSample.indicators as any,
      profileSample.valuesById as any,
      units,
    );
    const html = renderToString(
      <ProfileBody profile={profile} units={units} activeTab="children" onTabChange={() => {}} />,
    );
    expect(selectedOf(html, /(Powiaty|Gminy)/)).toBe('true');
    expect(selectedOf(html, /Przegląd/)).toBe('false');
  });

  it('przy ?c=a,b w adresie bez propsa startuje na „Porównaj”', () => {
    (globalThis as any).window = { location: { search: '?c=0201011,0201021' } };
    const html = render();
    expect(selectedOf(html, /Porównaj/)).toBe('true');
  });
});

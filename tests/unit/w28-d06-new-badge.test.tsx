import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import indicatorsData from '../../config/indicators.json' with { type: 'json' };
import fixture from '../fixtures/catalog/search-queries.json' with { type: 'json' };
import { buildCatalogTree, flattenTree } from '../../src/core/catalog/tree';
import { decodeFact, encodeFact } from '../../src/core/facts/codec';
import { isNewIndicator, isNewSince, labelDaysOf, markNew, newIdList } from '../../src/core/facts/fresh-label';
import { buildNewIds } from '../../scripts/data/library-available.mjs';
import { factView } from '../../src/core/start/discoveries';
import type { Fact } from '../../src/core/facts/types';
import type { AvailableFile } from '../../src/core/indicators/registry';
import type { Indicator } from '../../src/core/profile/profile';
import { DataMenuList } from '../../src/view/data-menu/DataMenuList';
import { FactCard } from '../../src/view/start/FactCard';

const NOW = '2026-11-20T12:00:00.000Z';
const daysAgo = (n: number) => new Date(Date.parse(NOW) - n * 86_400_000).toISOString();

describe('W28-D06 – logika „Nowość”', () => {
  it('rok sprzed 3 dni → etykieta; sprzed 8 dni → brak; brak źródła → brak', () => {
    expect(isNewSince(daysAgo(3), NOW, 7)).toBe(true);
    expect(isNewSince(daysAgo(8), NOW, 7)).toBe(false);
    expect(isNewSince(undefined, NOW, 7)).toBe(false);
    expect(isNewSince('to nie data', NOW, 7)).toBe(false);
    expect(newIdList({ now: NOW, days: 7 })).toEqual([]);
    expect(newIdList({ ledger: null, calendar: null, now: NOW, days: 7 })).toEqual([]);
  });

  it('łączy wskaźniki główne (fresh.json) i zmienne biblioteki (kalendarium, stan downloaded)', () => {
    const ledger = { 'avg-wage': { year: 2026, since: daysAgo(3) }, population: { year: 2025, since: daysAgo(8) } };
    const calendar = {
      entries: [
        {
          library: [
            { id: 12, state: 'downloaded', on: daysAgo(2).slice(0, 10) },
            { id: 13, state: 'waiting' },
            { id: 14, state: 'downloaded', on: daysAgo(20).slice(0, 10) },
          ],
        },
      ],
    };
    const list = newIdList({ ledger, calendar, now: NOW, days: 7 });
    expect(list).toEqual(['12', 'avg-wage']);
    // Skrypt available.json liczy to samo.
    expect(buildNewIds({ ledger, calendar, now: NOW, days: 7 })).toEqual(list);
    expect(isNewIndicator('avg-wage', list)).toBe(true);
    expect(isNewIndicator('b12', list)).toBe(true);
    expect(isNewIndicator('b13', list)).toBe(false);
    expect(isNewIndicator('population', list)).toBe(false);
    expect(isNewIndicator('population', null)).toBe(false);
  });

  it('liczba dni z konfiguracji, a przy złej wartości 7', () => {
    expect(labelDaysOf({ fresh: { labelDays: 3 } })).toBe(3);
    expect(labelDaysOf({})).toBe(7);
    expect(labelDaysOf(undefined)).toBe(7);
  });
});

const base: Fact = {
  type: 'F1',
  teryt: '1606042',
  indicatorId: 'population',
  year: 2025,
  value: 3005,
  strength: 6.39,
  frame: 'kraj',
  compare: { kind: 'rank', dir: -1, rank: 1, total: 71, tie: false },
};

describe('W28-D06 – kodek faktów', () => {
  it('fakt z flagą i bez flagi koduje się i dekoduje bez zmian w pozostałych polach', () => {
    const plain = encodeFact(base);
    expect(plain).toEqual(['F1', 'population', 2025, 3005, 6.39, -1, 1, 71, 0]);
    const flagged = encodeFact({ ...base, isNew: true });
    expect(flagged.slice(0, plain.length)).toEqual(plain);
    expect(flagged.slice(plain.length)).toEqual([0, 1]);
    expect(decodeFact('1606042', plain)).toEqual(base);
    expect(decodeFact('1606042', flagged)).toEqual({ ...base, isNew: true });
  });

  it('flaga razem ze span, a stary zapis (także ze span) czyta się jak dotąd', () => {
    const spanned = { ...base, span: 3 };
    const old = encodeFact(spanned);
    expect(old[old.length - 1]).toBe(3);
    expect(decodeFact('1606042', old)).toEqual(spanned);
    const flagged = encodeFact({ ...spanned, isNew: true });
    expect(flagged.slice(-2)).toEqual([3, 1]);
    expect(decodeFact('1606042', flagged)).toEqual({ ...spanned, isNew: true });
  });

  it('markNew oznacza tylko fakty z najnowszego roku świeżego wskaźnika', () => {
    const older = { ...base, year: 2024 };
    const other = { ...base, indicatorId: 'avg-wage' };
    const out = markNew([base, older, other], { population: 2025 });
    expect(out.map((f) => f.isNew === true)).toEqual([true, false, false]);
    expect(markNew([base], undefined)[0]).toBe(base);
  });
});

const tree = buildCatalogTree(indicatorsData as Indicator[], fixture.available as AvailableFile);
const entries = flattenTree(tree).filter((e) => e.section === 'Ludność');

describe('W28-D06 – komponenty', () => {
  it('„Wybierz dane”: tylko wiersz z listy new ma etykietę z aria-label', () => {
    const el = DataMenuList({ entries, selectedId: null, onPick: vi.fn<(id: string) => void>(), limit: 50, onMore: () => {}, newIds: ['density'] });
    const html = renderToString(<>{el}</>).replace(/<!-- -->/g, '');
    expect(html.match(/aria-label="Nowe dane"/g)).toHaveLength(1);
    expect(html.indexOf('Nowe dane')).toBeGreaterThan(html.indexOf('Gęstość zaludnienia'));
    const none = renderToString(<>{DataMenuList({ entries, selectedId: null, onPick: vi.fn<(id: string) => void>(), limit: 50, onMore: () => {}, newIds: null })}</>);
    expect(none).not.toContain('Nowe dane');
  });

  it('FactCard: etykieta tylko przy fakcie z flagą', () => {
    const view = factView({ ...base, isNew: true })!;
    const plain = factView(base)!;
    expect(view.isNew).toBe(true);
    expect(plain.isNew).toBeUndefined();
    const render = (f: typeof view) =>
      renderToString(
        <MemoryRouter>
          <FactCard fact={f} place="Opole" to={(h) => h} />
        </MemoryRouter>,
      );
    expect(render(view)).toContain('aria-label="Nowe dane"');
    expect(render(view)).toContain('Nowość');
    expect(render(plain)).not.toContain('Nowe dane');
  });
});

describe('W28-D06 – wpięcie w budowę plików i panel', () => {
  it('buildShards z mapą nowych wskaźników koduje flagę, bez mapy plik jest bez zmian', async () => {
    const { buildShards } = await import('../../src/core/facts/build');
    const build = { ctx: { input: { units: [{ teryt: '1606042' }], neighbours: undefined } }, byUnit: new Map([['1606042', { selected: [base] }]]), twins: new Map() };
    const run = (y?: Record<string, number>) => buildShards(build as never, 'g', y)['16'].units['1606042'][0];
    expect(run()).toEqual(['F1', 'population', 2025, 3005, 6.39, -1, 1, 71, 0]);
    expect(run({ population: 2025 })).toEqual(['F1', 'population', 2025, 3005, 6.39, -1, 1, 71, 0, 0, 1]);
  });
});

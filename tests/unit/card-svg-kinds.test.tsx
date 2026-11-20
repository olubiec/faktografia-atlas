import { readFileSync } from 'node:fs';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CardSvg } from '../../src/view/share/CardSvg';
import { pageScene, type PageSceneContext } from '../../src/core/share/deck-scene';
import type { CardItem, CardScene, TextItem } from '../../src/core/share/card';
import type { DeckPage, PageKind } from '../../src/core/share/deck';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';
import type { Indicator, IndicatorValues } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

const measure = (text: string, size: number): number => Math.round(0.55 * size * text.length);
const FORMATS = Object.keys(SHARE_FORMATS) as ShareFormatKey[];

const ind = (id: string, name: string, unit: string, higherIsBetter: boolean | null): Indicator =>
  ({ id, bdlVarId: 1, name, unit, description: '', group: 'g', higherIsBetter, minLevel: 'pow' }) as Indicator;
const NAMES = ['powiat opolski', 'powiat nyski', 'powiat brzeski', 'powiat kluczborski', 'powiat namysłowski', 'powiat strzelecki', 'powiat prudnicki', 'powiat głubczycki', 'powiat krapkowicki', 'powiat oleski', 'powiat kędzierzyńsko-kozielski', 'powiat wrocławski'];
const units: Unit[] = NAMES.map((name, i) => ({
  teryt: `16${String(i + 1).padStart(2, '0')}`, bdlId: null, name, level: 'pow', parent: '16', bbox: [0, 0, 1, 1], centroid: [0, 0],
}));
const vals = (id: string, base: number): IndicatorValues => ({
  indicatorId: id, years: [2022, 2023, 2024], fetchedAt: '2025-01-01',
  values: Object.fromEntries(units.map((u, i) => [u.teryt, [base + i, base + i + 0.5, i === 5 ? null : base + i + 1]])),
});
const indicators = [ind('bezr', 'Stopa bezrobocia', '%', false), ind('gest', 'Gęstość zaludnienia', 'os./km²', true), ind('b101', 'Wskaźnik z biblioteki', 'szt.', null)];
const ctx: PageSceneContext = {
  year: 2024, level: 'pow', units, indicators,
  values: { bezr: vals('bezr', 3), gest: vals('gest', 80), b101: vals('b101', 10) },
  placeTeryt: '1601', pair: ['1601', '1602'],
  features: [{ type: 'Feature', properties: { teryt: '1601' }, geometry: { type: 'Polygon', coordinates: [[[19, 49.5], [21, 49.5], [21, 50.5], [19, 50.5], [19, 49.5]]] } }],
};

const page = (kind: PageKind, indicatorIds: string[] = ['bezr'], options?: DeckPage['options']): DeckPage => ({ id: 'p1', kind, indicatorIds, options });
const CASES: [string, DeckPage][] = [
  ['map', page('map')],
  ['ranking (top)', page('ranking', ['bezr'], { side: 'top' })],
  ['ranking (bottom)', page('ranking', ['bezr'], { side: 'bottom' })],
  ['table', page('table', ['bezr', 'gest'])],
  ['bignumber', page('bignumber')],
  ['trend', page('trend')],
  ['histogram', page('histogram')],
  ['profile', page('profile', ['bezr', 'gest'])],
  ['compare', page('compare', ['bezr', 'gest'])],
  ['versus', page('versus')],
];

const texts = (items: CardItem[]) => items.filter((i): i is TextItem => i.type === 'text');
const allText = (s: CardScene) => texts(s.items).flatMap((t) => t.lines).join(' | ');
const scene = (p: DeckPage, label = '', f: ShareFormatKey = 'post', c: PageSceneContext = ctx) => pageScene(p, label, c, f, 'light', measure);

describe('pageScene: 10 przypadków (9 rodzajów, ranking w dwóch wariantach)', () => {
  it.each(CASES)('%s: scena i podgląd SVG', (_name, p) => {
    const s = scene(p);
    expect(s).not.toBeNull();
    expect(s!.items.length).toBeGreaterThan(3);
    const html = renderToString(<CardSvg scene={s!} />);
    expect(html).toContain('<svg');
  });

  it('ranking najwyżej i najniżej to różne listy', () => {
    const top = allText(scene(page('ranking', ['bezr'], { side: 'top' }))!);
    const bottom = allText(scene(page('ranking', ['bezr'], { side: 'bottom' }))!);
    expect(top).not.toEqual(bottom);
  });
});

describe('numer strony', () => {
  it('label „3/5” trafia do sceny, pusty label nie', () => {
    for (const [, p] of CASES) {
      expect(allText(scene(p, '3/5')!)).toContain('3/5');
      expect(allText(scene(p, '')!)).not.toContain('3/5');
      expect(allText(scene(p, '')!)).not.toContain(' · ');
    }
  });
});

describe('brak danych', () => {
  it('profile bez miejsca i compare/versus bez pary dają null', () => {
    const noPlace = { ...ctx, placeTeryt: null };
    const noPair = { ...ctx, pair: null };
    expect(scene(page('profile', ['bezr']), '', 'post', noPlace)).toBeNull();
    expect(scene(page('compare', ['bezr']), '', 'post', noPair)).toBeNull();
    expect(scene(page('versus'), '', 'post', noPair)).toBeNull();
  });

  it('bignumber i trend bez miejsca oraz strona bez wskaźników dają null', () => {
    const noPlace = { ...ctx, placeTeryt: null };
    expect(scene(page('bignumber'), '', 'post', noPlace)).toBeNull();
    expect(scene(page('trend'), '', 'post', noPlace)).toBeNull();
    expect(scene(page('table', []))).toBeNull();
  });
});

describe('geometria', () => {
  // Zwraca opisy elementów wystających poza kartę (pusta lista = wszystko się mieści).
  const outside = (name: string, s: CardScene): string[] =>
    s.items.flatMap((it) => {
      const box = it.type === 'text' ? { x: it.x, y: it.y, w: it.maxWidth, h: it.lines.length * it.lineHeight } : it.type === 'path' ? null : { x: it.x, y: it.y, w: it.width, h: it.height };
      if (!box) return [];
      const bad = box.x < -1 || box.y < 0 || box.x + box.w > s.width + 1 || box.y + box.h > s.height + 1;
      return bad ? [`${name}: ${it.type} ${JSON.stringify(box)}`] : [];
    });

  it.each(FORMATS)('wszystkie elementy mieszczą się w %s', (f) => {
    const { width, height } = SHARE_FORMATS[f];
    const bad = CASES.flatMap(([name, p]) => {
      const s = scene(p, '2/10', f)!;
      return [...outside(name, s), ...(s.width === width && s.height === height ? [] : [`${name}: zły rozmiar`])];
    });
    expect(bad).toEqual([]);
  });
});

describe('tytuły', () => {
  it('table zawiera nazwę miejsca, versus obie nazwy', () => {
    const t = allText(scene(page('table', ['bezr', 'gest']))!);
    expect(t).toContain('opolski – wskaźniki');
    const v = allText(scene(page('versus'))!);
    expect(v).toContain('opolski');
    expect(v).toContain('nyski');
  });

  it('trend, histogram i bignumber mają tytuły z nazwą wskaźnika', () => {
    expect(allText(scene(page('trend'))!)).toContain('Stopa bezrobocia – Powiat opolski, lata');
    expect(allText(scene(page('histogram'))!)).toContain('Stopa bezrobocia – rozkład');
    expect(allText(scene(page('bignumber'))!)).toContain('Stopa bezrobocia');
  });
});

describe('wskaźnik z biblioteki (b101)', () => {
  it('table i bignumber biorą wartości z ctx.values', () => {
    const t = allText(scene(page('table', ['b101']))!);
    expect(t).toContain('Wskaźnik z biblioteki');
    expect(t).toContain('11');
    const b = allText(scene(page('bignumber', ['b101']))!);
    expect(b).toContain('11');
    expect(b).toContain('szt.');
  });

  it('ranking z biblioteki działa bez kierunku (higherIsBetter: null)', () => {
    expect(scene(page('ranking', ['b101']))).not.toBeNull();
  });
});

describe('rozmiar plików', () => {
  it.each(['card.ts', 'deck-scene.ts'])('%s ma do 200 linii', (file) => {
    const src = readFileSync(`src/core/share/${file}`, 'utf8');
    expect(src.split('\n').length).toBeLessThanOrEqual(200);
  });
});

import fs from 'node:fs';
import path from 'node:path';
import type { Feature } from 'geojson';
import { describe, expect, it } from 'vitest';
import tokens from '../../config/tokens.json';
import indicatorsData from '../../config/indicators.json';
import explanationsData from '../fixtures/explanations.json';
import unitsData from '../fixtures/seo/units.json';
import type { IndicatorValues } from '../../src/core/profile/profile';
import type { RankingContext } from '../../src/core/seo/ranking-page';
import {
  compactPath,
  MAP_HEIGHT,
  MAP_WIDTH,
  rankingMapAlt,
  rankingMapSrc,
  rankingMapSvg,
  titleLines,
} from '../../src/core/seo/ranking-map';
import { buildRankingSite, rankingHeadings, type RankingGeo } from '../../src/core/seo/ranking-template';
import { buildUnitPaths, type SlugUnit } from '../../src/core/seo/slug';

// Statyczne mapy rankingów (Grafika Google) i blokada adresów /mapa?… w robots.txt.
const units = unitsData as SlugUnit[];
const indicators = indicatorsData as RankingContext['indicators'][number][];
const seq = tokens.data.sequential.light;
const noData = tokens.data.noData.light;

/** Kwadrat 0,1° × 0,1° w siatce – kształt jednostki do testu. */
function square(teryt: string, i: number): Feature {
  const x = 14 + (i % 20) * 0.4;
  const y = 49 + Math.floor(i / 20) * 0.3;
  return {
    type: 'Feature',
    properties: { teryt },
    geometry: { type: 'Polygon', coordinates: [[[x, y], [x + 0.1, y], [x + 0.1, y + 0.1], [x, y + 0.1], [x, y]]] },
  };
}

const geo: RankingGeo = {
  woj: units.filter((u) => u.level === 'woj').map((u, i) => square(u.teryt, i)),
  pow: units.filter((u) => u.level === 'pow').map((u, i) => square(u.teryt, i)),
  gmi: units.filter((u) => u.level === 'gmi').map((u, i) => square(u.teryt, i)),
};

/** Wartość = TERYT jako liczba; jedna jednostka bez danych (sprawdza kolor „brak danych”). */
function values(id: string): IndicatorValues {
  const v: Record<string, (number | null)[]> = {};
  for (const u of units) v[u.teryt] = [Number(u.teryt)];
  v['1201'] = [null];
  return { indicatorId: id, years: [2025], values: v, fetchedAt: '2026-11-17T10:00:00.000Z' };
}

const one = indicators.slice(0, 1);
const ctx: RankingContext = {
  units,
  paths: buildUnitPaths(units),
  headings: rankingHeadings(units),
  indicators: one,
  explanations: explanationsData.items,
  indexGminy: false,
};
const allValues = Object.fromEntries(one.map((i) => [i.id, values(i.id)]));

describe('compactPath', () => {
  it('zaokrągla do pikseli, usuwa powtórzone punkty i zapisuje współrzędne względnie', () => {
    expect(compactPath('M10.2,10.4L10.4,10.1L20,10L20,20L10,20L10.2,10.4Z')).toBe('M10 10l10 0 0 10-10 0z');
  });

  it('usuwa pierścień, z którego zostały mniej niż 3 punkty', () => {
    expect(compactPath('M1,1L1.2,1.1L1.3,0.9Z M0,0L5,0L5,5Z')).toBe('M0 0l5 0 0 5z');
  });
});

describe('rankingMapSvg', () => {
  const features = [square('a', 0), square('b', 1), square('c', 2), square('d', 3)];
  const vals = [
    { teryt: 'a', name: 'Alfa', value: 1 },
    { teryt: 'b', name: 'Beta', value: 50 },
    { teryt: 'c', name: 'Gamma <b>', value: 100 },
  ];
  const svg = rankingMapSvg({ features, values: vals, title: 'Lesistość – ranking <test>', unit: '%', year: 2025 });

  it('każda jednostka ma kształt w kolorze klasy z tokenów; bez danych – kolor „brak danych”', () => {
    const fills = [...svg.matchAll(/<path d="[^"]+" fill="([^"]+)"/g)].map((m) => m[1]);
    expect(fills).toHaveLength(4);
    expect(fills[0]).toBe(seq[0]);
    expect(fills[2]).toBe(seq[4]);
    expect(fills[3]).toBe(noData);
    expect(svg).toContain('brak danych');
  });

  it('ma wymiary, tytuł, legendę z jednostką i źródło ze znakiem faktografia.eu', () => {
    expect(svg).toContain(`viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}"`);
    expect(svg).toContain('Wartość (%)');
    expect(svg).toMatch(/od 1,0/);
    expect(svg).toMatch(/do 100,0/);
    expect(svg).toContain('Źródło: GUS, Bank Danych Lokalnych · faktografia.eu');
  });

  it('tekst z danych jest zabezpieczony (nie tworzy znaczników)', () => {
    expect(svg).not.toContain('<test>');
    expect(svg).toContain('&lt;test&gt;');
    expect(svg).not.toContain('<b>');
  });

  it('opis alt podaje skrajne jednostki z wartościami', () => {
    const alt = rankingMapAlt({ title: 'Lesistość', values: vals, unit: '%' });
    expect(alt).toContain('Mapa: Lesistość.');
    expect(alt).toContain('Najwyższa: Gamma <b> (100,0');
    expect(alt).toContain('najniższa: Alfa (1,0');
  });

  it('tytuł mieści się w 2 liniach', () => {
    const lines = titleLines('Podmioty gospodarki narodowej wpisane do rejestru REGON na 10 tys. ludności – ranking gmin, województwo małopolskie 2025, dane GUS');
    expect(lines).toHaveLength(2);
    for (const l of lines) expect(l.length).toBeLessThanOrEqual(62);
    expect(lines[1]!.endsWith('…')).toBe(true);
  });
});

describe('mapa na stronach rankingów', () => {
  const site = buildRankingSite(allValues, ctx, { css: [] }, geo);
  const byLevel = (path: string) => site.find((p) => p.path === path)!;
  const ind = one[0]!;
  const woj = site.find((p) => p.level === 'woj')!;
  const nationalGmi = site.find((p) => p.level === 'gmi' && p.path.endsWith('/gminy'))!;
  const voivGmi = site.find((p) => p.level === 'gmi' && p.path.endsWith('/gminy/malopolskie'))!;

  it('ranking województw, powiatów i gmin w województwie ma plik mapy i obrazek z opisem alt', () => {
    for (const page of [woj, byLevel(woj.path.replace('wojewodztwa', 'powiaty')), voivGmi]) {
      expect(page.mapSvg).toBeTruthy();
      expect(page.html).toContain(`<img src="${rankingMapSrc(page.path)}" alt="Mapa: `);
      expect(page.html).toContain(`width="${MAP_WIDTH}" height="${MAP_HEIGHT}"`);
    }
    expect(rankingMapSrc(woj.path)).toBe(`${woj.path}/mapa.svg`);
    expect(ind.id).toBeTruthy();
  });

  it('mapa gmin w województwie pokazuje tylko gminy tego województwa', () => {
    const shapes = voivGmi.mapSvg!.match(/<path /g)!.length;
    expect(shapes).toBe(units.filter((u) => u.level === 'gmi' && u.teryt.startsWith('12')).length);
  });

  it('ranking gmin w Polsce nie ma mapy (za duży plik) ani obrazka', () => {
    expect(nationalGmi.mapSvg).toBeUndefined();
    expect(nationalGmi.html).not.toContain('mapa.svg');
  });

  it('bez granic (geo) strony nie linkują do nieistniejących plików mapy', () => {
    const plain = buildRankingSite(allValues, ctx, { css: [] });
    for (const p of plain) {
      expect(p.mapSvg).toBeUndefined();
      expect(p.html).not.toContain('mapa.svg');
    }
  });
});

describe('robots.txt: adresy aplikacji z parametrami', () => {
  it('blokuje /mapa?… (stan mapy w adresie), a samą /mapa zostawia', () => {
    const robots = fs.readFileSync(path.resolve(process.cwd(), 'public/robots.txt'), 'utf8');
    const lines = robots.split('\n').map((l) => l.trim());
    expect(lines).toContain('Disallow: /mapa?');
    expect(lines).not.toContain('Disallow: /mapa');
  });
});

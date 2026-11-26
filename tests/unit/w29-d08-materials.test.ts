import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as board from '../../scripts/data/calendar-board.mjs';
import { decodeFact } from '../../src/core/facts/codec';
import { buildMaterials, type MaterialsInput } from '../../src/core/facts/materials';
import { factSentence } from '../../src/core/facts/sentences';
import type { FactUnit, IndicatorValues } from '../../src/core/facts/types';

const indicators = JSON.parse(readFileSync('config/indicators.json', 'utf8'));
const config = JSON.parse(readFileSync('config/facts.json', 'utf8'));
const ind = (id: string) => indicators.find((i: { id: string }) => i.id === id);

const YEARS = Array.from({ length: 12 }, (_, i) => 2014 + i);
const TERYT = ['0201011', '0201022', '0201033', '0202011', '0202022', '0203011', '0203022', '0204011'];
const POP = [100000, 80000, 60000, 40000, 20000, 9000, 3000, 50000]; // [6] mała gmina, [7] zmiana granic
const units: FactUnit[] = TERYT.map((teryt, i) => ({ teryt, name: `Gmina ${i + 1}`, level: 'gmi', parent: teryt.slice(0, 4) }));
const series = (f: (i: number, y: number) => number) => Object.fromEntries(TERYT.map((t, i) => [t, YEARS.map((y) => f(i, y))]));
const values = (): Record<string, IndicatorValues> => ({
  population: { years: YEARS, values: series((i, y) => Math.round(POP[i] * (1 + 0.01 * (y - 2014)))) },
  // powierzchnia = ludność ÷ gęstość: gmina 8 podwaja powierzchnię w 2020 (zmiana granic)
  density: { years: YEARS, values: series((i, y) => Math.round(((POP[i] * (1 + 0.01 * (y - 2014))) / (i === 7 && y >= 2020 ? 200 : 100)) * 10) / 10) },
  'median-age': { years: YEARS, values: series((i, y) => 30 + i + (y - 2014) * 0.1) },
  'income-per-capita': { years: YEARS, values: series((i, y) => (i === 6 ? 9000 : i === 7 ? 8500 : 4000 + i * 100) + (y - 2014) * 50) },
});
const dailyFact = (u: string, id: string, v: number, strength: number, dir = 1) => ({ u, n: 'x', f: ['F1', id, 2025, v, strength, dir, 1, 8, 0] });
const base = (): MaterialsInput => {
  const v = values();
  return {
    today: '2026-11-26',
    indicators,
    values: v,
    units,
    config,
    gminaMinPopulation: 5000,
    fresh: {
      'median-age': { year: 2025, since: '2026-11-24T08:00:00.000Z' },
      'income-per-capita': { year: 2025, since: '2026-11-25T08:00:00.000Z' },
      population: { year: 2025, since: '1970-01-01T00:00:00.000Z' },
    },
    premieres: [
      { date: '2026-11-25', title: 'Dochody gmin w 2025 r.', href: 'https://stat.gov.pl/dochody', main: ['income-per-capita'] },
      { date: '2026-11-10', title: 'Stara publikacja', href: 'https://stat.gov.pl/stara', main: ['density'] },
    ],
    daily: [
      dailyFact('0201011', 'median-age', v['median-age'].values['0201011'][11] as number, 9.4),
      dailyFact('0201011', 'population', v.population.values['0201011'][11] as number, 11.7),
    ],
  };
};
const noNews = (): MaterialsInput => ({ ...base(), fresh: {}, premieres: [] });

describe('W29-D08 pakiet: kolejność priorytetów', () => {
  it('premiera jest pierwsza, świeży wskaźnik drugi, potem skrajności', () => {
    const items = buildMaterials(base()).items;
    expect(items.map((i) => i.kind).slice(0, 2)).toEqual(['premiere', 'fresh']);
    expect(items[0].indicatorId).toBe('income-per-capita');
    expect(items[0].premiere?.title).toBe('Dochody gmin w 2025 r.');
    expect(items[1].indicatorId).toBe('median-age');
    expect(items.slice(2).every((i) => i.kind === 'extreme')).toBe(true);
    expect(items.length).toBeLessThanOrEqual(8);
  });
  it('premiera starsza niż 7 dni nie wchodzi do pakietu', () => {
    expect(buildMaterials(base()).items.some((i) => i.premiere?.title === 'Stara publikacja')).toBe(false);
  });
  it('bez premier i świeżych danych pakiet zawiera skrajności', () => {
    const items = buildMaterials(noNews()).items;
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.kind === 'extreme')).toBe(true);
    expect(items.some((i) => i.indicatorId === 'population')).toBe(true);
  });
  it('temat na czasie (trendBoost) trafia na koniec pakietu', () => {
    const input = noNews();
    input.config = { ...config, trendBoost: { Ludność: 1.4 } };
    const items = buildMaterials(input).items;
    expect(items.at(-1)?.kind).toBe('trend');
    expect(items.at(-1)?.topic).toBe('Ludność');
  });
});

describe('W29-D08 pakiet: ranking, źródło, ostrzeżenia', () => {
  const premiere = () => buildMaterials(base()).items[0];
  it('ranking pomija gminy poniżej progu ludności i ze zmianą granic', () => {
    const r = premiere().ranking;
    const all = [...r.top, ...r.bottom].map((x) => x.teryt);
    expect(all).not.toContain('0203022'); // 3000 mieszkańców
    expect(all).not.toContain('0204011'); // zmiana granic w 2020
    expect(r.compared).toBe(6);
    expect(r.top).toHaveLength(5);
    expect(r.bottom).toHaveLength(5);
    expect(r.top[0].teryt).toBe('0203011');
    expect(r.top[0].rank).toBe(1);
    expect(r.bottom[0].teryt).toBe('0201011');
    expect(r.bottom[0].rank).toBe(6);
  });
  it('pozycja ma źródło z rokiem, bdlVarId i link do mapy z parametrami', () => {
    for (const it of buildMaterials(base()).items) {
      expect(it.source.text).toBe(`GUS, BDL, ${it.year}`);
      expect(it.source.bdlVarId).toBe(ind(it.indicatorId).bdlVarId);
      const url = new URL(it.source.map, 'https://x.pl');
      expect(url.pathname).toBe('/mapa');
      expect(url.searchParams.get('i')).toBe(it.indicatorId);
      expect(url.searchParams.get('y')).toBe(String(it.year));
      expect(url.searchParams.get('u')).toBe(it.teryt);
    }
  });
  it('liczba ma jednostkę, kontekst średnią i zmianę w 10 lat', () => {
    const it = premiere();
    expect(it.value.text).toMatch(/zł/);
    expect(it.context.average).toBeDefined();
    expect(it.context.change10).toMatch(/od 2015 r\./);
  });
  it('ostrzega przy małej gminie i zmianie granic', () => {
    const it = premiere(); // liderem premiery jest gmina 7 (3000 mieszkańców)
    expect(it.teryt).toBe('0203022');
    expect(it.warnings.join(' ')).toMatch(/mała gmina/);
    const input = base();
    input.values['income-per-capita'].values['0204011'] = YEARS.map((y) => 20000 + y);
    const b = buildMaterials(input).items[0];
    expect(b.teryt).toBe('0204011');
    expect(b.warnings.join(' ')).toMatch(/zmiana granic/);
  });
  it('ostrzega o przerwie w serii', () => {
    const input = base();
    input.values['income-per-capita'].values['0203022'][8] = null;
    expect(buildMaterials(input).items[0].warnings.join(' ')).toMatch(/przerwa w serii/);
  });
});

describe('W29-D08 pakiet: tytuły', () => {
  it('tytuł ma do 90 znaków i pochodzi z szablonu zdań', () => {
    const items = buildMaterials(base()).items;
    for (const it of items) {
      expect(it.title.length).toBeLessThanOrEqual(90);
      expect(it.sentence.startsWith(it.title.replace(/…$/, ''))).toBe(true);
      expect(it.sentence).toMatch(/najwyższa wartość|najniższa wartość|wzrost|spadek|mediany/);
    }
  });
  it('tytuł świeżego faktu jest zdaniem z sentences.ts dla tego samego faktu', () => {
    const input = base();
    const fresh = buildMaterials(input).items[1];
    const fact = decodeFact(input.daily[0].u, input.daily[0].f);
    const i = ind('median-age');
    const sentence = factSentence(fact, { indicator: { name: i.name, unit: i.unit }, level: 'gmi' })!;
    expect(fresh.sentence).toBe(sentence);
    expect(fresh.title).toBe(sentence.length <= 90 ? sentence : `${sentence.slice(0, 89).replace(/\s+\S*$/, '')}…`);
  });
});

describe('W29-D08 pakiet: wyjście', () => {
  it('latest.json i .md są deterministyczne dla tych samych danych', () => {
    const a = buildMaterials(base());
    const b = buildMaterials(base());
    expect(board.materialsJson(a)).toBe(board.materialsJson(b));
    expect(board.renderMaterialsMarkdown(a, { site: 'https://faktografia.eu' })).toBe(board.renderMaterialsMarkdown(b, { site: 'https://faktografia.eu' }));
    expect(JSON.parse(board.materialsJson(a)).items).toHaveLength(a.items.length);
  });
  it('plik .md ma tytuł z datą, źródło i link do mapy każdej pozycji', () => {
    const pack = buildMaterials(base());
    const md = board.renderMaterialsMarkdown(pack, { site: 'https://faktografia.eu' });
    expect(md).toContain('# Do materiałów – 2026-11-26');
    for (const it of pack.items) {
      expect(md).toContain(it.title);
      expect(md).toContain(`https://faktografia.eu${it.source.map}`);
      expect(md).toContain(it.source.text);
    }
  });
});

describe('W29-D08 tablica kalendarium i przebieg', () => {
  it('tablica ma sekcję „Do materiałów” z tytułami i linkami', () => {
    const pack = buildMaterials(base());
    const sections = board.buildSections({ today: '2026-11-26', ledger: null, available: null, start: null, fresh: {}, materials: pack.items });
    const s = sections.find((x: { title: string }) => x.title === 'Do materiałów');
    expect(s.rows).toHaveLength(pack.items.length);
    expect(s.rows[0]).toContain(pack.items[0].title);
    expect(s.rows[0]).toContain(pack.items[0].source.map);
  });
  it('przebieg: w poniedziałek albo w dniu nowych „downloaded”', () => {
    const ledger = (on: string) => ({ entries: [{ date: on, library: [{ id: 1, state: 'downloaded', on }] }] });
    expect(board.shouldBuildMaterials({ today: '2026-11-30', ledger: null })).toBe(true); // poniedziałek
    expect(board.shouldBuildMaterials({ today: '2026-11-26', ledger: null })).toBe(false);
    expect(board.shouldBuildMaterials({ today: '2026-11-26', ledger: ledger('2026-11-26') })).toBe(true);
    expect(board.shouldBuildMaterials({ today: '2026-11-26', ledger: ledger('2026-11-25') })).toBe(false);
  });
});

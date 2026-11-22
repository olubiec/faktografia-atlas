import { describe, expect, it } from 'vitest';
import units from '../fixtures/seo/units.json';
import profile from '../fixtures/seo/profile-12.json';
import indicators from '../../config/indicators.json';
import { buildUnitPaths, type SlugUnit } from '../../src/core/seo/slug';
import { buildUnitPage, type IndicatorMeta, type ProfileShard } from '../../src/core/seo/unit-page';

const ALL = units as SlugUnit[];
const ctx = { units: ALL, paths: buildUnitPaths(ALL), indicators: indicators as IndicatorMeta[] };
const shard = profile as unknown as ProfileShard;
const page = (teryt: string) => buildUnitPage(ALL.find((u) => u.teryt === teryt)!, shard, ctx)!;
const GMINY = ['1201011', '1201022', '1201032', '1209033'];

describe('W25-S06: model strony miejsca', () => {
  it('tytuły i opisy 4 gmin są unikalne i mieszczą się w limitach', () => {
    const pages = GMINY.map(page);
    expect(new Set(pages.map((p) => p.title)).size).toBe(4);
    expect(new Set(pages.map((p) => p.description)).size).toBe(4);
    for (const p of pages) {
      expect(p.title.length).toBeLessThanOrEqual(65);
      expect(p.description.length).toBeGreaterThanOrEqual(120);
      expect(p.description.length).toBeLessThanOrEqual(160);
    }
    const bochnia = page('1201011');
    const pop = shard.units['1201011']!.find((e) => e.indicatorId === 'population')!;
    expect(bochnia.description).toContain(new Intl.NumberFormat('pl-PL').format(pop.value!).replace(/ /g, ' '));
    expect(bochnia.description).toContain(String(pop.year));
    expect(bochnia.title).toMatch(/^Gmina miejska Bochnia/);
  });

  it('zdania i tabela bez undefined/NaN/null, liczby w formacie pl-PL', () => {
    for (const t of ['12', '1201', '1261011', ...GMINY]) {
      const p = page(t);
      const text = [p.title, p.description, p.h1, ...p.lead, ...p.rows.flatMap((r) => Object.values(r).filter((v) => v !== null).map(String))].join(' | ');
      expect(text).not.toMatch(/undefined|NaN|\bnull\b/);
      expect(p.lead.length).toBeGreaterThanOrEqual(3);
      expect(p.lead.length).toBeLessThanOrEqual(5);
      for (const s of p.lead) expect(s).toMatch(/\d/);
    }
    expect(page('1201011').lead[0]).toMatch(/\d{2} \d{3}/);
  });

  it('gmina z małą liczbą danych jest nieindeksowana, pozostałe tak', () => {
    expect(page('1201072').indexable).toBe(false);
    for (const t of ['12', '1201', '1261011', ...GMINY]) expect(page(t).indexable).toBe(true);
  });

  it('miasto na prawach powiatu: rodzaj i jeden model dla obu TERYT', () => {
    const a = page('1261');
    const b = page('1261011');
    expect(a.kindLabel).toBe('Miasto na prawach powiatu');
    expect(b.kindLabel).toBe('Miasto na prawach powiatu');
    expect(a.path).toBe('/miasto/krakow');
    expect(b.path).toBe(a.path);
    expect(b.links.parents.map((l) => l.path)).toEqual(['/wojewodztwo/malopolskie']);
  });

  it('tabela: kolejność z configu, miejsca i zmiana w czasie, wartość powiatu przy gminie', () => {
    const p = page('1201011');
    expect(p.rows.map((r) => r.indicatorId)).toEqual(indicators.map((i) => i.id));
    expect(p.rows[0]!.rankVoivodeship).toMatch(/^\d+\. z \d+ w województwie$/);
    expect(p.rows[0]!.rankNational).toMatch(/^\d+\. z 2479 w Polsce$/);
    expect(p.rows[0]!.change10).toMatch(/^[+−]?\d/);
    expect(p.rows.find((r) => r.indicatorId === 'unemployment-rate')!.note).toBe('wartość dla powiatu');
    expect(p.lastmod).toBe(shard.generatedAt);
  });

  it('linki: nadrzędne, podrzędne i sąsiedzi', () => {
    const p = page('1201011');
    expect(p.links.parents.map((l) => l.path)).toEqual(['/powiat/bochenski', '/wojewodztwo/malopolskie']);
    const county = page('1201');
    expect(county.links.children.some((l) => l.path === '/gmina/bochnia-miasto')).toBe(true);
    expect(page('12').links.children.length).toBeGreaterThan(10);
    expect(p.links.neighbors.length).toBeGreaterThan(0);
    expect(p.links.neighbors.length).toBeLessThanOrEqual(6);
  });
});

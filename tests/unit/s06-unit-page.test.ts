import { describe, expect, it } from 'vitest';
import indicators from '../../config/indicators.json';
import profileData from '../fixtures/seo/profile-12.json';
import unitsData from '../fixtures/seo/units.json';
import { buildUnitPaths, type SlugUnit } from '../../src/core/seo/slug';
import { buildUnitPage, type PageProfile, type UnitPage } from '../../src/core/seo/unit-page';

// Wycinek prawdziwego public/data/profiles/12.json (opis w polu $opis pliku).
const profile = profileData as unknown as PageProfile;
const units = unitsData as SlugUnit[];
const ctx = { units, paths: buildUnitPaths(units), indicators };
const unit = (teryt: string) => units.find((u) => u.teryt === teryt)!;
const page = (teryt: string) => buildUnitPage(unit(teryt), profile, ctx);

const GMINY = ['1201011', '1206162', '1219053', '1219022']; // miejska, wiejska, miejsko-wiejska, wiejska
const POOR = '1206012'; // Czernichów z wyciętymi wartościami
const ALL = ['12', '1206', '1219', '1261', '1261011', ...GMINY, POOR];

const pageTexts = (p: UnitPage) => [
  p.title,
  p.description,
  p.h1,
  ...p.lead,
  ...p.rows.flatMap((r) => [r.name, r.value, r.rankNational ?? '', r.rankVoivodeship ?? '', r.change5 ?? '', r.change10 ?? '']),
];

describe('S06 tytuły i opisy', () => {
  const pages = GMINY.map(page);

  it('dla 4 gmin są unikalne i mieszczą się w limitach', () => {
    expect(new Set(pages.map((p) => p.title)).size).toBe(4);
    expect(new Set(pages.map((p) => p.description)).size).toBe(4);
    for (const p of pages) {
      expect(p.title.length).toBeLessThanOrEqual(65);
      expect(p.description.length).toBeGreaterThanOrEqual(120);
      expect(p.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('tytuł ma wzór „Gmina X – ludność, bezrobocie, dochody (rok)”', () => {
    expect(page('1219053').title).toBe('Gmina Wieliczka – ludność, bezrobocie, dochody (2025)');
    expect(page('1219053').h1).toBe('Gmina Wieliczka');
  });

  it('opis zawiera liczbę ludności z danych i rok', () => {
    for (const t of GMINY) {
      const pop = profile.units[t].find((i) => i.indicatorId === 'population')!;
      const formatted = new Intl.NumberFormat('pl-PL', { useGrouping: 'always' }).format(pop.value!).replace(/ /g, ' ');
      const p = page(t);
      expect(p.description).toContain(formatted);
      expect(p.description).toContain(String(pop.year));
    }
  });
});

describe('S06 zdania i tabela', () => {
  it('bez undefined, NaN, null; liczby w formacie pl-PL', () => {
    for (const t of ALL) {
      for (const text of pageTexts(page(t))) expect(text).not.toMatch(/undefined|NaN|null|Infinity/);
    }
    const lead = page('1219053').lead;
    expect(lead[0]).toMatch(/70 471 osób/);
    expect(lead[0]).toMatch(/\d+,\d% (więcej|mniej) niż w 2015 r\./);
    // Brak liczb w formacie angielskim (przecinek tysięcy, kropka dziesiętna).
    for (const s of lead) expect(s).not.toMatch(/\d,\d{3}\b|\d\.\d/);
  });

  it('lead ma 3–5 zdań, każde z liczbą i rokiem', () => {
    for (const t of [...GMINY, '1206', '12', '1261']) {
      const lead = page(t).lead;
      expect(lead.length).toBeGreaterThanOrEqual(3);
      expect(lead.length).toBeLessThanOrEqual(5);
      for (const s of lead) {
        expect(s).toMatch(/\d/);
        expect(s).toMatch(/\b(19|20)\d{2}\b/);
      }
    }
  });

  it('przy braku danych zdanie się pomija (bez „brak danych”)', () => {
    const p = page(POOR);
    for (const text of [...p.lead, p.description]) expect(text).not.toContain('brak danych');
    expect(p.rows).toHaveLength(5);
  });

  it('wiersze w kolejności z config/indicators.json, z miejscem w województwie i w Polsce', () => {
    const rows = page('1219053').rows;
    expect(rows.map((r) => r.indicatorId)).toEqual(indicators.map((i) => i.id));
    const pop = rows[0];
    expect(pop.value).toBe('70 471 osób');
    expect(pop.rankVoivodeship).toBe('4. z 183 w województwie');
    expect(pop.rankNational).toBe('48. z 2 479 w Polsce');
    expect(pop.change5).toMatch(/^\+\d+,\d% od 2020 r\.$/);
    expect(pop.change10).toMatch(/^\+\d+,\d% od 2015 r\.$/);
    expect(rows.find((r) => r.indicatorId === 'unemployment-rate')?.fromParent).toBe('1219');
  });
});

describe('S06 indeksowanie i lastmod', () => {
  it('gmina z małą liczbą danych ma indexable: false, pozostałe true', () => {
    expect(page(POOR).indexable).toBe(false);
    for (const t of ALL.filter((t) => t !== POOR)) expect(page(t).indexable).toBe(true);
  });

  it('lastmod = generatedAt z pliku profilu', () => {
    expect(page('1219053').lastmod).toBe(profile.generatedAt);
  });
});

describe('S06 rodzaj i miasto na prawach powiatu', () => {
  it('rodzaj z TERYT', () => {
    expect(page('12').kind).toBe('województwo');
    expect(page('1206').kind).toBe('powiat');
    expect(page('1201011').kind).toBe('gmina miejska');
    expect(page('1206162').kind).toBe('gmina wiejska');
    expect(page('1219053').kind).toBe('gmina miejsko-wiejska');
  });

  it('miasto na prawach powiatu ma rodzaj „miasto na prawach powiatu” i jeden model dla obu TERYT', () => {
    const a = page('1261');
    const b = page('1261011');
    expect(a.kind).toBe('miasto na prawach powiatu');
    expect(b).toEqual(a);
    expect(a.path).toBe('/miasto/krakow');
    expect(a.h1).toBe('Kraków');
  });
});

describe('S06 linki', () => {
  it('gmina: powiat i województwo jako nadrzędne, sąsiedzi z rankingu ludności', () => {
    const { parents, children, neighbours } = page('1219053').links;
    expect(parents.map((l) => l.path)).toEqual(['/powiat/wielicki', '/wojewodztwo/malopolskie']);
    expect(children).toEqual([]);
    expect(neighbours.length).toBeGreaterThan(0);
    expect(neighbours.length).toBeLessThanOrEqual(6);
    expect(neighbours.map((l) => l.teryt)).not.toContain('1219053');
    expect(neighbours.map((l) => l.teryt)).not.toContain('1261011');
  });

  it('powiat ma gminy, województwo ma powiaty; każdy link ma adres', () => {
    const pow = page('1219').links;
    expect(pow.children.map((l) => l.teryt)).toEqual(['1219012', '1219022', '1219032', '1219043', '1219053']);
    const woj = page('12').links;
    expect(woj.parents).toEqual([]);
    expect(woj.children).toHaveLength(22);
    expect(woj.children.map((l) => l.path)).toContain('/miasto/krakow');
    for (const l of [...pow.children, ...woj.children, ...pow.parents]) expect(l.path).toMatch(/^\/[a-z]+\/[a-z0-9-]+$/);
  });
});

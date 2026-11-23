import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import factsConfig from '../../config/facts.json';
import indicatorsData from '../../config/indicators.json';
import listsData from '../../config/lists.json';
import fixture from '../fixtures/f04/opolskie.json';
import { buildFacts } from '../../src/core/facts/build';
import { monthBoost, monthGroups, upcomingPeaks } from '../../src/core/facts/calendar';
import { buildNewsPage, newYears, type NewsContext } from '../../src/core/facts/news';
import { buildNewsSite, renderNewsPage } from '../../src/core/facts/news-page';
import { pickDaily } from '../../src/core/facts/start';
import { finishFact } from '../../src/core/facts/strength';
import type { FactIndicator, FactsConfig, FactUnit } from '../../src/core/facts/types';
import type { IndicatorValues } from '../../src/core/profile/profile';
import { auditPages, readPage, summarize } from '../../src/core/seo/audit';
import { rankingHeadings, rankingSpecs } from '../../src/core/seo/ranking-template';
import { buildUnitPaths } from '../../src/core/seo/slug';

// Dane: wycinek prawdziwych serii GUS dla województwa opolskiego (84 jednostki, lata 2013–2025).
// Opole (1661011) ma zmianę granic w 2017 r. (przyłączenie sołectw) – skok ludności to nie „wzrost”.
const units = fixture.units as FactUnit[];
const values = fixture.values as unknown as Record<string, IndicatorValues>;
const indicators = indicatorsData as (FactIndicator & { higherIsBetter: boolean | null })[];
const config = factsConfig as unknown as FactsConfig;
const paths = buildUnitPaths(units);
const ctx: NewsContext = {
  units,
  paths,
  headings: rankingHeadings(units),
  indicators,
  values,
  gminaMinPopulation: listsData.gminaMinPopulation,
  relativeChangeUnits: config.relativeChangeUnits,
  boundaryJump: config.news!.boundaryJump,
  rows: config.news!.rows,
  recordMinYears: config.thresholds.recordMinYears,
};
const OPOLE = '1661011';
const PROSZKOW = '1609103'; // oddał sołectwa Opolu w 2017 r. (powierzchnia −2,4%, ludność −7,4%)
const ASSETS = { css: ['/assets/index-abc.css'] };
const pop = values.population!;
const at = (teryt: string, year: number) => pop.values[teryt]![pop.years.indexOf(year)]!;

describe('@F05 model strony „Nowe dane GUS”', () => {
  it('ma tytuł, adres i wzrosty/spadki policzone z danych (rok do roku)', () => {
    const page = buildNewsPage({ id: 'population', year: 2025 }, ctx)!;
    expect(page.path).toBe('/nowe-dane/population-2025');
    expect(page.h1).toBe('Nowe dane GUS: Ludność ogółem za 2025 r.');
    expect(page.title.length).toBeLessThanOrEqual(65);
    expect(page.title).toContain('2025');
    expect(page.level).toBe('gmi');
    expect(page.rises.length).toBeGreaterThan(0);
    expect(page.falls.length).toBeGreaterThan(0);

    // Pierwszy wzrost i pierwszy spadek zgadzają się z ręcznym przeliczeniem z values (gminy ≥ 5000 mieszkańców).
    const big = units.filter((u) => u.level === 'gmi' && at(u.teryt, 2025) >= 5000 && at(u.teryt, 2024) != null);
    const pct = big.map((u) => [u.teryt, at(u.teryt, 2025) / at(u.teryt, 2024) - 1] as const).sort((a, b) => b[1] - a[1]);
    expect(page.rises[0]!.teryt).toBe(pct[0]![0]);
    expect(page.falls[0]!.teryt).toBe(pct.at(-1)![0]);
    expect(page.rises[0]!.change).toMatch(/^\+\d/);
    expect(page.falls[0]!.change).toMatch(/^−\d/);
    expect(page.lead.join(' ')).toContain(page.rises[0]!.name);
  });

  it('pomija zmiany granic: Opole w 2017 r. nie jest „największym wzrostem”, a strona to mówi', () => {
    // Bez detektora Opole (+~10% ludności po przyłączeniu sołectw) byłoby pierwsze.
    expect(at(OPOLE, 2017) / at(OPOLE, 2016) - 1).toBeGreaterThan(0.05);
    const page = buildNewsPage({ id: 'population', year: 2017 }, ctx)!;
    const all = [...page.rises, ...page.falls, ...page.records].map((r) => r.teryt);
    expect(all).not.toContain(OPOLE);
    expect(all).not.toContain(PROSZKOW);
    expect(page.skippedBoundary).toBeGreaterThanOrEqual(2);
    expect(page.lead.join(' ')).toMatch(/zmiany granic/);
    // Wszystkie pokazane zmiany są małe (prawdziwe zmiany ludności w rok to ułamki procenta, nie −7%).
    for (const r of [...page.rises, ...page.falls]) expect(r.change).toMatch(/^[+−][0-4],\d%$/);
  });

  it('rekordy: nowa wartość wyższa (albo niższa) niż w każdym wcześniejszym roku serii', () => {
    const page = buildNewsPage({ id: 'population', year: 2025 }, ctx)!;
    for (const r of page.records) {
      const s = pop.values[r.teryt]!.filter((v): v is number => v != null);
      const last = s.at(-1)!;
      const before = s.slice(0, -1);
      expect(before.every((v) => v < last) || before.every((v) => v > last)).toBe(true);
      expect(r.change).toMatch(/^najwy|^najni/);
    }
  });

  it('brak roku w danych albo nieznany wskaźnik → brak strony', () => {
    expect(buildNewsPage({ id: 'population', year: 2030 }, ctx)).toBeNull();
    expect(buildNewsPage({ id: 'population', year: 2013 }, ctx)).toBeNull();
    expect(buildNewsPage({ id: 'nie-ma', year: 2025 }, ctx)).toBeNull();
  });

  it('dokument: jeden H1, tabele wzrostów i spadków, poprawny audyt (bez martwych linków i błędów)', () => {
    const { pages, skipped } = buildNewsSite([{ id: 'population', year: 2025 }, { id: 'avg-wage', year: 2025 }, { id: 'population', year: 2030 }], ctx, ASSETS);
    expect(skipped).toEqual([{ id: 'population', year: 2030 }]);
    expect(pages.map((p) => p.path)).toEqual(['/nowe-dane/avg-wage-2025', '/nowe-dane/population-2025', '/nowe-dane']);
    const html = renderNewsPage(buildNewsPage({ id: 'population', year: 2025 }, ctx)!, ASSETS);
    expect(html).toContain('Największe wzrosty');
    expect(html).toContain('Największe spadki');
    expect(html).not.toMatch(/undefined|NaN/);
    const known = ['/', '/mapa', ...paths.terytByPath.keys(), ...rankingSpecs(indicators, units).map((s) => s.path), '/temat/ludnosc', '/temat/pieniadze'];
    const { errors } = summarize(auditPages(pages.map((p) => readPage(p.path, p.html)), [], { knownPaths: known }));
    expect(errors).toEqual([]);
  });

  it('brak zatwierdzonych pozycji → brak stron (strona powstaje dopiero po scaleniu PR robota)', () => {
    expect(buildNewsSite([], ctx, ASSETS).pages).toEqual([]);
  });

  it('robot wykrywa nowy rok: tylko wskaźniki, których ostatni rok się przesunął', () => {
    const before = { population: [2023, 2024], 'avg-wage': [2023, 2024], density: [2024] };
    const after = { population: [2023, 2024, 2025], 'avg-wage': [2023, 2024], density: [2024], nowy: [2025] };
    expect(newYears(before, after)).toEqual([{ id: 'population', year: 2025 }]);
  });
});

describe('@F05 kalendarz tematów', () => {
  const build = buildFacts({ indicators, values, units, config });
  const groupOf = new Map(indicators.map((i) => [i.id, i.group]));
  const strengthIn = (month: number) => new Map(pickDaily(build, month).map((f) => [`${f.teryt}|${f.indicatorId}|${f.type}`, f]));

  it('w miesiącu z kalendarza fakty tematu mają wyższą siłę (×1,5), pozostałe bez zmian', () => {
    const jan = strengthIn(1); // styczeń – Praca
    const aug = strengthIn(8); // sierpień – Transport
    const both = [...jan].filter(([key]) => aug.has(key)).map(([key, f]) => ({ f, other: aug.get(key)!, group: groupOf.get(f.indicatorId) }));
    const praca = both.filter((x) => x.group === 'Praca');
    const rest = both.filter((x) => x.group !== 'Praca' && x.group !== 'Transport');
    expect(praca.length).toBeGreaterThan(0);
    expect(rest.length).toBeGreaterThan(0);
    for (const { f, other } of praca) {
      expect(f.strength).toBeGreaterThan(other.strength);
      expect(f.strength).toBeCloseTo(other.strength * 1.5, 1);
    }
    for (const { f, other } of rest) expect(f.strength).toBe(other.strength);
  });

  it('miesiąc może mieć listę grup (temat dopisany ręcznie), a fakt spoza tematu ma mnożnik 1', () => {
    const cfg = { ...config, calendar: { ...config.calendar, '3': ['Ludność', 'Mieszkania'] } };
    expect(monthGroups(cfg, 3)).toEqual(['Ludność', 'Mieszkania']);
    expect(monthBoost(cfg, 'Mieszkania', 3)).toBe(1.5);
    expect(monthBoost(cfg, 'Praca', 3)).toBe(1);
    expect(monthBoost(config, 'Praca', 1)).toBe(1.5);
    // Siła z silnika nie zależy od kalendarza – mnożnik nakłada dopiero dobór na start.
    const draft = build.byUnit.values().next().value!.selected[0]!;
    expect(finishFact(draft, config, draft.year).strength).toBe(finishFact(draft, cfg, draft.year).strength);
  });

  it('daty szczytów: strona tematu do odświeżenia 2–4 tygodnie przed szczytem', () => {
    const peaks = upcomingPeaks(config, new Date('2026-12-30T10:00:00Z'));
    expect(peaks.map((p) => [p.group, p.on, p.inDays])).toEqual([['Praca', '2027-01-22', 23]]);
    expect(upcomingPeaks(config, new Date('2026-01-20T10:00:00Z'))).toEqual([]);
  });
});

describe('@F05 robot: PR „Nowe dane” bez auto-scalania', () => {
  it('workflow tworzy osobną gałąź robot/nowe-dane-<id>-<rok> i PR do main, nigdy nie scala sam', () => {
    const yml = readFileSync('.github/workflows/fetch-data.yml', 'utf8');
    expect(yml).toContain('NB="robot/nowe-dane-$ID-$YEAR"');
    expect(yml).toContain('build-news.mjs detect --base origin/main');
    expect(yml).toMatch(/pulls" -f title="Nowe dane GUS/);
    expect(yml).not.toMatch(/auto-merge|enable_pr_auto_merge|pulls\/\$N\/merge|gh pr merge/);
  });
});

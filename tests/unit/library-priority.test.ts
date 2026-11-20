import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as prio from '../../scripts/data/library-priority.mjs';
import catalog from '../fixtures/library-catalog-sample.json';

const rawConfig = readFileSync('config/library-priority.json', 'utf8');
const config = JSON.parse(rawConfig);

type V = { id: number; subjectId: string; level: number; n1?: string; n2?: string; n3?: string; n4?: string; n5?: string };
const variables = Object.values(catalog.variables) as V[];
const sectionName = (v: V) => (catalog.subjects as Record<string, { path: string[] }>)[v.subjectId].path[0].trim();
const ids = (list: V[]) => list.map((v) => v.id);

describe('Biblioteka GUS – kolejka wg priorytetu', () => {
  it('„Ludność ogółem” (gmina) jest przed rozbiciem po wieku i płci', () => {
    // Bez przypinania, żeby sprawdzić samą punktację (72305 jest dziś też na liście przypiętych).
    const q = prio.sortQueueByPriority(variables, catalog, { ...config, pinnedIds: [] }, { done: {}, failed: {} }) as V[];
    const total = q.findIndex((v) => v.id === 72305);
    // Rozbicia „grupa wieku × płeć” z tego samego działu (np. „25-29 | kobiety”, „25-29 | ogółem”).
    const breakdowns = q.filter((v) => v.subjectId === 'P2137' && v.id !== 72305);
    expect(total).toBeGreaterThanOrEqual(0);
    expect(breakdowns.length).toBeGreaterThan(0);
    for (const b of breakdowns) expect(total).toBeLessThan(q.indexOf(b));
  });

  it('zmienne działu „Fundusze unijne” są za zmiennymi z działów o wadze 100', () => {
    const q = prio.sortQueueByPriority(variables, catalog, { ...config, pinnedIds: [] }, {}) as V[];
    const weight = (v: V) => config.sectionWeights[sectionName(v)] ?? config.defaultSectionWeight;
    const firstEu = q.findIndex((v) => sectionName(v).startsWith('FUNDUSZE UNIJNE'));
    const lastTop = q.map(weight).lastIndexOf(100);
    expect(firstEu).toBeGreaterThan(-1);
    // Limit udziału działu może wymieszać końcówkę, ale unijne nie wchodzą przed połową zmiennych o wadze 100.
    const topBeforeEu = q.slice(0, firstEu).filter((v) => weight(v) === 100).length;
    expect(topBeforeEu).toBeGreaterThanOrEqual(Math.floor(q.filter((v) => weight(v) === 100).length / 2));
    expect(lastTop).toBeGreaterThan(-1);
    const euScore = Math.max(...variables.filter((v) => sectionName(v).startsWith('FUNDUSZE UNIJNE')).map((v) =>
      prio.priorityScore(v, (catalog.subjects as Record<string, { path: string[] }>)[v.subjectId].path, config)));
    const topScores = variables.filter((v) => weight(v) === 100).map((v) =>
      prio.priorityScore(v, (catalog.subjects as Record<string, { path: string[] }>)[v.subjectId].path, config));
    expect(euScore).toBeLessThan(Math.min(...topScores));
  });

  it('przypięte zmienne są zawsze pierwsze, nieudane na końcu, a kolejność jest powtarzalna', () => {
    const cfg = { ...config, pinnedIds: [1259, 346] };
    const state = { done: {}, failed: { 72305: 1 } };
    const a = prio.sortQueueByPriority(variables, catalog, cfg, state) as V[];
    const b = prio.sortQueueByPriority([...variables].reverse(), catalog, cfg, state) as V[];
    expect(ids(a).slice(0, 2)).toEqual([1259, 346]);
    expect(a[a.length - 1].id).toBe(72305);
    expect(ids(b)).toEqual(ids(a));
  });

  it('pomija pobrane i zmienne, które zawiodły 3 razy', () => {
    const q = prio.sortQueueByPriority(variables, catalog, config, { done: { 72305: '2026-11-01' }, failed: { 60559: 3 } }) as V[];
    expect(ids(q)).not.toContain(72305);
    expect(ids(q)).not.toContain(60559);
  });

  it('limit udziału działu: przy 100 zmiennych z jednego działu i 20 z innych pierwsze 50 ma ≥ 12 z innych', () => {
    const subjects = { A: { path: ['LUDNOŚĆ'] }, B: { path: ['KULTURA'] }, C: { path: ['TURYSTYKA'] } };
    const many: V[] = [];
    for (let i = 1; i <= 100; i++) many.push({ id: i, subjectId: 'A', level: 6, n1: 'ogółem' });
    for (let i = 101; i <= 120; i++) many.push({ id: i, subjectId: i % 2 ? 'B' : 'C', level: 6, n1: 'ogółem' });
    const cat = { subjects, variables: {} };
    const q = prio.sortQueueByPriority(many, cat, { ...config, pinnedIds: [] }, {}) as V[];
    expect(q.slice(0, 50).filter((v) => v.subjectId !== 'A').length).toBeGreaterThanOrEqual(12);
    // żaden prefiks nie przekracza 40% jednego działu, dopóki są inne zmienne
    for (let k = 1; k <= 30; k++) {
      expect(q.slice(0, k).filter((v) => v.subjectId === 'A').length).toBeLessThanOrEqual(Math.ceil(0.4 * k));
    }
    expect(q).toHaveLength(120);
  });

  it('podsumowanie przebiegu wylicza działy i liczbę pozostałych zmiennych', () => {
    const text = prio.summarizeBySection({ LUDNOŚĆ: 5, 'RYNEK PRACY': 3 }, 61000);
    expect(text).toContain('| LUDNOŚĆ | 5 |');
    expect(text).toContain('**8**');
    expect(text).toContain('61000');
  });
});

describe('Biblioteka GUS – limity API (checkWindows)', () => {
  // Plan z fetch-library.yml: 04:40 i 16:40 UTC po 3000 zapytań, nocny „Fetch data” 01:10 UTC ok. 750.
  const plan = [
    { name: 'biblioteka rano', startMinute: 4 * 60 + 40, requests: 3000 },
    { name: 'biblioteka wieczorem', startMinute: 16 * 60 + 40, requests: 3000 },
    { name: 'fetch-data', startMinute: 70, requests: 750 },
  ];

  it('przepuszcza obecny plan: 2 × 3000 + 750 na dobę', () => {
    const res = prio.checkWindows(plan);
    expect(res.windows.map((w: { name: string }) => w.name)).toEqual(['15m', '12h', '7d']);
    expect(res.ok).toBe(true);
    const week = res.windows.find((w: { name: string }) => w.name === '7d');
    expect(week.peak).toBe(47250);
  });

  it('odrzuca zły plan: dwa przebiegi po 3000 w odstępie 6 h', () => {
    const bad = [
      { name: 'a', startMinute: 4 * 60 + 40, requests: 3000 },
      { name: 'b', startMinute: 10 * 60 + 40, requests: 3000 },
      { name: 'fetch-data', startMinute: 70, requests: 750 },
    ];
    const res = prio.checkWindows(bad);
    expect(res.ok).toBe(false);
    expect(res.windows.find((w: { name: string }) => w.name === '12h').ok).toBe(false);
  });

  it('odrzuca zbyt szybkie tempo (okno 15 min) i zbyt duży plan tygodniowy', () => {
    expect(prio.checkWindows([{ name: 'szybki', startMinute: 0, requests: 3000, perSecond: 1 }]).ok).toBe(false);
    const heavy = [
      { name: 'a', startMinute: 0, requests: 3500 },
      { name: 'b', startMinute: 12 * 60, requests: 3500 },
      { name: 'c', startMinute: 6 * 60, requests: 200 },
    ];
    expect(prio.checkWindows(heavy).windows.find((w: { name: string }) => w.name === '7d').ok).toBe(false);
  });
});

describe('config/library-priority.json', () => {
  it('ma poprawny kształt: wagi 0–100, liczby całkowite, bez duplikatów kluczy', () => {
    const weights = Object.values(config.sectionWeights) as number[];
    for (const w of weights) {
      expect(Number.isInteger(w)).toBe(true);
      expect(w).toBeGreaterThanOrEqual(0);
      expect(w).toBeLessThanOrEqual(100);
    }
    const block = rawConfig.slice(rawConfig.indexOf('"sectionWeights"'), rawConfig.indexOf('}', rawConfig.indexOf('"sectionWeights"')));
    const keys = [...block.matchAll(/"([^"]+)"\s*:/g)].map((m) => m[1].trim().toLocaleUpperCase('pl')).slice(1);
    expect(keys.length).toBe(weights.length);
    expect(new Set(keys).size).toBe(keys.length);
    expect(Number.isInteger(config.depthPenalty) && config.depthPenalty <= 0).toBe(true);
    expect(config.maxSectionShareInRun).toBeGreaterThan(0);
    expect(config.maxSectionShareInRun).toBeLessThanOrEqual(1);
    expect(new Set(config.pinnedIds).size).toBe(config.pinnedIds.length);
    for (const k of config.keywordBoosts) {
      expect(typeof k.match).toBe('string');
      expect(Number.isInteger(k.points)).toBe(true);
    }
  });

  it('nazwy działów w wagach istnieją w katalogu z biblioteki (próbka) lub w znanym spisie działów BDL', () => {
    const known = new Set(Object.values(catalog.subjects as Record<string, { parent: string | null; name: string }>)
      .filter((s) => !s.parent).map((s) => s.name.trim().toLocaleUpperCase('pl')));
    for (const name of ['LUDNOŚĆ', 'RYNEK PRACY', 'FUNDUSZE UNIJNE (DANE PÓŁROCZNE)']) expect(known.has(name)).toBe(true);
  });
});

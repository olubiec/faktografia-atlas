import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import current from '../fixtures/seo/gsc-f06-current.json';
import previous from '../fixtures/seo/gsc-f06-previous.json';
import s12current from '../fixtures/seo/gsc-searchanalytics-current.json';
import { createContext } from '../../src/core/facts/context';
import type { FactsConfig, FactsInput } from '../../src/core/facts/types';
import {
  expandTrendBoost,
  queryTopic,
  replaceTrendBoost,
  topicTrends,
  trendBoostMap,
  type TopicKeywords,
} from '../../src/core/facts/trend-boost';
import { pageMatchesQuery, renderSignals, topicCandidates } from '../../src/core/facts/topic-candidates';

const root = path.resolve(import.meta.dirname, '../..');
const keywords = JSON.parse(readFileSync(path.join(root, 'config/topic-keywords.json'), 'utf8')) as TopicKeywords;
const indicators = JSON.parse(readFileSync(path.join(root, 'config/indicators.json'), 'utf8')) as { id: string; group: string }[];
const factsText = readFileSync(path.join(root, 'config/facts.json'), 'utf8');
const pagesOf = (...weeks: { page: { rows?: { keys?: string[] }[] } }[]) =>
  weeks.flatMap((w) => (w.page.rows ?? []).map((r) => r.keys?.[0] ?? ''));

describe('F06 temat zapytania ze słownika (bez AI)', () => {
  it('przypisuje grupę wskaźników; polskie znaki i odmiana bez znaczenia', () => {
    expect(queryTopic('Nowe MIESZKANIA gminy', keywords)).toBe('Mieszkania');
    expect(queryTopic('ile mieszkań oddano', keywords)).toBe('Mieszkania');
    expect(queryTopic('bezrobotni powiat krakowski', keywords)).toBe('Praca');
    expect(queryTopic('lesistość gmin', keywords)).toBe('Środowisko');
    expect(queryTopic('samochody na 1000 mieszkańców', keywords)).toBe('Transport');
    expect(queryTopic('pogoda zakopane', keywords)).toBeNull();
    // „aut$” = cały wyraz: „autor” nie jest transportem
    expect(queryTopic('autor książki', keywords)).toBeNull();
  });

  it('każdy temat słownika istnieje jako grupa w config/indicators.json', () => {
    const groups = new Set(indicators.map((i) => i.group));
    for (const g of Object.keys(keywords.groups)) expect(groups.has(g)).toBe(true);
  });
});

describe('F06 mnożnik tematu (trendBoost)', () => {
  const trends = topicTrends(current.query, previous.query, keywords);
  const boost = trendBoostMap(trends);

  it('na nagranym fixture temat z +40% dostaje mnożnik 1,4', () => {
    const housing = trends.find((t) => t.topic === 'Mieszkania');
    expect(housing).toMatchObject({ current: 700, previous: 500, boost: 1.4 });
    expect(boost['Mieszkania']).toBe(1.4);
  });

  it('temat < 100 wyświetleń – 1,0 (mimo wzrostu +200%)', () => {
    const env = trends.find((t) => t.topic === 'Środowisko');
    expect(env).toMatchObject({ current: 60, previous: 20, boost: 1 });
    expect(boost['Środowisko']).toBeUndefined();
  });

  it('mnożnik najwyżej 1,5; spadek i brak poprzedniego tygodnia → 1,0', () => {
    expect(trends.find((t) => t.topic === 'Praca')?.boost).toBe(1.5);
    expect(trends.find((t) => t.topic === 'Ludność')?.boost).toBe(1);
    expect(trends.find((t) => t.topic === 'Transport')?.boost).toBe(1.25);
    // pierwszy tydzień danych: nie ma z czym porównać
    expect(trendBoostMap(topicTrends(current.query, { rows: [] }, keywords))).toEqual({});
    expect(trendBoostMap(topicTrends({}, {}, keywords))).toEqual({});
  });

  it('zapis do config/facts.json zmienia tylko pole trendBoost', () => {
    const next = replaceTrendBoost(factsText, boost);
    const parsed = JSON.parse(next) as FactsConfig;
    expect(parsed.trendBoost).toEqual({ Mieszkania: 1.4, Praca: 1.5, Transport: 1.25 });
    const before = factsText.split('\n');
    const after = next.split('\n');
    expect(after).toHaveLength(before.length);
    expect(after.filter((l, i) => l !== before[i])).toHaveLength(1);
    expect(replaceTrendBoost(next, {})).toBe(factsText);
  });
});

describe('F06 mnożnik w sile faktów', () => {
  it('grupa z trendBoost mnoży wagę wszystkich wskaźników grupy; jawny wskaźnik wygrywa', () => {
    const config = { trendBoost: { Mieszkania: 1.4, 'avg-wage': 1.2 } } as unknown as FactsConfig;
    const expanded = expandTrendBoost(config, indicators);
    expect(expanded.trendBoost['dwellings-per-1000']).toBe(1.4);
    expect(expanded.trendBoost['dwelling-area-per-person']).toBe(1.4);
    expect(expanded.trendBoost['avg-wage']).toBe(1.2);
    expect(expanded.trendBoost['population']).toBeUndefined();
  });

  it('kontekst silnika faktów widzi mnożnik po wskaźniku', () => {
    const config = JSON.parse(replaceTrendBoost(factsText, { Mieszkania: 1.4 })) as FactsConfig;
    const input = { indicators: indicators, values: {}, units: [], config } as unknown as FactsInput;
    expect(createContext(input).input.config.trendBoost['dwellings-per-1000']).toBe(1.4);
  });
});

describe('F06 Tematy do rozważenia', () => {
  const pages = pagesOf(current, previous);
  const list = topicCandidates(current.query, pages, keywords);

  it('zapytanie z pozycją 12 bez dopasowanej strony trafia do listy; z pozycją 3 – nie', () => {
    const queries = list.map((c) => c.query);
    expect(queries).toContain('lesistość gmin');
    // pozycja 3, też bez dopasowanej strony
    expect(queries).not.toContain('przyrost naturalny gminy');
    expect(queries).not.toContain('bezrobocie powiat krakowski');
    expect(list.find((c) => c.query === 'lesistość gmin')).toMatchObject({ position: 12, topic: 'Środowisko' });
  });

  it('zapytanie z dopasowaną stroną albo poza 8–30 nie trafia', () => {
    const queries = list.map((c) => c.query);
    // pozycja 12, ale jest /zestawienie/samochody
    expect(queries).not.toContain('samochody na 1000 mieszkańców gminy');
    // pozycja 18,9, ale jest /mapa
    expect(queries).not.toContain('mapa gmin polski');
    // pozycja 41
    expect(queries).not.toContain('pogoda zakopane');
    expect(queries).toEqual(['nowe mieszkania gminy', 'lesistość gmin']);
  });

  it('dopasowanie strony: wszystkie słowa adresu w zapytaniu (odmiana, polskie znaki)', () => {
    expect(pageMatchesQuery('https://faktografia.eu/wojewodztwo/malopolskie', 'ludność małopolska')).toBe(true);
    expect(pageMatchesQuery('https://faktografia.eu/powiat/krakowski', 'mediana wieku powiaty')).toBe(false);
    expect(pageMatchesQuery('https://faktografia.eu/', 'mapa gmin')).toBe(false);
  });

  it('najwyżej 10 pozycji, od największej liczby wyświetleń', () => {
    const rows = Array.from({ length: 14 }, (_, i) => ({ keys: [`zapytanie ${i}`], clicks: 0, impressions: 10 + i, position: 15 }));
    const many = topicCandidates({ rows }, [], keywords);
    expect(many).toHaveLength(10);
    expect(many[0].impressions).toBe(23);
  });

  it('działa też na fixture raportu S12 (mediana wieku – brak strony)', () => {
    const s12 = topicCandidates(s12current.query, pagesOf(s12current), keywords);
    expect(s12.map((c) => c.query)).toEqual(['mediana wieku powiaty']);
  });

  it('sekcja raportu: tabela tematów i informacja, że nic nie powstaje samo', () => {
    const md = renderSignals(topicTrends(current.query, previous.query, keywords), list);
    expect(md).toContain('## Tematy do rozważenia');
    expect(md).toContain('| nowe mieszkania gminy |');
    expect(md).toContain('Mieszkania');
    expect(md).toContain('1,4');
    expect(md).toMatch(/nie powstaje automatycznie/);
    expect(renderSignals([], [])).toContain('Brak zapytań');
  });
});

describe('F06 skrypt bez sekretu', () => {
  it('czytelny komunikat i kod 0, config/facts.json bez zmian, bez sieci', () => {
    const script = path.join(root, 'scripts/seo/gsc-topics.mjs');
    const env = { ...process.env };
    delete env.GSC_SERVICE_ACCOUNT;
    const res = spawnSync(process.execPath, [script, '--write'], { env, encoding: 'utf8', timeout: 20_000 });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('Brak sekretu GSC_SERVICE_ACCOUNT');
    expect(readFileSync(path.join(root, 'config/facts.json'), 'utf8')).toBe(factsText);
  });
});

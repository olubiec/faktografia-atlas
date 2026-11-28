import { describe, expect, it } from 'vitest';
import { buildAnomalies } from '@/core/facts/anomalies';
import { changeCard, fmtValue, neighbourLines, pickAnomalyCards } from '@/core/facts/anomaly-cards';
import { dedupeKey, isReadableName, normalizeUnit, perThousand, sourceKind, valenceFromName } from '@/core/facts/anomaly-sources';
import type { AnomalyShard } from '@/core/facts/anomaly-types';
import { findViolations } from '@/core/facts/tone-guard';

const N = 1600;
const gminas = Array.from({ length: N }, (_, i) => `02${String(i).padStart(5, '0')}`);
const dist = { m: 5, lo: 0, hi: 10, b: new Array<number>(20).fill(5) };

describe('wybór wskaźników z biblioteki', () => {
  it('odsetki i „na N” zostają, liczby bezwzględne przeliczamy na mieszkańców, sumy w zł odpadają', () => {
    expect(sourceKind({ n: 'ogółem', u: '%', c: 'A > B > Udział ludności z internetem' })).toBe('rate');
    expect(sourceKind({ n: 'Czytelnicy na 1000 ludności', u: 'osoba', c: 'A > B > Biblioteki' })).toBe('rate');
    expect(sourceKind({ n: 'Dzieci w klubach dziecięcych', u: 'osoba', c: 'A > B > Kluby' })).toBe('count');
    expect(sourceKind({ n: 'Wydatki na zasiłki rodzinne', u: 'zł', c: 'A > B > Zasiłki' })).toBeNull();
    expect(sourceKind({ n: 'Średnia trzyletnia liczba mieszkań', u: '-', c: 'A > B > Mieszkania' })).toBeNull();
  });
  it('nazwa podziałów na wiek i „gminy łącznie z …” nie jest czytelnym podmiotem', () => {
    expect(isReadableName('Ludność kobiety w wieku 14 lat')).toBe(false);
    expect(isReadableName('Gminy łącznie z miastami na prawach powiatu – dochody')).toBe(false);
    expect(isReadableName('Czytelnicy bibliotek publicznych')).toBe(true);
  });
  it('„na 10 tys.” i „na 1000” to jedna jednostka, wartość przeliczona; to samo mierzone dwa razy jest powtórzeniem', () => {
    expect(normalizeUnit('na 10 tys. ludności')).toEqual({ unit: 'na 1000 mieszkańców', factor: 0.1, changed: true });
    expect(normalizeUnit('na 1000 ludności')).toEqual({ unit: 'na 1000 mieszkańców', factor: 1, changed: false });
    expect(normalizeUnit('%').unit).toBe('%');
    expect(dedupeKey('Podmioty na 10 tys. ludności')).toBe(dedupeKey('Podmioty na 1000 ludności'));
    expect(perThousand(30, 1500)).toBe(20);
    expect(perThousand(30, 0)).toBeNull();
  });
  it('kierunek „lepiej” tylko tam, gdzie jest jednoznaczny', () => {
    expect(valenceFromName('b1', 'Wypadki drogowe')).toBe('down');
    expect(valenceFromName('b2', 'Dzieci objęte opieką w żłobkach')).toBe('up');
    expect(valenceFromName('b3', 'Muzea łącznie z oddziałami')).toBeNull();
  });
});

describe('zmiana: bez absurdalnych procentów', () => {
  const an = (from: number, to: number, unit = 'na 1000 mieszkańców'): AnomalyShard => ({
    m: [['b1', 'Przyrost naturalny', unit, 2025, 'u', 0, dist]],
    u: {},
    c: { '0200001': [0, from, to, 2015, 99] },
    n: {},
  });
  it('z 0 do −3,4 to różnica w jednostkach wskaźnika, nie „11567%”', () => {
    const card = changeCard(an(0, -3.4), '0200001', new Set()) as NonNullable<ReturnType<typeof changeCard>>;
    expect(card.main).toBe('Przyrost naturalny: spadek z 0 do −3,4 na 1000 mieszkańców od 2015 roku.');
    expect(card.main).not.toContain('%');
  });
  it('przy odsetkach zawsze punkty: „z 99,1% do 97,2%”', () => {
    const card = changeCard(an(99.1, 97.2, '%'), '0200001', new Set()) as NonNullable<ReturnType<typeof changeCard>>;
    expect(card.main).toContain('spadek z 99,1 do 97,2%');
  });
  it('procent pojawia się, gdy punkt wyjścia jest sensowny, i pomija zmiany poniżej 10%', () => {
    expect(changeCard(an(4, 6), '0200001', new Set())?.main).toContain('wzrost o 50%');
    expect(changeCard(an(5, 5.2), '0200001', new Set())).toBeNull();
  });
});

describe('anomalie z całej biblioteki', () => {
  // Źródło A: gmina 0200010 skrajnie wysoko; B: te same wartości dla wszystkich (nic nie odstaje); C: temat jak A (powtórka tematu).
  const years = [2015, 2025];
  const series = (f: (i: number) => [number, number]) => Object.fromEntries(gminas.map((t, i) => [t, f(i)]));
  const sources = [
    { id: 'bA', name: 'Zgony', unit: 'na 1000 mieszkańców', topic: 'ruch', years, values: series((i) => [10, i === 10 ? 90 : 10 + (i % 7)]), derived: false },
    { id: 'bB', name: 'Wskaźnik płaski', unit: '%', topic: 'inne', years, values: series(() => [5, 5]), derived: false },
    { id: 'bC', name: 'Zgony niemowląt', unit: 'na 1000 mieszkańców', topic: 'ruch', years, values: series((i) => [1, i === 10 ? 80 : 1 + (i % 3)]), derived: true },
  ];
  const population = Object.fromEntries(gminas.map((t, i) => [t, 1000 + i]));
  const neighbours = { '0200010': ['0200011', '0200500'] };
  const shards = buildAnomalies({ sources, gminas, population, neighbours });
  const sh = shards['02'];

  it('gmina odstająca dostaje wskaźnik z kierunkiem i swoją wartość, płaski wskaźnik jej nie wyróżnia', () => {
    const cards = pickAnomalyCards(sh, '0200010');
    const ids = cards.map((c) => c.indicatorId);
    expect(ids).toContain('bA');
    expect(ids).not.toContain('bB');
    expect(cards[0].role).toBe('unusual');
    expect(cards[0].main).toBe('Zgony niemowląt: 40 razy więcej niż w typowej gminie.');
  });
  it('najbardziej odstający wskaźnik jest w pliku pierwszy, a wskaźnik zawsze występuje najwyżej raz', () => {
    const picked = sh.u['0200010'].filter((_, k) => k % 4 === 0).map((i) => sh.m[i][0]);
    expect(picked[0]).toBe('bC');
    expect(new Set(picked).size).toBe(picked.length);
  });
  it('sąsiad o najbliższej liczbie ludności i te same wskaźniki', () => {
    const view = neighbourLines(sh, '0200010');
    expect(view?.neighbour).toBe('0200011');
    expect(view?.lines.map((l) => l.indicatorId)).toContain('bA');
    expect(view?.lines.every((l) => l.mine.endsWith('na 1000 mieszkańców') && l.theirs.endsWith('na 1000 mieszkańców'))).toBe(true);
  });
  it('wszystkie liczby na karcie mają jedną jednostkę wskaźnika, bez „wartość” i bez „na 10 tys.”', () => {
    for (const c of pickAnomalyCards(sh, '0200010')) {
      const text = `${c.main} ${c.reference} ${c.source}`;
      expect(text).not.toMatch(/wartość\.|na 10 tys\.|1 na \d/u);
      expect(findViolations(c.main)).toEqual([]);
    }
  });
  it('gmina bez wpisów nie dostaje kart', () => {
    expect(pickAnomalyCards(sh, '0209999')).toEqual([]);
    expect(pickAnomalyCards(undefined, '0200010')).toEqual([]);
  });
  it('formatowanie: jednostka zawsze w tej samej formie', () => {
    expect(fmtValue(6.6, 'na 1000 mieszkańców')).toBe('6,6 na 1000 mieszkańców');
    expect(fmtValue(12, '%')).toBe('12%');
    expect(fmtValue(3, '')).toBe('3');
  });
});

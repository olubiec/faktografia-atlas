import { describe, expect, it } from 'vitest';
import config from '../../config/facts.json';
import fixture from '../fixtures/facts/opolskie.json';
import { buildFacts } from '../../src/core/facts/build';
import { buildStart, type DailyEntry, type FactsStart } from '../../src/core/facts/start';
import type { FactIndicator, FactsConfig, FactsInput, FactUnit, IndicatorValues } from '../../src/core/facts/types';
import { dailyEntry } from '../../src/core/start/discoveries';
import { contrastSentence, discoveryDeck } from '../../src/core/start/extremes';

// Odkrycie dnia jako para skrajności i talia ciekawostek („Pokaż inną ciekawostkę”).
// Wpisy w zapisie facts-start.json, wartości przepisane z public/data/facts-start.json (2026-11-17).
const e = (u: string, n: string, f: (string | number)[]): DailyEntry => ({ u, n, f });
const WARSZAWA = e('1465011', 'Warszawa', ['F1', 'population', 2025, 1866729, 11.73, 1, 1, 2479, 0]);
const KRYNICA = e('2210011', 'Krynica Morska', ['F1', 'population', 2025, 1127, 11.73, -1, 1, 2479, 0]);
const PODKOWA = e('1405021', 'Podkowa Leśna', ['F1', 'median-age', 2026, 49, 9.38, 1, 1, 2473, 0]);
const SIERAKOWICE = e('2205042', 'Sierakowice', ['F1', 'median-age', 2026, 39, 9.38, -1, 1, 2473, 0]);
const DZIWNOW = e('3207032', 'Dziwnów', ['F1', 'dwelling-area-per-person', 2025, 60.1, 9, 1, 1, 2479, 0]);
const SZYDLOWIEC = e('1424', 'powiat szydłowiecki', ['F1', 'unemployment-rate', 2025, 22.1, 9, 1, 1, 380, 0]);
const POZNANSKI = e('3021', 'powiat poznański', ['F1', 'unemployment-rate', 2025, 1.2, 9, -1, 1, 380, 0]);

const start = (daily: DailyEntry[]): FactsStart => ({ generatedAt: '2026-11-17T10:00:00.000Z', daily, lists: [] });
// Dzień o indeksie 0 dla talii danej długości (dailyIndex = dni od 1970 mod długość).
const dayFor = (index: number, length: number) => new Date((length * 30_000 + index) * 86_400_000 + 3_600_000);

describe('Odkrycie dnia: para skrajności', () => {
  const s = start([WARSZAWA, PODKOWA, KRYNICA, DZIWNOW, SIERAKOWICE]);

  it('pierwsza karta talii to ta sama pozycja co Odkrycie dnia (ta sama dla wszystkich danego dnia)', () => {
    for (let k = 0; k < 5; k++) {
      const day = dayFor(k, 5);
      const deck = discoveryDeck(s, day);
      expect(deck[0].place).toBe(dailyEntry(s, day)!.n);
    }
  });

  it('najwyższa i najniższa wartość tego samego wskaźnika trafiają na jedną kartę: najmniej po lewej, najwięcej po prawej', () => {
    const deck = discoveryDeck(s, dayFor(0, 5));
    const card = deck[0].extremes!;
    expect(card.title).toBe('Ludność ogółem');
    expect(card.low).toMatchObject({ name: 'Krynica Morska', label: 'Najmniej', number: '1\u00a0127' });
    expect(card.high).toMatchObject({ name: 'Warszawa', label: 'Najwięcej', number: '1\u00a0866\u00a0729' });
    // Każdy biegun prowadzi do mapy z tym miejscem zaznaczonym.
    expect(card.low.href).toBe('/mapa?i=population&y=2025&u=2210011&l=gmi');
    expect(card.high.href).toBe('/mapa?i=population&y=2025&u=1465011&l=gmi');
    // Podpis z liczbą porównanych jednostek i rokiem.
    expect(card.scope).toBe('Skrajne wartości wśród 2\u00a0479 gmin w Polsce, 2025');
  });

  it('drugi biegun nie powtarza się w talii jako osobna karta; fakt bez pary zostaje kartą pojedynczą', () => {
    const deck = discoveryDeck(s, dayFor(0, 5));
    expect(deck.map((d) => d.place)).toEqual(['Warszawa', 'Podkowa Leśna', 'Dziwnów']);
    expect(deck[1].extremes?.low.name).toBe('Sierakowice');
    expect(deck[2].extremes).toBeNull();
    expect(deck[2].fact.sentence).toContain('2025');
  });

  it('„Zobacz na mapie” prowadzi do faktu dnia, także gdy jest on niższym biegunem', () => {
    // Indeks 2 = Krynica Morska jest faktem dnia; para ta sama, link do Krynicy.
    const deck = discoveryDeck(s, dayFor(2, 5));
    expect(deck[0].place).toBe('Krynica Morska');
    expect(deck[0].extremes?.high.name).toBe('Warszawa');
    expect(deck[0].fact.href).toContain('u=2210011');
  });

  it('poziom powiatów: podpis „wśród 380 powiatów”', () => {
    const deck = discoveryDeck(start([SZYDLOWIEC, POZNANSKI]), dayFor(0, 2));
    expect(deck).toHaveLength(1);
    expect(deck[0].extremes?.scope).toBe('Skrajne wartości wśród 380 powiatów w Polsce, 2025');
    expect(deck[0].extremes?.contrast).toBe('Różnica między skrajnościami: 20,9 pkt proc.');
  });

  it('fakty uśrednione z kilku lat: podpis mówi o latach', () => {
    const a = e('0619082', 'Wyryki', ['F1', 'migration-balance', 2025, -16.63, 9.38, -1, 1, 2461, 0, 3]);
    const b = e('2002162', 'Grabówka', ['F1', 'migration-balance', 2025, 41, 9.38, 1, 1, 2461, 0]);
    const deck = discoveryDeck(start([a, b]), dayFor(0, 2));
    expect(deck[0].extremes?.scope).toContain('średnio w latach 2023–2025');
  });

  it('pusta lista: pusta talia', () => {
    expect(discoveryDeck(start([]), new Date())).toEqual([]);
  });

  it('na prawdziwym wycinku danych talia nie powtarza jednostek i zaczyna się od Odkrycia dnia', () => {
    const input: FactsInput = {
      indicators: fixture.indicators as FactIndicator[],
      units: fixture.units as FactUnit[],
      values: fixture.values as unknown as Record<string, IndicatorValues>,
      config: config as unknown as FactsConfig,
    };
    const real = buildStart(buildFacts(input), '2026-11-17T10:00:00.000Z');
    const day = new Date('2026-11-26T12:00:00Z');
    const deck = discoveryDeck(real, day);
    expect(deck.length).toBeGreaterThan(0);
    expect(deck[0].place).toBe(dailyEntry(real, day)!.n);
    const shown = deck.flatMap((d) => (d.extremes ? [d.extremes.low.teryt, d.extremes.high.teryt] : [d.fact.href]));
    expect(new Set(shown).size).toBe(shown.length);
  });
});

describe('zdanie o rozpiętości', () => {
  it('liczby dodatnie różniące się ≥ 3 razy: iloraz', () => {
    expect(contrastSentence(1127, 1866729, 'osoba')).toBe('Najwyższa wartość jest 1\u00a0656 razy większa od najniższej.');
  });
  it('lata i udziały: różnica z jednostką, procenty w punktach procentowych', () => {
    expect(contrastSentence(39, 49, 'lata')).toMatch(/^Różnica między skrajnościami: 10(,0)? lat\.$/);
    expect(contrastSentence(1.2, 22.1, '%')).toBe('Różnica między skrajnościami: 20,9 pkt proc.');
  });
  it('wartości ujemne: różnica zamiast ilorazu', () => {
    expect(contrastSentence(-16.63, 41, 'na 1000')).toContain('Różnica między skrajnościami: 57,6');
  });
  it('brak różnicy: brak zdania', () => {
    expect(contrastSentence(5, 5, 'zł')).toBeNull();
  });
});

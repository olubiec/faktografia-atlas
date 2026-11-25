import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { classCounts } from '../../src/core/map/calibrate';
import { legendBreaks } from '../../src/core/map/classes';
import { buildLegend, legendCaption } from '../../src/core/legend/legend';
import { isTailFair, jenksBreaks, legendFit, TAIL_MAX_SHARE, TAIL_SPAN } from '../../src/core/map/tail';

const DIR = 'public/data/values/';
const LEVELS = [['województwa', 2], ['powiaty', 4], ['gminy', 7]] as const;

interface Combo { id: string; level: string; year: number; values: number[]; breaks: number[] }

/** Wszystkie wskaźniki × poziomy × ostatnie 3 lata z danych strony (także przyszłe, gdy robot je doda). */
function combos(): Combo[] {
  const out: Combo[] = [];
  for (const f of readdirSync(DIR).filter((n) => n.endsWith('.json'))) {
    const d = JSON.parse(readFileSync(DIR + f, 'utf8')) as { indicatorId: string; years: number[]; values: Record<string, (number | null)[]> };
    for (let yi = Math.max(0, d.years.length - 3); yi < d.years.length; yi++) {
      for (const [level, len] of LEVELS) {
        const values = Object.entries(d.values)
          .filter(([t]) => t.length === len)
          .map(([, a]) => a[yi])
          .filter((v): v is number => typeof v === 'number');
        if (values.length < 5) continue;
        out.push({ id: d.indicatorId, level, year: d.years[yi], values, breaks: legendBreaks(values) });
      }
    }
  }
  return out;
}

const ALL = combos();
// Umiarkowana skośność (nie ogon): skrajna klasa może być szeroka, ale nie jest „zbiorcza” dla wielu jednostek.
const MODERATE_SHARE = 0.15;
// Zaokrąglenie progów do „okrągłych” liczb może poszerzyć skrajną klasę o kilka punktów procentowych zakresu.
const ROUNDING_SLACK = 0.1;

describe('legenda a dane – wszystkie wskaźniki z public/data', () => {
  test('są dane do sprawdzenia', () => {
    expect(ALL.length).toBeGreaterThan(20);
  });

  test('skrajne klasy nie są rozciągnięte: wąskie w wartościach albo garstka jednostek', () => {
    // Schemat rozbieżny (progi z zerem) ma własne zasady podziału po obu stronach zera – pomijamy.
    // Mało różnych wartości (np. 16 województw w pełnych latach) – kwantyle są tu z natury zdegenerowane.
    const bad = ALL.filter((c) => !c.breaks.includes(0) && new Set(c.values).size >= 20).filter((c) => {
      const f = legendFit(c.values, c.breaks);
      const stretched = (span: number, share: number) =>
        span > TAIL_SPAN + ROUNDING_SLACK && !isTailFair(span, share) && share > MODERATE_SHARE;
      return stretched(f.topSpan, f.topShare) || stretched(f.bottomSpan, f.bottomShare);
    });
    expect(bad.map((c) => `${c.id} ${c.level} ${c.year}: ${c.breaks.join('|')}`)).toEqual([]);
  });

  test('co najmniej 2 progi, rosnące progi, żadnej pustej klasy', () => {
    const bad = ALL.filter((c) => {
      const sorted = [...c.breaks].sort((a, b) => a - b);
      const increasing = c.breaks.every((b, i) => b === sorted[i]) && new Set(c.breaks).size === c.breaks.length;
      return c.breaks.length < 2 || !increasing || !classCounts(c.values, c.breaks).every((n) => n > 0);
    });
    expect(bad.map((c) => `${c.id} ${c.level} ${c.year}: ${c.breaks.join('|')}`)).toEqual([]);
  });

  test('etykiety legendy się nie powtarzają i nie są puste', () => {
    for (const c of ALL) {
      const labels = buildLegend({ breaks: c.breaks, scheme: 'sequential' }).map((i) => i.label);
      expect([c.id, c.level, new Set(labels).size]).toEqual([c.id, c.level, labels.length]);
    }
  });
});

describe('ogon rozkładu – dane syntetyczne', () => {
  // 380 powiatów: gros 7000–9000, kilku liderów daleko (jak przeciętne wynagrodzenie).
  const base = Array.from({ length: 372 }, (_, i) => 7000 + ((i * 7919) % 372) * (2000 / 371));
  const values = [...base, 11400, 11500, 11700, 12900, 13500, 14000, 14400, 14874];

  test('ostatni próg nie leży daleko poniżej liderów, a najwyższa grupa jest mała', () => {
    const b = legendBreaks(values);
    const f = legendFit(values, b);
    expect(b).toHaveLength(4);
    expect(f.topShare).toBeLessThanOrEqual(TAIL_MAX_SHARE);
    expect(b[3]).toBeGreaterThan(9500);
  });

  test('rozkład bez ogona zostaje kwantylowy (klasy równoliczne)', () => {
    const even = Array.from({ length: 400 }, (_, i) => 100 + i);
    const counts = classCounts(even, legendBreaks(even));
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(20);
  });

  test('wartości ujemne i dodatnie: zero zostaje granicą klas mimo ogona', () => {
    const mixed = [...Array.from({ length: 300 }, (_, i) => -5 + i * 0.01), ...Array.from({ length: 80 }, (_, i) => 0.1 + i * 0.05), 30, 40];
    expect(legendBreaks(mixed)).toContain(0);
  });

  test('jenksBreaks dzieli na wyraźne grupy i respektuje minimalną liczność', () => {
    expect(jenksBreaks([1, 2, 3, 100, 101, 102], 2, 1)).toEqual([100]);
    expect(jenksBreaks([1, 2, 3, 100], 2, 2)).toEqual([3]);
    expect(jenksBreaks([1, 2], 3, 1)).toEqual([]);
  });
});

describe('opis pod legendą', () => {
  const eq = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`t${i}`, i % 5]));
  test('równoliczne klasy: stary opis', () => {
    expect(legendCaption('sequential', eq, 5)).toBe('Pięć grup o podobnej liczbie jednostek.');
  });
  test('mała najwyższa grupa: opis mówi o niej wprost', () => {
    const skew = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`t${i}`, i < 97 ? i % 4 : 4]));
    expect(legendCaption('sequential', skew, 5)).toContain('najwyższa grupa to tylko 3 z 100');
  });
  test('schemat rozbieżny: opis o zerze', () => {
    expect(legendCaption('diverging', eq, 5)).toContain('zera');
  });
});

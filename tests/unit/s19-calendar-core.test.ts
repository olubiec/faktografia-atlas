import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dayData, dayMarks, parseKalendarium, plural } from '../../src/core/calendar/days';
import { dayTitle, monthGrid, monthTitle, shiftMonth } from '../../src/core/calendar/month';
import { KALENDARIUM_DATA_URL } from '../../src/core/calendar/source';

const raw = JSON.parse(readFileSync('tests/fixtures/kalendarium/kalendarium-dni.json', 'utf8'));
const data = parseKalendarium(raw);

describe('S19 kalendarz: siatka miesiąca', () => {
  it('listopad 2026 zaczyna się w niedzielę, więc pierwszy tydzień ma 6 dni z października', () => {
    const grid = monthGrid('2026-11');
    expect(grid[0].map((c) => c.iso)[0]).toBe('2026-10-26');
    expect(grid[0][6]).toEqual({ iso: '2026-11-01', day: 1, inMonth: true });
    expect(grid[0].filter((c) => !c.inMonth)).toHaveLength(6);
  });
  it('każdy tydzień ma 7 dni, tygodnie zaczynają się w poniedziałek, a ostatni dzień miesiąca jest w siatce', () => {
    for (const ym of ['2026-02', '2026-11', '2027-02', '2028-02']) {
      const grid = monthGrid(ym);
      expect(grid.every((w) => w.length === 7)).toBe(true);
      expect(new Date(`${grid[0][0].iso}T00:00:00Z`).getUTCDay()).toBe(1);
      expect(grid.flat().filter((c) => c.inMonth)).toHaveLength(new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5), 0)).getUTCDate());
    }
  });
  it('luty 2027 ma dokładnie 4 pełne tygodnie', () => {
    expect(monthGrid('2027-02')).toHaveLength(4);
  });
  it('zły miesiąc daje pustą siatkę', () => {
    expect(monthGrid('2026-13')).toEqual([]);
  });
  it('przesuwanie miesiąca przechodzi przez granicę roku', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-11', 0)).toBe('2026-11');
  });
  it('tytuły po polsku', () => {
    expect(monthTitle('2026-11')).toBe('listopad 2026');
    expect(dayTitle('2026-11-26')).toBe('czwartek, 26 listopada 2026');
  });
});

describe('S19 kalendarz: dane dni', () => {
  it('plik z próbki jest poprawny, a zły kształt daje null', () => {
    expect(data?.updated).toBe('2026-11-26');
    expect(parseKalendarium(null)).toBeNull();
    expect(parseKalendarium({ days: {} })).toBeNull();
    expect(parseKalendarium({ updated: 'x', days: { 'zły-klucz': {} } })?.days).toEqual({});
  });
  it('znaczniki: publikacje, pobrane i media z jednego dnia', () => {
    expect(dayMarks(data, '2026-11-25')).toEqual({ publications: 1, downloaded: 2, media: 1 });
    expect(dayMarks(data, '2026-11-27')).toEqual({ publications: 0, downloaded: 0, media: 1 });
    expect(dayMarks(data, '2026-12-01')).toEqual({ publications: 1, downloaded: 0, media: 0 });
  });
  it('dzień bez wpisu i brak danych dają zera, nie wyjątek', () => {
    expect(dayMarks(data, '2026-11-10')).toEqual({ publications: 0, downloaded: 0, media: 0 });
    expect(dayMarks(null, '2026-11-25')).toEqual({ publications: 0, downloaded: 0, media: 0 });
    expect(dayData(null, '2026-11-25').publications).toEqual([]);
  });
  it('odmiana liczebników', () => {
    expect([1, 2, 5, 12, 22].map((n) => plural(n, 'zmienna', 'zmienne', 'zmiennych'))).toEqual(['zmienna', 'zmienne', 'zmiennych', 'zmiennych', 'zmienne']);
  });
  it('adres pliku jest jeden i wskazuje gałąź data/library', () => {
    expect(KALENDARIUM_DATA_URL).toBe('https://raw.githubusercontent.com/olubiec/faktografia-atlas/data/library/library/kalendarium-dni.json');
  });
});

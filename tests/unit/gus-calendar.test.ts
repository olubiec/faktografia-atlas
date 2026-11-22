import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as cal from '../../scripts/data/gus-calendar.mjs';
import * as prio from '../../scripts/data/library-priority.mjs';
import * as plan from '../../scripts/data/library-plan.mjs';

const html = readFileSync('tests/fixtures/gus/kalendarium-17-11-2026.html', 'utf8');

describe('Kalendarium GUS', () => {
  it('adres dnia ma format DD-MM-RRRR', () => {
    expect(cal.dayUrl(new Date('2026-11-05T10:00:00Z'))).toBe('https://stat.gov.pl/kalendarium/05-11-2026.html');
  });
  it('czyta tytuły publikacji GUS z prawdziwej strony dnia', () => {
    const titles = cal.parseDay(html).map((x: { title: string }) => x.title);
    expect(titles).toContain('Gospodarka mieszkaniowa i infrastruktura komunalna w 2025 r.');
    expect(titles.length).toBeGreaterThanOrEqual(3);
  });
  it('strona bez sekcji publikacji daje pustą listę', () => {
    expect(cal.parseDay('<html></html>')).toEqual([]);
  });
  it('rdzenie słów: bez krótkich i pospolitych', () => {
    const s = cal.stemsFromTitles(['Gospodarka mieszkaniowa w roku 2025']);
    expect(s).toContain('gospo');
    expect(s).toContain('mieszkaniowa'.slice(0, 5));
    expect(s).not.toContain('roku');
  });
  it('loadCalendar łączy dni, a błąd sieci jednego dnia go nie psuje', async () => {
    const out = await cal.loadCalendar(async (url: string) => {
      if (url.includes('22-11')) throw new Error('sieć');
      return url.includes('21-11') ? html : null;
    }, { now: new Date('2026-11-22T10:00:00Z'), days: 3 });
    expect(out.latest).toBe('2026-11-21');
    expect(out.titles.length).toBeGreaterThan(0);
  });
  it('zmienna o pasującej nazwie dostaje premię w wyniku priorytetu', () => {
    const v = { id: 1, level: 5, n1: 'mieszkania oddane do użytkowania' };
    const base = prio.priorityScore(v, ['INFRASTRUKTURA'], {});
    const boosted = prio.priorityScore(v, ['INFRASTRUKTURA'], { calendarStems: ['mieszk'], calendarBonus: 15 });
    expect(boosted - base).toBe(15);
  });
  it('świeża publikacja wymusza sprawdzenie nowego roku mimo młodego pobrania', () => {
    const now = Date.parse('2026-11-22T12:00:00Z');
    const ids = plan.refreshCandidates({
      done: { 1: '2026-11-18', 2: '2026-11-18' }, config: { refreshAfterDays: 14 }, now,
      calendarHit: (id: number) => id === 1, calendarLatest: '2026-11-21',
    });
    expect(ids).toEqual([1]);
  });
});

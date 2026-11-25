import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import * as cal from '../../scripts/data/gus-calendar.mjs';
import * as pre from '../../scripts/data/premieres.mjs';
import * as plan from '../../scripts/data/library-plan.mjs';
import * as prio from '../../scripts/data/library-priority.mjs';

const fx = (d: string) => readFileSync(`tests/fixtures/gus-calendar/${d}.html`, 'utf8');
const indicators = JSON.parse(readFileSync('config/indicators.json', 'utf8'));
const priority = JSON.parse(readFileSync('config/library-priority.json', 'utf8'));
const v = (id: number, n1: string, n2?: string) => ({ variable: { id, n1, n2 }, path: ['LUDNOŚĆ'] });

const demography = () => cal.parseDay(fx('29-09-2026')).find((p: { title: string }) => /demograficzna/.test(p.title));

describe('W27-D05 kalendarium: podstrony dni', () => {
  it('czyta tytuł, link i opis publikacji z nagranej strony', () => {
    const p = demography();
    expect(p.title).toBe('Sytuacja demograficzna Polski do 2025 r.');
    expect(p.href).toContain('/obszary-tematyczne/ludnosc/');
    expect(p.desc).toContain('urodzeniach');
  });
  it('przyszły dzień istnieje, ale sekcja „Publikacje GUS” jest pusta (stąd ahead = 0)', () => {
    expect(cal.parseDay(fx('30-11-2026'))).toEqual([]);
  });
  it('ahead=0 nie pyta o przyszłe dni; ahead=2 pyta, a przyszłość nie wpływa na rdzenie i „latest”', async () => {
    const urls: string[] = [];
    const get = async (u: string) => (urls.push(u), u.includes('25-11') ? fx('25-11-2026') : u.includes('30-11') ? fx('30-11-2026') : null);
    const now = new Date('2026-11-25T10:00:00Z');
    await cal.loadCalendar(get, { now, days: 1 });
    expect(urls).toEqual(['https://stat.gov.pl/kalendarium/25-11-2026.html']);
    urls.length = 0;
    const out = await cal.loadCalendar(get, { now: new Date('2026-11-28T10:00:00Z'), days: 1, ahead: 2 });
    expect(urls).toHaveLength(3);
    expect(out.items).toEqual([]);
    const today = await cal.loadCalendar(get, { now, days: 1, ahead: 5 });
    expect(today.items.length).toBeGreaterThanOrEqual(3);
    expect(today.items.every((x: { date: string }) => x.date === '2026-11-25')).toBe(true);
    expect(today.latest).toBe('2026-11-25');
  });
});

describe('W27-D05 dopasowanie', () => {
  it('publikacja o urodzeniach dopasowuje wskaźnik z grupy Ludność i zmienne z „urodzenia”', () => {
    const m = pre.matchPublication({ date: '2026-09-29', ...demography() }, {
      indicators,
      variables: [v(1, 'Urodzenia żywe na 1000 ludności'), v(2, 'Urodzenia żywe według płci', 'dzieci'), v(3, 'Ludność ogółem'), v(4, 'Lesistość')],
    });
    expect(m.main).toContain('natural-increase');
    expect(indicators.find((i: { id: string }) => i.id === 'natural-increase').group).toBe('Ludność');
    expect(m.main).not.toContain('forest-cover');
    expect(m.library).toEqual([1, 2]); // „Ludność ogółem” (jedno trafienie) i „Lesistość” odpadają
    expect(m.date).toBe('2026-09-29');
    expect(m.href).toBe(demography().href);
  });
  it('ogólny tytuł z jednym trafieniem nie dopasowuje niczego', () => {
    const m = pre.matchPublication({ date: '2026-09-29', title: 'Ludność w 2025 r.', href: '/x', desc: '' }, { indicators, variables: [v(3, 'Ludność ogółem')] });
    expect(m).toBeNull();
  });
  it('publikacje z dnia 25.11 (BAEL) łączą się z bezrobociem, a nie z lasami', () => {
    const items = cal.parseDay(fx('25-11-2026')).map((p: object) => ({ date: '2026-11-25', ...p }));
    const found = pre.findPremieres(items, { indicators, variables: [] });
    const main = found.flatMap((p: { main: string[] }) => p.main);
    expect(main).toContain('unemployed-share-working-age');
    expect(main).not.toContain('forest-cover');
  });
});

describe('W27-D05 priorytet', () => {
  const premieres = [
    { date: '2026-11-25', library: [30, 10, 20], main: [] },
    { date: '2026-11-24', library: [40], main: [] },
    { date: '2026-11-20', library: [99], main: [] },
  ];
  it('bierze zmienne z dziś i wczoraj, najwyżej premiereMax', () => {
    expect(pre.premiereVariableIds(premieres, '2026-11-25', { premiereMax: 3 })).toEqual([10, 20, 30]);
    expect(pre.premiereVariableIds(premieres, '2026-11-25', { premiereMax: 40 })).toEqual([10, 20, 30, 40]);
    expect(priority.premiereMax).toBe(40);
  });
  it('w kolejce biblioteki zmienne premier są przed przypiętymi', () => {
    const queue = [...priority.pinnedIds.slice(0, 3), 10, 20, 30].map((id: number) => ({ id }));
    const out = pre.prependPremieres(queue, [20, 10]).map((x: { id: number }) => x.id);
    expect(out.slice(0, 2)).toEqual([20, 10]);
    expect(out.indexOf(30)).toBeGreaterThan(out.indexOf(priority.pinnedIds[0]) - 1);
    expect(out).toHaveLength(queue.length);
  });
  it('odświeżanie: premiery (limit premiereMax) przed przypiętymi i bez limitu calendarMax', () => {
    const done: Record<string, string> = { 72305: '2026-01-01', 11: '2026-11-24', 12: '2026-11-24', 13: '2026-11-24' };
    const ids = plan.refreshCandidates({
      done, config: { refreshAfterDays: 14, pinnedIds: [72305] }, now: Date.parse('2026-11-25T12:00:00Z'),
      premiereIds: [13, 12, 11, 999], premiereMax: 2, calendarMax: 0,
    });
    expect(ids).toEqual([13, 12, 72305]);
  });
});

describe('W27-D05 przebieg premierowy wskaźników głównych', () => {
  const readYears = async () => ['2024'];
  it('bez dopasowań nie robi żadnego zapytania do BDL', async () => {
    const fetchJson = vi.fn<(url: string) => Promise<unknown>>();
    expect(await pre.probePremieres({ indicators, ids: [], readYears, fetchJson })).toEqual([]);
    expect(fetchJson).not.toHaveBeenCalled();
  });
  it('z dopasowaniem sprawdza tylko dopasowany wskaźnik (1 zapytanie)', async () => {
    const fetchJson = vi.fn<(url: string) => Promise<unknown>>(async () => ({ results: [{ values: [{ val: 1 }] }] }));
    const out = await pre.probePremieres({ indicators, ids: ['natural-increase'], readYears, fetchJson });
    expect(out).toEqual(['natural-increase']);
    expect(fetchJson).toHaveBeenCalledTimes(1);
  });
  it('premiereMainIds bierze tylko dzisiejsze publikacje', () => {
    const p = [{ date: '2026-11-25', main: ['b', 'a'], library: [] }, { date: '2026-11-24', main: ['c'], library: [] }];
    expect(pre.premiereMainIds(p, '2026-11-25')).toEqual(['a', 'b']);
  });
});

describe('W27-D05 księga kalendarium', () => {
  const premiere = (date: string, library: number[]) => ({ date, title: 't', href: `/p/${date}`, main: ['natural-increase'], library });
  const state = (ledger: any, id = 1) => ledger.entries[0].library.find((x: { id: number }) => x.id === id);
  const old = { reason: null, lastYear: 2024, doneOn: '2026-08-01', niche: false };

  it('planned → waiting → downloaded', () => {
    let l = pre.updateLedger(null, { today: '2026-11-25', premieres: [premiere('2026-11-30', [1])], factsOf: () => old });
    expect(state(l).state).toBe('planned');
    l = pre.updateLedger(l, { today: '2026-11-30', premieres: [], factsOf: () => old });
    expect(state(l).state).toBe('waiting');
    l = pre.updateLedger(l, { today: '2026-12-02', premieres: [], factsOf: () => ({ ...old, lastYear: 2025, doneOn: '2026-12-02' }) });
    expect(state(l)).toMatchObject({ state: 'downloaded', on: '2026-12-02' });
    l = pre.updateLedger(l, { today: '2026-12-20', premieres: [], factsOf: () => old });
    expect(state(l).state).toBe('downloaded');
  });
  it('waiting po 14 dniach → rejected brak-nowego-roku-14-dni; w 14. dniu jeszcze czeka', () => {
    const first = pre.updateLedger(null, { today: '2026-11-01', premieres: [premiere('2026-11-01', [1])], factsOf: () => old });
    expect(state(pre.updateLedger(first, { today: '2026-11-15', premieres: [], factsOf: () => old })).state).toBe('waiting');
    expect(state(pre.updateLedger(first, { today: '2026-11-16', premieres: [], factsOf: () => old })))
      .toMatchObject({ state: 'rejected', reason: 'brak-nowego-roku-14-dni' });
  });
  it('zmienna łamiąca zasadę „nie niszowe” → rejected niszowe; brak gmin i poza wytycznymi też mają powód', () => {
    const fresh = { lastYear: 2025, doneOn: '2026-11-25', niche: true };
    const seen = pre.updateLedger(null, { today: '2026-11-25', premieres: [premiere('2026-11-25', [1, 2, 3])], factsOf: () => old });
    const l = pre.updateLedger(seen, { today: '2026-11-25', premieres: [], factsOf: (id: number) => (id === 1 ? { ...old, ...fresh } : id === 2 ? { ...old, reason: 'brak-gmin' } : { ...old, reason: 'poza-wytycznymi' }) });
    expect(state(l, 1)).toMatchObject({ state: 'rejected', reason: 'niszowe' });
    expect(state(l, 2).reason).toBe('brak-gmin');
    expect(state(l, 3).reason).toBe('poza-wytycznymi');
  });
  it('wpis po 90 dniach znika; wynik jest deterministyczny', () => {
    const args = { today: '2026-11-25', premieres: [premiere('2026-11-24', [2, 1]), premiere('2026-11-25', [1])], factsOf: () => old };
    const a = pre.updateLedger(null, args);
    expect(JSON.stringify(a)).toBe(JSON.stringify(pre.updateLedger(null, { ...args, premieres: [...args.premieres].reverse() })));
    expect(a.entries.map((e: { date: string }) => e.date)).toEqual(['2026-11-25', '2026-11-24']);
    // 90 dni = jeszcze jest, 91 = znika
    expect(pre.updateLedger(a, { today: '2027-02-23', premieres: [], factsOf: () => old }).entries.map((e: { date: string }) => e.date)).toEqual(['2026-11-25']);
    expect(pre.updateLedger(a, { today: '2027-02-24', premieres: [], factsOf: () => old }).entries).toHaveLength(0);
  });
  it('waitingIds zwraca zmienne wciąż czekające', () => {
    const l = pre.updateLedger(null, { today: '2026-11-25', premieres: [premiere('2026-11-25', [5, 3])], factsOf: () => old });
    expect(pre.waitingIds(l)).toEqual([3, 5]);
  });
  it('zasada „nie niszowe”: seria, rok, gminy i wskaźnik względny', () => {
    const ok = { lastYear: 2025, seriesYears: 5, gminaShare: 0.97, relative: true };
    expect(pre.nicheReason(ok)).toBeNull();
    for (const bad of [{ gminaShare: 0.9 }, { lastYear: 2023 }, { seriesYears: 3 }, { relative: false }]) expect(pre.nicheReason({ ...ok, ...bad })).toBe('niszowe');
    expect(pre.isRelative('na 1000', 'Urodzenia')).toBe(true);
    expect(pre.isRelative('szt.', 'Liczba aptek')).toBe(false);
    const d = Object.fromEntries(Array.from({ length: 2400 }, (_, i) => [String(i), [1, 2, 3, 4]]));
    expect(pre.factsFromValues({ l6: { y: ['2022', '2023', '2024', '2025'], d } }, { unit: '%', name: 'x' })).toEqual({ lastYear: 2025, niche: false });
    expect(pre.factsFromValues({ l6: { y: ['2022', '2023', '2024', '2025'], d: { a: [1, 1, 1, 1] } } }, { unit: '%', name: 'x' }).niche).toBe(true);
  });
});

describe('W27-D05 limity BDL i workflowy', () => {
  const wf = (f: string) => readFileSync(`.github/workflows/${f}`, 'utf8');
  // Premiery korzystają z dotychczasowych przebiegów (04:40 i 16:40) i budżetu 3000 – plan się nie zmienia.
  const plan2 = [
    { name: 'biblioteka rano', startMinute: 4 * 60 + 40, requests: 3000 },
    { name: 'biblioteka wieczorem', startMinute: 16 * 60 + 40, requests: 3000 },
    { name: 'fetch-data', startMinute: 70, requests: 750 },
  ];
  it('plan mieści się w limitach BDL', () => {
    expect(prio.checkWindows(plan2).ok).toBe(true);
  });
  it('harmonogram i budżet workflowów bez zmian (premiery w tej samej kolejce)', () => {
    expect(wf('fetch-data.yml').match(/cron:/g)).toHaveLength(1);
    const lib = wf('fetch-library.yml');
    expect(lib.match(/- cron:/g)).toHaveLength(1);
    expect(lib).toContain("LIBRARY_BUDGET: ${{ github.event.inputs.budget || '3000' }}");
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as board from '../../scripts/data/calendar-board.mjs';

const fx = (f: string) => JSON.parse(readFileSync(`tests/fixtures/calendar-board/${f}.json`, 'utf8'));
const indicators = JSON.parse(readFileSync('config/indicators.json', 'utf8'));
const material = (date: string, text: string) => ({
  premiere: { title: 'x', href: '/x', date },
  title: `${text}…`,
  sentence: text,
  value: { text: '16,6 %' },
  source: { text: 'GUS, BDL, 2025', map: '/mapa?i=a&y=2025' },
});
const build = (extra = {}) =>
  board.buildKalendariumDni({
    today: '2026-11-26',
    ledger: fx('calendar'),
    available: fx('available'),
    indicators,
    fresh: fx('fresh'),
    materials: [material('2026-11-25', 'Zdanie A.'), material('2026-11-25', 'Zdanie B.')],
    ...extra,
  });

describe('S19 kalendarium-dni: budowa pliku dla strony', () => {
  it('ma updated i dni z publikacjami z księgi, z pełnym adresem GUS', () => {
    const out = build();
    expect(out.updated).toBe('2026-11-26');
    const pub = out.days['2026-11-25'].publications[0];
    expect(pub.title).toBe('Sytuacja demograficzna Polski do 2025 r.');
    expect(pub.gusUrl).toMatch(/^https:\/\/stat\.gov\.pl\//);
  });
  it('względny adres z księgi dostaje przedrostek stat.gov.pl', () => {
    const ledger = { entries: [{ date: '2026-11-27', title: 'T', href: '/a/b.html', main: [], library: [] }] };
    expect(build({ ledger }).days['2026-11-27'].publications[0].gusUrl).toBe('https://stat.gov.pl/a/b.html');
  });
  it('odrzuconych zmiennych nie ma ani w nazwach, ani w liczbach', () => {
    const out = build();
    const pub = out.days['2026-11-02'].publications[0];
    expect(pub.items).toEqual([]);
    expect(pub.counts).toEqual({ downloaded: 0, waiting: 0, planned: 0 });
    expect(JSON.stringify(out)).not.toContain('rejected');
    expect(JSON.stringify(out)).not.toContain('niszowe');
  });
  it('stany: pobrane (z datą i linkiem do mapy), czeka na BDL (od kiedy), zaplanowane', () => {
    const items = build().days['2026-11-25'].publications[0].items;
    const done = items.find((i: { state: string }) => i.state === 'downloaded');
    expect(done).toMatchObject({ name: 'Liczba ludności ogółem', on: '2026-11-25' });
    expect(done.mapUrl).toContain('/mapa?i=b101');
    expect(items.find((i: { state: string }) => i.state === 'waiting')).toMatchObject({ name: 'Ludność w wieku produkcyjnym', on: '2026-11-25' });
    const planned = build().days['2026-12-01'].publications[0];
    expect(planned.counts.planned).toBe(3);
    expect(planned.items.some((i: { name: string; state: string }) => i.state === 'planned')).toBe(true);
  });
  it('pomysły na media trafiają do dnia premiery', () => {
    const out = build();
    expect(out.days['2026-11-25'].media.map((m: { sentence: string }) => m.sentence)).toEqual(['Zdanie A.', 'Zdanie B.']);
    expect(out.days['2026-11-25'].media[0]).toMatchObject({ value: '16,6 %', source: 'GUS, BDL, 2025', mapUrl: 'https://faktografia.eu/mapa?i=a&y=2025' });
  });
  it('limit nazw na publikację: reszta w `more`, a liczby zostają pełne', () => {
    const library = Array.from({ length: 55 }, (_, i) => ({ id: 1000 + i, state: 'planned' }));
    const ledger = { entries: [{ date: '2026-12-02', title: 'Duża', href: '/d', main: [], library }] };
    const pub = build({ ledger }).days['2026-12-02'].publications[0];
    expect(pub.items).toHaveLength(board.DAYS_ITEMS_LIMIT);
    expect(pub.more).toBe(55 - board.DAYS_ITEMS_LIMIT);
    expect(pub.counts.planned).toBe(55);
  });
  it('bez księgi i materiałów plik jest pusty, bez wyjątku, i mały', () => {
    const out = board.buildKalendariumDni({ today: '2026-11-26', ledger: null, available: null });
    expect(out).toEqual({ updated: '2026-11-26', days: {} });
    expect(JSON.stringify(build()).length).toBeLessThan(300_000);
  });
});

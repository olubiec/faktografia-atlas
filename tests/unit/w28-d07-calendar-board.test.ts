import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import * as board from '../../scripts/data/calendar-board.mjs';

const fx = (f: string) => JSON.parse(readFileSync(`tests/fixtures/calendar-board/${f}.json`, 'utf8'));
const indicators = JSON.parse(readFileSync('config/indicators.json', 'utf8'));
const input = () => ({
  today: '2026-11-26',
  ledger: fx('calendar'),
  available: fx('available'),
  start: fx('facts-start'),
  fresh: fx('fresh'),
  indicators,
  sentenceOf: (d: { n: string; f: (string | number)[] }) => `${d.n}: wartość ${d.f[3]} w ${d.f[2]} r.`,
});
const SECTIONS = ['Zaplanowane (14 dni)', 'Czeka na BDL', 'Pobrane', 'Odrzucone', 'Wdrożone (na stronie)', 'Odkrycia', 'Tematy na czasie'];
const part = (md: string, title: string) => md.split('\n## ').find((s) => s.startsWith(title)) ?? '';

describe('W28-D07 tablica: sekcje i stany', () => {
  it('ma wszystkie sekcje we właściwej kolejności', () => {
    const { markdown } = board.buildBoard(input());
    const at = SECTIONS.map((t) => markdown.indexOf(`## ${t}`));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });
  it('każdy stan trafia do swojej sekcji', () => {
    const { markdown } = board.buildBoard(input());
    expect(part(markdown, 'Zaplanowane')).toContain('Rynek pracy w 2025 r.');
    expect(part(markdown, 'Zaplanowane')).toContain('1 wskaźnik główny, 2 zmienne biblioteki');
    expect(part(markdown, 'Zaplanowane')).not.toContain('Mieszkania');
    expect(part(markdown, 'Czeka na BDL')).toContain('Ludność w wieku produkcyjnym');
    expect(part(markdown, 'Czeka na BDL')).toContain('od 2026-11-25');
    expect(part(markdown, 'Pobrane')).toContain('Liczba ludności ogółem');
    expect(part(markdown, 'Pobrane')).toContain('wskaźnik:');
    expect(part(markdown, 'Odrzucone')).toContain('Mieszkania oddane do użytkowania');
    expect(part(markdown, 'Pobrane')).not.toContain('Pracujący ogółem');
  });
  it('odrzucona zmienna ma powód po ludzku, nie kod', () => {
    const md = part(board.buildBoard(input()).markdown, 'Odrzucone');
    expect(md).toContain('GUS nie dał nowego roku w 14 dni');
    expect(md).toContain('brak danych na poziomie gmin');
    expect(md).toMatch(/niszowe: /);
    expect(md).not.toContain('brak-nowego-roku-14-dni');
  });
  it('wdrożona zmienna ma link /mapa?i=b<id>, wskaźnik główny /mapa?i=<id>', () => {
    const md = part(board.buildBoard(input()).markdown, 'Wdrożone');
    expect(md).toContain('/mapa?i=b101&y=2025)');
    expect(md).toContain('/mapa?i=median-age&y=2026)');
    expect(md).not.toContain('i=population');
  });
  it('odkrycia: tylko świeże wskaźniki, najmocniejsze pierwsze, ze zdaniem, liczbą i linkiem', () => {
    const md = part(board.buildBoard(input()).markdown, 'Odkrycia');
    expect(md).toContain('Podkowa Leśna: wartość 49 w 2026 r.');
    expect(md).toContain('/mapa?i=median-age&y=2026&u=1405021&l=gmi');
    expect(md).toContain('Zobacz na mapie');
    expect(md).not.toContain('Warszawa');
    expect(md).not.toContain('Krynica'); // rok 2025 < najnowszy rok świeżego wskaźnika
    expect(md.indexOf('Podkowa')).toBeLessThan(md.indexOf('Sierakowice'));
  });
  it('bez sygnału tematów sekcja pokazuje „—”', () => {
    expect(part(board.buildBoard(input()).markdown, 'Tematy na czasie')).toContain('| — |');
  });
});

describe('W28-D07 tablica: pierwsze uruchomienie', () => {
  it('bez księgi i plików tablica powstaje z „—” w każdej sekcji, bez wyjątku', () => {
    const { markdown, counts } = board.buildBoard({ today: '2026-11-26', ledger: null, available: null, start: null, fresh: null });
    for (const t of SECTIONS) expect(part(markdown, t)).toContain('| — |');
    expect(counts).toEqual({ premieres: 0, news: 0 });
  });
});

describe('W28-D07 znaczek', () => {
  it('badge.json ma format endpointu shields.io z liczbami z tablicy', () => {
    const { counts } = board.buildBoard(input());
    expect(counts).toEqual({ premieres: 1, news: 2 });
    expect(board.buildBadge(counts)).toEqual({ schemaVersion: 1, label: 'Kalendarium', message: '1 premiera · 2 nowości', color: 'blue' });
  });
  it('odmienia liczby i szarzeje bez treści', () => {
    expect(board.buildBadge({ premieres: 3, news: 5 }).message).toBe('3 premiery · 5 nowości');
    expect(board.buildBadge({ premieres: 0, news: 0 })).toMatchObject({ message: '0 premier · 0 nowości', color: 'lightgrey' });
  });
});

describe('W28-D07 zgłoszenie', () => {
  const api = (found: { number: number } | null) => ({
    findIssue: vi.fn<(label: string) => Promise<{ number: number } | null>>(async () => found),
    updateIssue: vi.fn<(n: number, d: { title: string; body: string }) => Promise<object>>(async () => ({})),
    createIssue: vi.fn<(d: { title: string; body: string; labels: string[] }) => Promise<{ number: number }>>(async () => ({ number: 7 })),
  });
  it('istniejące zgłoszenie z etykietą „kalendarium” jest edytowane, a nie tworzone', async () => {
    const a = api({ number: 3 });
    expect(await board.upsertIssue(a, 'treść')).toEqual({ number: 3, created: false });
    expect(a.findIssue).toHaveBeenCalledWith('kalendarium');
    expect(a.updateIssue).toHaveBeenCalledWith(3, { title: 'Kalendarium danych', body: 'treść' });
    expect(a.createIssue).not.toHaveBeenCalled();
  });
  it('bez zgłoszenia zakłada je raz z etykietą', async () => {
    const a = api(null);
    expect(await board.upsertIssue(a, 'treść')).toEqual({ number: 7, created: true });
    expect(a.createIssue).toHaveBeenCalledWith({ title: 'Kalendarium danych', body: 'treść', labels: ['kalendarium'] });
  });
});

describe('W28-D07 limit treści', () => {
  it('długie sekcje są przycinane z dopiskiem „i N więcej”, całość mieści się w limicie GitHub', () => {
    const entries = Array.from({ length: 3000 }, (_, i) => ({
      date: '2026-11-25',
      title: `Publikacja ${i} z dość długim tytułem, żeby tablica była duża`,
      href: `https://stat.gov.pl/p/${i}.html`,
      main: [],
      library: [{ id: 10_000 + i, state: 'waiting', base: 2024 }],
    }));
    const { markdown } = board.buildBoard({ ...input(), ledger: { updated: '2026-11-26', entries } });
    expect(markdown.length).toBeLessThanOrEqual(65_536);
    expect(markdown).toMatch(/_i \d+ więcej_/);
    expect(SECTIONS.every((t) => markdown.includes(`## ${t}`))).toBe(true);
  });
});

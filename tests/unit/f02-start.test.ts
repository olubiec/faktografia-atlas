import { describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import config from '../../config/facts.json';
import fixture from '../fixtures/facts/opolskie.json';
import { buildFacts } from '../../src/core/facts/build';
import { encodeFact } from '../../src/core/facts/codec';
import { buildStart } from '../../src/core/facts/start';
import type { Fact, FactIndicator, FactsConfig, FactsInput, FactUnit, IndicatorValues } from '../../src/core/facts/types';
import {
  bigNumber,
  compareHref,
  dailyEntry,
  firstNeighbour,
  listPlaceholders,
  twinSentence,
  twinView,
  factHref,
  factView,
  factsFileUrl,
  listHref,
  listView,
  mapHref,
  placeFacts,
  placeHeading,
  type FactsFile,
} from '../../src/core/start/discoveries';
import { PLACE_KEY, forgetPlace, readPlace, savePlace } from '../../src/core/start/place-memory';
import { loadFactsStart, loadPlaceFacts, resetDiscoveriesCache } from '../../src/core/start/load-discoveries';
import { readUrlState } from '../../src/core/url/state';

// Wycinek prawdziwych danych (woj. opolskie) z F01 – z niego składamy facts-start i plik faktów województwa.
const input: FactsInput = {
  indicators: fixture.indicators as FactIndicator[],
  units: fixture.units as FactUnit[],
  values: fixture.values as unknown as Record<string, IndicatorValues>,
  config: config as unknown as FactsConfig,
};
const build = buildFacts(input);
const start = buildStart(build, '2026-11-17T10:00:00.000Z');
const file: FactsFile = {
  woj: '16',
  generatedAt: start.generatedAt,
  units: Object.fromEntries([...build.byUnit.entries()].map(([t, u]) => [t, u.selected.map(encodeFact)])),
};

describe('F02 Odkrycie dnia', () => {
  it('ten sam dzień = ta sama karta, niezależnie od godziny', () => {
    expect(start.daily.length).toBeGreaterThan(1);
    const morning = dailyEntry(start, new Date('2026-11-22T00:01:00Z'));
    const evening = dailyEntry(start, new Date('2026-11-22T23:59:00Z'));
    expect(morning).not.toBeNull();
    expect(evening).toEqual(morning);
  });

  it('kolejny dzień = kolejna pozycja, po końcu listy od nowa', () => {
    const n = start.daily.length;
    const day = new Date('2026-11-22T12:00:00Z');
    const i = start.daily.indexOf(dailyEntry(start, day)!);
    const next = dailyEntry(start, new Date(day.getTime() + 86_400_000));
    expect(start.daily.indexOf(next!)).toBe((i + 1) % n);
    const later = dailyEntry(start, new Date(day.getTime() + n * 86_400_000));
    expect(later).toBe(start.daily[i]);
  });

  it('pusta lista nie wywraca strony', () => {
    expect(dailyEntry({ ...start, daily: [] }, new Date())).toBeNull();
  });
});

describe('F02 link do mapy z faktu', () => {
  const fact: Fact = {
    type: 'F1',
    teryt: '1219053',
    indicatorId: 'income-per-capita',
    year: 2025,
    value: 7250.89,
    frame: 'kraj',
    compare: { kind: 'rank', dir: 1, rank: 1, total: 2479, tie: false },
    strength: 3,
  };

  it('fakt gminy → /mapa ze wskaźnikiem, rokiem, jednostką i poziomem gmin', () => {
    expect(factHref(fact)).toBe('/mapa?i=income-per-capita&y=2025&u=1219053&l=gmi');
  });

  it('adres czyta się istniejącym odczytem stanu mapy (te same parametry)', () => {
    const state = readUrlState(factHref(fact).slice('/mapa'.length));
    expect(state).toEqual({ i: 'income-per-capita', y: 2025, u: '1219053', l: 'gmi' });
  });

  it('powiat i województwo dostają swój poziom; TERYT zostaje tekstem', () => {
    expect(factHref({ ...fact, teryt: '1219' })).toBe('/mapa?i=income-per-capita&y=2025&u=1219&l=pow');
    expect(factHref({ ...fact, teryt: '02' })).toBe('/mapa?i=income-per-capita&y=2025&u=02&l=woj');
    expect(mapHref({ indicatorId: 'density' })).toBe('/mapa?i=density');
  });

  it('zestawienie → mapa z tym wskaźnikiem, rokiem i poziomem', () => {
    const list = start.lists[0];
    expect(listHref(list)).toBe(`/mapa?i=${list.indicatorId}&y=${list.year}&l=${list.level}`);
  });

  it('karta Odkrycia dnia: zdanie z rokiem, duża liczba bez jednostki, link do mapy jednostki', () => {
    const entry = dailyEntry(start, new Date('2026-11-22T12:00:00Z'))!;
    const view = factView({ ...decode(entry.u, entry.f) })!;
    expect(view.sentence).toMatch(/\d{4}/);
    expect(view.number).toMatch(/^[−\d]/);
    expect(view.href).toContain(`u=${entry.u}`);
    expect(view.href).toContain(`i=${entry.f[1]}`);
    expect(view.href).toContain(`y=${entry.f[2]}`);
  });
});

function decode(teryt: string, e: (string | number)[]): Fact {
  return placeFacts({ woj: teryt.slice(0, 2), generatedAt: '', units: { [teryt]: [e] } }, teryt)[0];
}

describe('F02 fakty miejsca i zestawienia', () => {
  it('placeFacts: najwyżej 3 fakty jednostki, każdy z linkiem do niej', () => {
    const teryt = [...build.byUnit.keys()].find((t) => t.length === 7)!;
    const facts = placeFacts(file, teryt);
    expect(facts.length).toBeGreaterThan(0);
    expect(facts.length).toBeLessThanOrEqual(3);
    for (const f of facts) expect(factHref(f)).toContain(`u=${teryt}`);
    expect(placeFacts(file, '9999999')).toEqual([]);
  });

  it('plik faktów to tylko województwo jednostki', () => {
    expect(factsFileUrl('1219053')).toBe('/data/facts/12.json');
    expect(factsFileUrl('02')).toBe('/data/facts/02.json');
  });

  it('karta zestawienia: 3 pozycje i podpis z rokiem', () => {
    const view = listView(start.lists[0])!;
    expect(view.rows).toHaveLength(3);
    expect(view.subtitle).toContain(String(start.lists[0].year));
  });

  it('duża liczba: polski zapis, minus typograficzny, jednostka osobno', () => {
    expect(bigNumber(1866729, 'osoba').number).toBe('1 866 729');
    expect(bigNumber(-16.63, 'na 1000 ludności').number.startsWith('−')).toBe(true);
    expect(bigNumber(3, '%').unit).toBe('%');
  });

  it('nagłówek miejsca według rodzaju jednostki', () => {
    expect(placeHeading('1219053', 'Wieliczka')).toBe('Gmina Wieliczka');
    expect(placeHeading('1261011', 'Kraków')).toBe('Miasto Kraków');
    expect(placeHeading('1219', 'powiat wielicki')).toBe('Powiat wielicki');
    expect(placeHeading('1261', 'powiat Kraków')).toBe('Miasto Kraków');
    expect(placeHeading('12', 'małopolskie')).toBe('Województwo małopolskie');
  });
});

describe('F02 pamięć miejsca (sam TERYT)', () => {
  const memory = () => {
    const data = new Map<string, string>();
    return {
      data,
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    };
  };

  it('zapisuje wyłącznie kod TERYT pod kluczem faktografia.place', () => {
    const store = memory();
    savePlace('1219053', store);
    expect([...store.data.entries()]).toEqual([[PLACE_KEY, '1219053']]);
    expect(readPlace(store)).toBe('1219053');
    forgetPlace(store);
    expect(readPlace(store)).toBeNull();
  });

  it('ignoruje śmieci i brak dostępu do pamięci', () => {
    const store = memory();
    store.data.set(PLACE_KEY, '{"teryt":"1"}');
    expect(readPlace(store)).toBeNull();
    savePlace('Wieliczka', store);
    expect(store.data.get(PLACE_KEY)).toBe('{"teryt":"1"}');
    const broken = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    expect(readPlace(broken)).toBeNull();
    expect(() => savePlace('1219053', broken)).not.toThrow();
    expect(() => forgetPlace(broken)).not.toThrow();
  });
});

describe('F02 pobieranie danych', () => {
  const root = path.resolve(__dirname, '../..');

  it('facts-start.json mieści się w 4 KB', () => {
    expect(fs.statSync(path.join(root, 'public/data/facts-start.json')).size).toBeLessThanOrEqual(4 * 1024);
  });

  it('jedno żądanie na plik, plik województwa dopiero na prośbę', async () => {
    resetDiscoveriesCache();
    const fetchImpl = vi.fn<(url: string) => Promise<Response>>(async (url) => new Response(JSON.stringify(url.includes('facts-start') ? start : file)));
    await loadFactsStart(fetchImpl as unknown as typeof fetch);
    await loadFactsStart(fetchImpl as unknown as typeof fetch);
    expect(fetchImpl.mock.calls.map((c) => c[0])).toEqual(['/data/facts-start.json']);
    await loadPlaceFacts('1601011', fetchImpl as unknown as typeof fetch);
    expect(fetchImpl.mock.calls.map((c) => c[0])).toEqual(['/data/facts-start.json', '/data/facts/16.json']);
  });

  it('po błędzie sieci następna próba pobiera od nowa', async () => {
    resetDiscoveriesCache();
    const fail = vi.fn<() => Promise<Response>>(async () => new Response('', { status: 500 }));
    await expect(loadFactsStart(fail as unknown as typeof fetch)).rejects.toThrow('HTTP 500');
    const ok = vi.fn<() => Promise<Response>>(async () => new Response(JSON.stringify(start)));
    await expect(loadFactsStart(ok as unknown as typeof fetch)).resolves.toEqual(start);
  });
});

describe('F02 Twoja okolica i Twój bliźniak (dane F03)', () => {
  // Wpis Wieliczki przepisany z public/data/facts/12.json (near, twins).
  const wieliczka: FactsFile = {
    woj: '12',
    generatedAt: '2026-11-17T10:24:24.317Z',
    units: { '1219053': [['F5', 'population', 2025, 70471, 1.72, 1, 7226, 1995]] },
    near: { '1219053': ['1206143', '1209013', '1219012'] },
    twins: { '1219053': ['F8', '1434011', 2025, 11, 0.59] },
  };

  it('porównanie z sąsiadem i z bliźniakiem w istniejącym formacie /mapa?c=a,b', () => {
    expect(firstNeighbour(wieliczka, '1219053')).toBe('1206143');
    expect(compareHref('1219053', '1206143')).toBe('/mapa?c=1219053,1206143');
    const twin = twinView(wieliczka, '1219053')!;
    expect(twin).toEqual({ twin: '1434011', year: 2025, dims: 11, href: '/mapa?c=1219053,1434011' });
  });

  it('brak sąsiadów lub bliźniaka (stary plik) – brak karty, bez błędu', () => {
    const old: FactsFile = { woj: '12', generatedAt: '', units: {} };
    expect(firstNeighbour(old, '1219053')).toBeNull();
    expect(twinView(old, '1219053')).toBeNull();
  });

  it('zdanie o bliźniaku: rodzaj jednostki, województwo, liczba wskaźników i rok', () => {
    const twin = twinView(wieliczka, '1219053')!;
    expect(twinSentence(twin, 'Ząbki')).toBe(
      'Najbardziej podobna gmina w innym województwie: Ząbki (mazowieckie). Porównaliśmy 11 wskaźników z 2025 r.',
    );
    expect(twinSentence({ ...twin, twin: '1465' }, 'powiat Warszawa')).toMatch(/^Najbardziej podobne miasto na prawach powiatu/);
    expect(twinSentence({ ...twin, twin: '1434' }, 'powiat wołomiński')).toMatch(/^Najbardziej podobny powiat/);
  });

  it('zestawienia przed pobraniem danych: 4 karty z tytułem i linkiem do mapy', () => {
    const lists = listPlaceholders();
    expect(lists).toHaveLength(config.start.lists.length);
    for (const l of lists) expect(l.href).toMatch(/^\/mapa\?i=[\w-]+&l=(gmi|pow|woj)$/);
  });
});

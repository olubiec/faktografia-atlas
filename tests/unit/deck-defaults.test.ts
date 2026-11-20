import { describe, expect, it } from 'vitest';
import { numbering } from '../../src/core/share/deck';
import { defaultDeck, type DeckContext, type ShareEntry } from '../../src/core/share/deck-defaults';
import { PAGE_DATA_RULES } from '../../src/core/share/deck-page-data';
import { DEFAULT_INDICATOR_ID } from '../../src/core/map/main-view';
import { BASIC_INDICATORS } from '../../src/core/my-indicators/my-indicators';

const ENTRIES: ShareEntry[] = ['map', 'profile', 'compare', 'rankings', 'library'];
const ctx = (patch: Partial<DeckContext> = {}): DeckContext => ({
  indicatorId: 'population',
  mine: BASIC_INDICATORS,
  hasUnit: true,
  hasPair: true,
  ...patch,
});
const kinds = (entry: ShareEntry, c: DeckContext) => defaultDeck(entry, c).pages.map((p) => p.kind);

describe('defaultDeck', () => {
  it('map: mapa, ranking góra i dół, tabela, profil tylko z jednostką', () => {
    const d = defaultDeck('map', ctx());
    expect(d.pages.map((p) => p.kind)).toEqual(['map', 'ranking', 'ranking', 'table', 'profile']);
    expect(d.pages[1].options?.side).toBe('top');
    expect(d.pages[2].options?.side).toBe('bottom');
    expect(kinds('map', ctx({ hasUnit: false }))).toEqual(['map', 'ranking', 'ranking', 'table']);
  });

  it('profile i compare', () => {
    expect(kinds('profile', ctx())).toEqual(['profile', 'bignumber', 'trend', 'table']);
    expect(kinds('compare', ctx())).toEqual(['compare', 'table', 'versus']);
  });

  it('rankings i library', () => {
    expect(kinds('rankings', ctx())).toEqual(['ranking', 'map', 'histogram']);
    expect(kinds('library', ctx())).toEqual(['ranking', 'histogram']);
    expect(defaultDeck('rankings', ctx()).pages[0].options?.side).toBe('top');
  });

  it('zestawy zastępcze', () => {
    const map = kinds('map', ctx({ hasUnit: false }));
    expect(kinds('compare', ctx({ hasPair: false, hasUnit: false }))).toEqual(map);
    expect(kinds('profile', ctx({ hasUnit: false }))).toEqual(map);
  });

  it('strony wielowskaźnikowe dostają mine w kolejności, przycięte do max', () => {
    const many = Array.from({ length: 30 }, (_, i) => `w${i}`);
    const pages = defaultDeck('profile', ctx({ mine: many })).pages;
    for (const p of pages.filter((x) => x.kind === 'table' || x.kind === 'profile')) {
      expect(p.indicatorIds).toEqual(many.slice(0, PAGE_DATA_RULES[p.kind].max));
    }
    const t = defaultDeck('compare', ctx()).pages.find((p) => p.kind === 'table');
    expect(t?.indicatorIds).toEqual([...BASIC_INDICATORS]);
  });

  it('strony jednowskaźnikowe mają dokładnie aktywny wskaźnik, z awaryjnym', () => {
    const single = (c: DeckContext) =>
      ENTRIES.flatMap((e) => defaultDeck(e, c).pages.filter((p) => PAGE_DATA_RULES[p.kind].max === 1));
    for (const p of single(ctx())) expect(p.indicatorIds).toEqual(['population']);
    for (const p of single(ctx({ indicatorId: null }))) expect(p.indicatorIds).toEqual([BASIC_INDICATORS[0]]);
    for (const p of single(ctx({ indicatorId: null, mine: [] }))) expect(p.indicatorIds).toEqual([DEFAULT_INDICATOR_ID]);
  });

  it('żadna strona nie ma pustych wskaźników', () => {
    for (const e of ENTRIES) {
      for (const p of defaultDeck(e, ctx({ indicatorId: null, mine: [] })).pages) {
        expect(p.indicatorIds.length).toBeGreaterThanOrEqual(PAGE_DATA_RULES[p.kind].min);
      }
    }
  });

  it('id stron p1…pN i numeracja', () => {
    for (const e of ENTRIES) {
      for (const c of [ctx(), ctx({ hasUnit: false, hasPair: false })]) {
        const d = defaultDeck(e, c);
        const n = d.pages.length;
        expect(n).toBeGreaterThanOrEqual(1);
        expect(d.pages.map((p) => p.id)).toEqual(Array.from({ length: n }, (_, i) => `p${i + 1}`));
        const labels = numbering(d).map((x) => x.label);
        expect(labels).toEqual(Array.from({ length: n }, (_, i) => (n === 1 ? '' : `${i + 1}/${n}`)));
      }
    }
  });
});

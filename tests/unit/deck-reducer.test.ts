import { describe, it, expect } from 'vitest';
import { deckReducer, initDeckState } from '@/view/share/deckReducer';
import { defaultDeck } from '@/core/share/deck-defaults';
import { numbering } from '@/core/share/deck';

const ctx = { indicatorId: 'a1', mine: ['b101', 'b102'], hasUnit: true, hasPair: false };
const start = () => initDeckState('map', ctx);

describe('deckReducer', () => {
  it('start: zestaw z defaultDeck, current = pierwsza strona', () => {
    const s = start();
    expect(s.deck).toEqual(defaultDeck('map', ctx));
    expect(s.currentId).toBe(s.deck.pages[0].id);
  });

  it('removePage(current) przesuwa current na następną, a ostatnią na poprzednią', () => {
    let s = start();
    const [first, second] = s.deck.pages;
    s = deckReducer(s, { type: 'removePage', id: first.id });
    expect(s.currentId).toBe(second.id);
    const last = s.deck.pages[s.deck.pages.length - 1];
    s = deckReducer(s, { type: 'setCurrent', id: last.id });
    const prev = s.deck.pages[s.deck.pages.length - 2];
    s = deckReducer(s, { type: 'removePage', id: last.id });
    expect(s.currentId).toBe(prev.id);
  });

  it('nie usuwa ostatniej strony', () => {
    let s = start();
    for (const p of [...s.deck.pages]) s = deckReducer(s, { type: 'removePage', id: p.id });
    expect(s.deck.pages).toHaveLength(1);
    expect(s.currentId).toBe(s.deck.pages[0].id);
  });

  it('addPage zasiewa wskaźniki i ustawia nową stronę jako bieżącą', () => {
    let s = start();
    s = deckReducer(s, { type: 'addPage', kind: 'table', afterId: s.currentId });
    const added = s.deck.pages[1];
    expect(added.kind).toBe('table');
    expect(added.indicatorIds).toEqual(['b101', 'b102']);
    expect(s.currentId).toBe(added.id);
  });

  it('zmiana formatu i motywu nie zmienia zestawu', () => {
    const s = start();
    const a = deckReducer(s, { type: 'setFormat', format: 'story' });
    const b = deckReducer(a, { type: 'setTheme', theme: 'dark' });
    expect(b.format).toBe('story');
    expect(b.theme).toBe('dark');
    expect(b.deck).toBe(s.deck);
  });

  it('splitPage rozdziela wg bieżącego formatu, a zmiana formatu sama nic nie dzieli', () => {
    let s = start();
    s = deckReducer(s, { type: 'addPage', kind: 'table' });
    const id = s.currentId;
    for (let i = 0; i < 10; i++) s = deckReducer(s, { type: 'addIndicator', pageId: id, id: `b2${i}` });
    const before = s.deck.pages.length;
    s = deckReducer(s, { type: 'setFormat', format: 'wide' });
    expect(s.deck.pages).toHaveLength(before);
    s = deckReducer(s, { type: 'splitPage', id });
    expect(s.deck.pages.length).toBeGreaterThan(before);
    expect(s.deck.pages.filter((p) => p.options?.parts).length).toBeGreaterThan(1);
  });

  it('add/remove/replaceIndicator działają na stronie', () => {
    let s = start();
    const table = deckReducer(s, { type: 'addPage', kind: 'table' });
    const tid = table.currentId;
    let t = deckReducer(table, { type: 'addIndicator', pageId: tid, id: 'x1' });
    expect(t.deck.pages.find((p) => p.id === tid)?.indicatorIds).toContain('x1');
    t = deckReducer(t, { type: 'removeIndicator', pageId: tid, id: 'x1' });
    expect(t.deck.pages.find((p) => p.id === tid)?.indicatorIds).not.toContain('x1');
    const mapId = s.deck.pages[0].id;
    s = deckReducer(s, { type: 'replaceIndicator', pageId: mapId, id: 'z9' });
    expect(s.deck.pages[0].indicatorIds).toEqual(['z9']);
  });

  it('movePage zmienia kolejność', () => {
    let s = start();
    const [a, b] = s.deck.pages;
    s = deckReducer(s, { type: 'movePage', id: a.id, dir: 1 });
    expect(s.deck.pages[1].id).toBe(a.id);
    expect(s.deck.pages[0].id).toBe(b.id);
  });

  it('numbering zgodne z numbering(deck) po operacjach', () => {
    let s = start();
    s = deckReducer(s, { type: 'addPage', kind: 'map' });
    s = deckReducer(s, { type: 'removePage', id: s.deck.pages[0].id });
    expect(s.numbering).toEqual(numbering(s.deck));
  });
});

import { describe, expect, it } from 'vitest';
import {
  addPage, createDeck, getPage, movePage, numbering, pageIndex, removePage, updatePage,
  type Deck, type PageKind,
} from '../../src/core/share/deck';

const kinds: PageKind[] = ['map', 'ranking', 'table', 'bignumber'];
const mk = (n = 4): Deck => createDeck(kinds.slice(0, n).map((kind) => ({ kind, indicatorIds: ['i1'] })));
const ids = (d: Deck) => d.pages.map((p) => p.id);
const freeze = <T,>(o: T): T => {
  if (o && typeof o === 'object') { Object.values(o).forEach(freeze); Object.freeze(o); }
  return o;
};

describe('deck', () => {
  it('createDeck nadaje p1…p4 i numerację 1/4…4/4', () => {
    const d = mk();
    expect(ids(d)).toEqual(['p1', 'p2', 'p3', 'p4']);
    expect(numbering(d).map((x) => x.label)).toEqual(['1/4', '2/4', '3/4', '4/4']);
    expect(numbering(d)[1]).toEqual({ id: 'p2', n: 2, total: 4, label: '2/4' });
  });

  it('usunięcie strony 2 z 4 daje 1/3, 2/3, 3/3, a nowa strona dostaje p5', () => {
    const d = removePage(mk(), 'p2');
    expect(numbering(d).map((x) => x.label)).toEqual(['1/3', '2/3', '3/3']);
    expect(ids(addPage(d, { kind: 'trend', indicatorIds: [] }))).toEqual(['p1', 'p3', 'p4', 'p5']);
  });

  it('ostatniej strony nie da się usunąć (ta sama referencja)', () => {
    const one = mk(1);
    expect(removePage(one, 'p1')).toBe(one);
    expect(one.pages.length).toBe(1);
  });

  it('removePage nieznanego id zwraca ten sam obiekt', () => {
    const d = mk();
    expect(removePage(d, 'zzz')).toBe(d);
  });

  it('movePage zamienia miejscami, na krawędzi ta sama referencja', () => {
    const d = mk();
    expect(ids(movePage(d, 'p2', -1))).toEqual(['p2', 'p1', 'p3', 'p4']);
    expect(ids(movePage(d, 'p2', 1))).toEqual(['p1', 'p3', 'p2', 'p4']);
    expect(movePage(d, 'p1', -1)).toBe(d);
    expect(movePage(d, 'p4', 1)).toBe(d);
    expect(movePage(d, 'zzz', 1)).toBe(d);
  });

  it('addPage: za wskazaną, domyślnie na końcu, nieznane afterId na końcu', () => {
    const p = { kind: 'histogram' as const, indicatorIds: [] };
    expect(ids(addPage(mk(), p, 'p2'))).toEqual(['p1', 'p2', 'p5', 'p3', 'p4']);
    expect(ids(addPage(mk(), p))).toEqual(['p1', 'p2', 'p3', 'p4', 'p5']);
    expect(ids(addPage(mk(), p, null))).toEqual(['p1', 'p2', 'p3', 'p4', 'p5']);
    expect(ids(addPage(mk(), p, 'zzz'))).toEqual(['p1', 'p2', 'p3', 'p4', 'p5']);
  });

  it('N = 1 daje pustą etykietę', () => {
    expect(numbering(mk(1))[0].label).toBe('');
    expect(numbering(mk(1))[0].total).toBe(1);
  });

  it('operacje nie mutują zamrożonego decka', () => {
    const d = freeze(mk());
    expect(() => {
      addPage(d, { kind: 'map', indicatorIds: [] }, 'p1');
      removePage(d, 'p2');
      movePage(d, 'p2', 1);
      updatePage(d, 'p1', { kind: 'trend' });
      numbering(d);
    }).not.toThrow();
    expect(ids(d)).toEqual(['p1', 'p2', 'p3', 'p4']);
  });

  it('updatePage zmienia tylko wskazaną stronę, reszta zachowuje referencje', () => {
    const d = mk();
    const u = updatePage(d, 'p2', { options: { side: 'bottom' } });
    expect(getPage(u, 'p2')?.options?.side).toBe('bottom');
    expect(getPage(u, 'p2')?.id).toBe('p2');
    expect(u.pages[0]).toBe(d.pages[0]);
    expect(u.pages[2]).toBe(d.pages[2]);
    expect(updatePage(d, 'zzz', { kind: 'map' })).toBe(d);
  });

  it('pageIndex i getPage', () => {
    const d = mk();
    expect(pageIndex(d, 'p3')).toBe(2);
    expect(pageIndex(d, 'zzz')).toBe(-1);
    expect(getPage(d, 'p3')?.kind).toBe('table');
    expect(getPage(d, 'zzz')).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { readLastVisit, sinceLastVisit, touchVisit, VISIT_KEY } from '../../src/core/start/since-last-visit';
import { PLACE_KEY } from '../../src/core/start/place-memory';
import { findViolations } from '../../src/core/facts/tone-guard';
import { SinceLastVisit } from '../../src/view/start/SinceLastVisit';

const ledger = {
  'avg-wage': { year: 2025, since: '2026-11-20T00:00:00.000Z' },
  'unemployment-rate': { year: 2025, since: '2026-10-01T00:00:00.000Z' },
  'forest-cover': { year: 2025, since: '2026-11-22T00:00:00.000Z' },
  'regon-per-10k': { year: 2025, since: '2026-11-21T00:00:00.000Z' },
  'sewerage-share': { year: 2025, since: '2026-11-23T00:00:00.000Z' },
};
const mem = (init: Record<string, string> = {}) => {
  const m = new Map(Object.entries(init));
  return { m, store: { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } };
};
const view = (props: Partial<Parameters<typeof SinceLastVisit>[0]>) =>
  renderToString(
    <StaticRouter location="/">
      <SinceLastVisit teryt="3204033" ledger={ledger} to={(h) => h} {...props} />
    </StaticRouter>,
  );

describe('W34-O10 od ostatniej wizyty', () => {
  it('nowości sprzed wizyty nie są pokazywane; po niej tak, maks. 3', () => {
    const items = sinceLastVisit('2026-11-10T00:00:00.000Z', ledger);
    expect(items.map((i) => i.indicatorId)).toEqual(['sewerage-share', 'forest-cover', 'regon-per-10k']);
    expect(sinceLastVisit('2026-11-10T00:00:00.000Z', { 'unemployment-rate': ledger['unemployment-rate'] })).toEqual([]);
    expect(sinceLastVisit(null, ledger)).toEqual([]);
    const html = view({ initialLastVisit: '2026-11-10T00:00:00.000Z' });
    expect(html).toContain('Od 10 listopada 2026: nowe dane');
    expect(html).toContain('/mapa?i=sewerage-share&amp;y=2025&amp;u=3204033');
    expect(findViolations(html.replace(/<[^>]+>/g, ' '))).toEqual([]);
  });
  it('brak nowości = nic nie pokazuje', () => {
    expect(view({ initialLastVisit: '2026-12-01T00:00:00.000Z' })).toBe('');
    expect(view({ initialLastVisit: null })).toBe('');
  });
  it('brak zapamiętanego miejsca = nic nie zapisujemy; z miejscem zapisujemy jeden klucz', () => {
    const none = mem();
    touchVisit(new Date('2026-11-27T10:00:00Z'), none.store);
    expect(none.m.size).toBe(0);
    const some = mem({ [PLACE_KEY]: '3204033' });
    touchVisit(new Date('2026-11-27T10:00:00Z'), some.store);
    expect([...some.m.keys()].sort()).toEqual([PLACE_KEY, VISIT_KEY].sort());
    expect(readLastVisit(some.store)).toBe('2026-11-27T10:00:00.000Z');
  });
  it('wyjątek z localStorage nie psuje renderu ani odczytu', () => {
    const boom = { getItem: () => { throw new Error('zablokowane'); }, setItem: () => { throw new Error('zablokowane'); }, removeItem: () => {} };
    expect(readLastVisit(boom)).toBeNull();
    expect(() => touchVisit(new Date(), boom)).not.toThrow();
    expect(() => view({})).not.toThrow();
  });
  it('śmieciowa data w pamięci = brak wizyty', () => {
    expect(readLastVisit(mem({ [VISIT_KEY]: 'nie data' }).store)).toBeNull();
  });
});

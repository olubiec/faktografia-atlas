import { describe, expect, it } from 'vitest';
import { buildScope, filterInScope, isStale, loadScope, scopeReason } from '../../scripts/data/library-scope.mjs';
import { sortQueueByPriority } from '../../scripts/data/library-priority.mjs';
import curation from '../../config/library-curation.json';
import scopeFile from '../../config/library-scope.json';
import priority from '../../config/library-priority.json';
import indicators from '../../config/indicators.json';
import * as rules from '../../src/core/catalog/curation-rules';

// Wytyczne robota „Biblioteka GUS”: pobiera tylko tematy z listy, które przechodzą reguły strony.
type V = { id: number; subjectId: string; level: number; unit?: string; n1?: string; n2?: string; n3?: string; n4?: string; n5?: string };

const scope = buildScope({
  scope: { maxDepth: 2, dropNamePatterns: ['^(styczeń|grudzień) – ', 'wskaźnik precyzji'], topics: { P1: 'Ludność › Wskaźniki', P2: 'Rynek pracy › Stopa' } },
  curation,
  indicators: [{ bdlVarId: 60559 }],
  priority: { pinnedIds: [999] },
});
const LUD = ['LUDNOŚĆ', 'STAN LUDNOŚCI', 'Wskaźniki'];
const v = (over: Partial<V>): V => ({ id: 1, subjectId: 'P1', level: 6, unit: 'osoba', n1: 'urodzenia żywe na 1000 ludności', ...over });

describe('Biblioteka GUS – wytyczne pobierania', () => {
  it('prosty wskaźnik z tematu na liście wchodzi', () => {
    expect(scopeReason(v({}), LUD, scope)).toBeNull();
  });

  it('temat spoza listy nie zużywa zapytań', () => {
    expect(scopeReason(v({ subjectId: 'P777' }), LUD, scope)).toBe('temat spoza wytycznych');
  });

  it('wbudowane i przypięte wchodzą zawsze, nawet spoza listy tematów', () => {
    expect(scopeReason(v({ id: 60559, subjectId: 'P777' }), LUD, scope)).toBeNull();
    expect(scopeReason(v({ id: 999, subjectId: 'P777', level: 3 }), LUD, scope)).toBeNull();
  });

  it('same województwa (poziom < 5) – pomijane', () => {
    expect(scopeReason(v({ level: 3 }), LUD, scope)).toBe('brak danych dla powiatów i gmin');
  });

  it('zbyt szczegółowy podział (więcej niż maxDepth członów) – pomijany', () => {
    const deep = v({ n1: 'ogółem', n2: 'miasta', n3: 'mężczyźni', n4: '25-29' });
    expect(scopeReason(deep, LUD, scope)).toBe('zbyt szczegółowy podział');
    expect(scopeReason(v({ n1: 'ogółem', n2: 'mieszkania' }), LUD, scope)).toBeNull();
  });

  it('reguły strony obowiązują też robota (to samo, co strona ukrywa)', () => {
    expect(scopeReason(v({ n1: 'ludność', n2: 'wg płci' }), LUD, scope)).toBe('wariant dla specjalistów');
    expect(scopeReason(v({ n1: 'bezrobotni – kobiety' }), LUD, scope)).toBe('podział na płeć');
    expect(scopeReason(v({ unit: 'dam3' }), LUD, scope)).toBe('jednostka techniczna');
    expect(scopeReason(v({}), ['POWSZECHNE SPISY ROLNE', 'X'], scope)).toBe('dział niszowy');
    expect(scopeReason(v({ id: Number(curation.dropIds[0]) }), LUD, scope)).toBe('odrzucony po przeglądzie');
  });

  it('dane miesięczne i dopiski techniczne – pomijane', () => {
    expect(scopeReason(v({ n1: 'styczeń', n2: 'ogółem' }), LUD, scope)).toBe('dane miesięczne lub techniczny podział');
    expect(scopeReason(v({ n1: '25-54', n2: 'wskaźnik precyzji' }), LUD, scope)).toBe('dane miesięczne lub techniczny podział');
  });

  it('kolejka robota zawiera tylko zmienne z wytycznych', () => {
    const catalog = {
      subjects: { P1: { path: LUD }, P777: { path: ['NARODOWE SPISY POWSZECHNE', 'NSP', 'X'] } },
      variables: { 1: v({}), 2: v({ id: 2, subjectId: 'P777' }), 3: v({ id: 3, n1: 'zgony na 1000 ludności' }) },
    };
    const wanted = filterInScope(Object.values(catalog.variables), catalog, scope);
    const queue = sortQueueByPriority(wanted, catalog, { ...priority, pinnedIds: [] }, { done: {}, failed: {} }) as V[];
    expect(queue.map((x) => x.id).sort()).toEqual([1, 3]);
  });

  it('dane archiwalne (ostatni rok przed progiem) nie są odświeżane', () => {
    expect(isStale([2008, 2012], scope)).toBe(true);
    expect(isStale([2012, 2023], scope)).toBe(false);
    expect(isStale([], scope)).toBe(false);
  });
});

describe('config/library-scope.json i library-curation.json', () => {
  it('tematy to kody P… z opisem, jest ich rozsądnie dużo', () => {
    const topics = Object.entries(scopeFile.topics);
    expect(topics.length).toBeGreaterThan(50);
    for (const [code, label] of topics) {
      expect(code).toMatch(/^P\d+$/);
      expect(label.length).toBeGreaterThan(3);
    }
  });

  it('wzorce nazw to poprawne wyrażenia regularne', () => {
    for (const p of scopeFile.dropNamePatterns) expect(() => new RegExp(p, 'u')).not.toThrow();
  });

  it('strona i robot korzystają z tych samych reguł', () => {
    expect(rules.DROP_NAME_PARTS).toEqual(curation.dropNameParts);
    expect([...rules.DROP_IDS]).toEqual(curation.dropIds);
    expect(rules.STALE_BEFORE_YEAR).toBe(curation.staleBeforeYear);
  });

  it('wytyczne z plików wpuszczają wszystkie wskaźniki wbudowane i przypięte', async () => {
    const real = await loadScope();
    for (const i of indicators as { bdlVarId: number }[]) {
      expect(scopeReason({ id: i.bdlVarId, subjectId: 'P0', level: 1 }, [], real)).toBeNull();
    }
    for (const id of priority.pinnedIds) expect(scopeReason({ id, subjectId: 'P0', level: 1 }, [], real)).toBeNull();
  });
});

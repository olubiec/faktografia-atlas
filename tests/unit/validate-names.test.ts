import { describe, expect, it } from 'vitest';
import { checkNames } from '../../src/core/validate/names';
import type { CatalogEntry } from '../../src/core/catalog/tree';

const e = (id: string, name: string, unit = ''): CatalogEntry =>
  ({ id, name, section: 'S', group: 'G', topic: 'T', unit, levels: ['gmi'], builtin: false }) as CatalogEntry;

describe('checkNames', () => {
  it('wykrywa nazwy bez podmiotu, powtórzone „ogółem” i surowe sufiksy', () => {
    const f = checkNames([e('1', 'ogółem'), e('2', 'Zgony – ogółem – ogółem'), e('3', 'Dzieci stan w dniu 31 grudnia')]);
    expect(f.map((x) => x.rule).sort()).toEqual(['bare-name', 'raw-suffix', 'repeated-total']);
  });
  it('wykrywa duplikaty w temacie i niejasną jednostkę', () => {
    const f = checkNames([e('1', 'Zgony na 1000 ludności', 'osoba'), e('2', 'Wydatki'), e('3', 'Wydatki')]);
    expect(f.map((x) => x.rule).sort()).toEqual(['duplicate-in-topic', 'vague-unit']);
  });
  it('czyste nazwy nie dają uwag', () => {
    expect(checkNames([e('1', 'Ludność ogółem'), e('2', 'Zgony na 1000 ludności', 'na 1000 ludności')])).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import indicatorsData from '../../config/indicators.json' with { type: 'json' };
import synonyms from '../../config/synonyms.json' with { type: 'json' };
import fixture from '../fixtures/catalog/search-queries.json' with { type: 'json' };
import { noDataMessage, searchCatalog, searchOutcome, stem } from '../../src/core/catalog/search';
import { synonymsOf } from '../../src/core/catalog/synonyms';
import { buildCatalogTree } from '../../src/core/catalog/tree';
import type { AvailableFile } from '../../src/core/indicators/registry';
import type { Indicator } from '../../src/core/profile/profile';

const tree = buildCatalogTree(indicatorsData as Indicator[], fixture.available as AvailableFile);
const firstId = (q: string) => searchCatalog(tree, q)[0]?.entry.id ?? null;

describe('B05 – szukajka: 15 haseł zwykłego człowieka', () => {
  it('fixture ma 15 haseł', () => {
    expect(fixture.queries).toHaveLength(15);
  });

  for (const { q, first, allowNone } of fixture.queries as { q: string; first: string | null; allowNone?: boolean }[]) {
    it(`„${q}” → ${first ?? 'brak'}`, () => {
      const got = firstId(q);
      // Hasła bez danych (np. „lekarze”) mogą dać komunikat „Nie mamy jeszcze tych danych”.
      const accepted = allowNone && got === null ? null : first;
      expect(got).toBe(accepted);
      expect(searchOutcome(tree, q).kind).toBe(got === null ? 'none' : 'hits');
    });
  }
});

describe('B05 – szukajka: zachowanie', () => {
  it('synonim „zarobki” znajduje „wynagrodzenie” (wpisany w config/synonyms.json)', () => {
    expect(synonymsOf('zarobki')).toContain('wynagrodzenie');
    expect(synonyms.words.zarobki).toContain('wynagrodzenie');
    expect(searchCatalog(tree, 'zarobki').map((h) => h.entry.id)).toContain('avg-wage');
  });

  it('polskie znaki i wielkość liter bez znaczenia', () => {
    const ids = (q: string) => searchCatalog(tree, q).map((h) => h.entry.id);
    expect(ids('LUDNOŚĆ')).toEqual(ids('ludnosc'));
    expect(ids('Ścieki')).toEqual(ids('scieki'));
    expect(ids('Szkoły')).toEqual(ids('szkoly'));
  });

  it('wszystkie słowa muszą pasować; zbyt krótka fraza nic nie szuka', () => {
    expect(searchCatalog(tree, 'bezrobotni płci').map((h) => h.entry.id)).toEqual(['b7002']);
    expect(searchCatalog(tree, 'l')).toEqual([]);
    expect(searchCatalog(tree, '  ')).toEqual([]);
  });

  it('dane archiwalne nie pojawiają się w wynikach', () => {
    const ids = searchCatalog(tree, 'bezrobotni').map((h) => h.entry.id);
    expect(ids).not.toContain('b7001');
  });

  it('wynik niesie dział i grupę', () => {
    const hit = searchCatalog(tree, 'kino')[0]!;
    expect(hit.section).toBe('Kultura');
    expect(hit.group).toBe('Kina');
  });

  it('brak wyniku: komunikat „Nie mamy jeszcze tych danych o „…”.” bez „Zamów”', () => {
    const outcome = searchOutcome(tree, 'zzzzqq');
    expect(outcome.kind).toBe('none');
    if (outcome.kind !== 'none') return;
    expect(outcome.message).toBe('Nie mamy jeszcze tych danych o „zzzzqq”.');
    expect(noDataMessage(' lekarze ')).toBe('Nie mamy jeszcze tych danych o „lekarze”.');
    expect(JSON.stringify(outcome)).not.toMatch(/zamów/i);
  });

  it('brak wyniku wskazuje najbliższy dział z podpowiedzi synonimów', () => {
    const outcome = searchOutcome(tree, 'nauczyciele');
    expect(outcome).toMatchObject({ kind: 'none', nearestSection: 'Szkolnictwo' });
  });

  it('stem ucina końcówki, ale krótkich słów nie rusza', () => {
    expect(stem('szkoły')).toBe('szko');
    expect(stem('dom')).toBe('dom');
    expect(stem('kino')).toBe(stem('kina'));
  });
});

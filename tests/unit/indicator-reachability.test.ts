import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Indicator } from '../../src/core/profile/profile';
import { buildRegistry, type AvailableFile } from '../../src/core/indicators/registry';
import { BASIC_INDICATORS } from '../../src/core/my-indicators/my-indicators';
import { auditIndicators, searchIndicators } from '../../src/core/indicators/reachability';

const ROOT = join(__dirname, '..', '..');
const readJson = <T>(path: string): T => JSON.parse(readFileSync(join(ROOT, path), 'utf8')) as T;

const main = readJson<Indicator[]>('config/indicators.json');
const available = readJson<AvailableFile>('tests/fixtures/library/available.json');
const valuesFileIds = readdirSync(join(ROOT, 'public/data/values'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''));
const profileShards: Record<string, string[]> = {};
for (const file of readdirSync(join(ROOT, 'public/data/profiles')).filter((f) => /^\d+\.json$/.test(f))) {
  const shard = readJson<{ years: Record<string, unknown> }>(`public/data/profiles/${file}`);
  profileShards[file.replace(/\.json$/, '')] = Object.keys(shard.years);
}

const base = () => ({ main, valuesFileIds, available, basic: BASIC_INDICATORS, profileShards });

const variable = (id: string, n: string, c: string) => ({ id, n, u: 'osoba', c, lv: ['pow' as const], y: [2024] });
const withLibrary = (variables: AvailableFile['variables']): AvailableFile => ({ version: 1, variables });

describe('auditIndicators na prawdziwych plikach repo (strażnik)', () => {
  it('nie zgłasza problemów, a sprawdza co najmniej 20 wskaźników', () => {
    const result = auditIndicators(base());
    expect(result.problems).toEqual([]);
    expect(result.checked).toBeGreaterThanOrEqual(20);
    expect(Object.keys(profileShards)).toHaveLength(16);
  });
});

describe('auditIndicators – wykrywanie problemów', () => {
  it('brak pliku wartości dla wskaźnika głównego', () => {
    const ids = valuesFileIds.filter((id) => id !== 'density');
    const { problems } = auditIndicators({ ...base(), valuesFileIds: ids });
    expect(problems.some((p) => p.includes('density') && p.includes('bez pliku wartości'))).toBe(true);
  });

  it('plik wartości bez wpisu w configu', () => {
    const { problems } = auditIndicators({ ...base(), valuesFileIds: [...valuesFileIds, 'obcy-wskaznik'] });
    expect(problems.some((p) => p.includes('obcy-wskaznik') && p.includes('plik bez wpisu w config'))).toBe(true);
  });

  it('wskaźnik podstawowy spoza głównych', () => {
    const { problems } = auditIndicators({ ...base(), basic: [...BASIC_INDICATORS, 'nie-ma-takiego'] });
    expect(problems.some((p) => p.includes('nie-ma-takiego') && p.includes('podstawow'))).toBe(true);
  });

  it('zduplikowane id w głównych', () => {
    const { problems } = auditIndicators({ ...base(), main: [...main, main[0]] });
    expect(problems.some((p) => p.includes(main[0].id) && p.includes('duplikat'))).toBe(true);
  });

  it('wskaźnik usunięty z jednego pliku profilu – problem z numerem województwa i id', () => {
    const shards = { ...profileShards, '12': profileShards['12'].filter((id) => id !== 'population') };
    const { problems } = auditIndicators({ ...base(), profileShards: shards });
    expect(problems).toContain('profil 12 nie ma wskaźnika population');
  });

  it('available = null: audyt dotyczy tylko głównych, bez wyjątku', () => {
    const result = auditIndicators({ ...base(), available: null });
    expect(result.problems).toEqual([]);
    expect(result.checked).toBe(main.length);
  });
});

describe('searchIndicators i rozróżnialność', () => {
  it('znajduje „Ludność” frazą bez polskich znaków', () => {
    const lib = withLibrary([variable('900', 'Ludność', 'Ludność > Struktura')]);
    const found = searchIndicators(buildRegistry(main, lib).all, 'ludnosc');
    expect(found.some((i) => i.name === 'Ludność')).toBe(true);
  });

  it('pusta fraza zwraca całą listę', () => {
    expect(searchIndicators(main, '')).toEqual(main);
  });

  it('dwa wskaźniki biblioteki o tej samej nazwie i opisie – „nie do odróżnienia”', () => {
    const lib = withLibrary([
      variable('901', 'Zgony', 'Ludność > Zgony'),
      variable('902', 'Zgony', 'Ludność > Zgony'),
    ]);
    const { problems } = auditIndicators({ ...base(), available: lib, profileShards: undefined });
    expect(problems.some((p) => p.includes('nie do odróżnienia') && p.includes('b901') && p.includes('b902'))).toBe(true);
  });

  it('ta sama nazwa, ale inny dział – brak problemu', () => {
    const lib = withLibrary([
      variable('901', 'Zgony', 'Ludność > Zgony'),
      variable('902', 'Zgony', 'Zdrowie > Zgony'),
    ]);
    const { problems } = auditIndicators({ ...base(), available: lib, profileShards: undefined });
    expect(problems).toEqual([]);
  });
});

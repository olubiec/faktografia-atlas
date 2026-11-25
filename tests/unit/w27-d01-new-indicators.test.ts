import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Indicator } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';
import { buildRegistry, type AvailableFile } from '../../src/core/indicators/registry';
import { checkValuesFile } from '../../scripts/data/contract.mjs';

// W27-D01: nowe wskaźniki główne. Liczby pochodzą wyłącznie z pliku robota (public/data).
const root = process.cwd();
const read = <T>(rel: string): T => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')) as T;

const NEW: { id: string; bdlVarId: number }[] = [
  { id: 'births-per-1000', bdlVarId: 450540 },
  { id: 'deaths-per-1000', bdlVarId: 450541 },
  { id: 'old-per-100-young', bdlVarId: 60564 },
  { id: 'people-per-pharmacy', bdlVarId: 60583 },
  { id: 'bike-paths-per-10k', bdlVarId: 288082 },
];

const indicators = read<Indicator[]>('config/indicators.json');
const units = read<Unit[]>('public/data/units.json');
const gminy = units.filter((u) => u.level === 'gmi');
const explanations = read<{ items: { indicatorId: string; short: string; howToRead: string }[] }>(
  'public/data/explanations.json',
);

type ValuesFile = { years: number[]; values: Record<string, (number | null)[]> };

describe('W27-D01: nowe wskaźniki główne', () => {
  for (const n of NEW) {
    describe(n.id, () => {
      it('ma wpis w config/indicators.json z podanym bdlVarId i poziomem gmi', () => {
        const ind = indicators.find((i) => i.id === n.id);
        expect(ind).toBeDefined();
        expect(ind?.bdlVarId).toBe(n.bdlVarId);
        expect(ind?.minLevel).toBe('gmi');
      });

      it('plik wartości zgodny z kontraktem, ostatni rok ≥ 2024, ≥ 95% gmin, seria ≥ 4 lata', () => {
        const ind = indicators.find((i) => i.id === n.id)!;
        const json = read<ValuesFile>(`public/data/values/${n.id}.json`);
        expect(checkValuesFile(json, ind, units)).toEqual([]);
        const last = json.years.length - 1;
        expect(json.years[last]).toBeGreaterThanOrEqual(2024);
        expect(json.years.length).toBeGreaterThanOrEqual(4);
        const withValue = gminy.filter((g) => typeof json.values[g.teryt]?.[last] === 'number').length;
        expect(withValue / gminy.length).toBeGreaterThanOrEqual(0.95);
      });

      it('ma objaśnienie w explanations.json', () => {
        const ex = explanations.items.find((e) => e.indicatorId === n.id);
        expect(ex?.short.length).toBeGreaterThan(0);
        expect(ex?.howToRead.length).toBeGreaterThan(0);
      });
    });
  }

  it('objaśnienia: grupy wieku według GUS i ostrzeżenie o zgonach', () => {
    const old = explanations.items.find((e) => e.indicatorId === 'old-per-100-young')!;
    expect(old.howToRead).toContain('0–17');
    expect(old.howToRead).toContain('60+');
    expect(old.howToRead).toContain('65+');
    const deaths = explanations.items.find((e) => e.indicatorId === 'deaths-per-1000')!;
    expect(deaths.howToRead).toContain('starszej ludności');
  });

  it('rejestr nie ma dwóch pozycji z tym samym bdlVarId (także przy pełnym spisie biblioteki)', () => {
    const available: AvailableFile = {
      version: 1,
      variables: NEW.map((n) => ({
        id: String(n.bdlVarId), n: 'Zmienna z biblioteki', u: 'x', c: 'Ludność > X', lv: ['gmi' as const], y: [2024],
      })),
    };
    const r = buildRegistry(indicators, available);
    const ids = r.all.map((i) => i.bdlVarId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const n of NEW) expect(r.byId.has(`b${n.bdlVarId}`)).toBe(false);
  });

  it('profil każdej gminy z województwa zawiera nowe wskaźniki (próbka: woj. 02)', () => {
    const prof = read<{ units: Record<string, { indicatorId: string }[]> }>('public/data/profiles/02.json');
    const gmina = Object.keys(prof.units).find((k) => k.length === 7)!;
    const got = new Set(prof.units[gmina].map((r) => r.indicatorId));
    const present = NEW.filter((n) => got.has(n.id));
    expect(present.length).toBeGreaterThanOrEqual(3);
  });

  it('fakty zbudowane przez robota dotyczą co najmniej trzech nowych wskaźników', () => {
    const dir = path.join(root, 'public/data/facts');
    let text = '';
    for (const f of fs.readdirSync(dir)) text += fs.readFileSync(path.join(dir, f), 'utf8');
    const found = NEW.filter((n) => text.includes(`"${n.id}"`));
    expect(found.length).toBeGreaterThanOrEqual(3);
  });
});

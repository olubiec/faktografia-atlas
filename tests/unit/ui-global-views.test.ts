import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { fallbackLevel, levelsWithData } from '../../src/core/map/level-data';

const src = (p: string) => readFileSync(p, 'utf8');

describe('UI-GLOBAL 3: poziomy bez danych we wszystkich przełącznikach', () => {
  test('ranking (strona Rankingi) wyłącza i omija poziomy bez danych tak jak mapa', () => {
    const s = src('src/view/pages/Rankings.tsx');
    expect(s).toContain('levelsWithData');
    expect(s).toContain('fallbackLevel');
  });

  test('levelsWithData i fallbackLevel: brak gmin → najbliższy poziom z danymi', () => {
    const v = { years: [2024], values: { '02': [1], '0201': [2], '0201011': [null] } };
    expect(levelsWithData(v, 2024)).toEqual(['woj', 'pow']);
    expect(fallbackLevel('gmi', ['woj', 'pow'])).toBe('pow');
  });
});

describe('UI-GLOBAL 4: przewijanie wybieraków bez przewijania tła', () => {
  for (const f of [
    'src/view/controls/IndicatorPicker.tsx',
    'src/view/main/SheetIndicatorPicker.tsx',
    'src/view/profile/AddIndicatorWindow.tsx',
    'src/view/profile/ProfileIndicatorList.tsx',
    'src/view/search/SearchDialog.tsx',
    'src/view/data-menu/DataMenu.tsx',
    'src/view/data-menu/DataMenuTree.tsx',
    'src/view/ui/Window.tsx',
  ]) {
    test(`${f}: każdy własny kontener przewijania ma overscroll-contain`, () => {
      const lines = src(f).split('\n').filter((l) => /overflow-y-auto/.test(l));
      expect(lines.length).toBeGreaterThan(0);
      for (const l of lines) expect(l).toContain('overscroll-contain');
    });
  }
});

describe('UI-GLOBAL 6: nazwy jednostek w listach nigdy nie są skracane', () => {
  for (const f of [
    'src/view/ranking/RankingBars.tsx',
    'src/view/profile/ProfileChildren.tsx',
    'src/view/start/StartLists.tsx',
    'src/view/profile/CompareMaps.tsx',
    'src/view/profile/ProfileCompare.tsx',
    'src/view/profile/ProfileCompareTable.tsx',
    'src/view/compare/PlacePicker.tsx',
  ]) {
    test(`${f}: brak truncate przy nazwach jednostek`, () => {
      const lines = src(f).split('\n').filter((l) => /truncate/.test(l) && !/valueLabel/.test(l));
      expect(lines).toEqual([]);
    });
  }

  test('lista jednostek podrzędnych i lista startowa pokazują wartość pod nazwą', () => {
    expect(src('src/view/profile/ProfileChildren.tsx')).toContain('flex-col items-start');
    expect(src('src/view/start/StartLists.tsx')).toContain('flex-col');
  });
});

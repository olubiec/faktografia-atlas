import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PlacePicker, PlacePickerView, type PickerState } from '../../src/view/compare/PlacePicker';
import type { SearchResult } from '../../src/core/search';
import type { LocalitySearchResult } from '../../src/core/search/localities';
import type { Unit } from '../../src/core/units/types';

// Uwaga: środowisko testów jest „node” (bez DOM i bez Testing Library, a nowych
// pakietów nie wolno dodawać), więc zachowanie sprawdzamy na czystej logice
// (buildOptions, reduceKey) i na znaczniku widoku (renderToString).

const { buildOptions, reduceKey, selectedLabel } = PlacePicker.logic;

const unit = (teryt: string, name: string, level: Unit['level']): Unit => ({
  teryt, bdlId: null, name, level, parent: null, bbox: [0, 0, 0, 0], centroid: [0, 0],
});
const krakowPow = unit('1261000', 'Kraków', 'pow');
const unitsMap = new Map<string, Unit>([[krakowPow.teryt, krakowPow]]);

const unitHit = (teryt: string, name: string): SearchResult => ({
  kind: 'unit', teryt, name, label: 'miasto na prawach powiatu', context: 'małopolskie', score: 1,
});
const krakow = unitHit('1261000', 'Kraków');
const krakowek = unitHit('1203041', 'Krakówek');
const locality: LocalitySearchResult = {
  id: 'loc-1', teryt: '1206011', gminaTeryt: '1206011', kind: 'locality',
  name: 'Krakowiany', type: 'wieś', gminaName: 'Brzeźnica', label: 'wieś', context: 'gmina Brzeźnica',
};

const base: PickerState = { query: 'Krak', open: true, active: 0 };

describe('PlacePicker – logika i widok (QC202)', () => {
  it('„Krak” pokazuje „Kraków”, a Enter wybiera jego kod', () => {
    const options = buildOptions([krakow], [], unitsMap, null);
    const html = renderToString(
      <PlacePickerView label="Miejsce A" id="a" state={base} options={options} ready value={null} valueLabel="" onQuery={() => {}} onClear={() => {}} onPick={() => {}} />
    );
    expect(html).toContain('Kraków');
    expect(html).toContain('role="listbox"');
    expect(reduceKey(base, 'Enter', options).selected).toBe('1261000');
  });

  it('strzałka w dół zmienia aktywną pozycję (aria-activedescendant), Escape zamyka listę', () => {
    const options = buildOptions([krakow, krakowek], [], unitsMap, null);
    const html = (s: PickerState) =>
      renderToString(
        <PlacePickerView label="A" id="a" state={s} options={options} ready value={null} valueLabel="" onQuery={() => {}} onClear={() => {}} onPick={() => {}} />
      );
    expect(html(base)).toContain('aria-activedescendant="a-opt-0"');
    const down = reduceKey(base, 'ArrowDown', options).state;
    expect(down.active).toBe(1);
    expect(html(down)).toContain('aria-activedescendant="a-opt-1"');
    expect(reduceKey(down, 'ArrowUp', options).state.active).toBe(0);
    const closed = reduceKey(down, 'Escape', options).state;
    expect(closed.open).toBe(false);
    expect(html(closed)).toContain('aria-expanded="false"');
    expect(reduceKey(base, 'Tab', options)).toEqual({ state: { ...base, open: false } });
  });

  it('po wyborze widać nazwę z rodzajem i przycisk „Wyczyść”, bez pola tekstowego', () => {
    expect(selectedLabel(krakowPow, '1261000')).toBe('Kraków (powiat grodzki)');
    const html = renderToString(
      <PlacePickerView label="Miejsce A" id="a" state={{ query: '', open: false, active: 0 }} options={[]} ready value="1261000" valueLabel="Kraków (powiat grodzki)" onQuery={() => {}} onClear={() => {}} onPick={() => {}} />
    );
    expect(html).toContain('Kraków (powiat grodzki)');
    expect(html).toContain('aria-label="Wyczyść Miejsce A"');
    expect(html).not.toContain('role="combobox"');
  });

  it('excludeTeryt ukrywa wskazane miejsce (także miejscowość z tej gminy)', () => {
    const options = buildOptions([krakow, krakowek], [locality], unitsMap, '1261000');
    expect(options.map((o) => o.teryt)).toEqual(['1203041', '1206011']);
    expect(buildOptions([krakow], [locality], unitsMap, '1206011').map((o) => o.teryt)).toEqual(['1261000']);
  });

  it('brak trafień pokazuje komunikat w roli status', () => {
    const html = renderToString(
      <PlacePickerView label="A" id="a" state={{ query: 'zzzz', open: true, active: 0 }} options={[]} ready value={null} valueLabel="" onQuery={() => {}} onClear={() => {}} onPick={() => {}} />
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('Nie znaleźliśmy takiego miejsca');
  });

  it('wybór miejscowości zwraca TERYT jej gminy, nie kod miejscowości', () => {
    const options = buildOptions([], [locality], unitsMap, null);
    expect(options[0].teryt).toBe('1206011');
    expect(reduceKey(base, 'Enter', options).selected).toBe('1206011');
    expect(reduceKey(base, 'Enter', options).selected).not.toBe('loc-1');
  });

  it('lista ma najwyżej 8 pozycji, a pole i pozycje mają min. 44 px', () => {
    const many = Array.from({ length: 12 }, (_, i) => unitHit(`12030${i}1`, `Kraków ${i}`));
    expect(buildOptions(many, [], unitsMap, null)).toHaveLength(8);
    const options = buildOptions([krakow], [], unitsMap, null);
    const html = renderToString(
      <PlacePickerView label="A" id="a" state={base} options={options} ready value={null} valueLabel="" onQuery={() => {}} onClear={() => {}} onPick={() => {}} />
    );
    expect(html).toContain('min-h-[44px]');
    expect(html).toMatch(/role="option"[^>]*class="[^"]*min-h-\[44px\]/);
    expect(html).not.toMatch(/transition-(?!none)/);
  });
});

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { IndicatorPickerContent } from '../../src/view/controls/IndicatorPicker';
import { LibraryGroup, LibraryItem } from '../../src/view/controls/LibraryGroup';
import { buildRegistry, type AvailableFile } from '../../src/core/indicators/registry';
import type { Indicator } from '../../src/core/profile/profile';

const root = process.cwd();
const main: Indicator[] = JSON.parse(fs.readFileSync(path.join(root, 'config/indicators.json'), 'utf8'));
const available: AvailableFile = JSON.parse(
  fs.readFileSync(path.join(root, 'tests/fixtures/library/available.json'), 'utf8')
);
const mixed = buildRegistry(main, available).all;
const HEADER = 'Z biblioteki GUS';

function render(indicators: Indicator[], query = '', value: string | null = null, onSelect = () => {}) {
  return renderToString(
    <IndicatorPickerContent
      indicators={indicators}
      value={value}
      query={query}
      onQueryChange={() => {}}
      onSelect={onSelect}
    />
  );
}

function manyLibrary(n: number): Indicator[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `b${1000 + i}`,
    bdlVarId: 1000 + i,
    name: `Zmienna testowa ${String(i).padStart(3, '0')}`,
    unit: 'szt.',
    description: '',
    group: 'Testy',
    higherIsBetter: null,
    minLevel: 'pow',
  })) as Indicator[];
}

const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

describe('IndicatorPicker – grupa „Z biblioteki GUS” (QC607)', () => {
  it('lista mieszana: nagłówek i 5 pozycji pod głównymi', () => {
    expect(mixed.length).toBe(main.length + 5);
    const html = render(mixed);
    const headerIdx = html.indexOf(HEADER);
    expect(headerIdx).toBeGreaterThan(-1);
    expect(html.indexOf(main[main.length - 1].name)).toBeLessThan(headerIdx);
    const after = html.slice(headerIdx);
    expect(count(after, /role="option"/g)).toBe(5);
    expect(after).toContain('Liczba ludności ogółem');
    expect(count(html.slice(0, headerIdx), /role="option"/g)).toBe(main.length);
  });

  it('fraza „bezrob” znajduje główny i z biblioteki; filterIndicators usunięty', () => {
    const html = render(mixed, 'bezrob');
    expect(html).toContain('Stopa bezrobocia rejestrowanego');
    expect(html).toContain('Bezrobotni zarejestrowani');
    expect(html.indexOf('Bezrobotni zarejestrowani')).toBeGreaterThan(html.indexOf(HEADER));
    const src = fs.readFileSync(path.join(root, 'src/view/controls/IndicatorPicker.tsx'), 'utf8');
    expect(src).not.toContain('filterIndicators');
    expect(src).toContain('searchIndicators');
  });

  it('wybór pozycji biblioteki woła onSelect z id b…', () => {
    const onSelect = vi.fn<(id: string) => void>();
    const items = mixed.filter((i) => i.id.startsWith('b') && /^b\d+$/.test(i.id));
    expect(items).toHaveLength(5);
    const el = LibraryItem({ item: items[0], selected: false, onSelect }) as React.ReactElement<{
      onClick: () => void;
    }>;
    el.props.onClick();
    expect(onSelect).toHaveBeenCalledWith(items[0].id);
    expect(items[0].id).toMatch(/^b\d+$/);
  });

  it('120 pozycji: 50 + „Pokaż więcej (jeszcze 70)”, potem 100, potem 120 bez przycisku', () => {
    const items = manyLibrary(120);
    const view = (shown?: number) =>
      renderToString(<LibraryGroup items={items} value={null} onSelect={() => {}} initialShown={shown} />);
    let html = view();
    expect(count(html, /role="option"/g)).toBe(50);
    expect(html).toContain('Pokaż więcej (jeszcze <!-- -->70<!-- -->)');
    // Kolejne kliknięcia dokładają po 50 (licznik 100, potem 120)
    html = view(100);
    expect(count(html, /role="option"/g)).toBe(100);
    expect(html).toContain('jeszcze <!-- -->20');
    const s3 = 120;
    html = view(s3);
    expect(count(html, /role="option"/g)).toBe(120);
    expect(html).not.toContain('Pokaż więcej');
    // Zmiana frazy resetuje licznik: grupa dostaje key={query}
    const src = fs.readFileSync(path.join(root, 'src/view/controls/IndicatorPicker.tsx'), 'utf8');
    expect(src).toContain('<LibraryGroup key={query}');
    // W pickerze widać tylko pierwsze 50
    const full = render(items);
    expect(count(full, /role="option"/g)).toBe(50);
  });

  it('bez wskaźników z biblioteki: brak nagłówka i „Pokaż więcej”', () => {
    const html = render(main);
    expect(html).not.toContain(HEADER);
    expect(html).not.toContain('Pokaż więcej');
    expect(count(html, /role="option"/g)).toBe(main.length);
  });

  it('fraza bez trafień w bibliotece ukrywa nagłówek; bez trafień nigdzie: komunikat', () => {
    const onlyMain = render(mixed, 'stopa bezrobocia');
    expect(onlyMain).toContain('Stopa bezrobocia rejestrowanego');
    expect(onlyMain).not.toContain(HEADER);
    expect(onlyMain).not.toContain('Brak wskaźnika o tej nazwie');
    const onlyLib = render(mixed, 'mieszkania oddane');
    expect(onlyLib).toContain(HEADER);
    expect(onlyLib).not.toContain('Brak wskaźnika o tej nazwie');
    const none = render(mixed, 'zzzzqqq');
    expect(none).toContain('Brak wskaźnika o tej nazwie');
    expect(none).not.toContain(HEADER);
  });

  it('strzałki obejmują tylko główne; limity długości plików', () => {
    const src = fs.readFileSync(path.join(root, 'src/view/controls/IndicatorPicker.tsx'), 'utf8');
    // Zarówno lista w treści, jak i lista do klawiatury wykluczają wskaźniki z biblioteki
    expect(count(src, /!isLibraryIndicatorId\(i\.id\)/g)).toBe(2);
    expect(src).toContain('handlePickerKeyDown(e, filteredIndicators.length');
    expect(src.split('\n').length).toBeLessThanOrEqual(302);
    const lib = fs.readFileSync(path.join(root, 'src/view/controls/LibraryGroup.tsx'), 'utf8');
    expect(lib.split('\n').length).toBeLessThanOrEqual(200);
  });
});

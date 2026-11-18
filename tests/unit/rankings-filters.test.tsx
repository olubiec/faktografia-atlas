import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { RankingsFilters, type RankingsFiltersProps } from '../../src/view/ranking/RankingsFilters';
import { IndicatorPicker } from '../../src/view/controls/IndicatorPicker';
import { RANKINGS_DEFAULTS, type RankingsState } from '../../src/core/ranking/rankings-url';
import type { Indicator } from '../../src/core/profile/profile';

// Komponent jest bez stanu i bez haków, więc wywołujemy go jak funkcję i przeszukujemy drzewo elementów
// (środowisko testów nie ma DOM-u). Zdarzenia wołamy przez propsy znalezionych elementów.
type El = React.ReactElement<Record<string, unknown>>;

function walk(node: unknown, out: El[] = []): El[] {
  if (Array.isArray(node)) node.forEach((n) => walk(n, out));
  else if (React.isValidElement(node)) {
    out.push(node as El);
    walk((node.props as { children?: unknown }).children, out);
  }
  return out;
}

const indicators: Indicator[] = [
  { id: 'population', bdlVarId: 1, name: 'Ludność ogółem', unit: 'osoby', description: '', group: 'Ludność', higherIsBetter: null, minLevel: 'gmi' },
  { id: 'salary', bdlVarId: 2, name: 'Wynagrodzenie', unit: 'zł', description: '', group: 'Praca', higherIsBetter: true, minLevel: 'pow' },
];
const voivodeships = [
  { teryt: '12', name: 'Małopolskie' },
  { teryt: '14', name: 'Mazowieckie' },
];

function setup(over: Partial<RankingsFiltersProps> = {}) {
  const onChange = vi.fn<(patch: Partial<RankingsState>) => void>();
  const props: RankingsFiltersProps = {
    state: { ...RANKINGS_DEFAULTS, i: 'population' },
    indicators,
    years: [2020, 2022, 2021],
    availableLevels: ['woj', 'pow', 'gmi'],
    voivodeships,
    onChange,
    ...over,
  };
  const tree = walk(RankingsFilters(props));
  const byLabel = (label: string) => tree.find((e) => e.props['aria-label'] === label);
  const levelBtn = (name: string) => tree.find((e) => e.type === 'button' && e.props.role === 'radio' && JSON.stringify(e.props.children).includes(name))!;
  return { onChange, tree, byLabel, levelBtn, props };
}

const pick = (value: string) => ({ target: { value } });

describe('RankingsFilters (QC104)', () => {
  it('klik „Powiaty” woła onChange({ l: "pow" })', () => {
    const { onChange, levelBtn } = setup();
    (levelBtn('Powiaty').props.onClick as () => void)();
    expect(onChange).toHaveBeenCalledWith({ l: 'pow' });
  });

  it('poziom spoza availableLevels: aria-disabled, podpowiedź, klik nic nie robi', () => {
    const { onChange, levelBtn } = setup({ availableLevels: ['woj', 'pow'] });
    const gmi = levelBtn('Gminy');
    expect(gmi.props['aria-disabled']).toBe('true');
    expect(gmi.props.title).toBe('Ten wskaźnik nie ma danych na tym poziomie');
    (gmi.props.onClick as () => void)();
    expect(onChange).not.toHaveBeenCalled();
    expect(levelBtn('Powiaty').props['aria-disabled']).toBeUndefined();
  });

  it('poziomy tworzą radiogroup z zaznaczonym bieżącym poziomem', () => {
    const { tree, levelBtn } = setup({ state: { ...RANKINGS_DEFAULTS, l: 'pow' } });
    expect(tree.some((e) => e.props.role === 'radiogroup')).toBe(true);
    expect(levelBtn('Powiaty').props['aria-checked']).toBe(true);
    expect(levelBtn('Gminy').props['aria-checked']).toBe(false);
  });

  it('zmiana roku woła onChange({ y }) z liczbą; lata malejąco, domyślnie najnowszy', () => {
    const { onChange, byLabel } = setup();
    const sel = byLabel('Rok')!;
    expect(sel.props.value).toBe('2022');
    const years = walk(sel.props.children).map((o) => o.props.value);
    expect(years).toEqual(['2022', '2021', '2020']);
    (sel.props.onChange as (e: unknown) => void)(pick('2021'));
    expect(onChange).toHaveBeenCalledWith({ y: 2021 });
    expect(typeof onChange.mock.calls[0][0].y).toBe('number');
  });

  it('wybrany rok ze stanu wygrywa z najnowszym', () => {
    const { byLabel } = setup({ state: { ...RANKINGS_DEFAULTS, y: 2020 } });
    expect(byLabel('Rok')!.props.value).toBe('2020');
  });

  it('województwa: ukryte dla „woj”, widoczne dla „pow” i „gmi”, wybór woła onChange({ w })', () => {
    expect(setup({ state: { ...RANKINGS_DEFAULTS, l: 'woj' } }).byLabel('Województwo')).toBeUndefined();
    expect(setup({ state: { ...RANKINGS_DEFAULTS, l: 'gmi' } }).byLabel('Województwo')).toBeDefined();
    const { onChange, byLabel } = setup({ state: { ...RANKINGS_DEFAULTS, l: 'pow' } });
    const sel = byLabel('Województwo')!;
    const opts = walk(sel.props.children).map((o) => o.props.value);
    expect(opts).toEqual(['', '12', '14']);
    (sel.props.onChange as (e: unknown) => void)(pick('12'));
    expect(onChange).toHaveBeenCalledWith({ w: '12' });
    (sel.props.onChange as (e: unknown) => void)(pick(''));
    expect(onChange).toHaveBeenLastCalledWith({ w: null });
  });

  it('wybór wskaźnika w oknie woła onChange({ i })', () => {
    const { onChange, tree } = setup();
    const picker = tree.find((e) => e.type === IndicatorPicker)!;
    expect(picker.props.value).toBe('population');
    (picker.props.onChange as (id: string) => void)('salary');
    expect(onChange).toHaveBeenCalledWith({ i: 'salary' });
  });

  it('brak lat: lista roku wyłączona, bez wyjątku', () => {
    const { byLabel } = setup({ years: [] });
    expect(byLabel('Rok')!.props.disabled).toBe(true);
  });

  it('wszystkie kontrolki mają dostępne nazwy i min. 44 px', () => {
    const html = renderToString(
      <RankingsFilters
        state={{ ...RANKINGS_DEFAULTS, i: 'population', l: 'pow' }}
        indicators={indicators}
        years={[2021, 2022]}
        availableLevels={['woj', 'pow']}
        voivodeships={voivodeships}
        onChange={() => {}}
      />,
    );
    expect(html).toContain('aria-label="Rok"');
    expect(html).toContain('aria-label="Województwo"');
    expect(html).toContain('aria-label="Poziom"');
    expect(html).toContain('Wskaźnik');
    expect(html).toContain('Cała Polska');
    for (const name of ['Województwa', 'Powiaty', 'Gminy']) expect(html).toContain(name);
    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('flex-wrap');
  });
});

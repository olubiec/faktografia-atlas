import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { buildProfile } from '../../src/core/profile/profile';
import type { Indicator, IndicatorValues } from '../../src/core/profile/profile';
import { compareExtraRows } from '../../src/core/compare/compare-extra';
import { ProfileCompareTable } from '../../src/view/profile/ProfileCompareTable';
import { CompareIndicatorPicker } from '../../src/view/compare/CompareIndicatorPicker';
import { defaultMyIndicators, addIndicator, removeIndicator } from '../../src/core/my-indicators/my-indicators';
import profileSample from '../fixtures/synthetic/profile-sample.json';

const profile = buildProfile('0201011', profileSample.indicators as never, profileSample.valuesById as never, profileSample.units as never);
const profileB = { ...profile, teryt: '0201021' };

const lib: Indicator = {
  id: 'b4242',
  bdlVarId: 4242,
  name: 'Wskaźnik testowy z biblioteki',
  unit: 'szt.',
  description: '',
  group: 'Test',
  higherIsBetter: true,
  minLevel: 'gmi',
};
const values: IndicatorValues = {
  indicatorId: 'b4242',
  years: [2022, 2023],
  values: { '0201011': [10, 12], '0201021': [20, 25], '0201031': [5, 6] },
  fetchedAt: '',
};
const unitA = { teryt: '0201011', level: 'gmi' } as never;
const unitB = { teryt: '0201021', level: 'gmi' } as never;
const extraRows = compareExtraRows([{ indicator: lib, values }], unitA, unitB).map((row) => ({ indicator: lib, row }));

describe('Porównaj: wiersze z biblioteki i × (QC612)', () => {
  it('wskaźnik z biblioteki trafia do tabeli jako wiersz z wartościami obu miejsc', () => {
    expect(extraRows).toHaveLength(1);
    const html = renderToString(<ProfileCompareTable profileA={profile} profileB={profileB} extraRows={extraRows} />);
    expect(html).toContain('Wskaźnik testowy z biblioteki');
    expect(html).toContain('2. miejsce');
  });
  it('bez nowych propsów tabela działa jak dotąd: bez wiersza z biblioteki i bez ×', () => {
    const html = renderToString(<ProfileCompareTable profileA={profile} profileB={profileB} />);
    expect(html).not.toContain('Wskaźnik testowy z biblioteki');
    expect(html).not.toContain('Usuń wiersz');
  });
  it('każdy wiersz ma przycisk × (min. 44 px), także wiersz z biblioteki', () => {
    const html = renderToString(
      <ProfileCompareTable profileA={profile} profileB={profileB} extraRows={extraRows} onRemove={() => {}} />,
    );
    expect(html).toContain('aria-label="Usuń wiersz: Wskaźnik testowy z biblioteki"');
    expect(html).toContain('min-h-[44px] min-w-[44px]');
    const rows = html.match(/data-slot="compare-row"/g)?.length ?? 0;
    expect(rows).toBeGreaterThan(0);
    expect(html.match(/aria-label="Usuń wiersz:/g)?.length).toBe(rows);
  });
  it('wiersz bez danych u obu stron nie trafia do tabeli', () => {
    const empty = { ...values, values: {} };
    expect(compareExtraRows([{ indicator: lib, values: empty }], unitA, unitB)).toHaveLength(0);
  });
  it('lista „Moje wskaźniki”: wskaźnik z biblioteki ma × w pasku, usunięcie go zdejmuje', () => {
    const render = (list: readonly string[], onRemove = () => {}) =>
      renderToString(
        <CompareIndicatorPicker items={profile.indicators} list={list} onAdd={() => {}} onRemove={onRemove} onReset={() => {}} libraryShown={[lib]} />,
      );
    const withLib = addIndicator(defaultMyIndicators(), 'b4242');
    expect(render(withLib)).toContain('Usuń wskaźnik: Wskaźnik testowy z biblioteki');
    expect(render(withLib)).toContain('Przywróć podstawowe');
    const without = removeIndicator(withLib, 'b4242');
    expect(without).toEqual(defaultMyIndicators());
    expect(render(without)).not.toContain('Wskaźnik testowy z biblioteki');
    expect(render(without)).not.toContain('Przywróć podstawowe');
  });
});

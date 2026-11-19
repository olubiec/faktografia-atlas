import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { buildProfile } from '../../src/core/profile/profile';
import { CompareIndicatorPicker } from '../../src/view/compare/CompareIndicatorPicker';
import {
  BASIC_INDICATORS,
  addIndicator,
  defaultMyIndicators,
  removeIndicator,
} from '../../src/core/my-indicators/my-indicators';
import indicators from '../../config/indicators.json';
import profileSample from '../fixtures/synthetic/profile-sample.json';

const profile = buildProfile('0201011', profileSample.indicators as never, profileSample.valuesById as never, profileSample.units as never);
// Wskaźniki z prawdziwego rejestru: część podstawowa, część nie.
const items = (indicators as { id: string; name: string; group: string }[]).map((indicator) => ({
  ...profile.indicators[0],
  indicatorId: indicator.id,
  indicator: indicator as never,
}));
const full = { ...profile, indicators: items as never };

const { restrictProfile } = CompareIndicatorPicker;
const render = (list: readonly string[]) =>
  renderToString(
    <CompareIndicatorPicker items={full.indicators} list={list} onAdd={() => {}} onRemove={() => {}} onReset={() => {}} />,
  );

describe('Porównaj: na start 7 podstawowych wskaźników (QC611)', () => {
  it('start: do porównania trafia dokładnie 7 podstawowych z całego profilu', () => {
    expect(items.length).toBeGreaterThan(BASIC_INDICATORS.length);
    const shown = restrictProfile(full, defaultMyIndicators());
    expect(shown.indicators.map((i) => i.indicatorId).sort()).toEqual([...BASIC_INDICATORS].sort());
  });
  it('start: 7 wierszy z przyciskiem × (>= 44 px), bez „Przywróć podstawowe”', () => {
    const html = render(defaultMyIndicators());
    expect(html.match(/aria-label="Usuń wskaźnik:/g)?.length).toBe(BASIC_INDICATORS.length);
    expect(html).toContain('min-h-[44px] min-w-[44px]');
    expect(html).toContain('Dodaj wskaźnik');
    expect(html).not.toContain('Przywróć podstawowe');
  });
  it('usunięcie: wskaźnik znika z porównania i z listy', () => {
    const list = removeIndicator(defaultMyIndicators(), 'density');
    expect(restrictProfile(full, list).indicators.some((i) => i.indicatorId === 'density')).toBe(false);
    expect(restrictProfile(full, list).indicators).toHaveLength(BASIC_INDICATORS.length - 1);
    expect(render(list).match(/aria-label="Usuń wskaźnik:/g)?.length).toBe(BASIC_INDICATORS.length - 1);
  });
  it('dodanie: inny wskaźnik z rejestru pojawia się w porównaniu, a „Przywróć podstawowe” jest widoczne', () => {
    const extra = items.find((i) => !BASIC_INDICATORS.includes(i.indicatorId))!.indicatorId;
    const list = addIndicator(defaultMyIndicators(), extra);
    expect(restrictProfile(full, list).indicators.some((i) => i.indicatorId === extra)).toBe(true);
    const html = render(list);
    expect(html).toContain('Przywróć podstawowe');
    expect(html.match(/aria-label="Usuń wskaźnik:/g)?.length).toBe(BASIC_INDICATORS.length + 1);
  });
  it('pusta lista: puste porównanie i komunikat', () => {
    expect(restrictProfile(full, []).indicators).toHaveLength(0);
    expect(render([])).toContain('Nie wybrano żadnych wskaźników');
  });
});

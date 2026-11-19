import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ProfileCompare } from '../../src/view/profile/ProfileCompare';
import {
  BASIC_INDICATORS,
  removeIndicator,
  resetToBasic,
} from '../../src/core/my-indicators/my-indicators';
import { MY_INDICATORS_KEY } from '../../src/core/my-indicators/storage';
import indicators from '../../config/indicators.json';

// Profil z wartościami dla każdego wskaźnika z rejestru (część podstawowa, część nie)
const makeProfile = (teryt: string, name: string, base: number) =>
  ({
    teryt,
    unit: { teryt, name, level: 'pow' },
    indicators: (indicators as { id: string; name: string; unit: string }[]).map((ind, i) => ({
      indicatorId: ind.id,
      indicator: ind,
      value: base + i,
      year: 2024,
      rankNational: 1,
      totalNational: 380,
    })),
  }) as never;

const A = makeProfile('0201', 'bolesławiecki', 10);
const B = makeProfile('0202', 'dzierżoniowski', 20);

function stubStorage(list: readonly string[] | null) {
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (k === MY_INDICATORS_KEY && list ? JSON.stringify(list) : null),
    setItem: () => {},
  });
}
const rows = (html: string) => html.match(/data-slot="compare-row"/g)?.length ?? 0;
const render = (props: Partial<React.ComponentProps<typeof ProfileCompare>> = {}) =>
  renderToString(<ProfileCompare profileA={A} profileB={B} units={[]} {...props} />);

afterEach(() => vi.unstubAllGlobals());

describe('Profil, zakładka Porównaj: 7 podstawowych na start (QR01)', () => {
  it('czysty zapis: tabela ma 7 wierszy, ×, „Dodaj wskaźnik”, bez „Przywróć podstawowe”', () => {
    expect((indicators as unknown[]).length).toBeGreaterThan(BASIC_INDICATORS.length);
    const html = render();
    expect(rows(html)).toBe(BASIC_INDICATORS.length);
    expect(html.match(/aria-label="Usuń wskaźnik:/g)?.length).toBeGreaterThanOrEqual(BASIC_INDICATORS.length);
    expect(html).toContain('Dodaj wskaźnik');
    expect(html).not.toContain('Przywróć podstawowe');
  });

  it('profil bez view też pokazuje 7 wierszy, a z view tyle samo', () => {
    expect(rows(render({ view: undefined }))).toBe(BASIC_INDICATORS.length);
    const view = { indicator: { id: BASIC_INDICATORS[0], name: 'x' }, year: 2024, values: null } as never;
    expect(rows(render({ view }))).toBe(BASIC_INDICATORS.length);
  });

  it('usunięcie (×): wiersz znika, pojawia się „Przywróć podstawowe”', () => {
    stubStorage(removeIndicator([...BASIC_INDICATORS], BASIC_INDICATORS[1]));
    const html = render();
    expect(rows(html)).toBe(BASIC_INDICATORS.length - 1);
    expect(html).toContain('Przywróć podstawowe');
  });

  it('„Przywróć podstawowe” wraca do 7 wierszy', () => {
    stubStorage(resetToBasic());
    const html = render();
    expect(rows(html)).toBe(BASIC_INDICATORS.length);
    expect(html).not.toContain('Przywróć podstawowe');
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { IndicatorPanel } from '../../src/view/main/IndicatorPanel';
import { BASIC_INDICATORS, addIndicator, defaultMyIndicators } from '../../src/core/my-indicators/my-indicators';
import { MY_INDICATORS_KEY } from '../../src/core/my-indicators/storage';
import type { Indicator } from '../../src/core/profile/profile';
import indicatorsData from '../../config/indicators.json';

vi.mock('../../src/view/share/useShareData', () => ({ useShareData: () => null }));
vi.mock('../../src/view/share/LazyShareDialog', () => ({ LazyShareDialog: () => null }));

const ALL = indicatorsData as Indicator[];
const outside = ALL.find((i) => !BASIC_INDICATORS.includes(i.id))!;
const other = ALL.find((i) => i.id !== outside.id && !BASIC_INDICATORS.includes(i.id))!;

const render = (currentId: string) => {
  const view = {
    indicator: ALL.find((i) => i.id === currentId)!,
    indicators: ALL,
    values: null,
    year: null,
    years: [],
    level: 'woj',
    setIndicator: () => {},
    setYear: () => {},
    setLevel: () => {},
  };
  return renderToString(
    <IndicatorPanel
      view={view as never}
      choropleth={null}
      ranking={null}
      index={{ byTeryt: new Map() } as never}
      selectedTeryt={null}
      onSelectUnit={() => {}}
      inSheet={true}
    />,
  ).replace(/<!-- -->/g, '');
};

const removeButtons = (html: string) => html.match(/aria-label="Usuń wskaźnik /g)?.length ?? 0;

describe('Panel mapy: „Moje” na górze (QR01C)', () => {
  // Środowisko testów to Node: podstawiamy prostą pamięć w miejsce localStorage.
  beforeEach(() => {
    const data = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      clear: () => data.clear(),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('czysty zapis: 7 pozycji „Moich” z ×, bez „Przywróć podstawowe”, jest „+ Dodaj wskaźnik”', () => {
    const html = render(BASIC_INDICATORS[0]);
    expect(removeButtons(html)).toBe(BASIC_INDICATORS.length);
    expect(html).toContain('+ Dodaj wskaźnik');
    expect(html).not.toContain('Przywróć podstawowe');
    expect(html).toContain('min-h-[44px]');
  });

  it('wskaźnik z adresu spoza listy jest widoczny w wyborze i nie zmienia listy użytkownika', () => {
    const html = render(outside.id);
    expect(html).toContain(outside.name);
    expect(removeButtons(html)).toBe(BASIC_INDICATORS.length);
    expect(localStorage.getItem(MY_INDICATORS_KEY)).toBeNull();
  });

  it('lista wyboru zawiera tylko „Moje” i bieżący, nie cały katalog', () => {
    expect(render(outside.id)).not.toContain(`>${other.name}<`);
  });

  it('dodany wskaźnik jest w „Moich”, a „Przywróć podstawowe” jest widoczne', () => {
    localStorage.setItem(MY_INDICATORS_KEY, JSON.stringify(addIndicator(defaultMyIndicators(), outside.id)));
    const html = render(BASIC_INDICATORS[0]);
    expect(removeButtons(html)).toBe(BASIC_INDICATORS.length + 1);
    expect(html).toContain('Przywróć podstawowe');
  });
});

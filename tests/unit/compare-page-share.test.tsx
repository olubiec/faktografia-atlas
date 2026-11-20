import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import profileSample from '../fixtures/synthetic/profile-sample.json';
import { buildProfile, type Indicator, type IndicatorValues } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';
import { compare } from '../../src/core/compare/compare';
import { swapPair } from '../../src/core/compare/compare-url';
import { CompareIndicatorPicker } from '../../src/view/compare/CompareIndicatorPicker';

// Przechwytujemy przyciski (onClick) prawdziwego ShareBar i propsy okna eksportu (bez DOM w środowisku node).
const captured = vi.hoisted(() => ({
  buttons: [] as { props: Record<string, unknown> }[],
  dialogs: [] as Record<string, unknown>[],
}));

vi.mock('../../src/view/share/LazyShareDialog', () => ({
  LazyShareDialog: (props: Record<string, unknown>) => {
    captured.dialogs.push(props);
    return null;
  },
}));

vi.mock('react/jsx-dev-runtime', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react/jsx-dev-runtime')>();
  return {
    ...actual,
    jsxDEV: ((type: unknown, props: Record<string, unknown>, ...rest: unknown[]) => {
      if (type === 'button') captured.buttons.push({ props });
      return (actual.jsxDEV as (...a: unknown[]) => unknown)(type, props, ...rest);
    }) as typeof actual.jsxDEV,
  };
});

import { CompareShare } from '../../src/view/pages/CompareShare';
import { ComparePage } from '../../src/view/pages/ComparePage';

// Dwa województwa (14, 12) dołożone do próbki, z wartościami dla każdego wskaźnika.
const extraUnits: Unit[] = ['14', '12'].map((teryt) => ({
  teryt, bdlId: teryt, name: teryt === '14' ? 'MAZOWIECKIE' : 'MAŁOPOLSKIE', level: 'woj', parent: null,
  bbox: [0, 0, 1, 1], centroid: [0, 0],
}) as unknown as Unit);
const units = [...(profileSample.units as unknown as Unit[]), ...extraUnits];
const indicators = profileSample.indicators as unknown as Indicator[];
const valuesById = Object.fromEntries(
  Object.entries(profileSample.valuesById as unknown as Record<string, IndicatorValues>).map(([id, v], i) => [
    id,
    { ...v, values: { ...v.values, '14': [100 + i, 200 + i], '12': [90 + i, 150 + i] } },
  ]),
) as Record<string, IndicatorValues>;
const profile = (teryt: string) => buildProfile(teryt, indicators, valuesById, units);
const profileA = profile('14');
const profileB = profile('12');
const fullList = indicators.map((i) => i.id);

type Props = Parameters<typeof CompareShare>[0];
function render(patch: Partial<Props> = {}) {
  return renderToString(
    <CompareShare pair={{ a: '14', b: '12' }} profileA={profileA} profileB={profileB} list={fullList} {...patch} />,
  );
}
const lastCard = () =>
  (captured.dialogs.at(-1) as { data: { compare: { unitA: { teryt: string }; unitB: { teryt: string }; rows: unknown[] } } }).data.compare;

let writeText: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;
beforeEach(() => {
  captured.buttons.length = 0;
  captured.dialogs.length = 0;
  writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  vi.stubGlobal('window', { location: { origin: 'https://atlas.test', pathname: '/porownaj', search: '?share=1' } });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Porównaj: pasek udostępniania (QC803)', () => {
  it('bez pary i z samym A strona nie pokazuje paska; pasek jest tylko w bloku wyniku (A i B załadowane)', () => {
    for (const url of ['/porownaj', '/porownaj?c=14']) {
      const page = renderToString(
        <MemoryRouter initialEntries={[url]}>
          <ComparePage />
        </MemoryRouter>,
      );
      expect(page).not.toMatch(/Kopiuj link/);
    }
    // Z dwoma załadowanymi profilami pasek jest (SSR nie uruchamia efektów, więc render bezpośrednio).
    expect(render({ pair: { a: '14', b: '12' } })).toMatch(/Kopiuj link/);
    // Użycie w stronie jest wyłącznie warunkowe: profileA && profileB.
    const src = readFileSync('src/view/pages/ComparePage.tsx', 'utf8');
    expect(src).toMatch(/\{profileA && profileB && \([\s\S]*<CompareShare /);
    expect(src.match(/<CompareShare /g)).toHaveLength(1);
  });

  it('„Kopiuj link” kopiuje adres z c=14,12', () => {
    render();
    (captured.buttons[0].props.onClick as () => void)();
    const url = new URL(writeText.mock.calls[0][0] as string);
    expect(url.origin + url.pathname).toBe('https://atlas.test/porownaj');
    expect(url.searchParams.get('c')).toBe('14,12');
  });

  it('„Pobierz i udostępnij” otwiera okno z kartą „compare” dla obu miejsc', () => {
    render();
    expect(captured.dialogs.at(-1)?.defaultKind).toBe('compare');
    expect(typeof captured.buttons[1].props.onClick).toBe('function');
    expect(lastCard().unitA.teryt).toBe('14');
    expect(lastCard().unitB.teryt).toBe('12');
  });

  it('po „Zamień miejsca” link ma c=12,14, a unitA karty to 12', () => {
    const swapped = swapPair({ a: '14', b: '12' });
    render({ pair: swapped, profileA: profileB, profileB: profileA });
    (captured.buttons[0].props.onClick as () => void)();
    expect(new URL(writeText.mock.calls[0][0] as string).searchParams.get('c')).toBe('12,14');
    expect(lastCard().unitA.teryt).toBe('12');
    expect(lastCard().unitB.teryt).toBe('14');
  });

  it('wiersze karty = wiersze tabeli dla bieżącej listy; usunięcie wskaźnika odejmuje wiersz', () => {
    const tableRows = (list: string[]) => {
      const r = CompareIndicatorPicker.restrictProfile;
      return compare(r(profileA, list), r(profileB, list)).rows.filter((x) => x.a != null && x.b != null).length;
    };
    render({ list: fullList });
    const before = lastCard().rows.length;
    expect(before).toBe(tableRows(fullList));
    expect(before).toBeGreaterThan(1);
    const shorter = fullList.slice(1);
    render({ list: shorter });
    expect(lastCard().rows.length).toBe(tableRows(shorter));
    expect(lastCard().rows.length).toBe(before - 1);
  });

  it('pliki ComparePage.tsx i CompareShare.tsx mają najwyżej 200 linii', () => {
    for (const f of ['src/view/pages/ComparePage.tsx', 'src/view/pages/CompareShare.tsx']) {
      expect(readFileSync(f, 'utf8').split('\n').length).toBeLessThanOrEqual(200);
    }
  });
});

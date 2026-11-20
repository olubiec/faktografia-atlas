import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import profileSample from '../fixtures/synthetic/profile-sample.json';
import type { RankedUnit } from '../../src/core/ranking/ranking';
import type { Unit } from '../../src/core/units/types';
import type { Indicator } from '../../src/core/profile/profile';
import { formatValue } from '../../src/core/format/number';
import { RANKINGS_DEFAULTS, type RankingsState } from '../../src/core/ranking/rankings-url';

// Przechwytujemy przyciski (onClick) prawdziwego ShareBar i propsy okna eksportu (bez DOM w środowisku node).
const captured = vi.hoisted(() => ({
  buttons: [] as { props: Record<string, unknown> }[],
  dialogs: [] as Record<string, unknown>[],
  forceOpen: false,
}));

vi.mock('../../src/view/share/LazyShareDialog', () => ({
  LazyShareDialog: (props: Record<string, unknown>) => {
    captured.dialogs.push(props);
    return null;
  },
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    // Wymuszone otwarcie okna: SSR nie pozwala kliknąć, więc podajemy stan „otwarte” po kliknięciu.
    useState: ((initial: unknown) => {
      const [value, set] = actual.useState(initial);
      return [captured.forceOpen && initial === false ? true : value, set];
    }) as typeof actual.useState,
  };
});

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

import { RankingsShare } from '../../src/view/pages/RankingsShare';
import { Rankings } from '../../src/view/pages/Rankings';

const units = profileSample.units as Unit[];
const indicator: Indicator = {
  id: 'population', bdlVarId: 1, name: 'Ludność ogółem', unit: 'osoba', description: '', group: 'Ludność',
  higherIsBetter: null, minLevel: 'gmi',
};
const ranking: RankedUnit[] = units.map((u, i) => ({
  teryt: u.teryt, name: u.name, value: 1000 - i * 10, rank: i + 1, total: units.length,
}));
const state = (patch: Partial<RankingsState> = {}): RankingsState => ({ ...RANKINGS_DEFAULTS, ...patch });

type Props = Parameters<typeof RankingsShare>[0];
function render(patch: Partial<Props> = {}) {
  return renderToString(
    <RankingsShare state={state()} ranking={ranking} units={units} indicator={indicator} year={2023} {...patch} />,
  ).replace(/<!-- -->/g, '');
}
const clickCopy = () => {
  // Pierwszy przycisk paska = „Kopiuj link”.
  (captured.buttons[0].props.onClick as () => void)();
};

let writeText: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;
beforeEach(() => {
  captured.buttons.length = 0;
  captured.dialogs.length = 0;
  captured.forceOpen = false;
  writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  vi.stubGlobal('window', { location: { origin: 'https://atlas.test', pathname: '/rankingi', search: '?share=1' } });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Rankingi: pasek udostępniania (QC802)', () => {
  it('po załadowaniu rankingu widać „Kopiuj link” i „Pobierz i udostępnij”', () => {
    const html = render();
    expect(html).toMatch(/Kopiuj link/);
    expect(html).toMatch(/Pobierz i udostępnij/);
  });

  it('„Kopiuj link” kopiuje adres z bieżącym i=, l=, y=; zmiana wskaźnika zmienia i', () => {
    render({ state: state({ i: 'population', l: 'pow', y: 2022 }) });
    clickCopy();
    const url = writeText.mock.calls[0][0] as string;
    expect(url.startsWith('https://atlas.test/rankingi?')).toBe(true);
    const p = new URL(url).searchParams;
    expect(p.get('i')).toBe('population');
    expect(p.get('l')).toBe('pow');
    expect(p.get('y')).toBe('2022');

    captured.buttons.length = 0;
    render({ state: state({ i: 'natural-increase', l: 'pow', y: 2022 }) });
    clickCopy();
    expect(new URL(writeText.mock.calls[1][0] as string).searchParams.get('i')).toBe('natural-increase');
  });

  it('bez rankingu (ładowanie / brak danych) paska nie ma', () => {
    expect(render({ ranking: null })).toBe('');
    expect(render({ indicator: undefined })).toBe('');
    expect(render({ year: null })).toBe('');
    const page = renderToString(
      <MemoryRouter initialEntries={['/rankingi']}>
        <Rankings />
      </MemoryRouter>,
    );
    expect(page).not.toMatch(/Kopiuj link/);
  });

  it('„Pobierz i udostępnij” otwiera okno z kartą „ranking” dla bieżącego wskaźnika', () => {
    render();
    expect(captured.dialogs.at(-1)?.isOpen).toBe(false);
    // Kliknięcie ustawia stan; drugi render z wymuszonym „otwarte” pokazuje, co dostaje okno.
    expect(typeof captured.buttons[1].props.onClick).toBe('function');
    captured.forceOpen = true;
    render();
    const dialog = captured.dialogs.at(-1) as { isOpen: boolean; defaultKind: string; data: { ranking: { indicator: { name: string }; year: number } } };
    expect(dialog.isOpen).toBe(true);
    expect(dialog.defaultKind).toBe('ranking');
    expect(dialog.data.ranking.indicator.name).toBe('Ludność ogółem');
    expect(dialog.data.ranking.year).toBe(2023);
  });

  it('?q=gdan trafia do linku, ale karta ma pełny ranking; powiat bez przedrostka', () => {
    render({ state: state({ q: 'gdan' }) });
    clickCopy();
    expect(new URL(writeText.mock.calls[0][0] as string).searchParams.get('q')).toBe('gdan');
    const dialog = captured.dialogs.at(-1) as { data: { ranking: { items: { teryt: string; name: string; valueText: string }[] } } };
    const items = dialog.data.ranking.items;
    expect(items.length).toBe(ranking.length);
    expect(items[0].valueText).toBe(formatValue(1000, 'osoba'));
    const pow = units.find((u) => u.level === 'pow')!;
    expect(items.find((i) => i.teryt === pow.teryt)!.name).toBe(pow.name.replace(/^powiat /, ''));
  });

  it('pliki Rankings.tsx i RankingsShare.tsx mają najwyżej 200 linii', () => {
    for (const f of ['src/view/pages/Rankings.tsx', 'src/view/pages/RankingsShare.tsx']) {
      expect(readFileSync(f, 'utf8').split('\n').length).toBeLessThanOrEqual(200);
    }
  });
});

import { describe, it, expect, afterEach } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { useShareData, initialDeck, singleCsv } from '../../src/view/share/useShareData';
import type { ShareDialogData } from '../../src/view/share/ShareDialog';
import { INDICATORS } from '../../src/view/map/hooks/useMainView';
import { BASIC_INDICATORS } from '../../src/core/my-indicators/my-indicators';
import { MY_INDICATORS_KEY } from '../../src/core/my-indicators/storage';
import { buildIndex } from '../../src/core/units/units';
import unitsData from '../../public/data/units.json';
import type { Unit } from '../../src/core/units/types';

const index = buildIndex(unitsData as Unit[]);
const woj = (unitsData as Unit[]).find((u) => u.level === 'woj')!;

function setStorage(list: string[] | null) {
  const store = new Map<string, string>();
  if (list) store.set(MY_INDICATORS_KEY, JSON.stringify(list));
  (globalThis as any).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
}

function shareData(): ShareDialogData {
  const indicator = INDICATORS.find((i) => i.id === 'population')!;
  const values = { indicatorId: indicator.id, years: [2023], values: { [woj.teryt]: [100] }, fetchedAt: '' };
  const view = { indicator, indicators: INDICATORS, values, year: 2023, years: [2023], level: 'woj' } as never;
  const sink: ShareDialogData[] = [];
  function Probe({ sink: into }: { sink: ShareDialogData[] }) {
    into.push(useShareData({ view, choropleth: null, ranking: null, index, selectedTeryt: woj.teryt }));
    return null;
  }
  renderToString(createElement(Probe, { sink }));
  return sink[0];
}

const dataRows = (csv: string) => csv.trim().split('\n').length - 1;

describe('okno udostępniania: dane z „Moich wskaźników”', () => {
  afterEach(() => {
    delete (globalThis as any).localStorage;
  });

  it('czysty zapis: CSV profilu ma 7 wierszy, initialDeck 7 wskaźników', () => {
    setStorage(null);
    const data = shareData();
    expect(INDICATORS.length).toBeGreaterThan(7);
    expect(data.unitProfile?.indicators.map((i) => i.indicatorId)).toEqual([...BASIC_INDICATORS]);
    expect(dataRows(singleCsv(data, 'profile').csv)).toBe(7);
    const profilePage = initialDeck(data).pages.find((p) => p.kind === 'profile');
    expect(profilePage?.indicatorIds).toEqual([...BASIC_INDICATORS]);
  });
});

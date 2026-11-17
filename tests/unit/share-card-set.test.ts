import { describe, expect, it } from 'vitest';
import {
  buildCardSet,
  canMoveCard,
  cardSetFileParts,
  cardSetPages,
  cardSetPositions,
  moveCard,
  removeCard,
  type CardSetSource,
} from '../../src/core/share/card-set';
import {
  isUnitProfile,
  mapCardFromCompare,
  profileCardFromUnitProfile,
  rankingFromProfiles,
} from '../../src/core/share/card-set-sources';
import type { CompareCardData, MapCardData, ProfileCardData, RankingCardData } from '../../src/core/share/card';
import type { Indicator, ProfileIndicatorItem, UnitProfile } from '../../src/core/profile/profile';
import { shareFileName } from '../../src/core/share/csv';

const ind = (id: string, name: string, unit = 'os./km²'): Indicator => ({
  id, bdlVarId: 1, name, unit, description: '', group: 'g', higherIsBetter: true, minLevel: 'woj',
});
const item = (indicator: Indicator, value: number | null, rankNational: number | null): ProfileIndicatorItem => ({
  indicatorId: indicator.id, indicator, year: 2024, value, rankNational, rankVoivodeship: null,
  totalNational: 16, totalVoivodeship: 1, neutral: false, series: [],
});
const density = ind('gestosc', 'Gęstość zaludnienia');
const unemployment = ind('bezrobocie', 'Stopa bezrobocia', '%');
const profileA: UnitProfile = { teryt: '12', unit: null, indicators: [item(density, 225.8, 5), item(unemployment, 4.5, 3)] };
const profileB: UnitProfile = { teryt: '24', unit: null, indicators: [item(density, 360.1, 2), item(unemployment, 5.1, 7)] };

const compare: CompareCardData = {
  indicatorName: 'Gęstość zaludnienia',
  year: 2024,
  unitA: { name: 'małopolskie', teryt: '12', features: ['fA'], classOf: { '12': 3 } },
  unitB: { name: 'śląskie', teryt: '24', features: ['fB'] },
  rows: [{ indicatorName: 'Gęstość zaludnienia', valA: '225,8', valB: '360,1', diffText: 'niżej' }],
};
const map: MapCardData = { indicator: { name: 'Gęstość zaludnienia' }, year: 2024, unitName: 'Polska' };
const ranking = (n: number): RankingCardData => ({
  indicator: { name: 'Gęstość zaludnienia' }, year: 2024,
  items: Array.from({ length: n }, (_, i) => ({ name: `J${i}`, value: i })),
});
const profile: ProfileCardData = { unitName: 'Kraków', indicatorName: 'X', year: 2024, bigNumber: '1', indicators: [] };

const compareSource: CardSetSource = { compare, compareUnitA: profileA, compareUnitB: profileB };
const ids = (s: { id: string }[]) => s.map((e) => e.id);

describe('buildCardSet – porównanie', () => {
  it('daje mapę A, mapę B, tabelę, ranking i oba profile w tej kolejności', () => {
    const set = buildCardSet(compareSource);
    expect(ids(set)).toEqual(['map-a', 'map-b', 'compare', 'ranking', 'profile-a', 'profile-b']);
    expect(set.map((e) => e.kind)).toEqual(['map', 'map', 'compare', 'ranking', 'profile', 'profile']);
    expect(set[0].label).toBe('Mapa: małopolskie');
    expect(set[1].label).toBe('Mapa: śląskie');
  });
  it('mapa A ma kształty i klasy jednostki A oraz zaznaczenie A', () => {
    const a = buildCardSet(compareSource)[0].data as MapCardData;
    expect(a.features).toEqual(['fA']);
    expect(a.classOf).toEqual({ '12': 3 });
    expect(a.selectedTeryt).toBe('12');
    expect(mapCardFromCompare(compare, 'B').selectedTeryt).toBe('24');
  });
  it('bez profili jednostek (sam kod TERYT) nie ma rankingu ani profili, chyba że podano gotowe', () => {
    expect(ids(buildCardSet({ compare, compareUnitA: '12', compareUnitB: '24' }))).toEqual(['map-a', 'map-b', 'compare']);
    expect(ids(buildCardSet({ compare, ranking: ranking(3), profile }))).toEqual(['map-a', 'map-b', 'compare', 'ranking', 'profile']);
  });
});

describe('buildCardSet – pojedyncza jednostka', () => {
  it('mapa, ranking, profil; brakujące karty pominięte', () => {
    expect(ids(buildCardSet({ map, ranking: ranking(3), profile }))).toEqual(['map', 'ranking', 'profile']);
    expect(ids(buildCardSet({ map }))).toEqual(['map']);
    expect(buildCardSet({})).toEqual([]);
  });
});

describe('removeCard / moveCard', () => {
  const set = buildCardSet(compareSource);
  it('usunięcie zmniejsza zestaw i nie zmienia wejścia', () => {
    const next = removeCard(set, 'compare');
    expect(ids(next)).toEqual(['map-a', 'map-b', 'ranking', 'profile-a', 'profile-b']);
    expect(set).toHaveLength(6);
    expect(removeCard(set, 'brak')).toHaveLength(6);
  });
  it('przesunięcie w górę i w dół zamienia sąsiadów', () => {
    expect(ids(moveCard(set, 'map-b', -1)).slice(0, 2)).toEqual(['map-b', 'map-a']);
    expect(ids(moveCard(set, 'map-a', 1)).slice(0, 2)).toEqual(['map-b', 'map-a']);
    expect(ids(set).slice(0, 2)).toEqual(['map-a', 'map-b']);
  });
  it('na krawędziach i dla nieznanego id nic się nie zmienia', () => {
    expect(ids(moveCard(set, 'map-a', -1))).toEqual(ids(set));
    expect(ids(moveCard(set, 'profile-b', 1))).toEqual(ids(set));
    expect(ids(moveCard(set, 'brak', 1))).toEqual(ids(set));
    expect(canMoveCard(set, 'map-a', -1)).toBe(false);
    expect(canMoveCard(set, 'map-a', 1)).toBe(true);
    expect(canMoveCard(set, 'profile-b', 1)).toBe(false);
    expect(canMoveCard(set, 'brak', 1)).toBe(false);
  });
});

describe('cardSetPages / cardSetPositions', () => {
  it('numeracja n/N jest ciągła i odświeża się po usunięciu i przestawieniu', () => {
    let set = buildCardSet(compareSource);
    expect(cardSetPositions(set).map((p) => p.label)).toEqual(['1/6', '2/6', '3/6', '4/6', '5/6', '6/6']);
    set = removeCard(set, 'ranking');
    expect(cardSetPositions(set).map((p) => p.label)).toEqual(['1/5', '2/5', '3/5', '4/5', '5/5']);
    set = moveCard(set, 'compare', -1);
    const pos = cardSetPositions(set);
    expect(pos.find((p) => p.id === 'compare')?.label).toBe('2/5');
    expect(pos.find((p) => p.id === 'map-b')?.label).toBe('3/5');
  });
  it('strony idą w kolejności zestawu; długi ranking zajmuje kilka stron', () => {
    const set = moveCard(buildCardSet({ map, ranking: ranking(25), profile }), 'profile', -1);
    const pages = cardSetPages(set);
    expect(pages.map((p) => p.entry.id)).toEqual(['map', 'profile', 'ranking', 'ranking', 'ranking']);
    expect(pages.map((p) => p.page)).toEqual([1, 2, 3, 4, 5].map((number) => ({ number, total: 5 })));
    expect(cardSetPositions(set).map((p) => p.label)).toEqual(['1/5', '2/5', '3–5/5']);
  });
  it('pusty zestaw nie daje stron', () => {
    expect(cardSetPages([])).toEqual([]);
    expect(cardSetPositions([])).toEqual([]);
  });
  it('nazwy plików zaczynają się od numeru pozycji, więc sortują się w wybranej kolejności', () => {
    const set = moveCard(buildCardSet(compareSource), 'profile-b', -1);
    const names = cardSetPages(set).map((p) => shareFileName('faktografia', cardSetFileParts(p, 'post'), 'png'));
    expect(names[0]).toBe('faktografia-1-map-a-post-2024.png');
    expect(names[4]).toBe('faktografia-5-profile-b-post-2024.png');
    expect([...names].sort()).toEqual(names);
  });
});

describe('karty pochodne z profili', () => {
  it('rozpoznaje profil jednostki', () => {
    expect(isUnitProfile(profileA)).toBe(true);
    expect(isUnitProfile('12')).toBe(false);
    expect(isUnitProfile(null)).toBe(false);
  });
  it('ranking porównania sortuje po miejscu w kraju', () => {
    const r = rankingFromProfiles([{ profile: profileA, name: 'małopolskie' }, { profile: profileB, name: 'śląskie' }], 'Gęstość zaludnienia', 2024)!;
    expect(r.items.map((i) => [i.name, i.rank])).toEqual([['śląskie', 2], ['małopolskie', 5]]);
    expect(r.indicator.name).toBe('Gęstość zaludnienia');
    expect(rankingFromProfiles([{ profile: { teryt: '1', unit: null, indicators: [] }, name: 'x' }], 'X', 2024)).toBeUndefined();
  });
  it('profil ma wskaźnik główny jako dużą liczbę i miejsce w kraju', () => {
    const p = profileCardFromUnitProfile(profileB, 'śląskie', 'Stopa bezrobocia', 2024);
    expect(p.indicatorName).toBe('Stopa bezrobocia');
    expect(p.rankText).toBe('7. miejsce w Polsce');
    expect(p.indicators.map((i) => i.name)).toEqual(['Gęstość zaludnienia']);
    expect(p.unitName).toBe('śląskie');
  });
});

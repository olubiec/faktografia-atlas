import type { CompareCardData, MapCardData, ProfileCardData, RankingCardData } from './card';
import type { ProfileIndicatorItem, UnitProfile } from '../profile/profile';
import { formatValue } from '../format/number';

/** Karty pochodne dla porównania: mapa jednej jednostki, profil i ranking z profili. Czyste funkcje. */

/** Karta mapy jednej strony porównania (z legendą klas – rysuje ją renderMapContent). */
export function mapCardFromCompare(compare: CompareCardData, side: 'A' | 'B'): MapCardData {
  const unit = side === 'A' ? compare.unitA : compare.unitB;
  return {
    indicator: { name: compare.indicatorName, year: compare.year },
    year: compare.year,
    unitName: `${unit.name}, ${compare.year}`,
    features: unit.features,
    classOf: unit.classOf,
    selectedTeryt: unit.teryt,
  };
}

/** Czy wartość wygląda na profil jednostki (a nie samą jednostkę lub kod TERYT). */
export function isUnitProfile(value: unknown): value is UnitProfile {
  return typeof value === 'object' && value !== null && Array.isArray((value as UnitProfile).indicators);
}

/** Wskaźnik główny profilu: o podanej nazwie, a gdy go brak – pierwszy z wartością. */
export function mainIndicatorItem(profile: UnitProfile, indicatorName: string): ProfileIndicatorItem | undefined {
  return (
    profile.indicators.find((i) => i.indicator.name === indicatorName && i.value != null) ??
    profile.indicators.find((i) => i.value != null)
  );
}

/** Karta profilu z profilu jednostki: duża liczba wskaźnika głównego i do 5 innych wskaźników. */
export function profileCardFromUnitProfile(profile: UnitProfile, unitName: string, indicatorName: string, year: number): ProfileCardData {
  const main = mainIndicatorItem(profile, indicatorName);
  const others = profile.indicators
    .filter((i) => i !== main && i.value != null)
    .slice(0, 5)
    .map((i) => ({
      name: i.indicator.name,
      value: formatValue(i.value, i.indicator.unit),
      unit: i.indicator.unit,
      rankText: i.rankNational ? `${i.rankNational}. miejsce` : undefined,
    }));
  return {
    unitName,
    teryt: profile.teryt,
    indicatorName: main?.indicator.name ?? indicatorName,
    unit: main?.indicator.unit,
    year,
    bigNumber: main ? formatValue(main.value, main.indicator.unit) : 'brak danych',
    rankText: main?.rankNational ? `${main.rankNational}. miejsce w Polsce` : undefined,
    indicators: others,
  };
}

/** Ranking porównywanych jednostek: miejsce w kraju dla wskaźnika głównego, od najlepszego. */
export function rankingFromProfiles(
  entries: { profile: UnitProfile; name: string }[],
  indicatorName: string,
  year: number,
): RankingCardData | undefined {
  const first = entries[0] ? mainIndicatorItem(entries[0].profile, indicatorName) : undefined;
  if (!first) return undefined;
  const id = first.indicatorId;
  const items = entries
    .map(({ profile, name }) => {
      const it = profile.indicators.find((i) => i.indicatorId === id);
      return {
        teryt: profile.teryt,
        name,
        value: it?.value ?? null,
        valueText: formatValue(it?.value ?? null, first.indicator.unit),
        rank: it?.rankNational ?? undefined,
      };
    })
    .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
  return { indicator: { name: first.indicator.name, unit: first.indicator.unit }, year, items };
}

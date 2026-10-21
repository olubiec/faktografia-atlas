import type { Indicator, ProfileIndicatorItem, UnitProfile } from '../profile/profile';
import type { Unit } from '../units/types';

export type ProfileShardItem = {
  indicatorId: string;
  year: number | null;
  value: number | null;
  rankNational: number | null;
  rankVoivodeship: number | null;
  totalNational: number;
  totalVoivodeship: number;
  neutral: boolean;
  fromParent?: string;
  years?: number[];
  series: (number | null)[];
};

export type ProfileShard = {
  woj: string;
  generatedAt: string;
  years?: Record<string, number[]>;
  units: Record<string, ProfileShardItem[]>;
};

const shardCache = new Map<string, ProfileShard | null>();
const loadingPromises = new Map<string, Promise<ProfileShard | null>>();

/**
 * Pobiera plik szardu profilu dla danego województwa /data/profiles/<wojTeryt>.json.
 * Kesżuje wynik w pamięci i przy równoległych wywołaniach wykonuje jedno żądanie.
 * W przypadku 404 lub błędu sieci zwraca null bez zgłaszania wyjątku.
 */
export function loadProfileShard(
  wojTeryt: string,
  fetchImpl: typeof fetch = (...args) => fetch(...args)
): Promise<ProfileShard | null> {
  if (shardCache.has(wojTeryt)) {
    return Promise.resolve(shardCache.get(wojTeryt) ?? null);
  }

  if (loadingPromises.has(wojTeryt)) {
    return loadingPromises.get(wojTeryt)!;
  }

  const promise = fetchImpl(`/data/profiles/${wojTeryt}.json`)
    .then((res) => {
      if (!res.ok) {
        shardCache.set(wojTeryt, null);
        return null;
      }
      return res.json() as Promise<ProfileShard>;
    })
    .then((data) => {
      if (data && typeof data === 'object' && data.units && typeof data.units === 'object') {
        shardCache.set(wojTeryt, data);
        return data;
      }
      shardCache.set(wojTeryt, null);
      return null;
    })
    .catch(() => {
      shardCache.set(wojTeryt, null);
      return null;
    })
    .finally(() => {
      loadingPromises.delete(wojTeryt);
    });

  loadingPromises.set(wojTeryt, promise);
  return promise;
}

/**
 * Odczytuje profil jednostki z pobranego szardu.
 * Odbudowuje obiekty indicator oraz serię czasową { year, value }[] dla każdej pozycji.
 * Zwraca ten sam typ `UnitProfile` co `buildProfile`.
 */
export function profileFromShard(
  teryt: string,
  shard: ProfileShard | null,
  indicators: Indicator[],
  units: Unit[]
): UnitProfile {
  const targetUnit = units.find((u) => u.teryt === teryt) ?? null;
  if (!targetUnit) {
    return {
      teryt,
      unit: null,
      indicators: [],
    };
  }

  if (!shard || !shard.units || !shard.units[teryt]) {
    return {
      teryt,
      unit: targetUnit,
      indicators: [],
    };
  }

  const indicatorsById = new Map<string, Indicator>();
  for (const ind of indicators) {
    indicatorsById.set(ind.id, ind);
  }

  const shardItems = shard.units[teryt];
  const profileItems: ProfileIndicatorItem[] = [];

  for (const item of shardItems) {
    const indicator = indicatorsById.get(item.indicatorId);
    if (!indicator) {
      continue;
    }

    const years = item.years ?? shard.years?.[item.indicatorId] ?? [];
    const series = years.map((y, i) => ({
      year: y,
      value: item.series?.[i] ?? null,
    }));

    profileItems.push({
      indicatorId: item.indicatorId,
      indicator,
      year: item.year,
      value: item.value,
      rankNational: item.rankNational,
      rankVoivodeship: item.rankVoivodeship,
      totalNational: item.totalNational,
      totalVoivodeship: item.totalVoivodeship,
      neutral: item.neutral,
      fromParent: item.fromParent,
      series,
    });
  }

  return {
    teryt,
    unit: targetUnit,
    indicators: profileItems,
  };
}

/**
 * Czyści pamięć podręczną szardów (używane w testach).
 */
export function resetProfileCache(): void {
  shardCache.clear();
  loadingPromises.clear();
}

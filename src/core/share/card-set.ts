import type { CardData, CardKind, CompareCardData, MapCardData, ProfileCardData, RankingCardData } from './card';
import type { UnitProfile } from '../profile/profile';
import { cardPages } from './card-pages';
import { pageLabel } from './pagination';
import { isUnitProfile, mapCardFromCompare, profileCardFromUnitProfile, rankingFromProfiles } from './card-set-sources';

/**
 * Zestaw kart do eksportu: lista w kolejności wybranej przez użytkownika.
 * Wszystkie funkcje są czyste – zwracają nową listę, wejścia nie zmieniają.
 */

export interface CardSetEntry {
  /** Stały identyfikator w zestawie (np. „map-a”), używany też w nazwie pliku. */
  id: string;
  kind: CardKind;
  /** Opis dla człowieka, np. „Mapa: Województwo małopolskie”. */
  label: string;
  data: CardData;
}

export type CardSet = readonly CardSetEntry[];

/** Dane wejściowe: to, co okno udostępniania dostaje od ekranu. */
export interface CardSetSource {
  map?: MapCardData;
  ranking?: RankingCardData;
  profile?: ProfileCardData;
  compare?: CompareCardData;
  compareUnitA?: unknown;
  compareUnitB?: unknown;
}

const KIND_NAMES: Record<CardKind, string> = { map: 'Mapa', ranking: 'Ranking', profile: 'Profil', compare: 'Tabela porównawcza' };

function entry(id: string, kind: CardKind, data: CardData, detail?: string): CardSetEntry {
  return { id, kind, data, label: detail ? `${KIND_NAMES[kind]}: ${detail}` : KIND_NAMES[kind] };
}

/** Zestaw dla porównania: mapa A, mapa B, tabela, ranking, profile A i B. */
function compareSet(src: CardSetSource, compare: CompareCardData): CardSetEntry[] {
  const { unitA, unitB, year, indicatorName } = compare;
  const set: CardSetEntry[] = [
    entry('map-a', 'map', mapCardFromCompare(compare, 'A'), unitA.name),
    entry('map-b', 'map', mapCardFromCompare(compare, 'B'), unitB.name),
    entry('compare', 'compare', compare, `${unitA.name} i ${unitB.name}`),
  ];
  const profiles: { profile: UnitProfile; name: string; id: string }[] = [];
  if (isUnitProfile(src.compareUnitA)) profiles.push({ profile: src.compareUnitA, name: unitA.name, id: 'profile-a' });
  if (isUnitProfile(src.compareUnitB)) profiles.push({ profile: src.compareUnitB, name: unitB.name, id: 'profile-b' });

  const ranking = src.ranking ?? (profiles.length > 0 ? rankingFromProfiles(profiles, indicatorName, year) : undefined);
  if (ranking) set.push(entry('ranking', 'ranking', ranking, ranking.indicator.name));

  if (profiles.length > 0) {
    for (const p of profiles) set.push(entry(p.id, 'profile', profileCardFromUnitProfile(p.profile, p.name, indicatorName, year), p.name));
  } else if (src.profile) {
    set.push(entry('profile', 'profile', src.profile, src.profile.unitName));
  }
  return set;
}

/** Domyślny zestaw: porównanie (gdy jest) albo mapa, ranking i profil pojedynczej jednostki. */
export function buildCardSet(src: CardSetSource): CardSetEntry[] {
  if (src.compare) return compareSet(src, src.compare);
  const set: CardSetEntry[] = [];
  if (src.map) set.push(entry('map', 'map', src.map, src.map.unitName));
  if (src.ranking) set.push(entry('ranking', 'ranking', src.ranking, src.ranking.indicator.name));
  if (src.profile) set.push(entry('profile', 'profile', src.profile, src.profile.unitName));
  return set;
}

/** Usuwa kartę o danym id (brak id = ta sama zawartość w nowej liście). */
export function removeCard(set: CardSet, id: string): CardSetEntry[] {
  return set.filter((e) => e.id !== id);
}

/** Czy kartę da się przesunąć o `delta` (−1 w górę, +1 w dół). */
export function canMoveCard(set: CardSet, id: string, delta: -1 | 1): boolean {
  const i = set.findIndex((e) => e.id === id);
  if (i < 0) return false;
  const j = i + delta;
  return j >= 0 && j < set.length;
}

/** Przesuwa kartę o jedno miejsce w górę (−1) lub w dół (+1); na krawędzi listy nic nie zmienia. */
export function moveCard(set: CardSet, id: string, delta: -1 | 1): CardSetEntry[] {
  const next = [...set];
  if (!canMoveCard(set, id, delta)) return next;
  const i = next.findIndex((e) => e.id === id);
  const j = i + delta;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Jedna strona (jeden plik PNG) zestawu z numeracją ciągłą n/N przez cały zestaw. */
export interface CardSetPage {
  entry: CardSetEntry;
  data: CardData;
  page: { number: number; total: number };
}

/** Rozkłada zestaw na strony w kolejności listy; ranking może zająć kilka stron. */
export function cardSetPages(set: CardSet): CardSetPage[] {
  const raw = set.flatMap((e) => cardPages(e.kind, e.data).map((p) => ({ entry: e, data: p.data })));
  const total = raw.length;
  return raw.map((p, i) => ({ ...p, page: { number: i + 1, total } }));
}

/** Etykieta pozycji karty w zestawie: „2/5”, a dla karty wielostronicowej „3–4/6”. */
export interface CardSetPosition {
  id: string;
  from: number;
  to: number;
  total: number;
  label: string;
}

export function cardSetPositions(set: CardSet): CardSetPosition[] {
  const pages = cardSetPages(set);
  return set.map((e) => {
    const own = pages.filter((p) => p.entry.id === e.id);
    const from = own[0]?.page.number ?? 0;
    const to = own[own.length - 1]?.page.number ?? 0;
    const total = pages.length;
    const label = from === to ? pageLabel(from, total) : `${from}–${to}/${total}`;
    return { id: e.id, from, to, total, label };
  });
}

/** Części nazwy pliku strony: numer z zerem wiodącym zachowuje kolejność przy sortowaniu po nazwie. */
export function cardSetFileParts(p: CardSetPage, format: string): (string | number)[] {
  const width = String(p.page.total).length;
  const year = 'year' in p.data ? p.data.year : undefined;
  const parts: (string | number)[] = [String(p.page.number).padStart(width, '0'), p.entry.id, format];
  if (year !== undefined) parts.push(year);
  return parts;
}

import { normalize } from './normalize';
import { INDICATOR_PHRASES, LEVEL_PHRASES, UNIT_PREFIXES } from './intent-synonyms';
import type { Unit, UnitLevel } from '../units/types';

export type Intent = {
  i?: string;
  l?: UnitLevel;
  y?: number;
  u?: string;
  notes: string[];
};

type IndicatorInfo = { id: string; minLevel?: string };

const RANK: Record<string, number> = { woj: 0, pow: 1, gmi: 2 };

/** Szuka najdłuższej frazy ze słownika (na granicach słów); zwraca ją i tekst bez niej. */
function takePhrase<T>(text: string, dict: Record<string, T>): { value: T; rest: string } | null {
  const padded = ` ${text} `;
  const phrases = Object.keys(dict).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    const at = padded.indexOf(` ${phrase} `);
    if (at >= 0) {
      const rest = (padded.slice(0, at) + ' ' + padded.slice(at + phrase.length + 2)).replace(/\s+/g, ' ').trim();
      return { value: dict[phrase], rest };
    }
  }
  return null;
}

/** Nazwa jednostki po normalizacji, bez prefiksów typu „powiat”. */
function unitKey(name: string): string {
  let key = normalize(name);
  for (const prefix of UNIT_PREFIXES) {
    if (key.startsWith(prefix)) key = key.slice(prefix.length);
  }
  return key;
}

/**
 * Rozpoznaje wskaźnik, poziom, rok i jednostkę we wpisanym tekście.
 * Bez rozpoznanego wskaźnika zwraca null (wyszukiwarka działa jak dotąd).
 */
export function parseIntent(
  text: string,
  data: { units: Unit[]; indicators: IndicatorInfo[] },
): Intent | null {
  let rest = normalize(text);
  const notes: string[] = [];
  const known = new Map(data.indicators.map((ind) => [ind.id, ind]));

  const found = takePhrase(rest, INDICATOR_PHRASES);
  if (!found || !known.has(found.value)) return null;
  rest = found.rest;
  const result: Intent = { i: found.value, notes };

  const year = /(?:^| )(\d{4})(?= |$)/.exec(rest);
  if (year && Number(year[1]) >= 1995 && Number(year[1]) <= 2100) {
    result.y = Number(year[1]);
    rest = rest.replace(year[0], ' ').replace(/\s+/g, ' ').trim();
  }

  const lvl = takePhrase(rest, LEVEL_PHRASES);
  if (lvl) {
    rest = lvl.rest;
    const min = known.get(found.value)?.minLevel;
    // minLevel = najdrobniejszy poziom, do którego GUS podaje dane.
    if (min && RANK[lvl.value] > RANK[min]) {
      notes.push('GUS podaje te dane tylko do powiatów');
    } else {
      result.l = lvl.value;
    }
  }

  // Najdłuższe dopasowanie nazwy jednostki (na granicach słów).
  const padded = ` ${rest} `;
  let best: Unit[] = [];
  let bestLen = 0;
  for (const unit of data.units) {
    const key = unitKey(unit.name);
    if (!key || !padded.includes(` ${key} `)) continue;
    if (key.length > bestLen) {
      best = [unit];
      bestLen = key.length;
    } else if (key.length === bestLen) {
      best.push(unit);
    }
  }
  if (best.length > 1 && result.l) {
    const sameLevel = best.filter((unit) => unit.level === result.l);
    if (sameLevel.length > 0) best = sameLevel;
  }
  if (best.length === 1) result.u = best[0].teryt;
  else if (best.length > 1) notes.push('kilka miejsc o tej nazwie');

  return result;
}

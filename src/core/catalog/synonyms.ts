import raw from '../../../config/synonyms.json';
import { normalize } from '../search/normalize';

// Synonimy szukajki wyboru danych. Jedno źródło: config/synonyms.json.

type SynonymFile = { words: Record<string, string[]>; sections: Record<string, string> };
const FILE = raw as unknown as SynonymFile;

const WORDS = new Map(Object.entries(FILE.words).map(([k, v]) => [normalize(k), v.map(normalize)]));
const SECTIONS = new Map(Object.entries(FILE.sections).map(([k, v]) => [normalize(k), normalize(v)]));

/** Zamienniki słowa (bez niego samego); pusta lista, gdy słowo nie ma synonimów. */
export function synonymsOf(word: string): string[] {
  return WORDS.get(normalize(word)) ?? [];
}

/** Podpowiedź działu (początek jego nazwy, bez polskich liter) dla słowa albo null. */
export function sectionHintFor(word: string): string | null {
  return SECTIONS.get(normalize(word)) ?? null;
}

// Wybór wskaźników biblioteki GUS do anomalii: które da się uczciwie porównać między gminami i jak je nazwać.
// Czysta logika (bez sieci i plików): wartości dostarcza robot (scripts/data/build-facts.mjs).
import config from '../../../config/anomalies.json';
import { effectiveUnit } from '../catalog/effective-unit';
import { standaloneName } from '../catalog/standalone-name';
import type { AvailableVariable } from '../indicators/registry';
import { valenceOf, type Valence } from './valence';

/** Wskaźnik gotowy do porównań: wartości gmin po TERYT, w osi lat `years`. */
export interface AnomalySource {
  id: string;
  name: string;
  unit: string;
  /** Temat (ostatni człon ścieżki z GUS) – do tego, żeby karty gminy nie powtarzały jednego tematu. */
  topic: string;
  years: number[];
  values: Record<string, (number | null)[]>;
  /** true = przeliczone przez nas na 1000 mieszkańców z liczby bezwzględnej. */
  derived: boolean;
}

export const PER_CAPITA_UNIT = 'na 1000 mieszkańców';

const DROP = config.dropNamePatterns.map((p) => new RegExp(p, 'iu'));
const RATE_NAME = /\bna \d|\bna 1 \p{L}|\bna (aptekę|placówkę|izbę|mieszkanie|oddział)(?!\p{L})|przypada|średni|przeciętn|wskaźnik|współczynnik|udział|odsetek|stosunek|gęstość|\(%\)|w %/iu;
const lower = (s: string) => s.toLocaleLowerCase('pl');

/** Nazwa czytelna jako samodzielny podmiot zdania: nie za długa, bez podziałów na wiek, PKD i „gminy łącznie z …”. */
export function isReadableName(name: string): boolean {
  return name.length > 0 && name.length <= config.pick.maxNameLength && !DROP.some((re) => re.test(name));
}

export type SourceKind = 'rate' | 'count';

/** Wskaźnik już „na N”, odsetek i średnie – rate; liczba bezwzględna – count (przeliczamy na mieszkańców); reszta (sumy, hektary, kilometry) odpada. */
export function sourceKind(v: Pick<AvailableVariable, 'n' | 'u' | 'c'>): SourceKind | null {
  const unit = effectiveUnit(v.n, v.u);
  const name = standaloneName(v.n, v.c);
  if (!isReadableName(name)) return null;
  if (unit === '%' || /^na /.test(unit)) return 'rate';
  const text = `${name} ${v.n}`;
  if (config.rateUnits.includes(unit)) return /\bna 1 \p{L}|\bcena\b|przeciętn\p{L}* powierzchni/iu.test(text) ? 'rate' : null;
  if (unit === '-') return /przeciętna liczba (izb|osób)/iu.test(text) ? 'rate' : null;
  if (config.countUnits.includes(unit)) return RATE_NAME.test(text) ? null : 'count';
  return null;
}

/** Nazwa i temat do pliku anomalii. */
export function describeSource(v: Pick<AvailableVariable, 'n' | 'u' | 'c'>): { name: string; unit: string; topic: string } {
  const topic = lower((v.c ?? '').split(' > ').map((p) => p.trim()).filter(Boolean).pop() ?? v.n);
  // Jednostka jest osobno pod liczbą – z nazwy znika „na 1000 ludności”.
  const name = standaloneName(v.n, v.c).replace(/\s+na (1000|10 tys\.) (ludności|mieszkańców)( w wieku produkcyjnym)?$/u, '');
  return { name, unit: effectiveUnit(v.n, v.u), topic };
}

const PER_INHABITANT = /^na (10 tys\.|1000|10000) (ludności|mieszkańców)( w wieku produkcyjnym)?$/;

/**
 * Jednostka wyświetlana jednolicie: wskaźniki „na 10 tys. ludności” i „na 1000 ludności” to zawsze „na 1000 mieszkańców”
 * (factor 0,1 dla 10 tys.); „-” bez jednostki – pusta. changed = wartość różni się od tej na mapie (przeliczenie).
 */
export function normalizeUnit(unit: string): { unit: string; factor: number; changed: boolean } {
  const m = PER_INHABITANT.exec(unit);
  if (!m) return { unit: unit === '-' ? '' : unit, factor: 1, changed: false };
  const factor = m[1] === '1000' ? 1 : 0.1;
  return { unit: m[3] ? `${PER_CAPITA_UNIT}${m[3]}` : PER_CAPITA_UNIT, factor, changed: factor !== 1 };
}

/** Klucz do usuwania powtórzeń tej samej miary w różnych jednostkach („… na 1000 ludności” i „… na 10 tys. ludności”). */
export function dedupeKey(name: string): string {
  return lower(name).replace(/\s+na (10 tys\.|1000|10000)( ludności| mieszkańców)?( w wieku produkcyjnym)?/g, '').replace(/\s+/g, ' ').trim();
}

/** Kierunek „lepiej”: jawna lista wskaźników głównych, potem słowa kluczowe w nazwie; null = nie oceniamy. */
export function valenceFromName(id: string, name: string): Valence | null {
  const explicit = valenceOf(id);
  if (explicit) return explicit;
  const n = lower(name);
  const down = config.valence.down.some((k) => n.includes(k));
  const up = config.valence.up.some((k) => n.includes(k));
  if (down === up) return null;
  return down ? 'down' : 'up';
}

/** Liczba bezwzględna → na 1000 mieszkańców; brak ludności albo wartości = null. */
export function perThousand(value: number | null | undefined, population: number | null | undefined): number | null {
  if (typeof value !== 'number' || typeof population !== 'number' || !Number.isFinite(value) || population <= 0) return null;
  return (value / population) * 1000;
}

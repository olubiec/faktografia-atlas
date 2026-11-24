// Wytyczne robota „Biblioteka GUS”: które zmienne z katalogu w ogóle warto pobierać (czyste funkcje, bez sieci).
// Zmienna wchodzi, gdy jej temat jest na liście config/library-scope.json I przechodzi reguły strony
// (config/library-curation.json – te same, którymi strona ukrywa niszowe wskaźniki). Dzięki temu robot
// nie zużywa zapytań na dane, których strona i tak nie pokaże.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { yearProbeUrl } from './library-plan.mjs';

const lower = (s) => String(s ?? '').toLocaleLowerCase('pl').trim();
const fileOf = (name) => fileURLToPath(new URL(`../../config/${name}`, import.meta.url));

/** Nazwa zmiennej tak, jak składa ją spis biblioteki (n1 – n2 – …). */
export function variableName(v) {
  return [v.n1, v.n2, v.n3, v.n4, v.n5].filter((x) => typeof x === 'string' && x.trim()).join(' – ');
}

/** Liczba poziomów podziału nazwy ponad pierwszy (n2…n5). */
function depthOf(v) {
  return ['n2', 'n3', 'n4', 'n5'].filter((k) => typeof v[k] === 'string' && v[k].trim()).length;
}

/**
 * Składa wytyczne z trzech plików konfiguracji w jeden obiekt (czysta funkcja – łatwa do testów).
 * alwaysIds = wbudowane + przypięte + keepIds: wchodzą zawsze, bez względu na temat i reguły.
 */
export function buildScope({ scope, curation, indicators = [], priority = {} }) {
  const always = new Set([
    ...indicators.map((i) => String(i.bdlVarId)),
    ...(priority.pinnedIds ?? []).map(String),
    ...(curation.keepIds ?? []).map(String),
  ]);
  return {
    topics: new Set(Object.keys(scope.topics ?? {})),
    maxDepth: scope.maxDepth ?? 2,
    minLevel: scope.minLevel ?? 2,
    patterns: (scope.dropNamePatterns ?? []).map((p) => new RegExp(p, 'u')),
    staleBeforeYear: curation.staleBeforeYear ?? 0,
    dropIds: new Set((curation.dropIds ?? []).map(String)),
    dropSections: (curation.dropSections ?? []).map(lower),
    dropGroups: (curation.dropGroups ?? []).map(lower),
    dropNameParts: (curation.dropNameParts ?? []).map(lower),
    dropNameEndings: (curation.dropNameEndings ?? []).map(lower),
    dropUnits: (curation.dropUnits ?? []).map(lower),
    always,
  };
}

/** Wczytuje wytyczne z config/ (library-scope, library-curation, indicators, library-priority). */
export async function loadScope() {
  const read = async (name) => JSON.parse(await readFile(fileOf(name), 'utf8'));
  return buildScope({
    scope: await read('library-scope.json'),
    curation: await read('library-curation.json'),
    indicators: await read('indicators.json'),
    priority: await read('library-priority.json'),
  });
}

/**
 * Powód pominięcia zmiennej albo null, gdy robot ma ją pobrać.
 * subjectPath = ścieżka działów z katalogu (np. ['LUDNOŚĆ', 'STAN LUDNOŚCI', 'Gęstość…']).
 */
export function scopeReason(v, subjectPath, scope) {
  const id = String(v.id);
  if (scope.always.has(id)) return null;
  if (!(Number(v.level) >= scope.minLevel)) return 'tylko dane dla całej Polski';
  if (!scope.topics.has(String(v.subjectId))) return 'temat spoza wytycznych';
  if (scope.dropIds.has(id)) return 'odrzucony po przeglądzie';
  if (depthOf(v) > scope.maxDepth) return 'zbyt szczegółowy podział';
  const [section = '', group = ''] = (subjectPath ?? []).map(lower);
  if (scope.dropSections.some((s) => section.startsWith(s))) return 'dział niszowy';
  if (scope.dropGroups.some((g) => group.startsWith(g))) return 'grupa niszowa';
  if (scope.dropUnits.includes(lower(v.unit))) return 'jednostka techniczna';
  const name = lower(variableName(v));
  if (scope.dropNameParts.some((p) => name.includes(p))) return 'wariant dla specjalistów';
  if (scope.dropNameEndings.some((e) => name.endsWith(e))) return 'podział na płeć';
  if (scope.patterns.some((re) => re.test(name))) return 'dane miesięczne lub techniczny podział';
  return null;
}

/** Zmienne katalogu, które robot ma pobierać (kolejność bez zmian). */
export function filterInScope(variables, catalog, scope) {
  return variables.filter((v) => scopeReason(v, catalog?.subjects?.[v.subjectId]?.path ?? [], scope) === null);
}

/** Dane archiwalne: ostatni rok w pobranym pliku starszy niż próg – odświeżanie nic nie da. */
export function isStale(years, scope) {
  const list = (years ?? []).map(Number).filter(Number.isFinite);
  return list.length > 0 && Math.max(...list) < scope.staleBeforeYear;
}

/**
 * Poziomy jednostek do pobrania (unit-level w API BDL): 2 = województwa, 5 = powiaty, 6 = gminy.
 * Województwa zawsze (16 wierszy = 1 zapytanie), powiaty i gminy, gdy zmienna je ma.
 * Poziomy 3–4 (regiony, podregiony) nie mają odpowiednika na mapie – z nich bierzemy województwa.
 */
export function fetchLevels(v) {
  const lvl = Number(v.level);
  if (!Number.isFinite(lvl) || lvl < 2) return [];
  return [2, ...(lvl >= 5 ? [5] : []), ...(lvl >= 6 ? [6] : [])];
}

/** Klucz poziomu w pliku wartości: województwa jako l3 (tak czyta je strona), reszta l5 / l6. */
export function levelKey(level) {
  return level === 2 ? 'l3' : `l${level}`;
}

/** Lata w pobranym pliku: najdokładniejszy poziom, jaki jest. */
export function yearsOf(file) {
  return file?.l6?.y ?? file?.l5?.y ?? file?.l3?.y ?? [];
}

/** Sonda nowego roku: na poziomie powiatów, a dla danych tylko wojewódzkich – województw. */
export function probeUrlFor(v, years) {
  const u = new URL(yearProbeUrl(v.id, years));
  if (Number(v.level) < 5) u.searchParams.set('unit-level', '2');
  return u.toString();
}

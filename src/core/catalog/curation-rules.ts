// Reguły wyboru „popularnych” danych z biblioteki GUS (decyzja właściciela: zostają tylko
// proste, zrozumiałe wskaźniki; niszowe, techniczne i przestarzałe znikają z całej strony).
// Listy leżą w config/library-curation.json, bo z tych samych reguł korzysta robot nocny
// (scripts/data/library-scope.mjs): czego strona nie pokaże, tego robot nie pobiera.
// Porównania po małych literach. Edytuj JSON – logika jest w curation.ts.
import rules from '../../../config/library-curation.json';

/** Dane, których ostatni rok jest starszy, uznajemy za archiwalne. */
export const STALE_BEFORE_YEAR: number = rules.staleBeforeYear;

/** Całe działy (początek nazwy działu GUS). */
export const DROP_SECTIONS: string[] = rules.dropSections;

/** Całe grupy (początek nazwy grupy GUS) – techniczne albo rozbite na dziesiątki wariantów. */
export const DROP_GROUPS: string[] = rules.dropGroups;

/** Fragmenty nazwy (tej, którą widzi użytkownik) oznaczające wariant dla specjalistów. */
export const DROP_NAME_PARTS: string[] = rules.dropNameParts;

/** Pojedyncze końcówki nazwy: podział na płeć i podobne rozbicia. */
export const DROP_NAME_ENDINGS: string[] = rules.dropNameEndings;

/** Jednostki techniczne, niezrozumiałe dla większości (tysiące m³, tony rocznie itp.). */
export const DROP_UNITS: string[] = rules.dropUnits;

/** Pojedyncze wskaźniki odrzucone po przeglądzie: duplikaty, mylące nazwy, warianty techniczne. */
export const DROP_IDS = new Set<string>(rules.dropIds);

/** Wyjątki: zostają mimo reguł (zrozumiałe, choć nazwa łapie się na regułę). */
export const KEEP_IDS = new Set<string>(rules.keepIds);

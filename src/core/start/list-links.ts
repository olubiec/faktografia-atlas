// Zestawienia na starcie → pełne strony zestawień (`/zestawienie/<slug>`, config/lists.json): ta sama lista w całości
// i „drugi koniec skali” (ten sam wskaźnik i poziom, odwrotny kierunek). Tylko zestawienia wartości, nie zmiany.
import listsConfig from '../../../config/lists.json';
import { DISCOVER_INDEX, LIST_ROOT } from '../seo/topics';
import type { Level } from '../facts/types';

export interface ListLink {
  href: string;
  label: string;
}

type Def = { slug: string; indicatorId: string; level: string; kind: string; dir: number; title: string };
const DEFS = (listsConfig.lists as Def[]).filter((d) => d.kind === 'value');

const find = (indicatorId: string, level: Level, dir: number): Def | undefined =>
  DEFS.find((d) => d.indicatorId === indicatorId && d.level === level && d.dir === dir);

/** Spis wszystkich tematów i zestawień. */
export const ALL_LISTS_HREF = DISCOVER_INDEX;

/** Pełne zestawienie tego samego kierunku i zestawienie z drugiego końca skali; brak strony = brak linku. */
export function listLinks(indicatorId: string, level: Level, dir: number): { full: ListLink | null; opposite: ListLink | null } {
  const same = find(indicatorId, level, dir);
  const other = find(indicatorId, level, -dir);
  return {
    full: same ? { href: `${LIST_ROOT}/${same.slug}`, label: same.title.replace(/ w Polsce(?= |$)/, '') } : null,
    opposite: other ? { href: `${LIST_ROOT}/${other.slug}`, label: other.title.replace(/ w Polsce(?= |$)/, '') } : null,
  };
}

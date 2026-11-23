// Sąsiedztwo jednostek z topologii public/geo/admin.topo.json (W26-F03, KONCEPT-ODKRYCIA §3 F3).
// Sąsiedzi = jednostki tego samego poziomu, które mają wspólny łuk granicy. Liczone w robocie, nie w przeglądarce.
import type { Level, NeighbourRing } from './types';

/** Minimum topologii potrzebne do sąsiedztwa: indeksy łuków geometrii i TERYT w properties. */
export interface TopoGeometryLike {
  arcs?: unknown;
  properties?: { teryt?: string } | null;
}

export interface TopologyLike {
  objects: Partial<Record<Level, { geometries: TopoGeometryLike[] }>>;
}

/** Łuk odwrócony zapisuje się jako ~i (liczba ujemna) – to ten sam łuk. */
const arcId = (i: number) => (i < 0 ? ~i : i);

function collectArcs(arcs: unknown, out: Set<number>): void {
  if (typeof arcs === 'number') out.add(arcId(arcs));
  else if (Array.isArray(arcs)) for (const a of arcs) collectArcs(a, out);
}

/** Bezpośredni sąsiedzi każdej jednostki poziomu (relacja symetryczna). */
export function adjacency(topo: TopologyLike, level: Level): Map<string, Set<string>> {
  const byArc = new Map<number, string[]>();
  const adj = new Map<string, Set<string>>();
  for (const g of topo.objects[level]?.geometries ?? []) {
    const teryt = g.properties?.teryt;
    if (!teryt) continue;
    if (!adj.has(teryt)) adj.set(teryt, new Set());
    const arcs = new Set<number>();
    collectArcs(g.arcs, arcs);
    for (const a of arcs) {
      const list = byArc.get(a) ?? [];
      if (!list.includes(teryt)) list.push(teryt);
      byArc.set(a, list);
    }
  }
  for (const list of byArc.values()) {
    for (const a of list) for (const b of list) if (a !== b) adj.get(a)!.add(b);
  }
  return adj;
}

/**
 * Pierścień sąsiadów: bezpośredni; przy mniej niż `min` – dołączeni sąsiedzi sąsiadów
 * (miasto otoczone jedną gminą wiejską, tzw. obwarzanek, porównuje się z gminami wokół obwarzanka).
 */
export function neighbourRings(adj: ReadonlyMap<string, ReadonlySet<string>>, min: number): Record<string, NeighbourRing> {
  const out: Record<string, NeighbourRing> = {};
  for (const teryt of [...adj.keys()].sort()) {
    const direct = adj.get(teryt)!;
    const ring = new Set(direct);
    const extended = direct.size < min;
    if (extended) {
      for (const n of direct) for (const m of adj.get(n) ?? []) if (m !== teryt) ring.add(m);
    }
    out[teryt] = { ids: [...ring].sort(), extended: extended && ring.size > direct.size };
  }
  return out;
}

/** Pierścienie dla wszystkich poziomów topologii (gminy, powiaty, województwa). */
export function ringsFromTopology(topo: TopologyLike, min: number): Record<string, NeighbourRing> {
  const out: Record<string, NeighbourRing> = {};
  for (const level of ['woj', 'pow', 'gmi'] as const) Object.assign(out, neighbourRings(adjacency(topo, level), min));
  return out;
}

// public/data/facts-lists.json i gmina-small.json: dalsze slajdy karuzeli zestawień na starcie (KONCEPT-ZESTAWIENIA-KARUZELA §3.4).
// Zestawienia 5 + 5 liczy robot, więc strona nie ładuje całych plików wartości.
import type { FactsBuild } from './build';
import { buildList, type StartList } from './start';
import type { Level } from './types';

export interface FactsLists {
  generatedAt: string;
  lists: StartList[];
}

/** Poziom zestawienia: gminy, gdy wskaźnik ma dane gmin, w przeciwnym razie powiaty. */
export function carouselLevel(build: FactsBuild, indicatorId: string): Level {
  const data = build.ctx.input.values[indicatorId];
  return build.ctx.byLevel.gmi.some((u) => data?.values[u.teryt]) ? 'gmi' : 'pow';
}

const keyOf = (l: Pick<StartList, 'indicatorId' | 'level' | 'dir'>): string => `${l.indicatorId}-${l.level}-${l.dir}`;

/**
 * Slajdy karuzeli poza zestawieniami redakcyjnymi z config/facts.json → start.lists. Gminy poniżej `minPopulation`
 * mieszkańców są pominięte (szum małych liczb), kolejność z start.carousel. Świeże zestawienie na pierwszym miejscu
 * facts-start.json może powtórzyć wskaźnik z karuzeli – powtórkę usuwa strona (`dedupeLists`).
 */
export function buildCarousel(build: FactsBuild, generatedAt: string, minPopulation: number): FactsLists {
  const used = new Set(build.ctx.input.config.start.lists.map((l) => keyOf(l)));
  const lists: StartList[] = [];
  for (const c of build.ctx.input.config.start.carousel ?? []) {
    const level = carouselLevel(build, c.indicatorId);
    const list = buildList(build, c.indicatorId, level, c.dir, level === 'gmi' ? minPopulation : 0);
    if (!list || list.top.length === 0 || used.has(keyOf(list))) continue;
    used.add(keyOf(list));
    lists.push(list);
  }
  return { generatedAt, lists };
}

/** Kody TERYT gmin poniżej `minPopulation` mieszkańców (ostatni znany rok) – do pomijania w zestawieniach liczonych w przeglądarce. */
export function smallGminas(build: FactsBuild, minPopulation: number): string[] {
  const pop = build.ctx.input.values.population?.values ?? {};
  return build.ctx.byLevel.gmi
    .filter((u) => {
      const s = pop[u.teryt] ?? [];
      for (let i = s.length - 1; i >= 0; i--) if (s[i] != null) return (s[i] as number) < minPopulation;
      return true;
    })
    .map((u) => u.teryt)
    .sort();
}

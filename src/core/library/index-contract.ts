import { z } from 'zod';
import type { LibraryCategory, LibraryIndex as QueryIndex, LibraryVariable } from './query';

// Kontrakt spisu biblioteki (library/index.json) zapisywanego przez robota
// (`scripts/data/library-index.mjs`). Wyszukiwarka (`query.ts`) czyta inny, wygodniejszy
// kształt – ten plik jest jedynym miejscem, które zamienia jeden w drugi.
export const LibraryIndexSchema = z.object({
  version: z.literal(1),
  categories: z.record(z.string(), z.object({ n: z.string(), p: z.string().nullable() })),
  units: z.array(z.string()),
  variables: z.array(
    z.object({
      id: z.union([z.number(), z.string()]),
      s: z.string().nullable().optional(),
      n: z.string(),
      l: z.union([z.literal(5), z.literal(6)]),
      u: z.number().int().nonnegative(),
      has: z.union([z.literal(0), z.literal(1)]),
    }),
  ),
});

export type RobotLibraryIndex = z.infer<typeof LibraryIndexSchema>;

/** Sprawdza plik robota; zły kształt → `null` (strona pokazuje „biblioteka niedostępna”). */
export function parseLibraryIndex(data: unknown): RobotLibraryIndex | null {
  const parsed = LibraryIndexSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

/** Tytuł zmiennej: „Dział: wymiary”; bez działu albo bez wymiarów – to, co jest. */
export function titleOf(categoryName: string | undefined, dimensions: string): string {
  const parts = [categoryName?.trim() ?? '', dimensions.trim()].filter((part) => part.length > 0);
  return parts.length === 2 ? `${parts[0]}: ${parts[1]}` : (parts[0] ?? '');
}

/** Zamienia spis robota na kształt czytany przez `filterVars`, `categoryPath` i `countByCategory`. */
export function prepare(index: RobotLibraryIndex): QueryIndex {
  const categories: Record<string, LibraryCategory> = {};
  for (const [id, category] of Object.entries(index.categories)) {
    categories[id] = { id, name: category.n, parent: category.p };
  }
  // W spisie robota `n` to tylko wymiary („kobiety – ogółem”); nazwa wskaźnika to nazwa działu.
  // Tytuł na liście i tekst, po którym szukamy, to „Dział: wymiary”.
  const variables: LibraryVariable[] = index.variables.map((item) => ({
    id: item.id,
    name: titleOf(item.s ? index.categories[item.s]?.n : undefined, item.n),
    cat: item.s ?? null,
    level: item.l,
    unit: index.units[item.u] ?? '',
    has: item.has,
  }));
  return { categories, variables };
}

/** Skrót: surowy plik → gotowy do wyszukiwania spis albo `null`. */
export function prepareLibraryIndex(data: unknown): QueryIndex | null {
  const parsed = parseLibraryIndex(data);
  return parsed ? prepare(parsed) : null;
}

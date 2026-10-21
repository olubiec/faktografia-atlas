import { z } from 'zod';

export const EXPLANATIONS_URL = '/data/explanations.json';

const httpsUrlSchema = z.string().refine(
  (val) => {
    try {
      const url = new URL(val);
      return url.protocol === 'https:';
    } catch {
      return false;
    }
  },
  { message: 'URL must start with https://' }
);

export const WorldExplanationSchema = z
  .object({
    text: z.string().min(1).max(240),
    source: z.string().min(1),
    url: httpsUrlSchema,
    year: z.number().int(),
  })
  .nullable();

export const FunFactExplanationSchema = z
  .object({
    text: z.string().min(1).max(200),
    source: z.string().min(1),
    url: httpsUrlSchema,
  })
  .nullable();

export const ExplanationSchema = z.object({
  indicatorId: z.string().min(1),
  short: z.string().min(1).max(160),
  howToRead: z.string().min(1).max(240),
  world: WorldExplanationSchema,
  funFact: FunFactExplanationSchema,
  definitionUrl: httpsUrlSchema,
});

export type Explanation = z.infer<typeof ExplanationSchema>;

export const ExplanationsFileSchema = z.object({
  version: z.literal(1),
  items: z.array(z.unknown()),
});

let cachedExplanationsMap: Map<string, Explanation> | null = null;
let loadingPromise: Promise<Map<string, Explanation>> | null = null;

/**
 * Leniwie pobiera plik objaśnień /data/explanations.json i waliduje wpisy schematem Zod.
 * Wyniki są kesżowane. Błędy sieci, 404 lub błędny format zwracają pustą mapę bez wyjątku i bez błędów w konsoli.
 */
export function loadExplanations(
  fetchImpl: typeof fetch = (...args) => fetch(...args),
  url: string = EXPLANATIONS_URL
): Promise<Map<string, Explanation>> {
  if (cachedExplanationsMap) {
    return Promise.resolve(cachedExplanationsMap);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = fetchImpl(url)
    .then((res) => {
      if (!res.ok) {
        cachedExplanationsMap = new Map();
        return cachedExplanationsMap;
      }
      return res.json() as Promise<unknown>;
    })
    .then((data) => {
      const fileResult = ExplanationsFileSchema.safeParse(data);
      const map = new Map<string, Explanation>();

      if (fileResult.success) {
        for (const item of fileResult.data.items) {
          const itemResult = ExplanationSchema.safeParse(item);
          if (itemResult.success) {
            map.set(itemResult.data.indicatorId, itemResult.data);
          }
        }
      }

      cachedExplanationsMap = map;
      return map;
    })
    .catch(() => {
      cachedExplanationsMap = new Map();
      return cachedExplanationsMap;
    })
    .finally(() => {
      loadingPromise = null;
    });

  return loadingPromise;
}

/**
 * Czyszczenie pamięci podręcznej objaśnień na potrzeby testów.
 */
export function resetExplanationsCache(): void {
  cachedExplanationsMap = null;
  loadingPromise = null;
}

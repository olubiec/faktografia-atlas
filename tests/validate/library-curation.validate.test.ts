// Nocny raport: ile wskaźników biblioteki GUS przechodzi filtr „popularnych” (curation.ts)
// i które to są – nowe dane z importu, które się prześlizgnęły, widać od razu w podsumowaniu.
//   LIBRARY_DIR=lib-wt/library pnpm vitest run tests/validate
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildCatalogTree, flattenTree } from '../../src/core/catalog/tree';
import { popularOnly } from '../../src/core/catalog/curation';

const dir = process.env.LIBRARY_DIR;
const run = dir && existsSync(path.join(dir, 'available.json')) ? describe : describe.skip;
/** Górna granica: więcej oznacza, że import wpuścił serię niszowych danych. */
const MAX_POPULAR = 120;

run('biblioteka GUS – wybór popularnych danych', () => {
  it('w menu zostaje rozsądna liczba prostych wskaźników', () => {
    const available = JSON.parse(readFileSync(path.join(dir as string, 'available.json'), 'utf8'));
    const entries = flattenTree(buildCatalogTree([], popularOnly(available)));
    const lines = [
      '### Popularne dane w menu',
      `Wszystkich w spisie: ${available.variables.length} · w menu: ${entries.length}`,
      '',
      ...entries.map((e) => `- ${e.id} ${e.section} › ${e.name}`),
    ];
    console.log(lines.join('\n'));
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.length).toBeLessThanOrEqual(MAX_POPULAR);
  });
});

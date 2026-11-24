// Kontrola czytelności nazw wskaźników biblioteki GUS (nocny robot po imporcie, obok kontroli wartości):
//   LIBRARY_DIR=lib-wt/library pnpm vitest run tests/validate
// Bez LIBRARY_DIR pomijana (dane biblioteki są na gałęzi data/library). VALIDATE_STRICT=1 → błąd przy uwagach.
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildCatalogTree, flattenTree } from '../../src/core/catalog/tree';
import { checkNames } from '../../src/core/validate/names';

const dir = process.env.LIBRARY_DIR;
const run = dir && existsSync(path.join(dir, 'available.json')) ? describe : describe.skip;

run('biblioteka GUS – czytelność nazw', () => {
  it('nazwy w drzewie wyboru przechodzą reguły', () => {
    const available = JSON.parse(readFileSync(path.join(dir as string, 'available.json'), 'utf8'));
    const findings = checkNames(flattenTree(buildCatalogTree([], available)));
    const byRule = new Map<string, number>();
    for (const f of findings) byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1);
    const lines = ['### Czytelność nazw wskaźników', `Uwag: ${findings.length}`, '', ...[...byRule].map(([k, n]) => `- ${k}: ${n}`), '', ...findings.slice(0, 20).map((f) => `- ${f.rule}: ${f.name}`)];
    console.log(lines.join('\n'));
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
    expect(process.env.VALIDATE_STRICT === '1' ? findings : []).toEqual([]);
  });
});

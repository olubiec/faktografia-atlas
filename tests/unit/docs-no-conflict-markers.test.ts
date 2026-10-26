import { test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Pilnuje, żeby w dokumentach nie zostały znaczniki konfliktu scalania
// (po PR #339 trafiły do docs/STAN.md, a potem rozwiązanie konfliktu skasowało dwie decyzje).
const root = path.resolve(__dirname, '../..');

function markdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(full);
    return entry.name.endsWith('.md') ? [full] : [];
  });
}

test('dokumenty (docs/**, AGENTS.md, README.md) nie zawierają znaczników konfliktu', () => {
  const files = [
    ...markdownFiles(path.join(root, 'docs')),
    path.join(root, 'AGENTS.md'),
    path.join(root, 'README.md'),
  ].filter((file) => fs.existsSync(file));
  expect(files.length).toBeGreaterThan(5);

  const marker = /^(<{7}|>{7})( |$)/;
  const found: string[] = [];
  for (const file of files) {
    fs.readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (marker.test(line)) found.push(`${path.relative(root, file)}:${index + 1}`);
      });
  }
  expect(found).toEqual([]);
});

test('docs/STAN.md ma sekcję „Decyzje” i nie jest dłuższy niż ok. 100 linii', () => {
  const text = fs.readFileSync(path.join(root, 'docs/STAN.md'), 'utf8');
  expect(text).toMatch(/^## Decyzje/m);
  // Limit z WORKFLOW §4 (do ~100 linii); zapas na jedną dopisaną linię decyzji.
  expect(text.split('\n').length).toBeLessThanOrEqual(110);
});

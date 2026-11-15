import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Pilnuje zakazów z docs/STYL.md: bez wersalików w etykietach i bez cieni.
const FORBIDDEN = /(?<![\w-])uppercase(?![\w-])|(?<![\w:-])(?:[a-z]+:)*shadow(?:-sm|-md|-lg)?(?![\w-])/;

function getTsxFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getTsxFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.tsx')) results.push(full);
  }
  return results;
}

describe('dług stylu: wersaliki i cienie w src/view', () => {
  it('żaden plik .tsx nie używa klasy uppercase ani shadow (poza shadow-none)', () => {
    const violations: string[] = [];
    for (const file of getTsxFiles('src/view')) {
      fs.readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (FORBIDDEN.test(line)) violations.push(`${file}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(violations, `Naruszenia:\n${violations.join('\n')}`).toEqual([]);
  });

  it('wykrywa naruszenia i dopuszcza shadow-none', () => {
    expect(FORBIDDEN.test('class="text-xs uppercase"')).toBe(true);
    expect(FORBIDDEN.test('class="a shadow-sm b"')).toBe(true);
    expect(FORBIDDEN.test('class="a shadow b"')).toBe(true);
    expect(FORBIDDEN.test('class="a shadow-lg"')).toBe(true);
    expect(FORBIDDEN.test('class="a shadow-none"')).toBe(false);
    expect(FORBIDDEN.test('class="normal-case"')).toBe(false);
  });
});

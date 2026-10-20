import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { findHardcodedColors, isAllowedFile } from '../../scripts/ci/color-rules.mjs';

function getAllSrcFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllSrcFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.css'))
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('no hardcoded colors in src/', () => {
  it('nie pozwala na kolory wpisane na sztywno w plikach src/', () => {
    const srcDir = path.resolve(process.cwd(), 'src');
    const files = getAllSrcFiles(srcDir);
    expect(files.length).toBeGreaterThan(0);

    const violations: string[] = [];

    for (const absolutePath of files) {
      const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');
      if (isAllowedFile(relativePath)) {
        continue;
      }

      const content = fs.readFileSync(absolutePath, 'utf-8');
      const results = findHardcodedColors(relativePath, content);

      for (const res of results) {
        violations.push(
          `Kolor wpisany na sztywno: ${relativePath}:${res.line} (${res.match}). Użyj tokenu: klasa Tailwind z @theme, var(--nazwa) albo tokensJson.color.light.<nazwa> + parseCssColor. Zobacz AGENTS.md, sekcja „Zawsze”.`
        );
      }
    }

    expect(violations).toEqual([]);
  });
});

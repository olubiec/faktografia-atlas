import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const FILES = [
  'src/view/layout/SiteFooter.tsx',
  'src/view/pages/About.tsx',
  'src/view/pages/Sources.tsx',
  'src/view/pages/SourcesIndicatorTable.tsx',
  'src/view/pages/Privacy.tsx',
];

/** Usuwa komentarze, żeby sprawdzać tylko kod i widoczne teksty. */
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

describe('C06: brak odwołań do Biblioteki i „Moich wskaźników”', () => {
  for (const f of FILES) {
    it(`${f} ich nie zawiera`, () => {
      const code = strip(readFileSync(f, 'utf8'));
      expect(code).not.toMatch(/bibliotek/i);
      expect(code).not.toMatch(/moje wskaźniki|moich wskaźnik/i);
    });
  }
});

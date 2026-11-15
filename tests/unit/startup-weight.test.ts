import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// Waga startowa (@P3-E): panel strojenia i indeks biblioteki nie obciążają zwykłego wejścia.
const SRC = join(__dirname, '../../src');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(name) ? [p] : [];
  });
}
const files = walk(SRC).map((p) => ({ path: relative(SRC, p), text: readFileSync(p, 'utf8') }));
const staticImport = (text: string, what: string) =>
  new RegExp(`^\\s*import\\b[^;]*?from\\s+['"][^'"]*${what}[^'"]*['"]`, 'm').test(text);

describe('Waga startowa (@P3-E)', () => {
  it('tweakpane nie jest importowany statycznie nigdzie poza samym panelem', () => {
    const offenders = files
      .filter((f) => f.path !== 'view/tune/TunePanel.tsx')
      .filter((f) => staticImport(f.text, 'tweakpane'));
    expect(offenders.map((f) => f.path)).toEqual([]);
  });

  it('panel strojenia ładuje się dynamicznie i tylko przy ?tune', () => {
    const main = files.find((f) => f.path === 'main.tsx')!.text;
    expect(staticImport(main, 'TunePanel')).toBe(false);
    expect(main).toMatch(/has\('tune'\)[\s\S]*import\('\.\/view\/tune\/TunePanel'\)/);
  });

  it('indeks biblioteki (load-library) importują tylko strony /biblioteka*', () => {
    const importers = files
      .filter((f) => staticImport(f.text, 'load-library'))
      .map((f) => f.path)
      .sort();
    expect(importers).toEqual(['view/pages/Library.tsx', 'view/pages/LibraryVariable.tsx']);
  });

  it('strony biblioteki są ładowane leniwie, a Home nie dotyka biblioteki ani index.json', () => {
    const app = files.find((f) => f.path === 'App.tsx')!.text;
    expect(staticImport(app, 'pages/Library')).toBe(false);
    expect(app).toMatch(/lazy\(\(\) => import\('\.\/view\/pages\/Library'\)/);
    const home = files.find((f) => f.path === 'view/Home.tsx')!.text;
    expect(home).not.toMatch(/library|index\.json/i);
  });

  it('żądanie index.json wysyła wyłącznie loadLibraryIndex', () => {
    const fetchers = files.filter((f) => /index\.json/.test(f.text)).map((f) => f.path);
    expect(fetchers.every((p) => p === 'core/library/load-library.ts' || !p.startsWith('view/Home'))).toBe(true);
    expect(files.filter((f) => /libraryBase\(\)/.test(f.text) && !f.path.startsWith('core/library/')).map((f) => f.path)).toEqual([]);
  });
});

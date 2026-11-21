import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel: string) => fs.existsSync(path.join(root, rel));

// B14: stare nazwy plików, które po przebudowie nie mają użytkownika.
const forbidden = [
  'src/view/map/IntroOverlay.tsx',
  'src/view/test/proto',
  'src/view/test/PrototypePage.tsx',
  'src/core/catalog/prototype-tree.ts',
  'tests/unit/u04-prototype-tree.test.ts',
  'src/view/ranking/RankingsList.tsx',
  'src/core/ranking/rankings-filter.ts',
];

describe('B14: martwy kod usunięty', () => {
  it.each(forbidden)('%s nie istnieje', (rel) => {
    expect(exists(rel)).toBe(false);
  });

  it('package.json nie zawiera @observablehq/plot', () => {
    const pkg = JSON.parse(read('package.json'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(deps).not.toHaveProperty('@observablehq/plot');
  });

  it('kod i testy nie wspominają Observable Plot', () => {
    const walk = (dir: string): string[] =>
      fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => {
        const rel = path.join(dir, e.name);
        return e.isDirectory() ? walk(rel) : [rel];
      });
    const self = 'tests/unit/b14-no-dead-code.test.ts';
    const hits = ['src', 'tests', 'scripts']
      .flatMap(walk)
      .filter((f) => /\.(tsx?|mjs|js)$/.test(f) && f !== self)
      .filter((f) => read(f).includes('observablehq'));
    expect(hits).toEqual([]);
  });

  it('App.tsx nie ma tras prototypów ani strony Biblioteki', () => {
    const app = read('src/App.tsx');
    expect(app).not.toContain('/__test/proto');
    expect(app).not.toContain('PrototypePage');
    // `/biblioteka*` zostaje wyłącznie jako przekierowanie starych linków (R2), nie jako strona.
    const libraryRoutes = [...app.matchAll(/<Route path="(\/biblioteka[^"]*)" element=\{<(\w+) \/>\}/g)];
    expect(libraryRoutes.length).toBeGreaterThan(0);
    expect(libraryRoutes.every((m) => m[2] === 'LibraryRedirect')).toBe(true);
  });

  it('trasy w App.tsx to tylko dozwolony zestaw', () => {
    const app = read('src/App.tsx');
    const paths = [...app.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]);
    expect(paths.sort()).toEqual(
      [
        '/', '/mapa', '/rankingi', '/porownaj', '/o-projekcie', '/zrodla', '/prywatnosc',
        '/biblioteka', '/biblioteka/:id',
        '/design', '/__test/ui', '/__test/annotation', '/__test/interactive', '*',
      ].sort(),
    );
  });

  it('Home.tsx nie używa wstępu IntroOverlay', () => {
    expect(read('src/view/Home.tsx')).not.toContain('IntroOverlay');
  });
});

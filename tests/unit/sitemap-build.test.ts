import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { readPublicRoutes, unitUrls, buildSitemap, DOMAIN, INCLUDE_UNITS } from '../../scripts/seo/sitemap.mjs';

// Pilnuje, że public/sitemap.xml jest dokładnie wynikiem generatora.
const root = path.resolve(__dirname, '../..');
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const onDisk = fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8');

const units = [
  { teryt: '0201011', level: 'gmi' },
  { teryt: '12', level: 'woj' },
  { teryt: '0201', level: 'pow' },
  { teryt: '02', level: 'woj' },
];

describe('sitemap generator', () => {
  test('plik na dysku jest wynikiem generatora', () => {
    const expected = buildSitemap({ domain: DOMAIN, routes: readPublicRoutes(app) });
    expect(onDisk, 'uruchom node scripts/seo/sitemap.mjs').toBe(expected);
  });

  test('readPublicRoutes pomija trasy nie-publiczne i zachowuje kolejność', () => {
    const src = `<Route path="/" /><Route path="/a" /><Route path="/biblioteka/:id" />
      <Route path="/__test/ui" /><Route path="/design" /><Route path="/b" /><Route path="*" />`;
    expect(readPublicRoutes(src)).toEqual(['/', '/a', '/b']);
  });

  test('unitUrls filtruje poziomy, zachowuje zero i sortuje', () => {
    expect(unitUrls(units, { levels: ['woj', 'pow'] })).toEqual(['/?u=02', '/?u=0201', '/?u=12']);
  });

  test('buildSitemap dodaje jednostki i escapuje &', () => {
    const xml = buildSitemap({ domain: DOMAIN, routes: ['/'], unitPaths: ['/?u=0201', '/?a=1&b=2'] });
    expect(xml).toContain('<loc>https://faktografia.eu/?u=0201</loc>');
    expect(xml).toContain('<loc>https://faktografia.eu/?a=1&amp;b=2</loc>');
    expect(xml.replace(/&amp;/g, '')).not.toContain('&');
  });

  test('wynik jest deterministyczny, bez duplikatów, kończy się </urlset>', () => {
    const args = { domain: DOMAIN, routes: ['/', '/a', '/a'], unitPaths: ['/?u=02', '/?u=02'] };
    const xml = buildSitemap(args);
    expect(buildSitemap(args)).toBe(xml);
    const locs = xml.match(/<loc>[^<]+<\/loc>/g) ?? [];
    expect(new Set(locs).size).toBe(locs.length);
    expect(xml.endsWith('</urlset>\n')).toBe(true);
  });

  test('jednostki są wyłączone (D-SEO-1)', () => {
    expect(INCLUDE_UNITS).toBe(false);
    expect(onDisk).not.toContain('?u=');
  });
});

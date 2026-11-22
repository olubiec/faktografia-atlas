import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (p: string) => readFileSync(p, 'utf8');
const SITE = 'https://faktografia.eu';

describe('W25-S01: robots.txt, sitemap.xml, index.html', () => {
  it('robots.txt wskazuje mapę strony i nie blokuje całości ani /data', () => {
    const robots = read('public/robots.txt');
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
    expect(robots).not.toMatch(/^Disallow:\s*\/\s*$/m);
    expect(robots).not.toMatch(/Disallow:\s*\/(data|geo)/);
    expect(robots).toContain('Disallow: /__test/');
  });

  it('index.html ma język, opis 70–160 znaków, og:locale, h1 i linki w #root', () => {
    const html = read('index.html');
    expect(html).toMatch(/<html lang="pl"/);
    const desc = /<meta name="description" content="([^"]+)"/.exec(html)![1]!;
    expect(desc.length).toBeGreaterThanOrEqual(70);
    expect(desc.length).toBeLessThanOrEqual(160);
    expect(html).toContain('property="og:locale" content="pl_PL"');
    const root = /<div id="root">([\s\S]*?)<\/div>\s*<script/.exec(html)![1]!;
    expect(root).toContain('<h1>');
    expect(root.match(/<a href=/g)!.length).toBeGreaterThanOrEqual(3);
  });
});

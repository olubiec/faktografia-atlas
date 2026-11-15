import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Przejścia stron także z linków w stopce, na 404 i w nocie o danych (@N-08).
const root = join(__dirname, '../..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

/** Zlicza <Link> oraz te z propem viewTransition. */
function countLinks(src: string) {
  const all = src.match(/<Link\b/g) ?? [];
  const withProp = src.match(/<Link\b[^>]*?\bviewTransition\b/g) ?? [];
  return { all: all.length, withProp: withProp.length };
}

const FILES = [
  'src/view/layout/SiteFooter.tsx',
  'src/view/NotFound.tsx',
  'src/view/pages/DataDisclaimer.tsx',
];

describe('viewTransition w linkach (@N-08)', () => {
  for (const f of FILES) {
    it(`każdy <Link> w ${f} ma viewTransition`, () => {
      const { all, withProp } = countLinks(read(f));
      expect(all).toBeGreaterThan(0);
      expect(withProp).toBe(all);
    });
  }

  it('przypadek kontrolny: Link bez propu jest wykrywany', () => {
    const { all, withProp } = countLinks(
      '<Link to="/a" viewTransition>a</Link><Link to="/b">b</Link>',
    );
    expect(all).toBe(2);
    expect(withProp).not.toBe(all);
  });
});

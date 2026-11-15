import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Przejścia między stronami (@P4-A): fade z tokenów, wyłączony przy reduced-motion.
const root = join(__dirname, '../..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const css = read('src/styles/view-transitions.css');

describe('View Transitions (@P4-A)', () => {
  it('css nie zawiera wartości ms ani hex wpisanych na sztywno', () => {
    expect(css).not.toMatch(/\b\d+(\.\d+)?m?s\b/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('css używa tokenu czasu i obejmuje ::view-transition-old/new', () => {
    expect(css).toContain('var(--motion-base)');
    expect(css).toContain('::view-transition-old(root)');
    expect(css).toContain('::view-transition-new(root)');
  });

  it('css ma blok prefers-reduced-motion z animation: none', () => {
    const m = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*\}/);
    expect(m).not.toBeNull();
    expect(m![0]).toMatch(/animation:\s*none/);
  });

  it('plik jest importowany w głównym css', () => {
    expect(read('src/styles/global.css')).toMatch(/@import\s+["']\.\/view-transitions\.css["']/);
  });

  it('każdy <Link> w nagłówku i menu ma viewTransition', () => {
    const header = read('src/view/Header.tsx');
    const links = header.match(/<Link\b/g) ?? [];
    const withProp = header.match(/<Link\b[^>]*?\bviewTransition\b/g) ?? [];
    expect(links.length).toBeGreaterThan(0);
    expect(withProp.length).toBe(links.length);
  });
});

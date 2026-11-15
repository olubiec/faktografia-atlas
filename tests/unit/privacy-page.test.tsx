import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Privacy } from '../../src/view/pages/Privacy';
import { CONSENT_KEY } from '../../src/core/consent/consent';
import { POSTHOG_CONFIG } from '../../src/core/consent/analytics';

function render(): string {
  return renderToString(
    <MemoryRouter>
      <Privacy />
    </MemoryRouter>,
  );
}

const SECTIONS = [
  'Administrator i kontakt',
  'Jakie dane przetwarzamy',
  'Cel i podstawa prawna',
  'Okres przechowywania',
  'Odbiorcy danych',
  'Twoje prawa',
  'Zewnętrzne linki',
  'Zmiany polityki',
];

describe('Polityka prywatności (RODO)', () => {
  it('ma 8 nagłówków h2 w ustalonej kolejności', () => {
    const html = render();
    const article = html.slice(html.indexOf('<article'), html.indexOf('</article>'));
    const h2 = [...article.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1]);
    expect(h2).toHaveLength(8);
    SECTIONS.forEach((title, i) => expect(h2[i]).toContain(title));
  });

  it('zawiera e-mail kontaktowy, UODO, PostHog i Vercel', () => {
    const html = render();
    expect(html).toContain('mateuszolubiec05@gmail.com');
    expect(html).toContain('UODO');
    expect(html).toContain('PostHog');
    expect(html).toContain('Vercel');
  });

  it('podaje podstawy prawne z art. 6 ust. 1 lit. a i f RODO', () => {
    const text = render().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    expect(text).toMatch(/art\. 6 ust\. 1 lit\. a/);
    expect(text).toMatch(/lit\. f/);
  });

  it('klucze zapisu w treści = klucze używane w kodzie', () => {
    const html = render();
    const header = readFileSync('src/view/Header.tsx', 'utf8');
    const themeKeys = [...header.matchAll(/localStorage\.setItem\('([^']+)'/g)].map((m) => m[1]);
    const used = new Set([CONSENT_KEY, ...themeKeys]);
    expect(used.size).toBe(2);

    const listed = [...html.matchAll(/<code[^>]*>([^<]+)<\/code>/g)].map((m) => m[1]);
    expect(new Set(listed)).toEqual(used);
  });

  it('opisuje brak kluczy ph_* zgodnie z persistence: memory', () => {
    expect(POSTHOG_CONFIG.persistence).toBe('memory');
    const text = render().replace(/<[^>]+>/g, ' ');
    expect(text).toContain('ph_');
    expect(text).toContain('eu.i.posthog.com');
  });

  it('zachowuje przycisk Cofnij zgodę', () => {
    expect(render()).toContain('Cofnij zgodę');
  });
});

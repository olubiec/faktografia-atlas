import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { SiteFooter } from '../../src/view/layout/SiteFooter';

const html = renderToString(
  <MemoryRouter>
    <SiteFooter />
  </MemoryRouter>,
);
const hrefs = [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);

describe('C06: stopka na LinkList', () => {
  // S09 (D9, zgoda właściciela): 7. link „Miejsca” → /miejsca.
  it('ma dokładnie 11 linków: 7 podstawowych + X, Instagram, TikTok, e-mail', () => {
    expect(hrefs).toEqual([
      '/mapa',
      '/miejsca',
      '/o-projekcie',
      '/zrodla',
      '/prywatnosc',
      'https://github.com/olubiec/faktografia-atlas',
      'https://creativecommons.org/licenses/by/4.0/deed.pl',
      'https://x.com/faktografia_eu',
      'https://www.instagram.com/faktografia.eu',
      'https://www.tiktok.com/@faktografia.eu',
      'mailto:kontakt@faktografia.eu',
    ]);
  });
  it('nie ma linków do Biblioteki, rankingów, porównania ani map wskaźników', () => {
    for (const bad of ['/biblioteka', '/rankingi', '/porownaj', '/mapa?i=']) {
      expect(html).not.toContain(`href="${bad}`);
    }
    expect(html).not.toContain('Biblioteka');
    expect(html).not.toContain('Działy tematyczne');
  });
  it('linki mają pole dotykowe min. 44 px i nie mają cieni ani kolorów na sztywno', () => {
    const links = html.match(/<a [^>]+>/g) ?? [];
    expect(links.length).toBe(11);
    for (const l of links) {
      expect(l).toContain('min-h-[44px]');
      expect(l).not.toContain('shadow-');
    }
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });
  it('zachowuje landmark contentinfo, nawigację z etykietą i logo z alt', () => {
    expect(html).toContain('role="contentinfo"');
    expect(html).toContain('aria-label="Stopka"');
    expect(html).toContain('alt="Faktografia"');
  });
});

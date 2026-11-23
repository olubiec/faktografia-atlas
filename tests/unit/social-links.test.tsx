import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { SiteFooter } from '../../src/view/layout/SiteFooter';
import { organizationLd } from '../../src/core/seo/json-ld';

const html = renderToString(
  <MemoryRouter>
    <SiteFooter />
  </MemoryRouter>,
);
const nav = html.match(/<nav aria-label="Faktografia w sieci"[\s\S]*?<\/nav>/)?.[0] ?? '';
const anchors = nav.match(/<a [^>]+>/g) ?? [];

describe('Stopka: ikony profili Faktografii', () => {
  it('prowadzą do X, Instagrama, TikToka i na adres kontakt@faktografia.eu', () => {
    const hrefs = anchors.map((a) => a.match(/href="([^"]+)"/)?.[1]);
    expect(hrefs).toEqual([
      'https://x.com/faktografia_eu',
      'https://www.instagram.com/faktografia.eu',
      'https://www.tiktok.com/@faktografia.eu',
      'mailto:kontakt@faktografia.eu',
    ]);
  });

  it('każda ikona ma nazwę dla czytnika ekranu i pole dotykowe 44 × 44 px', () => {
    expect(anchors).toHaveLength(4);
    for (const a of anchors) {
      expect(a).toMatch(/aria-label="[^"]+"/);
      expect(a).toContain('min-h-[44px]');
      expect(a).toContain('min-w-[44px]');
      expect(a).not.toContain('shadow-');
    }
    expect(nav).toContain('<svg');
  });

  it('profile otwierają się w nowej karcie bezpiecznie, e-mail w programie pocztowym', () => {
    const external = anchors.filter((a) => a.includes('href="https://'));
    expect(external).toHaveLength(3);
    for (const a of external) {
      expect(a).toContain('target="_blank"');
      expect(a).toContain('noopener');
    }
    const mail = anchors.find((a) => a.includes('mailto:'));
    expect(mail).not.toContain('target=');
  });

  it('dane strukturalne organizacji podają profile (sameAs) i e-mail', () => {
    const o = organizationLd() as Record<string, unknown>;
    expect(o.sameAs).toEqual([
      'https://x.com/faktografia_eu',
      'https://www.instagram.com/faktografia.eu',
      'https://www.tiktok.com/@faktografia.eu',
    ]);
    expect(o.email).toBe('kontakt@faktografia.eu');
  });
});

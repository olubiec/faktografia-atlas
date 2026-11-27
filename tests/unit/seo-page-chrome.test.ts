import { describe, expect, it } from 'vitest';
import { CHROME_PATHS } from '../../src/core/seo/audit';
import { HEADER, footer } from '../../src/core/seo/page-chrome';

// Statyczne strony mają nagłówek i stopkę jak aplikacja (bez JavaScriptu).
const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!);

describe('ramka stron statycznych', () => {
  it('nagłówek ma logo i menu główne Start, Mapa, Miejsca, Zestawienia', () => {
    expect(HEADER).toContain('aria-label="Menu główne"');
    expect(HEADER).toContain('/brand/faktografia-logo-granat.svg');
    for (const p of ['/', '/mapa', '/miejsca', '/zestawienia']) expect(hrefs(HEADER)).toContain(p);
  });

  it('stopka ma opis, 7 linków „Strony”, źródło i datę danych (z escapowaniem)', () => {
    const html = footer('2026-11-<27>');
    expect(html).toContain('role="contentinfo"');
    expect(hrefs(html).filter((h) => !h.startsWith('/brand'))).toHaveLength(7);
    expect(html).toContain('Źródło: GUS, Bank Danych Lokalnych, CC BY 4.0 · dane z 2026-11-&lt;27&gt;');
  });

  it('wszystkie wewnętrzne linki ramki są znane audytowi (brak martwych linków)', () => {
    const internal = [...hrefs(HEADER), ...hrefs(footer('x'))].filter((h) => h.startsWith('/') && !h.startsWith('/brand'));
    for (const h of internal) expect(CHROME_PATHS).toContain(h);
  });
});

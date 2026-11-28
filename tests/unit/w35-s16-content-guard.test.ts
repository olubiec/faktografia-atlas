import { describe, expect, it } from 'vitest';
import indicators from '../../config/indicators.json';
import profileData from '../fixtures/seo/profile-12.json';
import unitsData from '../fixtures/seo/units.json';
import { ALLOWED_HOSTS, guardHtml, guardLive, samplePages, type GuardCode } from '../../src/core/seo/content-guard';
import { renderUnitPage } from '../../src/core/seo/page-template';
import { buildUnitPaths, type SlugUnit } from '../../src/core/seo/slug';
import { buildUnitPage, type PageProfile } from '../../src/core/seo/unit-page';

const profile = profileData as unknown as PageProfile;
const units = unitsData as SlugUnit[];
const paths = buildUnitPaths(units);
const ctx = { units, paths, indicators };

/** Strony miejsc z fixtury, wyrenderowane tak jak w buildzie. */
function fixturePages(): string[] {
  const out: string[] = [];
  for (const teryt of paths.terytByPath.values()) {
    if (!profile.units[teryt]) continue;
    const unit = units.find((u) => u.teryt === teryt)!;
    const page = buildUnitPage(unit, profile, ctx);
    out.push(renderUnitPage({ ...page, level: unit.level, centroid: unit.centroid ?? null }, { css: ['/a.css'] }));
  }
  return out;
}

const wrap = (body: string, head = '') => `<!doctype html><html><head><title>t</title>${head}</head><body><p>Treść.</p>${body}</body></html>`;
const codes = (html: string, indexable = false) => guardHtml(html, { indexable }).map((p) => p.code);

describe('strażnik treści – strony z fixtury', () => {
  it('czysta strona miejsca nie daje problemów (także jako indeksowana)', () => {
    const pages = fixturePages();
    expect(pages.length).toBeGreaterThan(0);
    for (const html of pages) {
      const indexable = !/noindex/i.test(html);
      expect(guardHtml(html, { indexable })).toEqual([]);
    }
  });

  it('lista allowedHosts zawiera wszystkie hosty linków wychodzących ze stron z fixtur', () => {
    const hosts = new Set<string>();
    for (const html of fixturePages()) {
      for (const m of html.matchAll(/<a\b[^>]*\shref="(https?:\/\/[^"]+)"/g)) hosts.add(new URL(m[1]!).hostname);
    }
    expect(hosts.size).toBeGreaterThan(0);
    for (const host of hosts) expect(ALLOWED_HOSTS).toContain(host);
  });
});

describe('strażnik treści – każdy kod osobno', () => {
  const cases: [GuardCode, string, boolean?][] = [
    ['external-script', wrap('<script src="https://evil.example/x.js"></script>')],
    ['iframe', wrap('<iframe src="https://faktografia.eu/x"></iframe>')],
    ['meta-refresh', wrap('', '<meta http-equiv="refresh" content="0;url=https://faktografia.eu/">')],
    ['inline-event-handler', wrap('<button onclick="go()">ok</button>')],
    ['hidden-text', wrap('<div style="display:none"><a href="/x">tani kredyt</a></div>')],
    ['foreign-link', wrap('<a href="https://spam.example/p">link</a>')],
    ['eval-like', wrap('<script>eval(atob("YWxlcnQoMSk="))</script>')],
    ['noindex-on-indexable', wrap('', '<meta name="robots" content="noindex,follow">'), true],
  ];

  it.each(cases)('%s wywołuje tylko siebie', (code, html, indexable) => {
    const found = new Set(codes(html, indexable));
    expect([...found]).toEqual([code]);
  });

  it('noindex na stronie spoza mapy jest dozwolony', () => {
    expect(codes(wrap('', '<meta name="robots" content="noindex,follow">'), false)).toEqual([]);
  });

  it('noindex w nagłówku X-Robots-Tag też jest wykrywany', () => {
    expect(guardHtml(wrap(''), { indexable: true, robotsHeader: 'noindex' }).map((p) => p.code)).toEqual(['noindex-on-indexable']);
  });

  it('skrypty własne, JSON-LD i linki do dozwolonych hostów przechodzą', () => {
    const html = wrap(
      '<script src="/theme-init.js"></script><script type="application/ld+json">{"a":"eval("}</script><a href="https://stat.gov.pl/x">GUS</a><a href="/miejsca">m</a>',
    );
    expect(codes(html)).toEqual([]);
  });

  it('ukryty element bez linku i z krótkim tekstem nie jest problemem', () => {
    expect(codes(wrap('<span style="display:none">x</span>'))).toEqual([]);
    expect(codes(wrap('<div style="display:none">to jest dłuższy ukryty tekst reklamowy</div>'))).toEqual(['hidden-text']);
  });
});

const SITE = 'https://faktografia.eu';
const xml = (tag: string, urls: string[]) => `<${tag}>${urls.map((u) => `<url><loc>${u}</loc></url>`).join('')}</${tag}>`;
const index = `<sitemapindex><sitemap><loc>${SITE}/sitemap-a.xml</loc></sitemap><sitemap><loc>${SITE}/sitemap-rankingi.xml</loc></sitemap></sitemapindex>`;

function mockFetch(routes: Record<string, { status?: number; body?: string }>, calls: string[] = []): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    const r = routes[url];
    if (!r) throw new TypeError('fetch failed');
    return new Response(r.body ?? '', { status: r.status ?? 200 });
  }) as typeof fetch;
}

const okRoutes = {
  [`${SITE}/robots.txt`]: { body: `User-agent: *\nSitemap: ${SITE}/sitemap.xml\n` },
  [`${SITE}/sitemap.xml`]: { body: index },
  [`${SITE}/sitemap-a.xml`]: { body: xml('urlset', [`${SITE}/a`, `${SITE}/b`]) },
  [`${SITE}/sitemap-rankingi.xml`]: { body: xml('urlset', [`${SITE}/ranking/x`]) },
  [`${SITE}/a`]: { body: wrap('') },
  [`${SITE}/b`]: { body: wrap('') },
  [`${SITE}/ranking/x`]: { body: wrap('') },
};

describe('strażnik treści – tryb live (zamockowany fetch)', () => {
  it('czysta produkcja: sprawdza strony z mapy i ranking, zero problemów', async () => {
    const result = await guardLive(SITE, mockFetch(okRoutes));
    expect(result).toEqual({ problems: [], networkError: null, checked: 3 });
  });

  it('404 na robots.txt to problem', async () => {
    const result = await guardLive(SITE, mockFetch({ ...okRoutes, [`${SITE}/robots.txt`]: { status: 404 } }));
    expect(result.problems.map((p) => p.problem.code)).toEqual(['robots-status']);
    expect(result.networkError).toBeNull();
  });

  it('robots.txt bez linii Sitemap to problem', async () => {
    const result = await guardLive(SITE, mockFetch({ ...okRoutes, [`${SITE}/robots.txt`]: { body: 'User-agent: *\n' } }));
    expect(result.problems.map((p) => p.problem.code)).toEqual(['robots-no-sitemap']);
  });

  it('404 na mapie strony to problem i koniec kontroli', async () => {
    const result = await guardLive(SITE, mockFetch({ ...okRoutes, [`${SITE}/sitemap.xml`]: { status: 404 } }));
    expect(result.problems.map((p) => p.problem.code)).toEqual(['sitemap-status']);
  });

  it('wstrzyknięty obcy skrypt na stronie z mapy jest zgłaszany z adresem', async () => {
    const bad = wrap('<script src="https://evil.example/x.js"></script>');
    const result = await guardLive(SITE, mockFetch({ ...okRoutes, [`${SITE}/b`]: { body: bad } }));
    expect(result.problems).toEqual([{ url: `${SITE}/b`, problem: { code: 'external-script', detail: 'https://evil.example/x.js' } }]);
  });

  it('błąd sieci = ostrzeżenie, nie problem', async () => {
    const result = await guardLive(SITE, mockFetch({}));
    expect(result.problems).toEqual([]);
    expect(result.networkError).toBe('fetch failed');
  });

  it('próbka jest deterministyczna i nie przekracza limitu', () => {
    const urls = Array.from({ length: 1000 }, (_, i) => `${SITE}/p${i}`);
    const a = samplePages(urls, 200);
    expect(a).toHaveLength(200);
    expect(samplePages([...urls].reverse(), 200)).toEqual(a);
  });
});

import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router', () => ({
  useNavigate: () => () => undefined,
  useLocation: () => ({ search: '' }),
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => <a href={to} {...rest}>{children}</a>,
}));
vi.mock('../../src/view/map/hooks/useReducedMotion', () => ({ useReducedMotion: () => ({ current: false }) }));
vi.mock('../../src/view/layout/SiteLayout', () => ({ SiteLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('../../src/view/start/StartBackground', () => ({ StartBackground: () => null }));

import indicators from '../../config/indicators.json';
import { datasetLd, organizationLd, serializeLd, websiteLd } from '../../src/core/seo/json-ld';
import { JsonLd } from '../../src/view/layout/JsonLd';
import { StartPage } from '../../src/view/start/StartPage';
import { Sources } from '../../src/view/pages/Sources';

const scripts = (html: string) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
const parseScript = (raw: string) => JSON.parse(raw.replace(/&quot;/g, '"'));

describe('S04 serializeLd', () => {
  it('nie zawiera </script> i daje się sparsować do tego samego obiektu', () => {
    const obj = { n: '</script><b>&</b>', z: 'zażółć' };
    const out = serializeLd(obj);
    expect(out).not.toContain('</script>');
    expect(out).not.toMatch(/[<>&]/);
    expect(JSON.parse(out)).toEqual(obj);
  });

  it('JsonLd renderuje tekst w skrypcie, bez wstawiania HTML', () => {
    const html = renderToString(<JsonLd data={{ n: '</script>' }} />);
    expect(scripts(html)).toHaveLength(1);
    const src = fs.readFileSync(path.resolve(__dirname, '../../src/view/layout/JsonLd.tsx'), 'utf8');
    expect(src).not.toContain('dangerouslySetInnerHTML');
  });
});

describe('S04 datasetLd', () => {
  const ld = datasetLd(indicators, [2010, 1995, 2025, 2003]) as Record<string, any>;

  it('ma nazwę, opis 50–5000 znaków, licencję CC BY 4.0 i twórcę', () => {
    expect(ld['@type']).toBe('Dataset');
    expect(ld.name).toBeTruthy();
    expect(ld.description.length).toBeGreaterThanOrEqual(50);
    expect(ld.description.length).toBeLessThanOrEqual(5000);
    expect(ld.license).toBe('https://creativecommons.org/licenses/by/4.0/');
    expect(ld.creator.name).toContain('Statystyczny');
  });

  it('zasięg: Polska; czas: najstarszy i najnowszy rok', () => {
    expect(ld.spatialCoverage.name).toBe('Polska');
    expect(ld.temporalCoverage).toBe('1995/2025');
  });

  it('variableMeasured to nazwy 20 wskaźników', () => {
    expect(indicators).toHaveLength(20);
    expect(ld.variableMeasured).toEqual(indicators.map((i) => i.name));
  });
});

describe('S04 strony', () => {
  it('organizationLd ma logo, nazwę i adres', () => {
    const o = organizationLd() as Record<string, any>;
    expect(o.logo).toBe('https://faktografia.eu/brand/faktografia-logo-granat.svg');
    expect(o.name).toBe('Faktografia');
    expect(o.address.addressCountry).toBe('PL');
    expect((websiteLd() as Record<string, any>)['@type']).toBe('WebSite');
  });

  it('StartPage ma dokładnie jeden skrypt ld+json z typem WebSite', () => {
    const found = scripts(renderToString(<StartPage />));
    expect(found).toHaveLength(1);
    const data = parseScript(found[0][1]);
    expect([data].flat().map((d: { '@type': string }) => d['@type'])).toContain('WebSite');
  });

  it('Sources ma skrypt ld+json z typem Dataset', () => {
    const found = scripts(renderToString(<Sources />));
    expect(found).toHaveLength(1);
    expect(parseScript(found[0][1])['@type']).toBe('Dataset');
  });
});

import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { StartPage } from '../../src/view/start/StartPage';
import { datasetLd, organizationLd, serializeLd, websiteLd } from '../../src/core/seo/json-ld';
import indicators from '../../config/indicators.json';

describe('W25-S04: dane strukturalne', () => {
  it('serializeLd nie zawiera </script> i daje się sparsować', () => {
    const obj = { n: '</script><b>&</b>' };
    const out = serializeLd(obj);
    expect(out).not.toContain('</script>');
    expect(out).not.toMatch(/[<>&]/);
    expect(JSON.parse(out)).toEqual(obj);
  });

  it('datasetLd ma wymagane pola i 20 wskaźników', () => {
    const d = datasetLd(indicators, [1995, 1996, 2025]) as Record<string, unknown>;
    expect(d['name']).toBeTruthy();
    const desc = d['description'] as string;
    expect(desc.length).toBeGreaterThanOrEqual(50);
    expect(desc.length).toBeLessThanOrEqual(5000);
    expect(d['license']).toBe('https://creativecommons.org/licenses/by/4.0/');
    expect(d['creator']).toBeTruthy();
    expect(JSON.stringify(d['spatialCoverage'])).toContain('Polska');
    expect(d['temporalCoverage']).toBe('1995/2025');
    expect(d['variableMeasured']).toHaveLength(20);
    expect(d['variableMeasured']).toContain(indicators[0]!.name);
  });

  it('WebSite i Organization mają nazwę i adres', () => {
    expect(websiteLd()['@type']).toBe('WebSite');
    expect(organizationLd()['url']).toBe('https://faktografia.eu/');
  });

  it('strona startowa ma dokładnie jeden skrypt ld+json typu WebSite', () => {
    const html = renderToString(
      <MemoryRouter>
        <StartPage />
      </MemoryRouter>,
    );
    const scripts = html.match(/<script type="application\/ld\+json">/g) ?? [];
    expect(scripts).toHaveLength(1);
    expect(html).toContain('&quot;@type&quot;:&quot;WebSite&quot;'.replace(/&quot;/g, '"'));
  });
});

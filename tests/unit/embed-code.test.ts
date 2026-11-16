import { describe, expect, it } from 'vitest';
import { embedSnippet, fullViewHref } from '@/core/embed/embed-code';
import { readEmbedParams } from '@/core/embed/embed-params';
import indicators from '../../config/indicators.json';

const ORIGIN = 'https://atlas.example';
const densityName = indicators.find((x) => x.id === 'density')!.name;

describe('embedSnippet', () => {
  const params = readEmbedParams('?w=map&i=density&l=pow&theme=dark&h=600');
  const html = embedSnippet(params, ORIGIN);

  it('zawiera lazy, title z nazwą wskaźnika i adres /osadz?', () => {
    expect(html).toContain('loading="lazy"');
    expect(html).toContain(`title="Faktografia Atlas – ${densityName}"`);
    expect(html).toContain(`src="${ORIGIN}/osadz?`);
    expect(html).toContain('width="100%"');
    expect(html).toContain('height="600"');
    expect(html).toContain('style="border:0"');
  });

  it('ma stałą kolejność parametrów', () => {
    expect(html).toContain('/osadz?w=map&amp;i=density&amp;l=pow&amp;theme=dark&amp;h=600');
    expect(embedSnippet(params, ORIGIN)).toBe(html);
  });

  it('escapuje znaki specjalne i nie pozwala wstrzyknąć atrybutu', () => {
    const evil = embedSnippet(params, 'https://x.pl"><script>&');
    expect(evil).not.toContain('"><script>');
    expect(evil).toContain('&quot;&gt;&lt;script&gt;&amp;');
    expect(evil.match(/<iframe/g)).toHaveLength(1);
  });
});

describe('fullViewHref', () => {
  it('nie zawiera parametrów osadzania', () => {
    const p = readEmbedParams('?w=trend&i=density&l=pow&y=2022&u=1201000&theme=dark&h=600');
    const href = fullViewHref(p, ORIGIN);
    expect(href).toBe(`${ORIGIN}/?i=density&l=pow&u=1201000&y=2022`);
    expect(href).not.toMatch(/[?&](w|theme|h)=/);
  });
});

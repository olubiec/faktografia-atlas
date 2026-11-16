import { describe, expect, it } from 'vitest';
import { readEmbedParams } from '../../src/core/embed/embed-params';
import { embedSnippet, fullViewHref } from '../../src/core/embed/embed-code';

const origin = 'https://atlas.example';

describe('readEmbedParams – złośliwe i brzegowe', () => {
  it('null/undefined/„?” nie rzucają i dają domyślne', () => {
    for (const s of [undefined, null, '?', '#', '&&&&']) {
      const r = readEmbedParams(s as unknown as string);
      expect(r).toMatchObject({ widget: 'map', theme: 'light', height: 400 });
    }
  });
  it('powtórzone parametry – liczy się pierwszy', () => {
    const r = readEmbedParams('?w=ranking&w=map&theme=dark&theme=light&h=600&h=400');
    expect(r).toMatchObject({ widget: 'ranking', theme: 'dark', height: 600 });
  });
  it('wielkość liter jest rozróżniana (RANKING → map)', () => {
    expect(readEmbedParams('?w=RANKING&theme=DARK&h=0600').widget).toBe('map');
    expect(readEmbedParams('?theme=DARK').theme).toBe('light');
    expect(readEmbedParams('?h=0600').height).toBe(400);
  });
  it('trend bez jednostki spada do mapy', () => {
    expect(readEmbedParams('?w=trend').widget).toBe('map');
  });
  it('hideSource/nologo/source są ignorowane', () => {
    const r = readEmbedParams('?hideSource=1&nologo=1&source=0');
    expect(r).not.toHaveProperty('hideSource');
    expect(JSON.stringify(r)).not.toMatch(/hideSource|nologo/);
  });
  it('złośliwe wartości (HTML, javascript:, null byte, %-encoding) nie trafiają do wyniku', () => {
    const evil = '?w=%3Cscript%3E&theme=%22%3E%3Cimg%20src%3Dx%3E&h=%00&i=%3Cb%3E&l=../../etc&u=%27%3B--&y=NaN';
    const r = readEmbedParams(evil);
    expect(r.widget).toBe('map');
    expect(r.theme).toBe('light');
    expect(r.height).toBe(400);
    // Bez indeksu jednostek `u` przechodzi jako surowy tekst, ale tylko do kodowanego URL-a.
    expect(JSON.stringify({ ...r, state: { ...r.state, u: undefined } })).not.toMatch(/<|script|etc/);
    const snippet = embedSnippet(r, origin);
    expect(snippet).not.toContain("';--");
    expect(snippet.match(/<iframe /g)).toHaveLength(1);
  });
  it('zepsute kodowanie procentowe (%E0%A4%A) nie rzuca', () => {
    expect(() => readEmbedParams('?i=%E0%A4%A&w=%')).not.toThrow();
  });
  it('bardzo długi parametr (1 MB) nie wycieka do wyniku', () => {
    const r = readEmbedParams('?i=' + 'a'.repeat(1_000_000) + '&w=ranking');
    expect(r.widget).toBe('ranking');
    expect(r.state.i?.length ?? 0).toBeLessThan(100);
  });
  it('polskie znaki w parametrach nie psują odczytu', () => {
    const r = readEmbedParams('?u=' + encodeURIComponent('Łódź') + '&w=ranking');
    expect(r.widget).toBe('ranking');
    const snippet = embedSnippet(r, origin);
    expect(snippet).toContain('u=%C5%81%C3%B3d%C5%BA');
  });
});

describe('embedSnippet / fullViewHref – brzegi', () => {
  const params = (over: Partial<ReturnType<typeof readEmbedParams>> = {}) => ({
    ...readEmbedParams('?i=density&l=pow'),
    ...over,
  });
  it('nieznany wskaźnik: tytuł „dane”, brak niezescapowanych cudzysłowów w atrybucie', () => {
    const p = params();
    p.state = { ...p.state, i: '"><script>alert(1)</script>' };
    const s = embedSnippet(p, origin);
    expect(s).not.toContain('<script');
    expect(s.match(/<iframe /g)).toHaveLength(1);
    expect(s).toContain('title="Faktografia Atlas – dane"');
  });
  it('złośliwy origin jest escapowany w atrybucie src', () => {
    const s = embedSnippet(params(), 'https://a.pl/"><script>x</script>');
    expect(s).not.toContain('<script');
    expect(s).not.toMatch(/src="[^"]*"[^ >]*<script/);
  });
  it('pusty stan: brak pustych parametrów w zapytaniu', () => {
    const p = params();
    p.state = { i: undefined, l: undefined, u: undefined, y: undefined } as typeof p.state;
    const s = embedSnippet(p, origin);
    expect(s).not.toMatch(/[?&][a-z]+=(&|")/);
    expect(fullViewHref(p, origin)).toBe(`${origin}/?`);
  });
  it('polskie znaki w jednostce są kodowane procentowo w adresie', () => {
    const p = params();
    p.state = { ...p.state, u: 'Łódź' };
    expect(fullViewHref(p, origin)).toContain('u=%C5%81%C3%B3d%C5%BA');
  });
  it('stała wysokość iframe zgodna z parametrem', () => {
    expect(embedSnippet(params({ height: 600 }), origin)).toContain('height="600"');
  });
});

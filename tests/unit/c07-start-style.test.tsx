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

import { StartPage } from '../../src/view/start/StartPage';

const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const html = renderToString(<StartPage />);
const classes = [...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean);

describe('C07 strona / według STYL.md', () => {
  it('klasy: bez rounded-*, shadow-*, backdrop-blur', () => {
    expect(classes.filter((c) => /^(rounded|shadow|backdrop-blur)/.test(c) && c !== 'rounded-none')).toEqual([]);
  });

  it('klasy: bez sztywnych kolorów i rozmiarów px poza polem dotykowym 44 px i wspólnym przyciskiem (17 px)', () => {
    const bad = classes.filter((c) => /#[0-9a-fA-F]{3,8}|rgb\(|hsl\(|\[\d+(\.\d+)?px\]/.test(c) && !/^(min-h-|h-|size-|text-)?\[(44|17)px\]$/.test(c));
    expect(bad).toEqual([]);
    const src = read('src/view/start/StartPage.tsx');
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(src).not.toMatch(/rounded-none|bg-tusz\/90/);
  });

  it('kolory tylko z tokenów (kalka, arkusz, linia, tusz, olowek, korekta)', () => {
    const colorClasses = classes.filter((c) => /^(bg|text|border|ring|stroke|fill)-/.test(c));
    const allowed = /^(bg|text|border|ring|stroke|fill)-(kalka|arkusz|linia|tusz|olowek|korekta|korekta-tekst|transparent|current)(\/\d+)?$/;
    const sizes = /^text-(xs|sm|md|lg|xl|[2-5]xl|left|right|center)$/;
    const borders = /^border(-[xytblr])?(-\d+)?$/;
    expect(colorClasses.filter((c) => !allowed.test(c) && c !== "text-[17px]" && !sizes.test(c) && !borders.test(c))).toEqual([]);
  });

  it('tytuł: waga 800, tracking −0,02em, bez szeryfów, wersalików i strzałek', () => {
    const h1 = html.match(/<h1 class="([^"]*)"[^>]*>.*?<span class="sr-only">([^<]*)<\/span>/);
    expect(h1?.[1]).toContain('font-extrabold');
    expect(h1?.[1]).toContain('tracking-[-0.02em]');
    expect(h1?.[2]).toBe('Faktografia');
    expect(html).not.toMatch(/font-serif|uppercase|capitalize/);
    expect(html).not.toMatch(/→|›|»|&rarr;/);
  });

  it('jeden przycisk główny „Otwórz mapę” w stylu Button, pole ≥ 44 px, fokus z tokenów', () => {
    const anchors = [...html.matchAll(/<a [^>]*>/g)].map((m) => m[0]);
    const primary = anchors.filter((a) => /data-variant="(primary|default)"/.test(a));
    expect(primary).toHaveLength(1);
    expect(html).toMatch(/data-variant="(primary|default)"[^>]*>Otwórz mapę</);
    expect(primary[0]).toContain('data-size="default"');
    expect(primary[0]).toContain('focus-visible:outline-2');
    expect(primary[0]).toContain('min-h-[44px]');
  });

  it('przykłady w PageSection, bez emoji', () => {
    expect(html).toContain('aria-labelledby="start-examples-title"');
    expect(html).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('logo: strona nie rysuje obrazów spoza /brand/', () => {
    const imgs = [...html.matchAll(/<img[^>]*src="([^"]*)"/g)].map((m) => m[1]);
    expect(imgs.filter((s) => !s.startsWith('/brand/'))).toEqual([]);
  });

  it('StartBackground bez zaokrągleń, cieni i rozmyć', () => {
    expect(read('src/view/start/StartBackground.tsx')).not.toMatch(/rounded-|shadow-|backdrop-blur|blur\(/);
  });
});

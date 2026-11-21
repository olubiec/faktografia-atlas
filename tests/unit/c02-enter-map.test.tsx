import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const navigate = vi.fn<(...a: unknown[]) => void>();
let reduced = false;
let preloaded = true;
vi.mock('../../src/view/start/preloadMap', () => ({ preloadMap: () => undefined, isMapPreloaded: () => preloaded }));
const handlers: Record<string, (e: unknown) => void> = {};
vi.mock('react-router', () => ({
  useNavigate: () => navigate,
  useLocation: () => ({ search: '' }),
  Link: ({ to, onClick, children }: { to: string; onClick?: (e: unknown) => void; children: React.ReactNode }) => {
    if (onClick) handlers[String(children)] = onClick;
    return <a href={to}>{children}</a>;
  },
}));
vi.mock('../../src/view/map/hooks/useReducedMotion', () => ({ useReducedMotion: () => ({ current: reduced }) }));
vi.mock('../../src/view/layout/SiteLayout', () => ({ SiteLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('../../src/view/Home', () => ({ Home: () => null }));
vi.mock('../../src/view/map/AtlasMap', () => ({ AtlasMap: () => null }));
vi.mock('../../src/view/start/StartBackground', () => ({ StartBackground: () => null }));

import { StartPage } from '../../src/view/start/StartPage';

const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

function click(init: Record<string, unknown> = {}) {
  renderToString(<StartPage />);
  const ev = { defaultPrevented: false, button: 0, preventDefault() { this.defaultPrevented = true; }, ...init };
  handlers['Otwórz mapę'](ev);
  return ev;
}

afterEach(() => { navigate.mockClear(); reduced = false; preloaded = true; });

describe('C02 wejście do mapy', () => {
  it('klik przy pobranym kodzie mapy: nawigacja wewnątrz przejścia widoku', async () => {
    const start = vi.fn<(cb: () => Promise<void>) => void>((cb) => { void cb(); });
    vi.stubGlobal('document', { startViewTransition: start, querySelector: () => null });
    vi.stubGlobal('requestAnimationFrame', (f: () => void) => { f(); return 0; });
    const ev = click();
    expect(ev.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(start).toHaveBeenCalledTimes(1));
    expect(navigate).toHaveBeenCalledWith('/mapa');
    vi.unstubAllGlobals();
  });
  it('klik gdy kod mapy jeszcze się pobiera: wejście od razu, bez czekania i bez przejścia', () => {
    preloaded = false;
    const start = vi.fn<(cb: () => Promise<void>) => void>();
    vi.stubGlobal('document', { startViewTransition: start, querySelector: () => null });
    click();
    expect(navigate).toHaveBeenCalledWith('/mapa');
    expect(start).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
  it('bez obsługi przejść widoku: zwykła nawigacja', () => {
    vi.stubGlobal('document', {});
    const ev = click();
    expect(ev.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledWith('/mapa');
    vi.unstubAllGlobals();
  });
  it('z klawiszem modyfikującym: zwykły link, bez navigate', () => {
    const ev = click({ ctrlKey: true });
    expect(ev.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
  it('przy reduced-motion: zwykły link, bez navigate z animacją', () => {
    reduced = true;
    const ev = click();
    expect(ev.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
  it('StartBackground nie ma skali > 1,1 ani propa leaving', () => {
    const src = read('src/view/start/StartBackground.tsx');
    expect(src).not.toMatch(/leaving/);
    const scales = [...src.matchAll(/scale\(([\d.]+)\)/g)].map((m) => Number(m[1]));
    expect(scales.every((n) => n <= 1.1)).toBe(true);
  });
  it('global.css: wspólny element poland-map, bez skali, czas i krzywa z tokenów', () => {
    const css = read('src/styles/global.css');
    const block = css.slice(css.indexOf('start-fade-out'));
    expect(block).toMatch(/view-transition-old\(poland-map\)/);
    expect(block).not.toMatch(/scale\(/);
    expect(block).toMatch(/var\(--motion-slow\) var\(--easing\)/);
    const tokens = JSON.parse(read('config/tokens.json'));
    expect(tokens.motion.cameraIn).toBe(tokens.motion.slow);
  });
  it('preloadMap pobiera Home i AtlasMap, a StartPage nadaje wspólną nazwę przejścia', () => {
    expect(read('src/view/start/preloadMap.ts')).toMatch(/import\('..\/map\/AtlasMap'\)/);
    expect(read('src/view/start/StartPage.tsx')).toMatch(/poland-map/);
  });
});

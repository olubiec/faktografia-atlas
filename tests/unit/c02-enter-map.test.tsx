import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const navigate = vi.fn<(...a: unknown[]) => void>();
const cover = vi.fn<(src: unknown, animate: boolean) => void>();
let reduced = false;
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
vi.mock('../../src/view/start/StartBackground', () => ({ StartBackground: () => null }));
vi.mock('../../src/view/start/preloadMap', () => ({ preloadMap: () => undefined }));
vi.mock('../../src/view/start/mapCover', () => ({ coverForMap: (s: unknown, a: boolean) => cover(s, a) }));

import { StartPage } from '../../src/view/start/StartPage';

const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

function click(init: Record<string, unknown> = {}) {
  renderToString(<StartPage />);
  const ev = { defaultPrevented: false, button: 0, preventDefault() { this.defaultPrevented = true; }, ...init };
  handlers['Otwórz mapę'](ev);
  return ev;
}

afterEach(() => { navigate.mockClear(); cover.mockClear(); reduced = false; vi.unstubAllGlobals(); });

describe('C02 wejście do mapy', () => {
  it('klik: okładka z animacją i od razu nawigacja do /mapa', () => {
    vi.stubGlobal('document', { querySelector: () => null });
    const ev = click();
    expect(ev.defaultPrevented).toBe(true);
    expect(cover).toHaveBeenCalledWith(null, true);
    expect(navigate).toHaveBeenCalledWith('/mapa');
  });
  it('reduced-motion: okładka bez animacji, nawigacja nadal od razu', () => {
    reduced = true;
    vi.stubGlobal('document', { querySelector: () => null });
    click();
    expect(cover).toHaveBeenCalledWith(null, false);
    expect(navigate).toHaveBeenCalledWith('/mapa');
  });
  it('z klawiszem modyfikującym: zwykły link, bez okładki i navigate', () => {
    const ev = click({ ctrlKey: true });
    expect(ev.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(cover).not.toHaveBeenCalled();
  });
  it('okładka: czas i krzywa z tokenów, kopia obrysu w tym samym miejscu, zdejmowana po gotowości mapy', () => {
    const src = read('src/view/start/mapCover.ts');
    expect(src).toMatch(/var\(--motion-slow\) var\(--easing\)/);
    expect(src).toContain('getBoundingClientRect');
    expect(src).toContain('maplibregl-canvas');
    expect(src).toContain('cover.remove()');
    const scales = [...src.matchAll(/scale\(([\d.]+)\)/g)].map((m) => Number(m[1]));
    expect(Math.max(...scales)).toBeLessThanOrEqual(1.1);
  });
  it('StartBackground nie ma skali > 1,1 ani propa leaving; kod mapy ładuje się w tle', () => {
    const src = read('src/view/start/StartBackground.tsx');
    expect(src).not.toMatch(/leaving/);
    expect([...src.matchAll(/scale\(([\d.]+)\)/g)].every((m) => Number(m[1]) <= 1.1)).toBe(true);
    expect(read('src/view/start/preloadMap.ts')).toMatch(/import\('..\/map\/AtlasMap'\)/);
    expect(read('config/tokens.json')).toContain('cameraIn');
  });
});

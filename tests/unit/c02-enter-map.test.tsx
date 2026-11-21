import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const navigate = vi.fn<(...a: unknown[]) => void>();
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

import { StartPage } from '../../src/view/start/StartPage';

const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

function click(init: Record<string, unknown> = {}) {
  renderToString(<StartPage />);
  const ev = { defaultPrevented: false, button: 0, preventDefault() { this.defaultPrevented = true; }, ...init };
  handlers['Otwórz mapę'](ev);
  return ev;
}

afterEach(() => { navigate.mockClear(); reduced = false; });

describe('C02 wejście do mapy', () => {
  it('klik „Otwórz mapę” nawiguje od razu (bez timera) z viewTransition', () => {
    vi.useFakeTimers();
    const ev = click();
    expect(ev.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/mapa', { viewTransition: true });
    vi.useRealTimers();
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
  it('global.css: skala przejścia ≤ 1,06, czas i krzywa z tokenów', () => {
    const css = read('src/styles/global.css');
    const block = css.slice(css.indexOf('start-zoom-out'));
    const scales = [...block.matchAll(/scale\(([\d.]+)\)/g)].map((m) => Number(m[1]));
    expect(scales.length).toBeGreaterThan(0);
    expect(Math.max(...scales)).toBeLessThanOrEqual(1.06);
    expect(block).toMatch(/var\(--motion-slow\) var\(--easing\)/);
    const tokens = JSON.parse(read('config/tokens.json'));
    expect(tokens.motion.cameraIn).toBe(tokens.motion.slow);
  });
});

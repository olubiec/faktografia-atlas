import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

// Wnioski z PageSpeed Insights (28.11.2026): TBT 400 ms i 559 KiB nieużywanego JS na `/` przez zbyt wczesne ładowanie kodu mapy.
describe('Lekki start: kod mapy nie blokuje pierwszych sekund', () => {
  it('kod mapy ładuje się „na zapas” dopiero po kilku sekundach, w wolnej chwili, nie przy oszczędzaniu danych', () => {
    const src = read('src/view/start/StartPage.tsx');
    const ms = Number(/const CODE_PRELOAD_MS = (\d+)/.exec(src)?.[1]);
    expect(ms).toBeGreaterThanOrEqual(5000);
    expect(src).toContain('requestIdleCallback(preloadMap');
    expect(src).toMatch(/if \(isFrugalNetwork\(\)\) return;/);
  });
  it('zamiar użytkownika (dotyk, najechanie, fokus) nadal rozgrzewa mapę od razu', () => {
    const src = read('src/view/start/StartPage.tsx');
    expect(src).toContain('onPointerEnter={warm}');
    expect(src).toContain('onTouchStart={warm}');
    expect(src).toContain('onFocus={warm}');
  });
  it('dane mapy po kodzie, nie wcześniej', () => {
    const src = read('src/view/start/StartPage.tsx');
    const code = Number(/const CODE_PRELOAD_MS = (\d+)/.exec(src)?.[1]);
    const data = Number(/const DATA_PRELOAD_MS = (\d+)/.exec(src)?.[1]);
    expect(data).toBeGreaterThan(code);
  });
});

describe('Logo ma wymiary (brak przesunięć układu)', () => {
  it.each(['src/view/Header.tsx', 'src/view/layout/SiteFooter.tsx', 'src/view/ui/Window.tsx'])('%s', (file) => {
    const imgs = [...read(file).matchAll(/<img[\s\S]*?\/>/g)].map((m) => m[0]);
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) expect(img).toMatch(/width=|\{\.\.\.logoSize\}/);
  });
});

describe('Mapy źródeł w buildzie', () => {
  it('vite.config.ts włącza sourcemap', () => {
    expect(read('vite.config.ts')).toMatch(/sourcemap:\s*true/);
  });
});

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Header } from '../../src/view/Header';

// Portal okna nie renderuje się w renderToString; podmieniamy Window na wersję z treścią w miejscu.
vi.mock('../../src/view/ui/Window', async () => {
  const { Dialog } = await import('../../src/components/ui/dialog');
  return {
    Window: ({ children, trigger }: { children: React.ReactNode; trigger?: React.ReactNode }) => (
      <Dialog>
        {trigger}
        {children}
      </Dialog>
    ),
  };
});

const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const html = (url: string) =>
  renderToString(
    <MemoryRouter initialEntries={[url]}>
      <Header />
    </MemoryRouter>,
  ).replace(/<!-- -->/g, '');

describe('C05 nagłówek: logo (STYL §4)', () => {
  const out = html('/');
  const img = out.match(/<img[^>]*>/)![0];
  it('logo pochodzi z /brand/ i ma alt', () => {
    expect(img).toMatch(/src="\/brand\/faktografia-logo-(granat|jasne)\.svg"/);
    expect(img).toContain('alt="Faktografia"');
    expect(fs.existsSync(path.join(root, 'public', img.match(/src="([^"]+)"/)![1]!))).toBe(true);
  });
  it('wysokość: 40 px (h-10) na telefonie i 48 px (h-12) na komputerze, zgodnie ze STYL §4', () => {
    const cls = img.match(/class="([^"]+)"/)![1]!.split(' ');
    expect(cls).toContain('h-10');
    expect(cls).toContain('md:h-12');
  });
  it('wysokość nagłówka i pole dotykowe logo są z klas skali, bez px', () => {
    expect(out).toMatch(/<header[^>]*class="[^"]*\bh-14\b[^"]*\bmd:h-18\b/);
    expect(out).toContain('min-h-11');
  });
});

describe('C05 nagłówek: linki', () => {
  const menuLinks = (url: string) => {
    const out = html(url);
    const menu = out.slice(out.indexOf('aria-label="Menu główne (telefon)"'));
    return [...menu.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map((m) => [m[2], m[1]]);
  };
  it('menu telefonu ma Start, Mapa, O projekcie, Skąd są dane – każdy raz', () => {
    const links = menuLinks('/');
    expect(links.map((l) => l[0])).toEqual(['Start', 'Mapa', 'O projekcie', 'Skąd są dane']);
    expect(new Set(links.map((l) => l[1])).size).toBe(4);
  });
  it('menu telefonu zawiera wszystkie linki komputera (z parametrami technicznymi)', () => {
    const out = html('/mapa?e2e&u=12');
    const desktop = out.slice(out.indexOf('aria-label="Menu główne"'), out.indexOf('aria-label="Menu główne (telefon)"'));
    const hrefs = [...desktop.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(['/?e2e', '/mapa?e2e']);
    for (const href of hrefs) expect(menuLinks('/mapa?e2e&u=12').map((l) => l[1])).toContain(href);
  });
  it('nawigacja komputera ma Start i Mapę raz (nie powtarza ich logo)', () => {
    const out = html('/');
    const desktop = out.slice(out.indexOf('aria-label="Menu główne"'), out.indexOf('aria-label="Menu główne (telefon)"'));
    expect(desktop.match(/>Start</g)).toHaveLength(1);
    expect(desktop.match(/>Mapa</g)).toHaveLength(1);
  });
  it('„Kopiuj link” jest raz, tylko na /mapa', () => {
    expect(html('/mapa').match(/Kopiuj link/g)).toHaveLength(1);
    expect(html('/')).not.toContain('Kopiuj link');
  });
  it('przycisk menu telefonu jest oknem (Window), ma 44 px i nazwę „Menu”', () => {
    const btn = html('/').match(/<button[^>]*aria-label="Menu"[^>]*>/)![0];
    expect(btn).toContain('aria-haspopup="dialog"');
    expect(btn).toContain('min-h-11');
    expect(btn).toContain('min-w-11');
    const src = read('src/view/Header.tsx');
    expect(src).toContain("from '@/view/ui/Window'");
    expect(src).toContain("from '@/view/ui/LinkList'");
  });
});

describe('C05 zmienione pliki bez wartości na sztywno', () => {
  const FILES = ['src/view/Header.tsx', 'src/view/layout/SiteLayout.tsx', 'src/view/layout/CopyLinkButton.tsx'];
  it.each(FILES)('%s: bez shadow-*, rounded-* (poza none), kolorów # i wymiarów w px', (file) => {
    const src = read(file);
    expect(src).not.toMatch(/shadow-(?!none)|rounded-(?!none)|backdrop-blur/);
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    const px = (src.match(/\[\d+px\]/g) ?? []).filter((v) => v !== '[44px]');
    expect(px).toEqual([]);
  });
});

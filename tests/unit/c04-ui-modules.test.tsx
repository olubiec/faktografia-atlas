import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Window } from '../../src/view/ui/Window';
import { PageSection } from '../../src/view/ui/PageSection';
import { LinkList } from '../../src/view/ui/LinkList';

const html = (node: React.ReactElement) => renderToString(node).replace(/<!-- -->/g, '');

const read = (p: string) => fs.readFileSync(path.join(__dirname, '../..', p), 'utf8');

describe('C04 Window', () => {
  // Portal Radix nie renderuje się w renderToString, więc sprawdzamy źródło i zachowanie Dialogu.
  const src = read('src/view/ui/Window.tsx');
  const dialog = read('src/components/ui/dialog.tsx');

  it('ma trzy odmiany: fullscreen, dialog, bottom (pełny ekran, środek, dół)', () => {
    expect(src).toMatch(/export type WindowMode = 'fullscreen' \| 'dialog' \| 'bottom'/);
    expect(src).toMatch(/fullscreen: '[^']*h-dvh[^']*'/);
    expect(src).toMatch(/bottom: '[^']*bottom-0[^']*'/);
    expect(src).toMatch(/dialog: '[^']*max-h-/);
  });

  it('każda odmiana ma nagłówek z tytułem i opisem oraz przycisk zamknięcia ≥ 44 px (z Dialogu)', () => {
    expect(src).toContain('<DialogTitle>{title}</DialogTitle>');
    expect(src).toContain('<DialogDescription>');
    expect(src).toContain('<DialogContent');
    expect(dialog).toMatch(/aria-label="Zamknij"[\s\S]{0,120}h-11 w-11/);
  });

  it('Esc, trap fokusa i powrót fokusa pochodzą z Dialogu Radix', () => {
    expect(src).toContain("from '@/components/ui/dialog'");
    expect(dialog).toContain('DialogPrimitive.Root');
  });

  it('zamknięte okno nie renderuje treści, element otwierający zostaje', () => {
    const out = html(<Window open={false} onOpenChange={() => {}} title="T" trigger={<button>Otwórz</button>}>x</Window>);
    expect(out).toContain('Otwórz');
    expect(out).not.toContain('role="dialog"');
  });
});

describe('C04 PageSection', () => {
  it('nagłówek h2 bez wersalików, odstęp z klas tokenów, powiązanie z id', () => {
    const out = html(<PageSection title="Sekcja" id="s1"><p>x</p></PageSection>);
    expect(out).toContain('<h2');
    expect(out).toContain('aria-labelledby="s1-title"');
    expect(out).toContain('mt-12 md:mt-16');
    expect(out).not.toMatch(/uppercase/);
  });
  it('w panelu odstęp 16–24 px', () => {
    expect(html(<PageSection title="S" variant="panel">x</PageSection>)).toContain('mt-4 md:mt-6');
  });
});

describe('C04 LinkList', () => {
  const items = [{ to: '/a', label: 'A' }, { to: '/b', label: 'B' }];
  it.each(['footer', 'menu'] as const)('wariant %s: każdy link ma pole ≥ 44 px i fokus z tokenu', (variant) => {
    const out = html(<MemoryRouter><LinkList items={items} variant={variant} /></MemoryRouter>);
    expect(out.match(/min-h-\[44px\]/g)).toHaveLength(2);
    expect(out).toContain('focus-visible:outline-tusz');
  });
  it('aktywny link ma aria-current', () => {
    const out = html(<MemoryRouter><LinkList items={items} activePath="/b" /></MemoryRouter>);
    expect(out.match(/aria-current="page"/g)).toHaveLength(1);
  });
});

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DeckStrip, StripTiles } from '../../src/view/share/DeckStrip';

const focusTargetAfterRemove = DeckStrip.focusTargetAfterRemove;
const pages = [
  { id: 'p1', kind: 'map' as const, label: '1/4', title: 'Mapa' },
  { id: 'p2', kind: 'table' as const, label: '2/4', title: 'Tabela' },
  { id: 'p3', kind: 'ranking' as const, label: '3/4', title: 'Ranking – najwyżej' },
  { id: 'p4', kind: 'versus' as const, label: '4/4', title: 'A vs B' },
];

type El = React.ReactElement<Record<string, unknown>>;
// Zbiera wszystkie elementy drzewa zwróconego przez komponent bez haków.
const collect = (node: React.ReactNode, out: El[] = []): El[] => {
  if (Array.isArray(node)) node.forEach((n) => collect(n, out));
  else if (React.isValidElement(node)) {
    out.push(node as El);
    collect((node.props as { children?: React.ReactNode }).children, out);
  }
  return out;
};

const setup = (over: Partial<Parameters<typeof StripTiles>[0]> = {}) => {
  const fn = {
    onSelect: vi.fn<(id: string) => void>(),
    onRemove: vi.fn<(id: string) => void>(),
    onMove: vi.fn<(id: string, dir: -1 | 1) => void>(),
    onAdd: vi.fn<() => void>(),
  };
  const props = { pages, currentId: 'p2', canRemove: true, ...fn, ...over };
  const els = collect(StripTiles(props));
  const byLabel = (l: string) => els.find((e) => e.props['aria-label'] === l)!;
  return { fn, els, byLabel, html: renderToString(<DeckStrip {...props} />) };
};

describe('pasek stron eksportu (QC913)', () => {
  it('renderuje wszystkie strony z numerem i rodzajem, aria-current tylko na bieżącej', () => {
    const { html } = setup();
    for (const t of ['1/4 Mapa', '2/4 Tabela', '3/4 Ranking – najwyżej', '4/4 A vs B']) {
      expect(html.replace(/<!-- -->/g, '')).toContain(t);
    }
    expect(html.match(/aria-current="true"/g)).toHaveLength(1);
  });

  it('× woła onRemove(id), a przy canRemove=false jest disabled', () => {
    const { fn, byLabel } = setup();
    (byLabel('Usuń stronę 2 (Tabela)').props.onClick as () => void)();
    expect(fn.onRemove).toHaveBeenCalledWith('p2');
    const off = setup({ canRemove: false });
    expect(off.byLabel('Usuń stronę 2 (Tabela)').props.disabled).toBe(true);
  });

  it('każda strona ma uchwyt do przeciągania zamiast strzałek ‹ ›', () => {
    const { byLabel, html } = setup();
    expect(byLabel('Przeciągnij, aby zmienić kolejność: strona 2 (Tabela)').props.type).toBe('button');
    expect(html).not.toContain('Przesuń stronę');
  });

  it('„+ Dodaj stronę” woła onAdd', () => {
    const { fn, els } = setup();
    const add = els.find((e) => e.props['data-strip-add'] !== undefined)!;
    (add.props.onClick as () => void)();
    expect(fn.onAdd).toHaveBeenCalledTimes(1);
    expect(renderToString(<DeckStrip {...{ pages, currentId: 'p1', canRemove: true, onSelect() {}, onRemove() {}, onMove() {}, onAdd() {} }} />)).toContain('Dodaj stronę');
  });

  it('kafelek to natywny przycisk (Enter/Spacja) wołający onSelect(id)', () => {
    const { fn, els, html } = setup();
    const tile = els.find((e) => e.props['data-strip-tile'] === 'p3')!;
    expect(tile.type).toBe('button');
    expect(tile.props.type).toBe('button');
    (tile.props.onClick as () => void)();
    expect(fn.onSelect).toHaveBeenCalledWith('p3');
    expect(html).not.toContain('role="tab"');
  });

  it('wszystkie przyciski mają min. 44 px i nazwę dostępną', () => {
    const { els } = setup();
    const buttons = els.filter((e) => e.type === 'button');
    expect(buttons.length).toBe(4 * 3 + 1);
    for (const b of buttons) {
      expect(String(b.props.className)).toMatch(/min-h-\[44px\]/);
      expect(String(b.props.className)).toMatch(/min-w-\[44px\]/);
      const named = b.props['aria-label'] || collect(b.props.children).length >= 0;
      expect(named).toBeTruthy();
    }
    const unnamed = buttons.filter(
      (b) => !b.props['aria-label'] && typeof b.props.children !== 'string' && !Array.isArray(b.props.children),
    );
    expect(unnamed).toHaveLength(0);
  });

  it('kontener przewija się w poziomie wewnątrz siebie', () => {
    const { html } = setup();
    expect(html).toContain('overflow-x-auto');
    expect(html).toContain('snap-x');
    expect(html).toContain('max-w-full');
  });

  it('po usunięciu fokus przechodzi na sąsiedni kafelek lub „+”', () => {
    const ids = ['p1', 'p2', 'p3'];
    expect(focusTargetAfterRemove(ids, 'p2')).toBe('p3');
    expect(focusTargetAfterRemove(ids, 'p3')).toBe('p2');
    expect(focusTargetAfterRemove(['p1'], 'p1')).toBe('add');
  });
});

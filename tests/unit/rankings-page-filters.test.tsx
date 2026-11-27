import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Rankings, MyIndicatorsBar } from '../../src/view/pages/Rankings';
import { BASIC_INDICATORS } from '../../src/core/my-indicators/my-indicators';
import type { Indicator } from '../../src/core/profile/profile';

type El = React.ReactElement<Record<string, unknown>>;
function walk(node: unknown, out: El[] = []): El[] {
  if (Array.isArray(node)) node.forEach((n) => walk(n, out));
  else if (React.isValidElement(node)) {
    out.push(node as El);
    walk((node.props as { children?: unknown }).children, out);
  }
  return out;
}

const mk = (id: string): Indicator => ({
  id, bdlVarId: 1, name: `Nazwa ${id}`, unit: 'x', description: '', group: 'G', higherIsBetter: null, minLevel: 'gmi',
});
const all = ['a', 'b', 'c', 'd'].map(mk);

describe('Rankingi: wpięcie paska wyboru (QC106)', () => {
  it('strona na start pokazuje pasek jak przy mapie: „Wybierz dane”, poziom, „Najwyższe | Najniższe”, rok', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/rankingi']}>
        <Rankings />
      </MemoryRouter>,
    ).replace(/<!-- -->/g, '');
    expect(html).toContain('Wybierz dane');
    expect(html).toContain('aria-label="Poziom"');
    expect(html).toContain('aria-label="Który koniec skali"');
    expect(html).toContain('Najwyższe');
    expect(html).toContain('Najniższe');
    expect(html).toContain('aria-label="Rok"');
    // Stare „Moje wskaźniki” (lista z krzyżykami) zastąpiło pełne menu.
    expect(html).not.toContain('aria-label="Usuń wskaźnik');
  });

  it('MyIndicatorsBar: × usuwa, wybór w liście dodaje, przycisk przywraca', () => {
    const onAdd = vi.fn<(id: string) => void>();
    const onRemove = vi.fn<(id: string) => void>();
    const onReset = vi.fn<() => void>();
    const onToggle = vi.fn<() => void>();
    const tree = walk(
      MyIndicatorsBar({ all, list: ['a', 'b'], isBasic: false, open: true, onToggle, onAdd, onRemove, onReset }),
    );
    const remove = tree.find((e) => e.props['aria-label'] === 'Usuń wskaźnik Nazwa b')!;
    (remove.props.onClick as () => void)();
    expect(onRemove).toHaveBeenCalledWith('b');

    const add = walk(tree.find((e) => e.props['aria-label'] === 'Wskaźniki do dodania')!.props.children)
      .filter((e) => e.type === 'button');
    expect(add.map((e) => e.props.children)).toEqual(['Nazwa c', 'Nazwa d']);
    (add[0].props.onClick as () => void)();
    expect(onAdd).toHaveBeenCalledWith('c');

    const toggle = tree.find((e) => e.type === 'button' && JSON.stringify(e.props.children).includes('Dodaj wskaźnik'))!;
    (toggle.props.onClick as () => void)();
    expect(onToggle).toHaveBeenCalledTimes(1);

    const reset = tree.find((e) => e.type === 'button' && JSON.stringify(e.props.children).includes('Przywróć podstawowe'))!;
    (reset.props.onClick as () => void)();
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('MyIndicatorsBar: bez przycisku „Przywróć podstawowe”, gdy lista jest podstawowa', () => {
    const tree = walk(MyIndicatorsBar({ all, list: ['a'], isBasic: true, open: false, onToggle: vi.fn<() => void>(), onAdd: vi.fn<(id: string) => void>(), onRemove: vi.fn<(id: string) => void>(), onReset: vi.fn<() => void>() }));
    expect(tree.some((e) => JSON.stringify(e.props.children ?? '').includes('Przywróć podstawowe'))).toBe(false);
  });
});

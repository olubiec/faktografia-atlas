import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MyIndicatorsBar } from '../../src/view/pages/MyIndicatorsBar';
import type { Indicator } from '../../src/core/profile/profile';

const mk = (id: string): Indicator => ({
  id, bdlVarId: 1, name: `Nazwa ${id}`, unit: 'x', description: '', group: 'G', higherIsBetter: null, minLevel: 'gmi',
});
const all = ['a', 'b', 'c'].map(mk);
const noop = () => {};
const handlers = () => ({ onPointerDown: noop, onPointerMove: noop, onPointerUp: noop, onPointerCancel: noop });
const base = { all, isBasic: false, open: false, onToggle: noop, onAdd: noop, onRemove: noop, onReset: noop };

describe('Moje wskaźniki: wiersz z uchwytem i ×', () => {
  it('kolejność wierszy wynika z listy, nie z katalogu', () => {
    const html = renderToString(<MyIndicatorsBar {...base} list={['c', 'a']} />);
    expect(html.indexOf('Usuń wskaźnik Nazwa c')).toBeLessThan(html.indexOf('Usuń wskaźnik Nazwa a'));
    expect(html).not.toContain('Usuń wskaźnik Nazwa b');
  });

  it('uchwyt jest tylko z reorder, a usuwa wyłącznie przycisk ×', () => {
    const withoutGrip = renderToString(<MyIndicatorsBar {...base} list={['a']} />);
    expect(withoutGrip).not.toContain('Przeciągnij, aby zmienić kolejność');
    const reorder = { drag: null, handlers, move: vi.fn<() => void>() };
    const html = renderToString(<MyIndicatorsBar {...base} list={['a']} reorder={reorder} />);
    expect(html).toContain('Przeciągnij, aby zmienić kolejność: Nazwa a');
    expect(html.match(/<button[^>]*aria-label="Usuń wskaźnik Nazwa a"/g)?.length).toBe(1);
    expect(html).toContain('<span class="flex-1');
  });
});

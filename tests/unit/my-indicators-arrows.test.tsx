import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MyIndicatorsBar, IndicatorRow } from '../../src/view/pages/MyIndicatorsBar';
import type { Indicator } from '../../src/core/profile/profile';

const mk = (id: string): Indicator => ({
  id, bdlVarId: 1, name: `Nazwa ${id}`, unit: 'x', description: '', group: 'G', higherIsBetter: null, minLevel: 'gmi',
});
const all = ['a', 'b', 'c'].map(mk);
const noop = () => {};
const handlers = () => ({ onPointerDown: noop, onPointerMove: noop, onPointerUp: noop, onPointerCancel: noop });
const base = { all, isBasic: false, open: false, onToggle: noop, onAdd: noop, onRemove: noop, onReset: noop };
const reorder = () => ({ drag: null, handlers, move: vi.fn<() => void>() });
const btn = (html: string, label: string) => html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0] ?? '';

describe('Moje wskaźniki: strzałki ‹ ›, aria-current', () => {
  it('strzałki są tylko z reorder', () => {
    const list = ['a', 'b', 'c'];
    expect(renderToString(<MyIndicatorsBar {...base} list={list} />)).not.toContain('Przesuń');
    const html = renderToString(<MyIndicatorsBar {...base} list={list} reorder={reorder()} />);
    expect(btn(html, 'Przesuń Nazwa a wyżej')).not.toBe('');
    expect(btn(html, 'Przesuń Nazwa a niżej')).not.toBe('');
  });

  it('na krawędziach przycisk jest wyłączony, w środku oba aktywne', () => {
    const html = renderToString(<MyIndicatorsBar {...base} list={['a', 'b', 'c']} reorder={reorder()} />);
    expect(btn(html, 'Przesuń Nazwa a wyżej')).toContain('disabled=""');
    expect(btn(html, 'Przesuń Nazwa a niżej')).not.toContain('disabled=""');
    expect(btn(html, 'Przesuń Nazwa b wyżej')).not.toContain('disabled=""');
    expect(btn(html, 'Przesuń Nazwa b niżej')).not.toContain('disabled=""');
    expect(btn(html, 'Przesuń Nazwa c wyżej')).not.toContain('disabled=""');
    expect(btn(html, 'Przesuń Nazwa c niżej')).toContain('disabled=""');
  });

  it('strzałki mają co najmniej 44 px', () => {
    const html = renderToString(<MyIndicatorsBar {...base} list={['a', 'b']} reorder={reorder()} />);
    for (const l of ['Przesuń Nazwa a niżej', 'Przesuń Nazwa b wyżej']) {
      expect(btn(html, l)).toContain('min-h-[44px]');
      expect(btn(html, l)).toContain('min-w-[44px]');
    }
  });

  it('aria-current ma tylko aktywny wiersz', () => {
    const list = ['a', 'b', 'c'];
    const html = renderToString(<MyIndicatorsBar {...base} list={list} activeId="b" />);
    expect(html.match(/aria-current="true"/g)?.length).toBe(1);
    const row = html.match(/<div[^>]*data-row-id="b"[^>]*>/)?.[0] ?? '';
    expect(row).toContain('aria-current="true"');
    expect(renderToString(<MyIndicatorsBar {...base} list={list} />)).not.toContain('aria-current');
  });

  it('kliknięcie strzałek woła move(id, -1) / move(id, 1)', () => {
    const r = reorder();
    const onChange = vi.fn<() => void>();
    const el = IndicatorRow({
      ind: mk('b'), pos: 1, count: 3, reorder: r, active: false, onChange, onRemove: noop,
    });
    const buttons: React.ReactElement<{ 'aria-label'?: string; onClick?: () => void }>[] = [];
    const walk = (n: React.ReactNode): void => {
      if (Array.isArray(n)) return n.forEach(walk);
      if (!React.isValidElement<{ children?: React.ReactNode }>(n)) return;
      if (n.type === 'button') buttons.push(n as never);
      walk(n.props.children);
    };
    walk(el);
    buttons.find((b) => b.props['aria-label'] === 'Przesuń Nazwa b wyżej')?.props.onClick?.();
    buttons.find((b) => b.props['aria-label'] === 'Przesuń Nazwa b niżej')?.props.onClick?.();
    expect(r.move.mock.calls).toEqual([['b', -1], ['b', 1]]);
    expect(onChange.mock.calls).toEqual([['b', 'up'], ['b', 'down']]);
  });
});

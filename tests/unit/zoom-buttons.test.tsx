import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ZoomButtons, ZoomButtonsView } from '../../src/view/map/ZoomButtons';

type Btn = { label: string; attrs: string };
// Przyciski z wyrenderowanego HTML (brak DOM w testach: renderToString).
const buttons = (html: string): Btn[] =>
  [...html.matchAll(/<button\b([^>]*)>/g)].map((m) => ({
    label: /aria-label="([^"]*)"/.exec(m[1])?.[1] ?? '',
    attrs: m[1],
  }));

const view = (props: Partial<React.ComponentProps<typeof ZoomButtonsView>> = {}, bottom = 0) =>
  renderToString(<ZoomButtonsView onZoom={() => {}} bottom={bottom} {...props} />);

// Atrybut disabled (nie klasa disabled:opacity-50).
const DIS = /\sdisabled(=|\s|$)/;

describe('ZoomButtons', () => {
  it('ma dwa przyciski z nazwami Przybliż i Oddal oraz title', () => {
    expect(buttons(view()).map((x) => x.label)).toEqual(['Przybliż', 'Oddal']);
    expect(view()).toContain('title="Przybliż"');
    expect(view()).toContain('title="Oddal"');
  });

  it('grupa ma role=group i nazwę „Powiększenie mapy”', () => {
    const html = view();
    expect(html).toMatch(/role="group"/);
    expect(html).toContain('aria-label="Powiększenie mapy"');
  });

  it('oba przyciski mają min. 44 px i type=button (natywny <button>: Enter i Spacja działają jak klik)', () => {
    for (const b of buttons(view())) {
      expect(b.attrs).toContain('min-h-[44px]');
      expect(b.attrs).toContain('min-w-[44px]');
      expect(b.attrs).toContain('type="button"');
    }
  });

  it('canZoomIn=false blokuje tylko „Przybliż”, canZoomOut=false tylko „Oddal”', () => {
    const [inB, outB] = buttons(view({ canZoomIn: false }));
    expect(inB.attrs).toMatch(DIS);
    expect(outB.attrs).not.toMatch(DIS);
    const [in2, out2] = buttons(view({ canZoomOut: false }));
    expect(in2.attrs).not.toMatch(DIS);
    expect(out2.attrs).toMatch(DIS);
  });

  it('domyślnie oba przyciski są aktywne', () => {
    for (const b of buttons(view())) expect(b.attrs).not.toMatch(DIS);
  });

  it('klik woła onZoom(1) dla „Przybliż” i onZoom(-1) dla „Oddal”', () => {
    const onZoom = vi.fn<(d: 1 | -1) => void>();
    type Tree = React.ReactElement<{ children: React.ReactElement<{ onClick: () => void }>[] }>;
    const tree = ZoomButtonsView({ onZoom, bottom: 0 }) as Tree;
    const [plus, minus] = tree.props.children;
    plus.props.onClick();
    minus.props.onClick();
    expect(onZoom.mock.calls).toEqual([[1], [-1]]);
  });

  it('położenie: bottom = sheetInset (200 → 200px, 0 → 0px)', () => {
    expect(view({}, 200)).toMatch(/bottom:200px/);
    expect(view({}, 0)).toMatch(/bottom:0[;"]/);
  });

  it('opakowanie bez arkusza (render serwerowy) stoi przy dole: bottom 0', () => {
    expect(renderToString(<ZoomButtons onZoom={() => {}} />)).toMatch(/bottom:0[;"]/);
  });
});

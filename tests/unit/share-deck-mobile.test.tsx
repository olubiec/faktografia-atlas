import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DeckStrip, type StripPage } from '../../src/view/share/DeckStrip';
import { ADD_MENU_LAYER } from '../../src/view/share/AddPageMenu';

const noop = () => {};
const page = (id: string, label: string): StripPage => ({ id, kind: 'map', label, title: '' });
const strip = (pages: StripPage[], currentId: string) =>
  renderToString(<DeckStrip pages={pages} currentId={currentId} onSelect={noop} onRemove={noop} onMove={noop} onAdd={noop} canRemove />);

const tag = (html: string, attr: string): string => {
  const m = html.match(new RegExp(`<button[^>]*${attr}[^>]*>`));
  if (!m) throw new Error(`brak przycisku ${attr}`);
  return m[0];
};
const classes = (t: string) => (t.match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/);

describe('okno udostępniania na telefonie (QS05)', () => {
  it('aktywna strona ma kolor tekstu różny od tła', () => {
    const html = strip([page('p1', '1/2'), page('p2', '2/2')], 'p1');
    const c = classes(tag(html, 'data-strip-tile="p1"'));
    expect(c).toContain('bg-tusz');
    expect(c).toContain('text-kalka');
    expect(c).not.toContain('text-tusz');
    const other = classes(tag(html, 'data-strip-tile="p2"'));
    expect(other).toContain('text-tusz');
    expect(other).not.toContain('text-kalka');
  });

  it('menu „Dodaj stronę” ma warstwę wyższą niż okno dialogu', () => {
    // Okno leży w arkuszu react-modal-sheet (z-index 9999), a popover w <body> – musi być wyżej.
    const z = Number(ADD_MENU_LAYER.match(/^z-\[(\d+)\]$/)?.[1]);
    expect(z).toBeGreaterThan(9999);
  });

  it('pasek z 1 stroną nie przewija się poziomo', () => {
    const one = classes((strip([page('p1', '1/1')], 'p1').match(/<div[^>]*aria-label="Strony zestawu"[^>]*>/) ?? [''])[0]);
    expect(one).not.toContain('overflow-x-scroll');
    expect(one).not.toContain('overflow-x-auto');
    expect(one).toContain('flex-wrap');
    const two = classes((strip([page('p1', '1/2'), page('p2', '2/2')], 'p1').match(/<div[^>]*aria-label="Strony zestawu"[^>]*>/) ?? [''])[0]);
    expect(two).toContain('overflow-x-auto');
  });
});

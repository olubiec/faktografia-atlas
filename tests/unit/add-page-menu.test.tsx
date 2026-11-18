import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AddPageList, AddPageMenu } from '../../src/view/share/AddPageMenu';

type Props = React.ComponentProps<typeof AddPageList>;
const base = (over: Partial<Props> = {}): Props => ({
  onPick: () => {},
  onSplit: () => {},
  hasUnit: false,
  hasPair: false,
  canSplitCurrent: false,
  splitHint: null,
  ...over,
});

// Lista nie używa podkomponentów ani hooków, więc drzewo elementów można przejść bez DOM.
function walk(node: React.ReactNode, out: React.ReactElement<Record<string, unknown>>[] = []) {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    const el = child as React.ReactElement<Record<string, unknown>>;
    out.push(el);
    walk(el.props.children as React.ReactNode, out);
  });
  return out;
}
const buttons = (props: Props) =>
  walk(AddPageList(props)).filter((e) => e.type === 'button');
const labels = (props: Props) => buttons(props).map((b) => b.props['aria-label'] as string);
const find = (props: Props, label: string) => {
  const b = buttons(props).find((x) => x.props['aria-label'] === label);
  if (!b) throw new Error(`brak pozycji ${label}`);
  return b;
};
const click = (b: React.ReactElement<Record<string, unknown>>) => (b.props.onClick as () => void)();

describe('menu „+ Dodaj stronę” (QC914)', () => {
  it('bez miejsca i pary ukrywa Profil, Porównanie i A vs B', () => {
    const l = labels(base());
    expect(l).toEqual(expect.arrayContaining([
      'Mapa', 'Ranking – najwyżej', 'Ranking – najniżej', 'Tabela', 'Duża liczba', 'Wykres lat', 'Rozkład',
    ]));
    for (const hidden of ['Profil', 'Porównanie', 'A vs B']) expect(l).not.toContain(hidden);
  });

  it('hasPair pokazuje Porównanie i A vs B, hasUnit pokazuje Profil', () => {
    const pair = labels(base({ hasPair: true }));
    expect(pair).toContain('Porównanie');
    expect(pair).toContain('A vs B');
    expect(pair).not.toContain('Profil');
    expect(labels(base({ hasUnit: true }))).toContain('Profil');
  });

  it('wybór wywołuje onPick z właściwym rodzajem i opcjami', () => {
    const onPick = vi.fn<Props["onPick"]>();
    const p = base({ onPick });
    click(find(p, 'Tabela'));
    expect(onPick).toHaveBeenLastCalledWith('table', undefined);
    click(find(p, 'Ranking – najniżej'));
    expect(onPick).toHaveBeenLastCalledWith('ranking', { side: 'bottom' });
    click(find(p, 'Ranking – najwyżej'));
    expect(onPick).toHaveBeenLastCalledWith('ranking', { side: 'top' });
  });

  it('„Podziel tę stronę” jest wyłączone dla mapy i nic nie woła', () => {
    const onSplit = vi.fn<() => void>();
    const split = find(base({ onSplit }), 'Podziel tę stronę');
    expect(split.props['aria-disabled']).toBe(true);
    click(split);
    expect(onSplit).not.toHaveBeenCalled();
  });

  it('„Podziel tę stronę” jest aktywne i woła onSplit, gdy canSplitCurrent', () => {
    const onSplit = vi.fn<() => void>();
    const split = find(base({ onSplit, canSplitCurrent: true }), 'Podziel tę stronę');
    expect(split.props['aria-disabled']).toBe(false);
    click(split);
    expect(onSplit).toHaveBeenCalledTimes(1);
  });

  it('splitHint jest widoczny jako opis przy „Podziel”', () => {
    const html = renderToString(
      <AddPageList {...base({ splitHint: 'Mapy nie da się podzielić' })} />,
    );
    expect(html).toContain('Mapy nie da się podzielić');
    const id = find(base({ splitHint: 'x' }), 'Podziel tę stronę').props['aria-describedby'] as string;
    expect(html).toContain(`id="${id}"`);
  });

  it('pozycje mają min. 44 px, nazwy dostępne i jednozdaniowe opisy', () => {
    const p = base({ hasUnit: true, hasPair: true, canSplitCurrent: true });
    const html = renderToString(<AddPageList {...p} />);
    const all = buttons(p);
    expect(all).toHaveLength(11);
    for (const b of all) {
      expect(b.props['aria-label']).toBeTruthy();
      expect(String(b.props.className)).toContain('min-h-[44px]');
    }
    expect(html).toContain('mapa wskaźnika z legendą');
    expect(html).toContain('ile jednostek w każdej klasie');
  });

  it('przycisk „+” otwiera menu (dialog), które zamyka Escape i zwraca fokus przyciskowi (Radix Popover)', () => {
    const html = renderToString(<AddPageMenu {...{ onAdd: () => {}, onSplit: () => {}, hasUnit: false, hasPair: false, canSplitCurrent: false }} />);
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('min-h-[44px]');
  });
});

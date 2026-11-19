import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import tokens from '../../config/tokens.json';
import { buildProfile } from '../../src/core/profile/profile';
import { ProfileCompareTable } from '../../src/view/profile/ProfileCompareTable';
import { StripTiles } from '../../src/view/share/DeckStrip';
import { AddPageList, AddPageMenu } from '../../src/view/share/AddPageMenu';
import profileSample from '../fixtures/synthetic/profile-sample.json';

const MIN = tokens.touchTarget;

// Klasy wszystkich przycisków z wyrenderowanego HTML (kolejność jak w dokumencie).
const buttons = (html: string): { label: string; cls: string }[] =>
  [...html.matchAll(/<button\b([^>]*)>/g)].map((m) => ({
    label: /aria-label="([^"]*)"/.exec(m[1])?.[1] ?? '(bez etykiety)',
    cls: /class="([^"]*)"/.exec(m[1])?.[1] ?? '',
  }));

// Najmniejszy rozmiar z klas min-h-[Npx] / min-w-[Npx]; brak klasy = 0.
const minSize = (cls: string, axis: 'h' | 'w'): number => {
  const m = new RegExp(`(?:^|\\s)min-${axis}-\\[(\\d+)px\\]`).exec(cls);
  return m ? Number(m[1]) : 0;
};

const expectTouchable = (list: { label: string; cls: string }[], both: boolean) => {
  expect(list.length).toBeGreaterThan(0);
  for (const b of list) {
    expect(minSize(b.cls, 'h'), `min-h: ${b.label}`).toBeGreaterThanOrEqual(MIN);
    if (both) expect(minSize(b.cls, 'w'), `min-w: ${b.label}`).toBeGreaterThanOrEqual(MIN);
  }
};

const profile = buildProfile('0201011', profileSample.indicators as never, profileSample.valuesById as never, profileSample.units as never);
const profileB = { ...profile, teryt: '0201021' };

describe('pola dotykowe min. 44 px (Q2)', () => {
  it('token touchTarget to 44', () => {
    expect(MIN).toBe(44);
  });

  it('Porównaj: każdy przycisk × ma min-h i min-w co najmniej 44 px', () => {
    const html = renderToString(<ProfileCompareTable profileA={profile} profileB={profileB} onRemove={() => {}} />);
    const list = buttons(html).filter((b) => b.label.startsWith('Usuń wiersz'));
    expect(list.length).toBe(html.match(/data-slot="compare-row"/g)?.length);
    expectTouchable(list, true);
  });

  it('DeckStrip: kafelek, strzałki, usuń i własny „Dodaj stronę” mają min. 44 px', () => {
    const pages = [
      { id: 'p1', kind: 'map' as const, label: '1', title: '' },
      { id: 'p2', kind: 'ranking' as const, label: '2', title: '' },
    ];
    const props = { pages, currentId: 'p1', onSelect() {}, onRemove() {}, onMove() {}, onAdd() {}, canRemove: true };
    const list = buttons(renderToString(<StripTiles {...props} />));
    // 2 strony × (kafelek + w lewo + w prawo + usuń) + „Dodaj stronę”
    expect(list).toHaveLength(9);
    expectTouchable(list, true);
  });

  it('AddPageMenu: przycisk „Dodaj” (QS01) i pozycje listy mają min. 44 px', () => {
    const trigger = buttons(renderToString(<AddPageMenu onAdd={() => {}} onSplit={() => {}} hasUnit hasPair canSplitCurrent={false} />));
    expect(trigger.map((b) => b.label)).toContain('Dodaj stronę');
    expectTouchable(trigger, true);

    const base = { onPick() {}, onSplit() {}, hasUnit: true, hasPair: true, canSplitCurrent: true };
    const items = buttons(renderToString(<AddPageList {...base} />));
    expect(items.map((b) => b.label)).toContain('Podziel tę stronę');
    expectTouchable(items, false);
  });
});

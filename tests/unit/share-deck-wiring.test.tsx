import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ShareDialog, type ShareDialogData } from '../../src/view/share/ShareDialog';
import { AddPageList } from '../../src/view/share/AddPageMenu';
import { StripTiles } from '../../src/view/share/DeckStrip';
import { ShareControls } from '../../src/view/share/ShareControls';
import { cardScene } from '../../src/core/share/card';
import { initialDeck, deckCsvSections } from '../../src/view/share/useShareData';
import { deckCsv } from '../../src/core/share/deck-csv';

const measure = (t: string, s: number) => Math.round(0.55 * s * t.length);
const map = { indicator: { name: 'Gęstość', unit: 'os./km²', year: 2024 }, year: 2024 };
const ranking = { indicator: { name: 'Gęstość', unit: 'os./km²' }, year: 2024, items: [] };
const profile = { unitName: 'Powiat wałecki', teryt: '3217', indicatorName: 'Gęstość', unit: 'os./km²', year: 2024, bigNumber: '41', indicators: [] };
const versus = { indicator: { name: 'Bezrobocie', unit: '%' }, year: 2024, a: { name: 'A', valueText: '5' }, b: { name: 'B', valueText: '4' }, diffText: '' };
const indicator = { id: 'dens', name: 'Gęstość', unit: 'os./km²', minLevel: 'woj' } as never;
const units = [{ teryt: '02', name: 'Dolnośląskie', level: 'woj' }] as never;
const values = { '02': { 2024: 100 } } as never;

const render = (data: ShareDialogData) => renderToString(<ShareDialog isOpen onClose={() => {}} data={data} />);

describe('okno udostępniania: zestaw stron (QC915)', () => {
  it('startowy zestaw ma tylko podstawowe strony z dostępnych danych, w stałej kolejności', () => {
    expect(initialDeck({ map, ranking }).pages.map((p) => p.kind)).toEqual(['map', 'ranking']);
    expect(initialDeck({ map, ranking, profile }).pages.map((p) => p.kind)).toEqual(['map', 'ranking', 'profile']);
    expect(initialDeck({}).pages.map((p) => p.kind)).toEqual(['map']);
  });

  it('okno pokazuje pasek stron i „Dodaj stronę” (jedna pozycja w pasku)', () => {
    const html = render({ map, ranking });
    expect(html).toContain('aria-label="Strony zestawu"');
    expect(html).toContain('data-strip-tile="p1"');
    expect(html).toContain('data-strip-tile="p2"');
    expect(html).not.toContain('data-strip-tile="p3"');
    expect(html.match(/Dodaj stronę/g)?.length).toBeGreaterThanOrEqual(1);
    expect(html).toContain('1/2');
  });

  it('dotychczasowe przyciski okna zostają', () => {
    const html = render({ map });
    for (const t of ['Pobierz obraz', 'Udostępnij zestaw', 'Pobierz dane (CSV)', 'Zamknij']) expect(html).toContain(t);
  });

  it('CSV zestawu pojawia się tylko przy więcej niż jednej stronie', () => {
    expect(render({ map })).not.toContain('Pobierz CSV zestawu');
    const two = render({ map, ranking, units, indicatorValues: values, indicator, year: 2024 });
    expect(two).toContain('Pobierz CSV zestawu');
  });

  it('pasek bez addSlot rysuje własny przycisk „Dodaj stronę”, z addSlot – podany element', () => {
    const p = { pages: [{ id: 'p1', kind: 'map' as const, label: '', title: '' }], currentId: 'p1', onSelect() {}, onRemove() {}, onMove() {}, onAdd() {}, canRemove: false };
    expect(renderToString(<StripTiles {...p} />)).toContain('data-strip-add=""');
    const html = renderToString(<StripTiles {...p} addSlot={<b id="slot">x</b>} />);
    expect(html).toContain('id="slot"');
    expect(html).not.toContain('data-strip-add=""');
  });

  it('menu „Dodaj stronę” z listą allowed pokazuje tylko wskazane rodzaje', () => {
    const base = { onPick() {}, onSplit() {}, hasUnit: true, hasPair: true, canSplitCurrent: false };
    const all = renderToString(<AddPageList {...base} />);
    const some = renderToString(<AddPageList {...base} allowed={['map', 'profile']} />);
    expect(all).toContain('Rozkład');
    expect(some).toContain('Mapa');
    expect(some).toContain('Profil');
    expect(some).not.toContain('Rozkład');
    expect(some).not.toContain('Ranking');
  });

  it('karta A vs B powstaje z cardScene i ma tytuł wskaźnika', () => {
    const scene = cardScene('versus', versus, 'post', 'light', { measure });
    const titles = scene.items.flatMap((i) => (i.type === 'text' ? i.lines : []));
    expect(titles.some((l) => l.includes('Bezrobocie'))).toBe(true);
    expect(titles).toContain('B');
  });

  it('wybór karty A vs B jest w kontrolkach tylko gdy dostępna', () => {
    const p = { activeKind: 'map' as const, onSelectKind() {}, selectedFormat: 'post' as const, onSelectFormat() {}, selectedTheme: 'light' as const, onSelectTheme() {} };
    expect(renderToString(<ShareControls {...p} availableKinds={['map']} />)).not.toContain('A vs B');
    expect(renderToString(<ShareControls {...p} availableKinds={['map', 'versus']} />)).toContain('A vs B');
  });

  it('sekcje CSV zestawu: po jednej na stronę z danymi, składane przez deckCsv', () => {
    const data: ShareDialogData = { map, ranking, profile, units, indicatorValues: values, indicator, year: 2024 };
    const deck = initialDeck(data);
    const sections = deckCsvSections(deck, data);
    expect(sections.map((s) => s.title)).toEqual(['Gęstość', 'Gęstość']);
    const csv = deckCsv(sections);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('Strona 1/2');
    expect(csv).toContain('Źródło: GUS');
    expect(deckCsvSections(initialDeck({ map }), { map })).toEqual([]);
  });
});

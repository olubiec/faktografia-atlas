import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ShareDialog } from '../../src/view/share/ShareDialog';
import { initialDeck, deckCsvSections } from '../../src/view/share/useShareData';
import { versusShareData } from '../../src/core/share/versus-data';
import { createDeck } from '../../src/core/share/deck';

const ind = (id: string, name: string, unit = '%') => ({ id, name, unit }) as never;
const item = (id: string, name: string, value: number | null) =>
  ({ indicatorId: id, indicator: ind(id, name), value, rankNational: null }) as never;
const profile = (teryt: string, name: string, level: string, vals: [number | null, number | null]) =>
  ({
    teryt,
    unit: { teryt, name, level },
    indicators: [item('bezr', 'Bezrobocie', vals[0]), item('gest', 'Gęstość', vals[1])],
  }) as never;

const A = profile('0201', 'powiat bolesławiecki', 'pow', [5, 80]);
const B = profile('0202', 'powiat dzierżoniowski', 'pow', [8, 120]);

describe('okno udostępniania: dane A vs B (QS02)', () => {
  it('z A i B dane versus mają oba tytuły i wiersze', () => {
    const d = versusShareData(A, B, 2024);
    expect(d.versus?.a.name).toContain('bolesławiecki');
    expect(d.versus?.b.name).toContain('dzierżoniowski');
    expect(d.versus?.indicator.name).toBe('Bezrobocie');
    expect(d.versus?.year).toBe(2024);
    expect(d.compareRows?.map((r) => r.indicatorId)).toEqual(['bezr', 'gest']);
    expect(d.compareUnitA).toBe(A);
    expect(d.compareUnitB).toBe(B);
    expect(renderToString(<ShareDialog isOpen onClose={() => {}} defaultKind="versus" data={d} />)).toContain('A vs B');
  });

  it('bez B (albo bez A) nie ma karty versus', () => {
    expect(versusShareData(A, null, 2024)).toEqual({});
    expect(versusShareData(null, B, 2024)).toEqual({});
    const html = renderToString(<ShareDialog isOpen onClose={() => {}} data={versusShareData(A, null, 2024)} />);
    expect(html).not.toContain('A vs B');
  });

  it('CSV zestawu zawiera sekcję A vs B', () => {
    const d = versusShareData(A, B, 2024);
    const deck = createDeck([{ kind: 'versus', indicatorIds: ['bezr'] }]);
    const sections = deckCsvSections(deck, d);
    expect(sections).toHaveLength(1);
    expect(sections[0].csv).toContain('Powiat bolesławiecki');
    expect(sections[0].csv).toContain('Powiat dzierżoniowski');
    expect(sections[0].csv).toContain('Bezrobocie');
    expect(initialDeck({}).pages.map((p) => p.kind)).toEqual(['map']);
  });
});

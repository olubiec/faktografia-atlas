import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ShareDialog } from '../../src/view/share/ShareDialog';

// Zamiast leniwego okna: prawdziwe okno otwarte od razu, z zapamiętanymi danymi
const captured: { data: Record<string, unknown> | null } = { data: null };
vi.mock('../../src/view/share/LazyShareDialog', () => ({
  LazyShareDialog: (props: { data: Record<string, unknown> }) => {
    captured.data = props.data;
    return <ShareDialog isOpen onClose={() => {}} defaultKind="compare" data={props.data as never} />;
  },
}));

import { ProfileCompare } from '../../src/view/profile/ProfileCompare';

const item = (id: string, name: string, value: number) =>
  ({ indicatorId: id, indicator: { id, name, unit: '%' }, value, year: 2024, rankNational: 1, totalNational: 380 }) as never;
const profile = (teryt: string, name: string, vals: [number, number]) =>
  ({
    teryt,
    unit: { teryt, name, level: 'pow' },
    indicators: [item('bezr', 'Bezrobocie', vals[0]), item('gest', 'Gęstość', vals[1])],
  }) as never;

const A = profile('0201', 'bolesławiecki', [5, 80]);
const B = profile('0202', 'dzierżoniowski', [8, 120]);

describe('Profil: A vs B w oknie z zakładki Porównaj (QS02c)', () => {
  it('z A i B shareData.versus ma oba tytuły i wartości aktywnego wskaźnika', () => {
    const view = { indicator: { id: 'gest', name: 'Gęstość' }, year: 2024, values: null } as never;
    // Okno jest w DOM dopiero po kliknięciu, więc dane bierzemy z atrapy; menu sprawdza drugi test
    const html = renderToString(<ProfileCompare profileA={A} profileB={B} units={[]} view={view} />);
    const versus = captured.data?.versus as {
      a: { name: string; valueText: string };
      b: { name: string; valueText: string };
      indicator: { name: string };
    };
    expect(versus.indicator.name).toBe('Gęstość');
    expect(versus.a.name).toContain('bolesławiecki');
    expect(versus.b.name).toContain('dzierżoniowski');
    expect(versus.a.valueText).toContain('80');
    expect(versus.b.valueText).toContain('120');
    expect(captured.data?.compare).toBeTruthy();
    expect(html).toContain('A vs B');
  });

  it('bez B shareData nie ma versus ani compare, a menu nie ma „A vs B”', () => {
    captured.data = null;
    const html = renderToString(<ProfileCompare profileA={A} profileB={null} units={[]} />);
    expect(html).not.toContain('A vs B');
    const empty = renderToString(<ShareDialog isOpen onClose={() => {}} data={{}} />);
    expect(empty).not.toContain('A vs B');
  });
});

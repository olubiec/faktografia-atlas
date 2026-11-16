import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { buildProfile } from '../../src/core/profile/profile';
import { ProfileBody } from '../../src/view/profile/ProfileSheet';
import sample from '../fixtures/synthetic/profile-sample.json';
import {
  BLOCK_IDS,
  defaultLayout,
  moveBlock,
  presetLayout,
  serializeLayout,
  toggleBlock,
  visibleIds,
} from '../../src/core/layout/layout';
import { blockForIndicator, orderByLayout, isIndicatorVisible } from '../../src/core/layout/profileBlocks';
import { BLOCK_LABELS } from '../../src/view/layout/blockLabels';
import { LayoutDialogButton } from '../../src/view/layout/LayoutDialog';
import { resetLayoutCache, setLayout, useLayout } from '../../src/view/layout/useLayout';

const items = [
  { id: 'population', group: 'Ludność' },
  { id: 'median-age', group: 'Ludność' },
  { id: 'avg-wage', group: 'Pieniądze' },
  { id: 'x', group: 'Inne' },
];
const key = (i: { id: string; group: string }) => i;

describe('układ: bloki profilu', () => {
  it('każdy blok ma etykietę, a wskaźniki mapują się na bloki', () => {
    for (const id of BLOCK_IDS) expect(BLOCK_LABELS[id]).toBeTruthy();
    expect(blockForIndicator('median-age', 'Ludność')).toBe('age');
    expect(blockForIndicator('population', 'Ludność')).toBe('population');
    expect(blockForIndicator('avg-wage', 'Pieniądze')).toBe('income');
    expect(blockForIndicator('x', 'Inne')).toBeNull();
  });
  it('domyślny układ ukrywa wiek, pełny pokazuje wszystko', () => {
    expect(isIndicatorVisible('median-age', 'Ludność', defaultLayout())).toBe(false);
    expect(isIndicatorVisible('median-age', 'Ludność', presetLayout('pełny'))).toBe(true);
    expect(visibleIds(defaultLayout())).not.toContain('age');
  });
  it('orderByLayout filtruje ukryte i trzyma kolejność układu; nieznane grupy zostają na końcu', () => {
    const l = moveBlock(moveBlock(defaultLayout(), 'income', -1), 'income', -1);
    const out = orderByLayout(items, l, key).map((i) => i.id);
    expect(out).toEqual(['avg-wage', 'population', 'x']);
    expect(orderByLayout(items, toggleBlock(l, 'income'), key).map((i) => i.id)).toEqual(['population', 'x']);
  });
});

describe('układ: dialog i wspólny magazyn', () => {
  beforeEach(() => {
    const data: Record<string, string> = {};
    vi.stubGlobal('window', {
      location: { search: '' },
      localStorage: {
        getItem: (k: string) => data[k] ?? null,
        setItem: (k: string, v: string) => void (data[k] = v),
      },
    });
    resetLayoutCache();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('przycisk „Dostosuj układ” ma min. 44 px', () => {
    const html = renderToString(<LayoutDialogButton />);
    expect(html).toContain('Dostosuj układ');
    expect(html).toContain('min-h-[44px]');
  });
  it('useLayout czyta zapisany układ z localStorage', () => {
    function Probe() {
      const [layout] = useLayout();
      return <p>{visibleIds(layout).join(',')}</p>;
    }
    expect(renderToString(<Probe />)).toContain(visibleIds(defaultLayout()).join(','));
    setLayout(presetLayout('pełny'));
    expect(window.localStorage.getItem('fa-layout-v1')).toBe(serializeLayout(presetLayout('pełny')));
    resetLayoutCache();
    expect(renderToString(<Probe />)).toContain([...BLOCK_IDS].join(','));
  });
  it('profil pokazuje tylko widoczne bloki (domyślnie bez wieku), po zmianie układu także wiek', () => {
    const base = (sample.indicators as any[])[0];
    const indicators = [
      base,
      { ...base, id: 'median-age', name: 'Mediana wieku TEST', group: 'Ludność' },
    ];
    const valuesById = { ...(sample.valuesById as any), 'median-age': (sample.valuesById as any)[base.id] };
    const render = () => {
      const profile = buildProfile('0201011', indicators as any, valuesById, sample.units as any);
      return renderToString(<ProfileBody profile={profile} units={sample.units as any} />);
    };
    expect(render()).not.toContain('Mediana wieku TEST');
    setLayout(presetLayout('pełny'));
    const html = render();
    expect(html).toContain('Mediana wieku TEST');
    expect(html).toContain('Dostosuj układ');
  });
});

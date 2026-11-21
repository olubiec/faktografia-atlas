import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import indicatorsData from '../../config/indicators.json' with { type: 'json' };
import fixture from '../fixtures/catalog/search-queries.json' with { type: 'json' };
import { buildCatalogTree } from '../../src/core/catalog/tree';
import { DataMenuBody } from '../../src/view/data-menu/DataMenu';
import { SheetIndicatorPicker } from '../../src/view/main/SheetIndicatorPicker';
import type { AvailableFile } from '../../src/core/indicators/registry';
import type { Indicator } from '../../src/core/profile/profile';

// Przechwytujemy propsy listy wskaźników, żeby „kliknąć” wiersz bez przeglądarki (testy jednostkowe działają w Node).
const listProps: { onPick?: (id: string) => void }[] = [];
vi.mock('../../src/view/data-menu/DataMenuList', async () => {
  const actual = await vi.importActual<typeof import('../../src/view/data-menu/DataMenuList')>('../../src/view/data-menu/DataMenuList');
  return {
    ...actual,
    DataMenuList: (props: Parameters<typeof actual.DataMenuList>[0]) => {
      listProps.push({ onPick: props.onPick });
      return actual.DataMenuList(props);
    },
  };
});

const INDICATORS = indicatorsData as Indicator[];
const tree = buildCatalogTree(INDICATORS, fixture.available as AvailableFile);
const section = tree.sections.find((s) => s.name === 'Rynek pracy')!;
const group = section.groups[0]!;
const noop = () => {};

const html = (extra: Partial<React.ComponentProps<typeof DataMenuBody>> = {}) =>
  renderToString(
    <DataMenuBody tree={tree} selectedId={null} onSelect={noop} onClose={noop} layout="stack" {...extra} />,
  ).replace(/<!-- -->/g, '');

describe('B06 – DataMenu layout="stack" (telefon)', () => {
  beforeEach(() => {
    listProps.length = 0;
  });

  it('poziom 1: szukajka u góry i lista działów, bez okruszków i bez grup', () => {
    const out = html();
    expect(out).toContain('data-layout="stack"');
    expect(out.indexOf('data-menu-search')).toBeLessThan(out.indexOf('aria-label="Działy"'));
    expect(out).toContain('aria-label="Działy"');
    expect(out).not.toContain('aria-label="Ścieżka"');
    expect(out).not.toContain('<ul');
  });

  it('poziom 2 (dział): okruszki „Wszystkie › Dział”, grupy; lista działów znika (jeden widok naraz)', () => {
    const out = html({ initialSectionId: section.id });
    expect(out).toContain('aria-label="Ścieżka"');
    expect(out).toContain('>Wszystkie<');
    expect(out).toContain(`>${section.name}<`);
    expect(out).toContain('›');
    expect(out).not.toContain('aria-label="Działy"');
    expect(out).toContain(group.name);
    expect(out).not.toContain('<ul');
  });

  it('poziom 3 (grupa): okruszki „Wszystkie › Dział › Grupa” i wskaźniki grupy, bez działów', () => {
    const out = html({ initialSectionId: section.id, initialGroupId: group.id });
    const crumbs = [...out.matchAll(/underline-offset-4 hover:underline cursor-pointer">([^<]+)</g)].map((m) => m[1]);
    expect(crumbs).toEqual(['Wszystkie', section.name, group.name]);
    expect(out).not.toContain('aria-label="Działy"');
    expect(out).toContain(group.entries[0]!.name);
  });

  it('wybór wskaźnika wywołuje onSelect(id) i zamyka menu', () => {
    const onSelect = vi.fn<(id: string) => void>();
    const onClose = vi.fn<() => void>();
    html({ initialSectionId: section.id, initialGroupId: group.id, onSelect, onClose });
    const target = group.entries[0]!;
    listProps.at(-1)!.onPick!(target.id);
    expect(onSelect).toHaveBeenCalledWith(target.id);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('szukanie pokazuje same wyniki (bez działów), wybór wyniku wywołuje onSelect', () => {
    const onSelect = vi.fn<(id: string) => void>();
    const out = html({ initialQuery: 'bezrobocie', onSelect });
    expect(out).not.toContain('aria-label="Działy"');
    expect(out).toContain('Stopa bezrobocia rejestrowanego');
    listProps.at(-1)!.onPick!('unemployment-rate');
    expect(onSelect).toHaveBeenCalledWith('unemployment-rate');
  });

  it('pola dotykowe mają min. 44 px w każdym widoku', () => {
    for (const out of [html(), html({ initialSectionId: section.id }), html({ initialSectionId: section.id, initialGroupId: group.id }), html({ initialQuery: 'bezrobocie' })]) {
      const buttons = out.match(/<button[^>]*>/g) ?? [];
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons.every((b) => b.includes('min-h-[44px]'))).toBe(true);
    }
  });
});

describe('B06 – wybór danych w arkuszu telefonu (SheetIndicatorPicker)', () => {
  const current = INDICATORS[0]!;
  const render = (defaultOpen?: boolean) =>
    renderToString(<SheetIndicatorPicker indicator={current} onSelect={noop} defaultOpen={defaultOpen} />).replace(/<!-- -->/g, '');

  it('domyślnie pokazuje menu danych w układzie stack z szukajką i działami', () => {
    const out = render();
    expect(out).toContain('data-layout="stack"');
    expect(out).toContain('data-menu-search');
    expect(out).toContain('aria-expanded="true"');
    expect(out).toContain(current.name);
  });

  it('zwinięty pokazuje tylko nazwę wskaźnika; nie ma „Moich wskaźników” ani „Zamów”', () => {
    const out = render(false);
    expect(out).not.toContain('data-layout');
    expect(out).toContain('aria-expanded="false"');
    expect(out).not.toMatch(/Moje wskaźniki|zamów/i);
  });

  it('przyciski paska mają min. 44 px', () => {
    const buttons = render(false).match(/<button[^>]*>/g) ?? [];
    expect(buttons.length).toBe(2);
    expect(buttons.every((b) => b.includes('min-h-[44px]'))).toBe(true);
  });
});

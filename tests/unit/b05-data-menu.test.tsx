import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import indicatorsData from '../../config/indicators.json' with { type: 'json' };
import fixture from '../fixtures/catalog/search-queries.json' with { type: 'json' };
import { buildCatalogTree, flattenTree } from '../../src/core/catalog/tree';
import { DataMenuBody } from '../../src/view/data-menu/DataMenu';
import { DataMenuList } from '../../src/view/data-menu/DataMenuList';
import { DataMenuBranch } from '../../src/view/data-menu/DataMenuTree';
import type { AvailableFile } from '../../src/core/indicators/registry';
import type { Indicator } from '../../src/core/profile/profile';

const tree = buildCatalogTree(indicatorsData as Indicator[], fixture.available as AvailableFile);
const entries = flattenTree(tree).filter((e) => e.section === 'Ludność');

type ButtonProps = { onClick?: () => void; disabled?: boolean; children?: React.ReactNode };
/** Zbiera przyciski z drzewa elementów (komponent bez hooków wywołujemy jak funkcję). */
function buttons(node: React.ReactNode): React.ReactElement<ButtonProps>[] {
  const found: React.ReactElement<ButtonProps>[] = [];
  const walk = (n: React.ReactNode): void => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!React.isValidElement<ButtonProps>(n)) return;
    if (n.type === 'button') found.push(n);
    walk(n.props.children);
  };
  walk(node);
  return found;
}

const noop = () => {};
const html = (extra: Partial<React.ComponentProps<typeof DataMenuBody>> = {}) =>
  renderToString(
    <DataMenuBody tree={tree} selectedId="population" onSelect={noop} onClose={noop} layout="columns" {...extra} />,
  ).replace(/<!-- -->/g, '');

describe('B05 – DataMenu', () => {
  it('kliknięcie wskaźnika wywołuje onSelect(id)', () => {
    const onPick = vi.fn<(id: string) => void>();
    const el = DataMenuList({ entries, selectedId: null, onPick, limit: 50, onMore: noop });
    const target = buttons(el).find((b) => JSON.stringify(b.props.children).includes('Ludność ogółem'))!;
    target.props.onClick?.();
    expect(onPick).toHaveBeenCalledWith('population');
  });

  it('pozycje z isDisabled są wyłączone i nie reagują', () => {
    const onPick = vi.fn<(id: string) => void>();
    const el = DataMenuList({
      entries, selectedId: null, onPick, limit: 50, onMore: noop,
      isDisabled: (e) => e.id === 'density',
    });
    const rows = buttons(el);
    const disabled = rows.filter((b) => b.props.disabled);
    expect(disabled).toHaveLength(1);
    expect(JSON.stringify(disabled[0]!.props.children)).toContain('Gęstość zaludnienia');
    const out = renderToString(
      <DataMenuBody tree={tree} selectedId={null} onSelect={noop} onClose={noop} layout="columns" initialQuery="gestosc" isDisabled={(e) => e.id === 'density'} />,
    );
    expect(out).toContain('disabled');
    expect(out).toContain('Brak danych na tym poziomie');
  });

  it('po 50 wierszy i „Pokaż więcej”', () => {
    const many = Array.from({ length: 120 }, (_, i) => ({ ...entries[0]!, id: `b${i}`, name: `Wskaźnik ${i}`, topic: '' }));
    const out = renderToString(<DataMenuList entries={many} selectedId={null} onPick={noop} limit={50} onMore={noop} />);
    expect((out.match(/<li/g) ?? []).length).toBe(51);
    expect(out).toContain('Pokaż więcej');
    expect(out).toContain('(70)');
  });

  it('nie zawiera słów „Zamów” ani „Archiwalne” (widok działów, szukajka, brak wyniku)', () => {
    for (const out of [html(), html({ initialQuery: 'ludnosc' }), html({ initialQuery: 'zzzzqq' }), html({ layout: 'stack' })]) {
      expect(out).not.toMatch(/zamów/i);
      expect(out).not.toMatch(/archiwaln/i);
    }
  });

  it('brak wyniku: komunikat „Nie mamy jeszcze tych danych o „…”.”', () => {
    expect(html({ initialQuery: 'lekarze' })).toContain('Nie mamy jeszcze tych danych o „lekarze”.');
  });

  it('wpisana fraza (adres ?q=) pokazuje wyniki szukania', () => {
    const out = html({ initialQuery: 'bezrobocie' });
    expect(out).toContain('Stopa bezrobocia rejestrowanego');
    expect(out).toContain('Rynek pracy › Pozostałe');
  });

  it('pola dotykowe mają min. 44 px: działy, wiersze i pole szukania', () => {
    const out = html();
    const rows = out.match(/<button[^>]*>/g) ?? [];
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((b) => b.includes('min-h-[44px]'))).toBe(true);
    expect(html({ initialQuery: 'lekarze' })).toContain('data-menu-search');
  });

  it('działy w kolejności wag, bez grupy archiwalnej', () => {
    const out = html();
    expect(out.indexOf('>Ludność<')).toBeLessThan(out.indexOf('>Kultura<'));
    expect(out).toContain('aria-label="Działy"');
  });

  it('dział z jedną grupą pokazuje wskaźniki od razu, bez podkategorii', () => {
    const tourism = tree.sections.find((s) => s.name === 'Turystyka')!;
    expect(tourism.groups).toHaveLength(1);
    const out = renderToString(
      <DataMenuBranch section={tourism} groupId={null} selectedId={null} onPick={noop} onHome={noop} onOpenSection={noop} onOpenGroup={noop} limit={50} onMore={noop} />,
    );
    expect(out).toContain(tourism.groups[0]!.entries[0]!.name);
    expect(out).not.toContain('Pozostałe');
  });
});

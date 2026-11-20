import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import {
  AddIndicatorView,
  AddTabs,
  LibrarySection,
  type AddTab,
} from '../../src/view/profile/AddIndicatorWindow';
import {
  LibraryBreadcrumbs,
  LibrarySearchPanel,
} from '../../src/view/profile/LibrarySearchPanel';
import indicators from '../../config/indicators.json';

const items = (indicators as { id: string; name: string; group: string }[]).map((indicator) => ({
  indicatorId: indicator.id,
  indicator: indicator as never,
}));

const index = prepareLibraryIndex({
  version: 1,
  categories: { '1': { n: 'Ludność', p: null } },
  units: ['osoba'],
  variables: Array.from({ length: 120 }, (_, i) => ({
    id: String(1000 + i),
    s: '1',
    n: `Ludność wskaźnik ${i}`,
    l: 5,
    u: 0,
    has: 1,
  })),
})!;

const noop = () => {};

function renderView(tab: AddTab, library = index) {
  return renderToString(
    <StaticRouter location="/">
      <AddIndicatorView
        items={items as never}
        onAdd={noop}
        tab={tab}
        onTab={noop}
        openKey={items[0].indicator.group}
        onToggle={noop}
        library={library}
      />
    </StaticRouter>,
  );
}

/** Przechodzi po drzewie elementów (bez DOM) i zwraca propsy elementów z danym `role`/tekstem. */
function walk(node: unknown, pred: (props: Record<string, unknown>) => boolean, out: Record<string, unknown>[] = []) {
  if (!node || typeof node !== 'object') return out;
  const props = (node as { props?: Record<string, unknown> }).props ?? {};
  if (pred(props)) out.push(props);
  for (const child of [props.children].flat(Infinity)) walk(child, pred, out);
  return out;
}

describe('okno Dodaj wskaźnik: zakładki, okruszki, pusty wynik (QC505)', () => {
  it('1. są zakładki Szukaj i Kategorie; domyślnie wybrane Kategorie z dotychczasową zawartością', () => {
    const html = renderView('categories');
    expect(html).toContain('role="tablist"');
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Kategorie</);
    expect(html).toMatch(/role="tab"[^>]*aria-selected="false"[^>]*>Szukaj</);
    expect(html).toContain('role="tabpanel"');
    expect(html).toContain(`Dodaj: ${items[0].indicator.name}`);
    expect(html.match(/aria-expanded="true"/g) ?? []).toHaveLength(1);
  });

  it('2. zakładka Szukaj pokazuje pole bez akordeonu; kliknięcie zakładki woła onTab', () => {
    const search = renderView('search');
    expect(search).toContain('aria-label="Szukaj w bibliotece"');
    expect(search).not.toContain('aria-expanded');
    expect(search).not.toContain(`Dodaj: ${items[0].indicator.name}`);
    const cats = renderView('categories');
    expect(cats).toContain('aria-expanded');
    expect(cats).toContain('Z biblioteki GUS');

    const onTab = vi.fn<(t: AddTab) => void>();
    const tree = AddTabs({ tab: 'categories', onTab });
    const tabs = walk(tree, (p) => p.role === 'tab');
    expect(tabs).toHaveLength(2);
    (tabs[0].onClick as () => void)();
    (tabs[1].onClick as () => void)();
    expect(onTab.mock.calls).toEqual([['search'], ['categories']]);
  });

  it('3. fraza bez trafień daje komunikat i przycisk zamówienia tematu', () => {
    const html = renderToString(
      <StaticRouter location="/">
        <LibrarySearchPanel index={index} text="kosmos" onText={noop} />
      </StaticRouter>,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('Nie ma takiego wskaźnika z danymi.');
    expect(html).toContain('Zamów dane o „kosmos”');
    expect(html).not.toContain('Brak wyników.');
  });

  it('4. dział biblioteki pokazuje okruszki Wszystkie › dział; „Wszystkie” woła zwinięcie', () => {
    const open = renderToString(
      <StaticRouter location="/">
        <LibrarySection index={index} initialCat="1" />
      </StaticRouter>,
    );
    expect(open).toContain('aria-label="Okruszki"');
    expect(open).toContain('Wszystkie');
    expect(open).toMatch(/aria-current="page">Ludność</);
    const closed = renderToString(
      <StaticRouter location="/">
        <LibrarySection index={index} />
      </StaticRouter>,
    );
    expect(closed).not.toContain('Okruszki');

    const onAll = vi.fn<() => void>();
    const tree = LibraryBreadcrumbs({ name: 'Ludność', onAll });
    const buttons = walk(tree, (p) => typeof p.onClick === 'function');
    expect(buttons).toHaveLength(1);
    (buttons[0].onClick as () => void)();
    expect(onAll).toHaveBeenCalledOnce();
  });

  it('5. wyniki w Szukaj są ograniczone do 50 z napisem „Pokazano 50 z 120”', () => {
    const html = renderToString(
      <StaticRouter location="/">
        <LibrarySearchPanel index={index} text="Ludność" onText={noop} />
      </StaticRouter>,
    );
    expect(html).toContain('Pokazano 50 z 120');
    expect(html.match(/aria-label="Dodaj: /g) ?? []).toHaveLength(50);
  });

  it('6. przyciski zakładek i „Wszystkie” mają min. 44 px', () => {
    const tabs = walk(AddTabs({ tab: 'search', onTab: noop }), (p) => p.role === 'tab');
    expect(tabs).toHaveLength(2);
    for (const t of tabs) expect(String(t.className)).toContain('min-h-[44px]');
    const crumbs = walk(LibraryBreadcrumbs({ name: 'X', onAll: noop }), (p) => typeof p.onClick === 'function');
    expect(String(crumbs[0].className)).toContain('min-h-[44px]');
  });
});

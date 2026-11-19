import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import { libraryPickResults } from '../../src/core/library/picker-results';
import { LibraryRows } from '../../src/view/profile/AddIndicatorWindow';
import { addIndicator, defaultMyIndicators } from '../../src/core/my-indicators/my-indicators';

const index = prepareLibraryIndex({
  version: 1,
  categories: { '1': { n: 'Ludność', p: null } },
  units: ['osoba'],
  variables: [
    { id: '4242', s: '1', n: 'Pobrany wskaźnik', l: 5, u: 0, has: 1 },
    { id: '9999', s: '1', n: 'Niepobrany wskaźnik', l: 5, u: 0, has: 0 },
  ],
})!;

const items = [{ id: '4242', name: 'Pobrany wskaźnik' }];

function render(list: readonly string[]) {
  return renderToString(
    <StaticRouter location="/">
      <LibraryRows items={items} list={list} onAdd={() => {}} onRemove={() => {}} />
    </StaticRouter>,
  );
}

/** Przechodzi po drzewie elementów (bez DOM) i zwraca przyciski o danej etykiecie. */
function findButtons(node: unknown, label: string, out: { onClick: () => void }[] = []) {
  if (!node || typeof node !== 'object') return out;
  const props = (node as { props?: Record<string, unknown> }).props ?? {};
  if (props['aria-label'] === label && typeof props.onClick === 'function') out.push({ onClick: props.onClick as () => void });
  for (const child of [props.children].flat(Infinity)) findButtons(child, label, out);
  return out;
}

describe('okno Dodaj wskaźnik: biblioteka dodaje do „Moich” (QS01)', () => {
  it('klik „Dodaj” wywołuje add z id wskaźnika z biblioteki', () => {
    const onAdd = vi.fn<(id: string) => void>();
    const tree = LibraryRows({ items, list: defaultMyIndicators(), onAdd, onRemove: () => {} });
    const buttons = findButtons(tree, 'Dodaj: Pobrany wskaźnik');
    expect(buttons).toHaveLength(1);
    buttons[0].onClick();
    expect(onAdd).toHaveBeenCalledExactlyOnceWith('b4242');
    const html = render(defaultMyIndicators());
    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('href="/biblioteka/4242"');
  });

  it('już dodany wskaźnik ma stan „Dodano”, przycisk usuń i nie dubluje się', () => {
    const list = addIndicator(defaultMyIndicators(), 'b4242');
    expect(addIndicator(list, 'b4242')).toBe(list);
    const html = render(list);
    expect(html).toContain('Dodano');
    expect(html).toContain('aria-label="Usuń wskaźnik: Pobrany wskaźnik"');
    expect(html).not.toContain('aria-label="Dodaj: Pobrany wskaźnik"');
    expect(html).toContain('href="/biblioteka/4242"');
    const onRemove = vi.fn<(id: string) => void>();
    findButtons(LibraryRows({ items, list, onAdd: () => {}, onRemove }), 'Usuń wskaźnik: Pobrany wskaźnik')[0].onClick();
    expect(onRemove).toHaveBeenCalledWith('b4242');
  });

  it('niepobrany wskaźnik nie jest na liście', () => {
    const ids = libraryPickResults(index, { cat: null, text: 'wskaźnik' }).items.map((v) => String(v.id));
    expect(ids).toEqual(['4242']);
  });
});

import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import indexFixture from "../fixtures/library/index.json" with { type: "json" };
import {
  prepare,
  parseLibraryIndex,
} from "../../src/core/library/index-contract";
import {
  childCategoriesWithData,
  countFetchedByCategory,
  emptyQuery,
  type LibraryIndex,
  type LibraryQuery,
} from "../../src/core/library/query";
import { CategoryTiles } from "../../src/view/library/CategoryTiles";

function loadIndex(mutate?: (raw: typeof indexFixture) => void): LibraryIndex {
  const raw = structuredClone(indexFixture) as typeof indexFixture;
  mutate?.(raw);
  const parsed = parseLibraryIndex(raw);
  if (!parsed) throw new Error("Fixture spisu jest niepoprawny");
  return prepare(parsed);
}

const render = (
  index: LibraryIndex,
  query: LibraryQuery,
  onlyWithData?: boolean,
) =>
  renderToString(
    <CategoryTiles
      index={index}
      query={query}
      onQueryChange={() => {}}
      {...(onlyWithData === undefined ? {} : { onlyWithData })}
    />,
  );

// Plain index (bez prepare) do testów liczby mnogiej: dział z k pobranymi wskaźnikami.
function indexWithFetched(k: number): LibraryIndex {
  return {
    categories: { a: { id: "a", name: "Dział testowy", parent: null } },
    variables: Array.from({ length: k }, (_, i) => ({
      id: 500 + i,
      name: `Wskaźnik ${i}`,
      cat: "a",
      level: 5,
      has: 1,
    })),
  } as unknown as LibraryIndex;
}

describe("QC703 – kafelki działów tylko z pobranymi wskaźnikami", () => {
  it("onlyWithData: działy z pobranymi mają kafelki z liczbą pobranych z fixture’a", () => {
    const index = loadIndex();
    const html = render(index, emptyQuery(), true);
    const counts = countFetchedByCategory(index);
    const roots = childCategoriesWithData(index, null);
    expect(roots.length).toBe(3);
    for (const cat of roots) {
      expect(html).toContain(cat.name);
      const n = counts.get(String(cat.id)) ?? 0;
      expect(n).toBeGreaterThan(0);
      expect(html).toContain(`${n} wskaźniki`);
    }
  });

  it("onlyWithData: dział bez pobranych nie ma kafelka", () => {
    const index = loadIndex((raw) => {
      for (const v of raw.variables) if (v.s === "31") v.has = 0;
    });
    const html = render(index, emptyQuery(), true);
    expect(html).toContain("Ludność");
    expect(html).toContain("Rynek pracy");
    expect(html).not.toContain("Mieszkania");
  });

  it.each([
    [1, "1 wskaźnik<"],
    [3, "3 wskaźniki<"],
    [12, "12 wskaźników<"],
  ])("liczba mnoga: %i pobranych", (k, text) => {
    const html = render(indexWithFetched(k), emptyQuery(), true);
    expect(html).toContain(text);
  });

  it("bez propa zachowanie jak dotąd: kafelki wszystkich działów", () => {
    const index = loadIndex((raw) => {
      for (const v of raw.variables) if (v.s === "31") v.has = 0;
    });
    const html = render(index, emptyQuery());
    expect(html).toContain("Mieszkania");
    expect(html).toContain("Rynek pracy");
  });

  it("klik w kafelek wywołuje callback z id działu", () => {
    const index = loadIndex();
    const onChange = vi.fn<(q: LibraryQuery) => void>();
    const tree = CategoryTiles({
      index,
      query: emptyQuery(),
      onQueryChange: onChange,
      onlyWithData: true,
    });
    const buttons: Array<{
      props: { onClick?: () => void; children?: unknown };
    }> = [];
    const walk = (node: unknown): void => {
      if (!React.isValidElement(node)) {
        if (Array.isArray(node)) node.forEach(walk);
        return;
      }
      const el = node as unknown as {
        type: unknown;
        props: { onClick?: () => void; children?: unknown };
      };
      if (el.type === "button") buttons.push(el);
      walk(el.props.children);
    };
    walk(tree);
    expect(buttons.length).toBeGreaterThan(0);
    buttons[0]!.props.onClick?.();
    const first = childCategoriesWithData(index, null)[0]!;
    expect(onChange).toHaveBeenCalledWith({ ...emptyQuery(), cat: first.id });
  });

  it("pusty wynik po filtrze pokazuje komunikat", () => {
    const index = loadIndex((raw) => {
      for (const v of raw.variables) v.has = 0;
    });
    const html = render(index, emptyQuery(), true);
    expect(html).toContain("Na razie nie ma pobranych wskaźników w tym dziale");
  });
});

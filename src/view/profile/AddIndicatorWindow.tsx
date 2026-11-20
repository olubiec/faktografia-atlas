import { useEffect, useMemo, useState } from "react";
import { NavArrowDown } from "iconoir-react";
import type { ProfileIndicatorItem } from "../../core/profile/profile";
import { prepareLibraryIndex } from "../../core/library/index-contract";
import { loadLibraryIndex } from "../../core/library/load-library";
import { libraryPickCategories } from "../../core/library/picker-results";
import { libraryCounts, type LibraryIndex } from "../../core/library/query";
import { Icon } from "../ui/Icon";
import {
  LibraryBreadcrumbs,
  LibraryResultList,
  LibrarySearchInput,
  LibrarySearchPanel,
  ROW,
} from "./LibrarySearchPanel";

export { LibraryRows } from "./LibrarySearchPanel";
export type { LibraryRowsProps } from "./LibrarySearchPanel";

export interface AddIndicatorWindowProps {
  /** Wskaźniki, których jeszcze nie ma na liście. */
  items: ProfileIndicatorItem[];
  onAdd: (indicatorId: string) => void;
}

export type AddTab = "search" | "categories";

const LIBRARY_KEY = "__library";
const HEADER =
  "w-full min-h-[44px] px-3 py-2 flex items-center justify-between gap-2 text-left text-xs font-bold tracking-wider text-olowek hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer";
const TABS: { id: AddTab; label: string }[] = [
  { id: "search", label: "Szukaj" },
  { id: "categories", label: "Kategorie" },
];

function groupBy(items: ProfileIndicatorItem[]): [string, ProfileIndicatorItem[]][] {
  const groups = new Map<string, ProfileIndicatorItem[]>();
  for (const item of items) {
    const g = item.indicator.group || "Inne";
    groups.set(g, [...(groups.get(g) ?? []), item]);
  }
  return [...groups.entries()];
}

function Header({ label, count, open, onClick }: { label: string; count: number; open: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-expanded={open} onClick={onClick} className={HEADER}>
      <span>{`${label} (${count})`}</span>
      <Icon icon={NavArrowDown} size={16} aria-hidden={true} className={open ? "rotate-180" : ""} />
    </button>
  );
}

/** Pasek zakładek „Szukaj” | „Kategorie” (przełączają się od razu, bez animacji). */
export function AddTabs({ tab, onTab }: { tab: AddTab; onTab: (tab: AddTab) => void }) {
  return (
    <div role="tablist" aria-label="Sposób wyboru wskaźnika" className="flex border-b border-linia">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={tab === t.id}
          onClick={() => onTab(t.id)}
          className={`flex-1 min-h-[44px] px-3 py-2 text-sm text-tusz focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer ${tab === t.id ? "font-bold border-b-2 border-tusz" : "text-olowek"}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Wskaźniki z biblioteki GUS: działy z okruszkami, w środku wyniki (najwyżej 50), wyszukiwanie po tekście. */
export function LibrarySection({ index, initialCat = null }: { index: LibraryIndex; initialCat?: string | null }) {
  const [cat, setCat] = useState<string | null>(initialCat);
  const [text, setText] = useState("");
  const categories = useMemo(() => libraryPickCategories(index), [index]);
  const searching = text.trim() !== "";

  return (
    <div>
      <LibrarySearchInput text={text} onText={setText} />
      {searching ? (
        <LibraryResultList index={index} cat={null} text={text} />
      ) : (
        categories.map((c) => (
          <div key={c.id} className="border-t border-linia/40">
            <Header label={c.name} count={c.count} open={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)} />
            {cat === c.id && (
              <>
                <LibraryBreadcrumbs name={c.name} onAll={() => setCat(null)} />
                <LibraryResultList index={index} cat={c.id} text="" />
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function SearchTab({ index }: { index: LibraryIndex }) {
  const [text, setText] = useState("");
  return <LibrarySearchPanel index={index} text={text} onText={setText} />;
}

export interface AddIndicatorViewProps extends AddIndicatorWindowProps {
  tab: AddTab;
  onTab: (tab: AddTab) => void;
  openKey: string | null;
  onToggle: (key: string) => void;
  library: LibraryIndex | null;
}

/** Widok okna zależny tylko od propsów (stan trzyma `AddIndicatorWindow`). */
export function AddIndicatorView({ items, onAdd, tab, onTab, openKey, onToggle, library }: AddIndicatorViewProps) {
  const groups = useMemo(() => groupBy(items), [items]);
  return (
    <div
      className="mt-3 border border-linia bg-arkusz max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain"
      role="group"
      aria-label="Wskaźniki do dodania"
    >
      <AddTabs tab={tab} onTab={onTab} />
      <div role="tabpanel" aria-label={tab === "search" ? "Szukaj" : "Kategorie"}>
        {tab === "search" ? (
          library ? <SearchTab index={library} /> : <p className="px-3 py-2 text-sm text-olowek">Wczytuję bibliotekę…</p>
        ) : (
          <>
            {groups.map(([name, list]) => (
              <div key={name} className="border-t border-linia/40 first:border-t-0">
                <Header label={name} count={list.length} open={openKey === name} onClick={() => onToggle(name)} />
                {openKey === name &&
                  list.map((item) => (
                    <button key={item.indicatorId} type="button" onClick={() => onAdd(item.indicatorId)} className={ROW}>
                      {`Dodaj: ${item.indicator.name}`}
                    </button>
                  ))}
              </div>
            ))}
            {library && (
              <div className="border-t border-linia/40">
                <Header label="Z biblioteki GUS" count={libraryCounts(library).fetched} open={openKey === LIBRARY_KEY} onClick={() => onToggle(LIBRARY_KEY)} />
                {openKey === LIBRARY_KEY && <LibrarySection index={library} />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Okno dodawania wskaźników do listy: zakładki „Szukaj” i „Kategorie” (domyślnie „Kategorie”).
 * Kategorie: akordeon (jedna naraz), na końcu dział z biblioteki GUS (ładowany po otwarciu okna).
 */
export function AddIndicatorWindow({ items, onAdd }: AddIndicatorWindowProps) {
  const [tab, setTab] = useState<AddTab>("categories");
  const [openKey, setOpenKey] = useState<string | null>(() => groupBy(items)[0]?.[0] ?? null);
  const [library, setLibrary] = useState<LibraryIndex | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadLibraryIndex().then((raw) => {
      const prepared = raw ? prepareLibraryIndex(raw) : null;
      if (!cancelled && prepared) setLibrary(prepared);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (key: string) => setOpenKey((cur) => (cur === key ? null : key));

  return <AddIndicatorView items={items} onAdd={onAdd} tab={tab} onTab={setTab} openKey={openKey} onToggle={toggle} library={library} />;
}

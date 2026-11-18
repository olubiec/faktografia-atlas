import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { NavArrowDown } from "iconoir-react";
import type { ProfileIndicatorItem } from "../../core/profile/profile";
import { prepareLibraryIndex } from "../../core/library/index-contract";
import { loadLibraryIndex } from "../../core/library/load-library";
import {
  LIBRARY_PICK_LIMIT,
  libraryPickCategories,
  libraryPickResults,
} from "../../core/library/picker-results";
import { libraryCounts, type LibraryIndex } from "../../core/library/query";
import { Icon } from "../ui/Icon";

export interface AddIndicatorWindowProps {
  /** Wskaźniki, których jeszcze nie ma na liście. */
  items: ProfileIndicatorItem[];
  onAdd: (indicatorId: string) => void;
}

const LIBRARY_KEY = "__library";
const HEADER =
  "w-full min-h-[44px] px-3 py-2 flex items-center justify-between gap-2 text-left text-xs font-bold tracking-wider text-olowek hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer";
const ROW =
  "block w-full min-h-[44px] px-3 py-2 text-left text-sm text-tusz hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer";

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

/** Wskaźniki z biblioteki GUS: działy, w środku wyniki (najwyżej 50), wyszukiwanie po tekście. */
function LibrarySection({ index }: { index: LibraryIndex }) {
  const [cat, setCat] = useState<string | null>(null);
  const [text, setText] = useState("");
  const categories = useMemo(() => libraryPickCategories(index), [index]);
  const searching = text.trim() !== "";
  const results = useMemo(
    () => (searching || cat !== null ? libraryPickResults(index, { cat: searching ? null : cat, text }) : null),
    [index, cat, text, searching],
  );

  const list = results && (
    <div aria-label="Wskaźniki z biblioteki">
      {results.items.map((v) => (
        <Link key={String(v.id)} to={`/biblioteka/${v.id}`} className={ROW}>
          {`Otwórz: ${v.name}`}
        </Link>
      ))}
      {results.total === 0 && <p className="px-3 py-2 text-sm text-olowek">Brak wyników.</p>}
      {results.total > LIBRARY_PICK_LIMIT && (
        <p className="px-3 py-2 text-xs text-olowek">{`Pokazano ${LIBRARY_PICK_LIMIT} z ${results.total}. Zawęź wyszukiwanie.`}</p>
      )}
    </div>
  );

  return (
    <div>
      <div className="px-3 py-2">
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Szukaj w bibliotece…"
          aria-label="Szukaj w bibliotece"
          className="w-full min-h-[44px] bg-transparent border border-linia px-2 text-sm text-tusz placeholder:text-olowek focus:outline-none focus:ring-2 focus:ring-tusz"
        />
      </div>
      {searching
        ? list
        : categories.map((c) => (
            <div key={c.id} className="border-t border-linia/40">
              <Header label={c.name} count={c.count} open={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)} />
              {cat === c.id && list}
            </div>
          ))}
    </div>
  );
}

/**
 * Okno dodawania wskaźników do listy: przewijane, podzielone na kategorie.
 * Kliknięcie kategorii rozwija ją (jedna naraz), a wybór wskaźnika jest w jej wnętrzu.
 * Na końcu osobna kategoria z biblioteki GUS (ładowana po otwarciu okna).
 */
export function AddIndicatorWindow({ items, onAdd }: AddIndicatorWindowProps) {
  const groups = useMemo(() => groupBy(items), [items]);
  const [openKey, setOpenKey] = useState<string | null>(groups[0]?.[0] ?? null);
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

  return (
    <div
      className="mt-3 border border-linia bg-arkusz max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain"
      role="group"
      aria-label="Wskaźniki do dodania"
    >
      {groups.map(([name, list]) => (
        <div key={name} className="border-t border-linia/40 first:border-t-0">
          <Header label={name} count={list.length} open={openKey === name} onClick={() => toggle(name)} />
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
          <Header label="Z biblioteki GUS" count={libraryCounts(library).fetched} open={openKey === LIBRARY_KEY} onClick={() => toggle(LIBRARY_KEY)} />
          {openKey === LIBRARY_KEY && <LibrarySection index={library} />}
        </div>
      )}
    </div>
  );
}

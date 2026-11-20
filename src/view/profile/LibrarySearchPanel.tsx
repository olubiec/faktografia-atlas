import { useMemo } from "react";
import { Link } from "react-router";
import { LIBRARY_PICK_LIMIT, libraryPickResults } from "../../core/library/picker-results";
import type { LibraryIndex } from "../../core/library/query";
import { libraryIndicatorId } from "../../core/indicators/registry";
import { useMyIndicators } from "../hooks/useMyIndicators";
import { OrderTopicButton } from "../library/OrderTopicButton";

export const ROW =
  "block w-full min-h-[44px] px-3 py-2 text-left text-sm text-tusz hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer";
const SIDE_ACTION =
  "min-h-[44px] min-w-[44px] px-3 py-2 flex items-center justify-center text-sm text-tusz hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer";

export interface LibraryRowsProps {
  items: { id: string | number; name: string }[];
  /** Id wskaźników już na liście „Moje”. */
  list: readonly string[];
  onAdd: (indicatorId: string) => void;
  onRemove: (indicatorId: string) => void;
}

/** Wiersze pobranych wskaźników z biblioteki: Dodaj / Dodano + usuń, link do strony wskaźnika jako druga akcja. */
export function LibraryRows({ items, list, onAdd, onRemove }: LibraryRowsProps) {
  return (
    <>
      {items.map((v) => {
        const id = libraryIndicatorId(v.id);
        const added = list.includes(id);
        return (
          <div key={id} className="flex items-stretch">
            <Link to={`/biblioteka/${v.id}`} className={`${ROW} flex-1`}>
              {`Otwórz: ${v.name}`}
            </Link>
            {added ? (
              <>
                <span className="min-h-[44px] px-3 flex items-center text-sm text-olowek">Dodano</span>
                <button type="button" aria-label={`Usuń wskaźnik: ${v.name}`} onClick={() => onRemove(id)} className={SIDE_ACTION}>
                  Usuń
                </button>
              </>
            ) : (
              <button type="button" aria-label={`Dodaj: ${v.name}`} onClick={() => onAdd(id)} className={SIDE_ACTION}>
                Dodaj
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}

/** Pole szukania w bibliotece (jedno źródło dla zakładki „Szukaj” i działu „Z biblioteki GUS”). */
export function LibrarySearchInput({ text, onText }: { text: string; onText: (text: string) => void }) {
  return (
    <div className="px-3 py-2">
      <input
        type="search"
        value={text}
        onChange={(e) => onText(e.target.value)}
        placeholder="Szukaj w bibliotece…"
        aria-label="Szukaj w bibliotece"
        className="w-full min-h-[44px] bg-transparent border border-linia px-2 text-sm text-tusz placeholder:text-olowek focus:outline-none focus:ring-2 focus:ring-tusz"
      />
    </div>
  );
}

export interface LibraryResultListProps {
  index: LibraryIndex;
  /** Wybrany dział (null przy szukaniu po tekście). */
  cat: string | null;
  text: string;
}

/** Wyniki z biblioteki (najwyżej 50), komunikat limitu i komunikat o braku wyniku z zamówieniem tematu. */
export function LibraryResultList({ index, cat, text }: LibraryResultListProps) {
  const { list: mine, add, remove } = useMyIndicators();
  const results = useMemo(() => libraryPickResults(index, { cat, text }), [index, cat, text]);
  return (
    <div aria-label="Wskaźniki z biblioteki">
      <LibraryRows items={results.items} list={mine} onAdd={add} onRemove={remove} />
      {results.total === 0 && (
        <div className="px-3 py-2 flex flex-col gap-2">
          <p role="status" className="text-sm text-olowek m-0">Nie ma takiego wskaźnika z danymi.</p>
          <OrderTopicButton topic={text} />
        </div>
      )}
      {results.total > LIBRARY_PICK_LIMIT && (
        <p className="px-3 py-2 text-xs text-olowek">{`Pokazano ${LIBRARY_PICK_LIMIT} z ${results.total}. Zawęź wyszukiwanie.`}</p>
      )}
    </div>
  );
}

/** Zakładka „Szukaj”: samo pole i wyniki, bez akordeonu działów. */
export function LibrarySearchPanel({ index, text, onText }: { index: LibraryIndex; text: string; onText: (text: string) => void }) {
  return (
    <div>
      <LibrarySearchInput text={text} onText={onText} />
      {text.trim() !== "" && <LibraryResultList index={index} cat={null} text={text} />}
    </div>
  );
}

/** Okruszki w dziale biblioteki: „Wszystkie” (zwija dział) › nazwa działu. */
export function LibraryBreadcrumbs({ name, onAll }: { name: string; onAll: () => void }) {
  return (
    <nav aria-label="Okruszki" className="px-3 flex flex-wrap items-center gap-1 text-xs text-olowek">
      <button type="button" onClick={onAll} className="min-h-[44px] pr-1 underline text-tusz focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer">
        Wszystkie
      </button>
      <span aria-hidden="true">›</span>
      <span aria-current="page">{name}</span>
    </nav>
  );
}

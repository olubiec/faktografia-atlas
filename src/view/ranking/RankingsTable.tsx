import { Link } from 'react-router';
import { BUTTON_SECONDARY } from '@/view/start/ListPodium';

export interface RankingsTableRow {
  teryt: string;
  pos: number;
  name: string;
  /** Województwo (dla powiatów i gmin). */
  region: string;
  valueText: string;
  href: string;
}

export interface RankingsTableProps {
  rows: RankingsTableRow[];
  page: number;
  pages: number;
  total: number;
  q: string;
  onQuery: (q: string) => void;
  onPage: (p: number) => void;
  unitLabel: string;
}

/** Pełna lista rankingu: szukajka po nazwie, wiersze z miejscem, nazwą i wartością (klik = mapa), numeracja stron pod tabelą. */
export function RankingsTable({ rows, page, pages, total, q, onQuery, onPage, unitLabel }: RankingsTableProps) {
  return (
    <section aria-labelledby="lista-jednostek" data-slot="rankings-list">
      <h2 id="lista-jednostek" className="mb-2 text-xl font-semibold">Lista jednostek</h2>
      <input
        type="search"
        aria-label="Szukaj jednostki"
        placeholder="Szukaj jednostki…"
        value={q}
        onChange={(e) => onQuery(e.target.value)}
        className="mb-4 min-h-[44px] w-full border border-linia bg-arkusz p-2 text-tusz"
      />
      {rows.length === 0 ? (
        <p role="status" className="text-sm text-olowek">Brak jednostek do pokazania.</p>
      ) : (
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <caption className="sr-only">{`Zestawienie: ${total} jednostek`}</caption>
          <thead>
            <tr className="border-b border-linia text-olowek">
              <th scope="col" className="w-20 py-2 pr-2 font-normal">Miejsce</th>
              <th scope="col" className="py-2 pr-2 font-normal">Jednostka</th>
              <th scope="col" className="w-28 py-2 text-right font-normal md:w-44">{unitLabel || 'Wartość'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.teryt} className="border-b border-linia">
                <td className="py-2 pr-2 font-mono tabular-nums text-olowek">{r.pos}</td>
                <td className="min-w-0 break-words p-0 pr-2">
                  <Link to={r.href} data-slot="rankings-row" className="flex min-h-[44px] flex-col justify-center py-1 text-tusz no-underline hover:underline">
                    <span>{r.name}</span>
                    {r.region && <span className="text-xs text-olowek">{r.region}</span>}
                  </Link>
                </td>
                <td className="break-words py-2 text-right font-mono tabular-nums">{r.valueText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {pages > 1 && (
        <nav aria-label="Strony listy" className="mt-6 flex flex-wrap items-center gap-3" data-slot="rankings-pager">
          <button type="button" className={BUTTON_SECONDARY} disabled={page <= 1} onClick={() => onPage(page - 1)}>Poprzednia</button>
          <span className="text-sm text-olowek">{`${page} z ${pages}`}</span>
          <button type="button" className={BUTTON_SECONDARY} disabled={page >= pages} onClick={() => onPage(page + 1)}>Następna</button>
        </nav>
      )}
    </section>
  );
}

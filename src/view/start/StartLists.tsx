import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import type { ListView } from '@/core/start/discoveries';

export interface StartListsProps {
  lists: ListView[];
  to: (href: string) => string;
  onWarm?: () => void;
}

/** „Zestawienia”: 4 krótkie listy (3 pozycje) i link do mapy z tym wskaźnikiem; przed pobraniem danych sam tytuł i link. */
export function StartLists({ lists, to, onWarm }: StartListsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {lists.map((l) => (
        <article key={l.key} data-slot="start-list" className="flex min-w-0 flex-col gap-3 border border-linia bg-arkusz p-4">
          <div className="flex flex-col gap-1">
            <h4 className="m-0 text-md font-bold leading-tight text-tusz break-words">{l.title}</h4>
            {l.subtitle && <p className="m-0 text-xs text-olowek">{l.subtitle}</p>}
          </div>
          {l.rows.length === 0 && <p className="m-0 text-sm text-olowek" role="status">Wczytujemy pozycje…</p>}
          <ol className="m-0 flex list-none flex-col p-0" hidden={l.rows.length === 0}>
            {l.rows.map((r, i) => (
              <li key={r.teryt} className="border-t border-linia text-sm text-tusz">
                <Link
                  to={to(r.href)}
                  data-slot="start-list-row"
                  className="flex min-h-[44px] min-w-0 items-start gap-3 py-2 text-tusz no-underline hover:bg-linia/15 focus-visible:outline-2 focus-visible:outline-tusz"
                  onPointerEnter={onWarm}
                  onTouchStart={onWarm}
                  onFocus={onWarm}
                >
                  <span className="w-4 shrink-0 font-mono text-xs text-olowek">{i + 1}</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="leading-tight [overflow-wrap:normal] [word-break:normal] hyphens-none" data-slot="start-list-name">{r.name}</span>
                    <span className="font-mono text-xs tabular-nums text-olowek">{r.value}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <Button asChild variant="secondary" className="mt-auto self-start">
            <Link to={to(l.href)} aria-label={`Zobacz na mapie: ${l.title}`} onPointerEnter={onWarm} onTouchStart={onWarm} onFocus={onWarm}>
              Zobacz na mapie
            </Link>
          </Button>
        </article>
      ))}
    </div>
  );
}

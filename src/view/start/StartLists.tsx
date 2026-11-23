import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import type { ListView } from '@/core/start/discoveries';

export interface StartListsProps {
  lists: ListView[];
  to: (href: string) => string;
  onWarm?: () => void;
}

/** „Zestawienia”: 4 krótkie listy (3 pozycje) i link do mapy z tym wskaźnikiem. */
export function StartLists({ lists, to, onWarm }: StartListsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {lists.map((l) => (
        <article key={l.key} data-slot="start-list" className="flex min-w-0 flex-col gap-3 border border-linia bg-arkusz p-4">
          <div className="flex flex-col gap-1">
            <h4 className="m-0 text-md font-bold leading-tight text-tusz break-words">{l.title}</h4>
            <p className="m-0 text-xs text-olowek">{l.subtitle}</p>
          </div>
          <ol className="m-0 flex list-none flex-col p-0">
            {l.rows.map((r, i) => (
              <li key={r.teryt} className="flex min-w-0 items-baseline gap-3 border-t border-linia py-2 text-sm text-tusz">
                <span className="w-4 shrink-0 font-mono text-xs text-olowek">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate" title={r.name}>{r.name}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums">{r.value}</span>
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

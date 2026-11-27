import { NavArrowLeft, NavArrowRight } from 'iconoir-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon } from '@/view/ui/Icon';
import type { ListView } from '@/core/start/discoveries';
import { END_KEYS, END_LABELS, type EndKey } from '@/core/start/list-ends';

export const TEXT_LINK =
  'inline-flex min-h-[44px] min-w-11 items-center self-start text-sm text-tusz underline underline-offset-4 break-words hover:no-underline focus-visible:outline-2 focus-visible:outline-tusz';
const BUTTON = 'inline-flex min-h-[44px] min-w-11 items-center justify-center border border-tusz px-4 py-2 text-sm font-bold no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tusz';
/** Główny przycisk (pełny) i drugi (obrys): oba pola dotykowe ≥ 44 px, jak przyciski na stronach zestawień. */
export const BUTTON_PRIMARY = `${BUTTON} bg-tusz text-arkusz hover:bg-tusz/90`;
export const BUTTON_SECONDARY = `${BUTTON} bg-arkusz text-tusz hover:bg-linia/20`;
const SIDE = 'hidden min-h-[44px] w-11 shrink-0 cursor-pointer items-center justify-center self-center border border-linia bg-arkusz text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz disabled:cursor-default disabled:text-olowek disabled:opacity-40 disabled:hover:bg-arkusz md:flex';
const ROW = 'flex min-h-[44px] min-w-0 items-center gap-3 py-2 text-tusz no-underline hover:bg-linia/15 focus-visible:outline-2 focus-visible:outline-tusz';

/** Wiersz podium: miejsce, nazwa i wartość pod nazwą; wszystkie wiersze w jednym rozmiarze (o kolejności mówi numer). */
function RowBody({ rank, name, value }: { rank: number; name: string; value: string }) {
  return (
    <>
      <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-olowek">{rank}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm leading-tight text-tusz [overflow-wrap:normal] [word-break:normal] hyphens-none" data-slot="start-list-name">
          {name}
        </span>
        <span className="font-mono text-xs tabular-nums text-olowek">{value}</span>
      </span>
    </>
  );
}

export interface ListPodiumProps {
  list: ListView;
  /** Zestawienie z aktywnego slajdu: tylko ono ma linki (pozostałe slajdy nie mają niewidocznych pól dotykowych). */
  active: boolean;
  /** Kierunek wybrany przez użytkownika (obowiązuje na wszystkich slajdach); null = kierunek redakcyjny zestawienia. */
  end: EndKey | null;
  onEnd: (end: EndKey) => void;
  to: (href: string) => string;
  warm: { onPointerEnter?: () => void; onTouchStart?: () => void; onFocus?: () => void };
  /** Przełącznik poziomu (Województwa / Powiaty / Gminy), obok „Najwyższe | Najniższe”. */
  levelSwitch?: ReactNode;
  /** Strzałki po bokach pozycji (komputer); brak = bez strzałek. Poza krańcami paska są wyłączone. */
  side?: { hasPrev: boolean; hasNext: boolean; onPrev: () => void; onNext: () => void };
}

/**
 * Jedno zestawienie: przełącznik „Najwyższe | Najniższe” (gdy plik ma oba końce skali), podium 5 miejsc
 * (wiersz prowadzi do profilu jednostki), link do mapy i do pełnego zestawienia w wybranym kierunku.
 */
export function ListPodium({ list: l, active, end, onEnd, to, warm, levelSwitch, side }: ListPodiumProps) {
  const key = l.ends ? (end ?? l.ends.initial) : null;
  const shown = key && l.ends ? l.ends[key] : { subtitle: l.subtitle, rows: l.rows, full: l.full ?? null };
  return (
    <article data-slot="start-list" className="flex min-w-0 flex-col gap-3 border border-t-0 border-linia bg-arkusz p-4 md:p-6">
      {/* Nazwa jest na pasku wskaźników; nagłówek zostaje dla czytników ekranu. */}
      <h4 className="sr-only">{l.title}</h4>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      {levelSwitch}
      {key && (
        <div role="group" aria-label="Który koniec skali" className="flex self-start border border-linia" data-slot="start-list-ends">
          {END_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={k === key}
              onClick={() => onEnd(k)}
              className={`min-h-[44px] min-w-11 cursor-pointer px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tusz ${k === key ? 'bg-tusz font-bold text-arkusz' : 'bg-arkusz text-tusz hover:bg-linia/20'}`}
            >
              {END_LABELS[k]}
            </button>
          ))}
        </div>
      )}
      </div>
      {shown.subtitle && (
        <p className="m-0 text-xs text-olowek" aria-live="polite" data-slot="start-list-subtitle">
          {shown.subtitle}
        </p>
      )}
      {shown.rows.length === 0 && (
        <p className="m-0 text-sm text-olowek" role="status">
          Wczytujemy pozycje…
        </p>
      )}
      <div className="flex items-stretch gap-3">
      {side && (
        <button type="button" className={SIDE} disabled={!side.hasPrev} onClick={side.onPrev} aria-label="Poprzednie zestawienie" data-slot="start-list-prev">
          <Icon icon={NavArrowLeft} aria-hidden={true} size={20} />
        </button>
      )}
      <ol className="m-0 flex min-w-0 flex-1 list-none flex-col p-0" hidden={shown.rows.length === 0}>
        {shown.rows.map((r, i) => (
          <li key={r.teryt} className="border-t border-linia text-tusz first:border-t-0">
            {active ? (
              <Link to={to(r.href)} data-slot="start-list-row" className={ROW} {...warm}>
                <RowBody rank={i + 1} name={r.name} value={r.value} />
              </Link>
            ) : (
              <div className={ROW}>
                <RowBody rank={i + 1} name={r.name} value={r.value} />
              </div>
            )}
          </li>
        ))}
      </ol>
      {side && (
        <button type="button" className={SIDE} disabled={!side.hasNext} onClick={side.onNext} aria-label="Następne zestawienie" data-slot="start-list-next">
          <Icon icon={NavArrowRight} aria-hidden={true} size={20} />
        </button>
      )}
      </div>
      {active && (
        <>
          {/* Plik bez drugiego końca skali (starszy facts-start.json): zamiast przełącznika link do odwrotnego zestawienia. */}
          {!key && l.opposite && (
            <p className="m-0 flex flex-col gap-0 border-t border-linia pt-3 text-xs text-olowek" data-slot="start-list-opposite">
              Na drugim końcu skali
              <a href={l.opposite.href} className={`${TEXT_LINK} font-bold`}>
                {l.opposite.label}
              </a>
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to={to(l.href)} aria-label={`Zobacz na mapie: ${l.title}`} className={BUTTON_PRIMARY} data-slot="start-list-map" {...warm}>
              Zobacz na mapie
            </Link>
            {shown.full && (
              <a href={shown.full.href} aria-label={`${shown.full.ranking ? 'Pełny ranking' : 'Pełne zestawienie'}: ${shown.full.label}`} className={BUTTON_SECONDARY} data-slot="start-list-full">
                {shown.full.ranking ? 'Pełny ranking' : 'Pełne zestawienie'}
              </a>
            )}
          </div>
        </>
      )}
    </article>
  );
}

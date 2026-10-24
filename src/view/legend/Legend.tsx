import type { LegendItem } from '../../core/legend/legend';
import { LEGEND_DIRECTION_LABEL } from '../../core/legend/legend';

export interface LegendProps {
  items: LegendItem[];
  title?: string;
  className?: string;
}

/**
 * Komponent legendy kartogramu.
 * Prezentuje podział na klasy kolorów z odpowiednimi etykietami.
 * Spełnia wymagania dostępności (role="list", role="listitem", etykiety tekstowe)
 * oraz stylistyki projektu (tło arkusz, ramka 1 px linia, brak hexów).
 */
export function Legend({ items, title, className = '' }: LegendProps) {
  return (
    <div
      className={`bg-arkusz border border-linia p-3 sm:p-4 text-tusz max-w-xs ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        {title ? (
          <h4 className="text-xs font-bold text-olowek uppercase tracking-wider truncate">
            {title}
          </h4>
        ) : (
          <span />
        )}
        <span className="text-xs text-olowek font-medium shrink-0">
          {LEGEND_DIRECTION_LABEL}
        </span>
      </div>
      <ul role="list" className="space-y-1.5">
        {items.map((item, index) => (
          <li
            key={`${item.token}-${index}`}
            role="listitem"
            className="flex items-center gap-2.5 text-xs min-w-0"
          >
            <span
              className="w-4 h-4 border border-linia shrink-0"
              style={{ backgroundColor: `var(${item.token})` }}
              aria-hidden="true"
            />
            <span className="truncate text-tusz font-mono font-medium">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

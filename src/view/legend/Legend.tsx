import { LEGEND_DIRECTION_LABEL, type LegendItem } from '../../core/legend/legend';

export interface LegendProps {
  items: LegendItem[];
  title?: string;
  className?: string;
  showDirection?: boolean;
}

/**
 * Komponent legendy kartogramu.
 * Prezentuje podział na klasy kolorów z odpowiednimi etykietami.
 * Spełnia wymagania dostępności (role="list", role="listitem", etykiety tekstowe)
 * oraz stylistyki projektu (tło arkusz, ramka 1 px linia, brak hexów).
 */
export function Legend({ items, title, className = '', showDirection = true }: LegendProps) {
  return (
    <div
      className={`bg-arkusz border border-linia p-3 sm:p-4 text-tusz max-w-xs ${className}`.trim()}
    >
      {title && (
        <h4 className="text-xs font-bold text-olowek uppercase tracking-wider mb-2.5 truncate">
          {title}
        </h4>
      )}
      {showDirection && (
        <p className="text-xs text-olowek mb-2">
          {LEGEND_DIRECTION_LABEL}
        </p>
      )}
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

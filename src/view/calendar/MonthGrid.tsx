import { dayMarks } from '@/core/calendar/days';
import { monthGrid, WEEKDAYS } from '@/core/calendar/month';
import type { KalendariumDni } from '@/core/calendar/types';
import { cn } from '@/lib/utils';

interface MonthGridProps {
  month: string;
  today: string;
  selected: string | null;
  data: KalendariumDni | null;
  onSelect: (iso: string) => void;
}

/** Znacznik z liczbą: kolor niesie znaczenie, ale liczba i kształt też (nie tylko kolor). */
function Mark({ tone, children }: { tone: string; children: string }) {
  return <span className={cn('inline-flex min-w-4 items-center justify-center px-1 text-xs font-[700] leading-[1.3]', tone)}>{children}</span>;
}

/** Siatka miesiąca Pn–Nd; każdy dzień to przycisk ≥ 44 px, dziś ma ramkę, wybrany ma ciemne tło. */
export function MonthGrid({ month, today, selected, data, onSelect }: MonthGridProps) {
  const weeks = monthGrid(month);
  return (
    <div role="grid" aria-label="Kalendarz miesięczny" className="border border-linia bg-arkusz">
      <div role="row" className="grid grid-cols-7 border-b border-linia">
        {WEEKDAYS.map((w) => (
          <div key={w} role="columnheader" className="py-2 text-center text-xs font-[700] text-olowek">
            {w}
          </div>
        ))}
      </div>
      {weeks.map((week) => (
        <div role="row" key={week[0].iso} className="grid grid-cols-7">
          {week.map((c) => {
            const m = dayMarks(data, c.iso);
            const isSel = c.iso === selected;
            const label = [
              c.iso,
              c.iso === today ? 'dziś' : '',
              m.publications ? `publikacje GUS: ${m.publications}` : '',
              m.downloaded ? `pobrane: ${m.downloaded}` : '',
              m.media ? 'pomysł na media' : '',
            ]
              .filter(Boolean)
              .join(', ');
            return (
              <div role="gridcell" key={c.iso} className="border-b border-r border-linia p-0 last:border-r-0">
                <button
                  type="button"
                  data-day={c.iso}
                  aria-label={label}
                  aria-pressed={isSel}
                  aria-current={c.iso === today ? 'date' : undefined}
                  onClick={() => onSelect(c.iso)}
                  className={cn(
                    'flex min-h-[64px] min-w-[44px] w-full flex-col items-center gap-1 px-0.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-tusz motion-safe:transition-colors motion-safe:duration-150',
                    isSel ? 'bg-tusz text-arkusz' : c.inMonth ? 'bg-arkusz text-tusz hover:bg-kalka' : 'bg-kalka text-olowek hover:bg-arkusz',
                  )}
                >
                  <span className={cn('inline-flex min-h-6 min-w-6 items-center justify-center font-[600]', c.iso === today && 'border-2 border-korekta-tekst px-1')}>
                    {c.day}
                  </span>
                  <span className="flex flex-wrap items-center justify-center gap-0.5" aria-hidden="true">
                    {m.publications > 0 && <Mark tone={isSel ? 'border-2 border-arkusz' : 'bg-tusz text-arkusz'}>{String(m.publications)}</Mark>}
                    {m.downloaded > 0 && <Mark tone={isSel ? 'border-2 border-ochra' : 'border-2 border-ochra text-tusz'}>{String(m.downloaded)}</Mark>}
                    {m.media > 0 && <Mark tone={isSel ? 'text-sm' : 'text-korekta-tekst text-sm'}>★</Mark>}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

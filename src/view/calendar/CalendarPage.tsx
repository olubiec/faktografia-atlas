import { useSearchParams } from 'react-router';
import { isIsoDay, monthOf, monthTitle, parseMonth, shiftMonth } from '@/core/calendar/month';
import { SiteLayout } from '../layout/SiteLayout';
import { DayPanel } from './DayPanel';
import { MonthGrid } from './MonthGrid';
import { useKalendarium } from './useKalendarium';

const BTN = 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-linia bg-arkusz px-3 text-sm font-[600] hover:border-tusz focus:outline-none focus:ring-2 focus:ring-tusz motion-safe:transition-colors motion-safe:duration-150';

/** Dzisiejsza data lokalnie (RRRR-MM-DD). */
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function Legend() {
  return (
    <ul className="mt-3 flex flex-col gap-2 text-sm leading-[1.6] sm:flex-row sm:flex-wrap sm:gap-x-6" aria-label="Legenda">
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-flex min-w-6 items-center justify-center bg-tusz px-1 text-xs font-[700] text-arkusz">2</span>
        GUS publikuje (liczba publikacji)
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-flex min-w-6 items-center justify-center border-2 border-ochra px-1 text-xs font-[700]">5</span>
        pobraliśmy (liczba zmiennych)
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-flex min-w-6 items-center justify-center text-sm font-[700] text-korekta-tekst">★</span>
        jest pomysł na media
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-flex min-w-6 items-center justify-center border-2 border-korekta-tekst px-1 text-xs font-[700]">7</span>
        dziś
      </li>
    </ul>
  );
}

/** Strona /kalendarium: klikalny miesięczny kalendarz publikacji GUS i naszych pobrań. Poza indeksem Google. */
export function CalendarPage() {
  const [params, setParams] = useSearchParams();
  const today = localToday();
  const selected = isIsoDay(params.get('d')) ? params.get('d') : null;
  const month = parseMonth(params.get('m')) ? (params.get('m') as string) : selected ? monthOf(selected) : monthOf(today);
  const state = useKalendarium();
  const data = state.status === 'ready' ? state.data : null;

  const update = (m: string, d: string | null) => {
    const next = new URLSearchParams();
    next.set('m', m);
    if (d) next.set('d', d);
    setParams(next, { replace: true });
  };

  return (
    <SiteLayout
      className="mx-auto w-full max-w-4xl p-4 pb-24 md:p-8 md:pb-32"
      meta={{ title: 'Kalendarium danych', description: 'Co GUS publikuje w kolejnych dniach i co już pobraliśmy.', noindex: true }}
    >
      <h1 className="text-3xl font-[800] leading-[1.05] tracking-[-0.02em]">Kalendarium danych</h1>
      <p className="mt-2 text-sm leading-[1.6]">Kliknij dzień, żeby zobaczyć, co GUS wtedy publikuje, co pobieramy i jaki jest pomysł na materiał.</p>
      <Legend />

      {state.status === 'error' && (
        <p role="alert" className="mt-4 border border-korekta-tekst bg-arkusz p-4 text-sm leading-[1.6]">
          Nie udało się pobrać danych kalendarza. Sprawdź połączenie z internetem i odśwież stronę. Sam kalendarz poniżej działa, ale dni są puste.
        </p>
      )}
      {state.status === 'loading' && <p role="status" className="mt-4 text-sm text-olowek">Wczytuję dane kalendarza…</p>}

      <div className="mt-4 flex items-center justify-between gap-2">
        <button type="button" className={BTN} onClick={() => update(shiftMonth(month, -1), null)} aria-label="Poprzedni miesiąc">
          ‹ Poprzedni
        </button>
        <h2 className="text-center text-lg font-[700] capitalize leading-[1.3]" aria-live="polite">
          {monthTitle(month)}
        </h2>
        <button type="button" className={BTN} onClick={() => update(shiftMonth(month, 1), null)} aria-label="Następny miesiąc">
          Następny ›
        </button>
      </div>

      <div className="mt-3">
        <MonthGrid month={month} today={today} selected={selected} data={data} onSelect={(iso) => update(monthOf(iso) === month ? month : monthOf(iso), iso)} />
      </div>
      {selected ? (
        <DayPanel iso={selected} data={data} />
      ) : (
        <p className="mt-4 text-sm leading-[1.6] text-olowek">Wybierz dzień w kalendarzu.</p>
      )}
      {data && <p className="mt-4 text-xs leading-[1.6] text-olowek">Dane z dnia {data.updated}. Odświeża je robot raz dziennie.</p>}
    </SiteLayout>
  );
}

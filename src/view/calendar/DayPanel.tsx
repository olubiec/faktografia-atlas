import { dayData, plural } from '@/core/calendar/days';
import { dayTitle } from '@/core/calendar/month';
import type { DayItem, DayPublication, KalendariumDni } from '@/core/calendar/types';

const LINK = 'inline-flex min-h-[44px] items-center font-[600] underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-tusz';

/** Stan zmiennej zwykłym językiem, z datą tam, gdzie ją znamy. */
function stateText(i: DayItem): string {
  if (i.state === 'downloaded') return i.on ? `pobrane ${i.on}` : 'pobrane';
  if (i.state === 'waiting') return i.on ? `czeka na BDL od ${i.on}` : 'czeka na BDL';
  return 'zaplanowane';
}

function counts(p: DayPublication): string {
  const { downloaded: d, waiting: w, planned: z } = p.counts;
  const parts = [
    d ? `${d} ${plural(d, 'pobrana', 'pobrane', 'pobranych')}` : '',
    w ? `${w} ${plural(w, 'czeka na BDL', 'czekają na BDL', 'czeka na BDL')}` : '',
    z ? `${z} ${plural(z, 'zaplanowana', 'zaplanowane', 'zaplanowanych')}` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : 'nic do pobrania';
}

function Downloads({ pub }: { pub: DayPublication }) {
  const total = pub.counts.downloaded + pub.counts.waiting + pub.counts.planned;
  return (
    <li className="border border-linia bg-arkusz p-4">
      <p className="text-sm font-[700] leading-[1.3]">{pub.title}</p>
      <p className="mt-1 text-sm leading-[1.6]">
        {total} {plural(total, 'zmienna', 'zmienne', 'zmiennych')}: {counts(pub)}.
      </p>
      {pub.items.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm leading-[1.6]">
          {pub.items.map((i) => (
            <li key={`${i.name}-${i.state}`}>
              {i.mapUrl ? (
                <a className="font-[600] underline underline-offset-4" href={i.mapUrl}>
                  {i.name}
                </a>
              ) : (
                <span className="font-[600]">{i.name}</span>
              )}{' '}
              <span className="text-olowek">({stateText(i)})</span>
            </li>
          ))}
          {pub.more ? <li className="text-olowek">i {pub.more} więcej</li> : null}
        </ul>
      )}
    </li>
  );
}

/** Panel szczegółów dnia: co GUS publikuje, co pobieramy, pomysł na media. Proste zdania, bez żargonu. */
export function DayPanel({ iso, data }: { iso: string; data: KalendariumDni | null }) {
  const day = dayData(data, iso);
  const withItems = day.publications.filter((p) => p.counts.downloaded + p.counts.waiting + p.counts.planned > 0);
  const empty = day.publications.length === 0 && day.media.length === 0;
  return (
    <section aria-labelledby="day-title" data-testid="day-panel" className="mt-4 border border-tusz bg-arkusz p-4 md:p-6">
      <h2 id="day-title" className="text-lg font-[700] leading-[1.3]">
        {dayTitle(iso)}
      </h2>
      {empty && <p className="mt-3 text-sm leading-[1.6]">Tego dnia nic nie zapisaliśmy: GUS nie ma zapowiedzianych publikacji ani pomysłów na media.</p>}

      {day.publications.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-[700] leading-[1.3]">GUS publikuje</h3>
          <ul className="mt-2 space-y-1">
            {day.publications.map((p) => (
              <li key={p.gusUrl}>
                <a className={LINK} href={p.gusUrl} target="_blank" rel="noopener noreferrer">
                  {p.title} (stat.gov.pl)
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {withItems.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-[700] leading-[1.3]">Co pobieramy / pobraliśmy</h3>
          <ul className="mt-2 space-y-3">
            {withItems.map((p) => (
              <Downloads key={p.gusUrl} pub={p} />
            ))}
          </ul>
        </div>
      )}

      {day.media.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-[700] leading-[1.3]">Pomysł na media w dniu premiery</h3>
          <ul className="mt-2 space-y-3">
            {day.media.map((m) => (
              <li key={m.mapUrl} className="border border-linia bg-kalka p-4">
                <p className="text-sm leading-[1.6]">{m.sentence}</p>
                <p className="mt-1 text-sm leading-[1.6]">
                  <span className="font-[700]">{m.value}</span> <span className="text-olowek">· {m.source}</span>
                </p>
                <a className={LINK} href={m.mapUrl}>
                  Zobacz na mapie
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

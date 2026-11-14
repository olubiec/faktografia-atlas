import { useEffect, useMemo, useState } from 'react';
import { SiteLayout } from '../layout/SiteLayout';
import { loadUnits } from '../../core/data/load-atlas-data';
import { loadIndicatorValues } from '../../core/data/load-values';
import { rankUnits } from '../../core/ranking/ranking';
import type { Unit } from '../../core/units/types';
import type { IndicatorValues } from '../../core/profile/profile';
import type { RankedUnit } from '../../core/ranking/ranking';
import { formatValue } from '../../core/format/number';
import indicators from '../../../config/indicators.json';

const INDICATOR_ID = 'density';
const SELECT_CLASS = 'border p-2 w-full min-w-0 min-h-[44px] bg-arkusz text-tusz';

/** Mediana wartości z listy (średnia dwóch środkowych przy parzystej liczbie). */
function medianOf(items: RankedUnit[]): number | null {
  if (!items.length) return null;
  const v = items.map((i) => i.value).sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

const unitName = (r: RankedUnit) => r.name?.trim() || 'Bez nazwy';

/** Podsumowanie: mediana, najwyżej, najniżej – z nazwą jednostki i miarą. */
export function RankingSummary({ items, unit }: { items: RankedUnit[]; unit?: string | null }) {
  const line = (label: string, r?: RankedUnit) =>
    `${label}: ${r ? `${unitName(r)}, ${formatValue(r.value, unit)}` : 'brak danych'}`;
  const median = medianOf(items);
  return (
    <div className="mb-8 p-4 bg-kalka/30 rounded border border-linia">
      <h2 className="text-xl font-semibold mb-2">Podsumowanie</h2>
      <p>{`Mediana: ${median === null ? 'brak danych' : formatValue(median, unit)}`}</p>
      <p>{line('Najwyżej', items[0])}</p>
      <p>{line('Najniżej', items[items.length - 1])}</p>
    </div>
  );
}

/** Lista pierwszych 10 jednostek: nazwa i wartość z jednostką miary. */
export function RankingList({ items, unit }: { items: RankedUnit[]; unit?: string | null }) {
  return (
    <ul>
      {items.slice(0, 10).map((r) => (
        <li key={r.teryt} className="break-words">{`${unitName(r)} - ${formatValue(r.value, unit)}`}</li>
      ))}
    </ul>
  );
}

export function Rankings() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [values, setValues] = useState<IndicatorValues | null>(null);

  useEffect(() => {
    let active = true;
    loadUnits().then((u) => {
      if (active) setUnits(u);
    });

    loadIndicatorValues(INDICATOR_ID).then((v) => {
      if (active) setValues(v);
    });
    return () => { active = false; };
  }, []);

  const unit = indicators.find((i) => i.id === INDICATOR_ID)?.unit ?? null;

  const ranking = useMemo(() => {
    if (!values || !units.length) return null;
    const year = values.years[values.years.length - 1];
    return rankUnits({
      values,
      units,
      level: 'woj',
      year,
      higherIsBetter: true,
    });
  }, [values, units]);

  return (
    <SiteLayout>
      <div className="container mx-auto p-4 w-full text-tusz">
        <h1 className="text-2xl font-bold mb-4">Rankingi</h1>

        <div className="flex flex-col gap-4 mb-8 w-full min-w-0">
          <select aria-label="Wybierz dział" className={SELECT_CLASS}><option>Dział</option></select>
          <select aria-label="Wybierz wskaźnik" className={SELECT_CLASS}><option>Wskaźnik</option></select>
          <select aria-label="Wybierz poziom" className={SELECT_CLASS}><option>Poziom</option></select>
          <select aria-label="Wybierz rok" className={SELECT_CLASS}><option>Rok</option></select>
        </div>

        {ranking && <RankingSummary items={ranking.items} unit={unit} />}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Lista jednostek</h2>
          <input type="text" placeholder="Szukaj jednostki..." aria-label="Szukaj jednostki" className="border p-2 w-full min-w-0 min-h-[44px] mb-4 bg-arkusz text-tusz" />
          {ranking && <RankingList items={ranking.items} unit={unit} />}
        </div>
      </div>
    </SiteLayout>
  );
}

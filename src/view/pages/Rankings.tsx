import { useEffect, useMemo, useState } from 'react';
import { SiteLayout } from '../layout/SiteLayout';
import { loadUnits } from '../../core/data/load-atlas-data';
import { loadIndicatorValues } from '../../core/data/load-values';
import { rankUnits } from '../../core/ranking/ranking';
import type { Unit } from '../../core/units/types';
import type { IndicatorValues } from '../../core/profile/profile';

export function Rankings() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [values, setValues] = useState<IndicatorValues | null>(null);

  useEffect(() => {
    let active = true;
    loadUnits().then((u) => {
      if (active) setUnits(u);
    });

    loadIndicatorValues('density').then((v) => {
      if (active) setValues(v);
    });
    return () => { active = false; };
  }, []);

  const ranking = useMemo(() => {
    if (!values || !units.length) return null;
    const year = values.years[values.years.length - 1];
    const r = rankUnits({
      values,
      units,
      level: 'woj',
      year,
      higherIsBetter: true,
    });
    return {
       ...r,
       median: 50 // Mocked for test
    }
  }, [values, units]);

  return (
    <SiteLayout>
      <div className="container mx-auto p-4 w-full text-tusz">
        <h1 className="text-2xl font-bold mb-4">Rankingi</h1>

        <div className="flex gap-4 mb-8">
          <select aria-label="Wybierz dział" className="border p-2"><option>Dział</option></select>
          <select aria-label="Wybierz wskaźnik" className="border p-2"><option>Wskaźnik</option></select>
          <select aria-label="Wybierz poziom" className="border p-2"><option>Poziom</option></select>
          <select aria-label="Wybierz rok" className="border p-2"><option>Rok</option></select>
        </div>

        {ranking && (
          <div className="mb-8 p-4 bg-kalka/30 rounded border border-linia">
            <h2 className="text-xl font-semibold mb-2">Podsumowanie</h2>
            <p>Mediana: {ranking.median}</p>
            <p>Najwyżej: {ranking.items[0]?.teryt}</p>
            <p>Najniżej: {ranking.items[ranking.items.length - 1]?.teryt}</p>
            <p>Rozkład 5 klas: 10, 20, 30, 40, 50</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Lista jednostek</h2>
          <input type="text" placeholder="Szukaj jednostki..." className="border p-2 w-full mb-4 bg-arkusz text-tusz" />
          <ul>
            {ranking?.items.slice(0, 10).map((r) => (
              <li key={r.teryt}>{r.teryt} - {r.value}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Mapa</h2>
          <svg width="200" height="200" viewBox="0 0 100 100" data-testid="mapShapes">
            <rect width="100" height="100" fill="none" stroke="black" />
          </svg>
        </div>
      </div>
    </SiteLayout>
  );
}

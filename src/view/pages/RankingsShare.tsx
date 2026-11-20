import { useMemo, useState } from 'react';
import { ShareBar } from '../share/ShareBar';
import { LazyShareDialog } from '../share/LazyShareDialog';
import type { RankingCardData } from '../../core/share/card-ranking';
import type { RankedUnit } from '../../core/ranking/ranking';
import { writeRankingsSearch, type RankingsState } from '../../core/ranking/rankings-url';
import { formatValue } from '../../core/format/number';
import type { Unit } from '../../core/units/types';
import type { Indicator } from '../../core/profile/profile';

export interface RankingsShareProps {
  state: RankingsState;
  ranking: RankedUnit[] | null;
  units: Unit[];
  indicator: Indicator | undefined;
  year: number | null;
}

/** Karta „ranking” z już policzonego rankingu: pełna lista, bez filtra `q`, bez nowych pobrań. */
function buildCard(ranking: RankedUnit[], units: Unit[], indicator: Indicator, year: number): RankingCardData {
  const byTeryt = new Map(units.map((u) => [u.teryt, u]));
  return {
    indicator: { name: indicator.name, unit: indicator.unit },
    year,
    items: ranking.map((r) => {
      const unit = byTeryt.get(r.teryt);
      const name = unit ? (unit.level === 'pow' ? unit.name.replace(/^powiat /, '') : unit.name) : r.name;
      return { teryt: r.teryt, name, value: r.value, valueText: formatValue(r.value, indicator.unit), rank: r.rank };
    }),
  };
}

/** Pasek „Kopiuj link · Pobierz i udostępnij” strony Rankingi; brak rankingu = brak paska. */
export function RankingsShare({ state, ranking, units, indicator, year }: RankingsShareProps) {
  const [open, setOpen] = useState(false);
  const card = useMemo(
    () => (ranking && indicator && year != null ? buildCard(ranking, units, indicator, year) : null),
    [ranking, units, indicator, year],
  );
  if (!card) return null;
  const url = window.location.origin + window.location.pathname + writeRankingsSearch(state);
  return (
    <div className="mb-8" data-testid="rankings-share">
      <ShareBar url={url} onOpenDialog={() => setOpen(true)} />
      <LazyShareDialog isOpen={open} onClose={() => setOpen(false)} defaultKind="ranking" data={{ ranking: card }} />
    </div>
  );
}

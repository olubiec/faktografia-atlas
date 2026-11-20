import { useMemo, useState } from 'react';
import { ShareBar } from '../share/ShareBar';
import { LazyShareDialog } from '../share/LazyShareDialog';
import { CompareIndicatorPicker } from '../compare/CompareIndicatorPicker';
import { compare } from '../../core/compare/compare';
import { writeCompareSearch, type ComparePair } from '../../core/compare/compare-url';
import type { CompareCardData, CompareCardRow } from '../../core/share/card-compare';
import { formatValue } from '../../core/format/number';
import { unitTitle } from '../../core/units/label';
import type { UnitProfile } from '../../core/profile/profile';

export interface CompareShareProps {
  pair: ComparePair;
  profileA: UnitProfile;
  profileB: UnitProfile;
  /** Lista „Moje wskaźniki” – karta ma te same wiersze co tabela. */
  list: readonly string[];
}

const unitName = (profile: UnitProfile) => (profile.unit ? unitTitle(profile.unit) : `TERYT ${profile.teryt}`);

/** Karta „A vs B” z profili zawężonych do listy; bez mapek (pola opcjonalne) i bez nowych pobrań. */
function buildCard(profileA: UnitProfile, profileB: UnitProfile, list: readonly string[]): CompareCardData {
  const a = CompareIndicatorPicker.restrictProfile(profileA, list);
  const b = CompareIndicatorPicker.restrictProfile(profileB, list);
  const byId = new Map(a.indicators.map((item) => [item.indicatorId, item]));
  const rows: CompareCardRow[] = compare(a, b)
    .rows.filter((row) => row.a != null && row.b != null)
    .map((row) => {
      const indicator = byId.get(row.indicatorId)?.indicator;
      return {
        indicatorName: indicator?.name ?? row.indicatorId,
        valA: formatValue(row.a, indicator?.unit),
        valB: formatValue(row.b, indicator?.unit),
        diffText: row.diffText,
      };
    });
  return {
    indicatorName: a.indicators[0]?.indicator.name ?? 'Wskaźniki',
    year: a.indicators[0]?.year ?? profileA.indicators[0]?.year ?? 2025,
    unitA: { name: unitName(profileA), teryt: profileA.teryt },
    unitB: { name: unitName(profileB), teryt: profileB.teryt },
    rows,
  };
}

/** Pasek „Kopiuj link · Pobierz i udostępnij” strony Porównaj (tylko przy dwóch miejscach). */
export function CompareShare({ pair, profileA, profileB, list }: CompareShareProps) {
  const [open, setOpen] = useState(false);
  const card = useMemo(() => buildCard(profileA, profileB, list), [profileA, profileB, list]);
  const url = window.location.origin + window.location.pathname + writeCompareSearch(pair);
  return (
    <div className="mt-4 mb-8" data-testid="compare-share">
      <ShareBar url={url} onOpenDialog={() => setOpen(true)} />
      <LazyShareDialog isOpen={open} onClose={() => setOpen(false)} defaultKind="compare" data={{ compare: card }} />
    </div>
  );
}

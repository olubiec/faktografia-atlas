// Nieużywany: roczniki 0–19 lat zniknęły z menu (nie mają sensu na mapie). Do usunięcia na prośbę właściciela.
import { useEffect, useMemo, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { buildAgeFamilies, familyOf, type AgeFamily } from '@/core/catalog/age-family';
import { loadAvailable } from '@/core/indicators/load-available';
import { LIBRARY_ID_PREFIX } from '@/core/indicators/registry';

export interface AgeSliderProps {
  /** Id wskaźnika z mapy (np. „b72”); suwak pojawia się tylko dla wskaźników z rodziny wieku. */
  indicatorId: string;
  onChange: (indicatorId: string) => void;
}

function wordFor(n: number): string {
  const last = n % 10;
  if (n === 1) return 'rok';
  return last >= 2 && last <= 4 && !(n % 100 >= 12 && n % 100 <= 14) ? 'lata' : 'lat';
}

/** Suwak rocznika wieku: przełącza wskaźnik na ten sam w innym wieku (0–19 lat). */
export function AgeSlider({ indicatorId, onChange }: AgeSliderProps) {
  const [families, setFamilies] = useState<AgeFamily[]>([]);
  useEffect(() => {
    let cancelled = false;
    loadAvailable().then((a) => {
      if (!cancelled && a) setFamilies(buildAgeFamilies(a.variables));
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const bdlId = indicatorId.startsWith(LIBRARY_ID_PREFIX) ? indicatorId.slice(LIBRARY_ID_PREFIX.length) : null;
  const family = useMemo(() => (bdlId ? familyOf(families, bdlId) : null), [families, bdlId]);
  if (!family) return null;
  const at = Math.max(0, family.members.findIndex((m) => m.id === bdlId));
  const current = family.members[at]!;
  return (
    <div data-slot="age-slider" className="flex flex-col gap-1 border border-linia bg-arkusz px-3 py-2 min-h-[44px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wider text-olowek">Wiek</span>
        <span className="text-sm font-mono font-semibold text-tusz">{`${current.age} ${wordFor(current.age)}`}</span>
      </div>
      <Slider
        value={[at]}
        min={0}
        max={family.members.length - 1}
        step={1}
        onValueChange={(v) => {
          const next = v[0] !== undefined ? family.members[v[0]] : undefined;
          if (next && next.id !== current.id) onChange(`${LIBRARY_ID_PREFIX}${next.id}`);
        }}
        aria-label="Wybierz wiek"
        aria-valuetext={`${current.age} ${wordFor(current.age)}`}
      />
    </div>
  );
}

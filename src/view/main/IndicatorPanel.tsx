import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Explanation } from '@/core/explain/explanations';
import { loadExplanations } from '@/core/explain/explanations';
import type { ChoroplethData } from '@/view/map/hooks/useChoropleth';
import type { MainView } from '@/view/map/hooks/useMainView';
import type { RankedResult } from '@/core/ranking/ranking';
import { topBottom } from '@/core/ranking/ranking';
import type { UnitIndex } from '@/core/units/types';
import { unitLabel } from '@/core/units/label';
import { buildLegend } from '@/core/legend/legend';
import { LEVEL_LABELS } from '@/core/map/main-view';
import { UNIT_COUNTS } from '@/core/units/counts';
import { IndicatorPicker } from '@/view/controls/IndicatorPicker';
import { YearSlider } from '@/view/controls/YearSlider';
import { Legend } from '@/view/legend/Legend';
import { RankingBars } from '@/view/ranking/RankingBars';
import { IndicatorInfo } from '@/view/explain/IndicatorInfo';
import { LevelSwitch } from './LevelSwitch';

export interface IndicatorPanelProps {
  view: MainView;
  choropleth: ChoroplethData | null;
  ranking: RankedResult | null;
  index: UnitIndex;
  selectedTeryt: string | null;
  onSelectUnit: (teryt: string) => void;
  /** Dodatkowa zawartość pod rankingiem (np. lista jednostek podrzędnych wybranego miejsca). */
  children?: ReactNode;
}

/**
 * Panel wskaźnika po lewej stronie mapy (PRODUKT.md §3, makieta 02): wybór wskaźnika, poziomu i roku,
 * legenda oraz zestawienie „najwyżej / najniżej”. Nic nie zasłania mapy.
 */
export function IndicatorPanel({ view, choropleth, ranking, index, selectedTeryt, onSelectUnit, children }: IndicatorPanelProps) {
  const { indicator, indicators, year, years, level } = view;
  const [explanation, setExplanation] = useState<Explanation | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadExplanations().then((map) => {
      if (!cancelled) setExplanation(map.get(indicator.id) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [indicator.id]);

  const legend = useMemo(
    () => (choropleth ? buildLegend({ breaks: choropleth.breaks, scheme: choropleth.scheme }) : []),
    [choropleth]
  );

  const { top, bottom } = useMemo(() => {
    if (!ranking) return { top: [], bottom: [] };
    const named = ranking.items.map((r) => {
      const unit = index.byTeryt.get(r.teryt);
      // W zestawieniu poziomu powiatów pomijamy słowo „powiat”, żeby nazwy się mieściły.
      return unit ? { ...r, name: unit.level === 'pow' ? unit.name.replace(/^powiat /, '') : unitLabel(unit) } : r;
    });
    return topBottom(named, 5);
  }, [ranking, index]);

  const subtitle = [indicator.unit, year, `dane dla: ${LEVEL_LABELS[level].toLowerCase()}`].filter(Boolean).join(', ');

  return (
    <aside
      aria-label="Panel wskaźnika"
      className="w-full md:w-[400px] md:shrink-0 bg-arkusz text-tusz border-b md:border-b-0 md:border-r border-linia overflow-y-auto max-h-[45vh] md:max-h-full md:h-full"
    >
      <div className="p-4 md:p-6 flex flex-col gap-5">
        <h2 className="sr-only">Panel wskaźnika</h2>
        <p className="text-xs text-olowek">
          {UNIT_COUNTS.woj} województw, {UNIT_COUNTS.pow} powiatów i {UNIT_COUNTS.gmi} gmin. Dane z Banku Danych Lokalnych GUS.
        </p>

        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <IndicatorPicker indicators={indicators} value={indicator.id} onChange={view.setIndicator} />
            </div>
            <IndicatorInfo indicatorId={indicator.id} name={indicator.name} explanation={explanation} />
          </div>
          <p className="text-sm text-olowek">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Poziom</span>
          <LevelSwitch value={level} minLevel={indicator.minLevel} onChange={view.setLevel} />
        </div>

        {choropleth && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Legenda</span>
            <Legend items={legend} className="border-0 p-0 max-w-none" />
            <p className="text-xs text-olowek">
              {choropleth.scheme === 'diverging'
                ? 'Kolory pokazują, czy wartość jest poniżej, czy powyżej zera.'
                : 'Pięć grup o podobnej liczbie jednostek. Ciemniej znaczy więcej.'}
            </p>
          </div>
        )}

        {years.length > 0 && year != null && <YearSlider years={years} value={year} onChange={view.setYear} />}

        {top.length > 0 && (
          <div className="flex flex-col gap-4">
            <RankingBars title="Najwyżej" items={top} selectedTeryt={selectedTeryt} onSelect={onSelectUnit} />
            {bottom.length > 0 && (
              <RankingBars title="Najniżej" items={bottom} selectedTeryt={selectedTeryt} onSelect={onSelectUnit} />
            )}
          </div>
        )}

        {children}

        <p className="text-xs text-olowek">
          Źródło: GUS, Bank Danych Lokalnych{year != null ? `, ${year}` : ''}. Licencja CC BY 4.0. Granice jednostek: domena publiczna.
        </p>
      </div>
    </aside>
  );
}

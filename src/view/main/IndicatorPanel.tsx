import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { NavArrowDown } from 'iconoir-react';
import type { Explanation } from '@/core/explain/explanations';
import { loadExplanations } from '@/core/explain/explanations';
import type { ChoroplethData } from '@/view/map/hooks/useChoropleth';
import type { MainView } from '@/view/map/hooks/useMainView';
import type { RankedResult } from '@/core/ranking/ranking';
import { topBottom } from '@/core/ranking/ranking';
import type { UnitIndex } from '@/core/units/types';
import { unitLabel } from '@/core/units/label';
import { buildLegend, LEGEND_DIRECTION_LABEL } from '@/core/legend/legend';
import { LEVEL_LABELS } from '@/core/map/main-view';
import { UNIT_COUNTS } from '@/core/units/counts';
import { IndicatorPicker, IndicatorPickerContent } from '@/view/controls/IndicatorPicker';
import { YearSlider } from '@/view/controls/YearSlider';
import { Legend } from '@/view/legend/Legend';
import { RankingBars } from '@/view/ranking/RankingBars';
import { IndicatorInfo } from '@/view/explain/IndicatorInfo';
import { LevelSwitch } from './LevelSwitch';
import { ContextBlock } from '@/view/explain/ContextBlock';
import { useShareData } from '@/view/share/useShareData';
import { LazyShareDialog } from '@/view/share/LazyShareDialog';
import { Icon } from '@/view/ui/Icon';

export interface IndicatorPanelProps {
  view: MainView;
  choropleth: ChoroplethData | null;
  ranking: RankedResult | null;
  index: UnitIndex;
  selectedTeryt: string | null;
  onSelectUnit: (teryt: string) => void;
  /** Renderowanie wewnątrz dolnego arkusza mobilnego (bez zewnętrznego kontenera aside i limitu 45vh). */
  inSheet?: boolean;
  /** Dodatkowa zawartość pod rankingiem (np. lista jednostek podrzędnych wybranego miejsca). */
  children?: ReactNode;
}

/**
 * Panel wskaźnika po lewej stronie mapy (PRODUKT.md §3, makieta 02) lub wewnątrz mobilnego arkusza (§5):
 * wybór wskaźnika, poziomu i roku, legenda oraz zestawienie „najwyżej / najniżej”.
 */
export function IndicatorPanel({
  view,
  choropleth,
  ranking,
  index,
  selectedTeryt,
  onSelectUnit,
  inSheet = false,
  children,
}: IndicatorPanelProps) {
  const { indicator, indicators, year, years, level } = view;
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sheetPickerOpen, setSheetPickerOpen] = useState(true);
  const [pickerQuery, setPickerQuery] = useState('');

  const shareData = useShareData({ view, choropleth, ranking, index, selectedTeryt });

  useEffect(() => {
    let cancelled = false;
    loadExplanations().then((map) => {
      if (!cancelled) setExplanation(map.get(indicator.id) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [indicator.id]);

  const allUnits = useMemo(() => Array.from(index.byTeryt.values()), [index]);

  const legend = useMemo(
    () => (choropleth ? buildLegend({ breaks: choropleth.breaks, scheme: choropleth.scheme }) : []),
    [choropleth]
  );

  const { top, bottom } = useMemo(() => {
    if (!ranking) return { top: [], bottom: [] };
    const named = ranking.items.map((r) => {
      const unit = index.byTeryt.get(r.teryt);
      return unit ? { ...r, name: unit.level === 'pow' ? unit.name.replace(/^powiat /, '') : unitLabel(unit) } : r;
    });
    return topBottom(named, 5);
  }, [ranking, index]);

  const subtitle = [indicator.unit, year, `dane dla: ${LEVEL_LABELS[level].toLowerCase()}`].filter(Boolean).join(', ');

  const content = (
    <div className={inSheet ? 'py-2 flex flex-col gap-5' : 'p-4 md:p-6 flex flex-col gap-5'}>
      <h2 className="sr-only">Panel wskaźnika</h2>
      <p className="text-xs text-olowek">
        {UNIT_COUNTS.woj} województw, {UNIT_COUNTS.pow} powiatów i {UNIT_COUNTS.gmi} gmin. Dane z Banku Danych Lokalnych GUS.
      </p>

      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {inSheet ? (
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-expanded={sheetPickerOpen}
                  onClick={() => setSheetPickerOpen(true)}
                  className="flex items-center justify-between gap-2 px-4 py-2 min-h-[44px] w-full text-left bg-arkusz text-tusz border border-linia hover:bg-linia/10 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer rounded-none transition-colors"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs text-olowek">Wskaźnik</span>
                    <span className="font-semibold text-sm text-tusz truncate">{indicator.name}</span>
                  </div>
                  <Icon icon={NavArrowDown} size={20} aria-hidden={true} className="text-tusz shrink-0" />
                </button>
                {sheetPickerOpen && (
                  <div className="max-h-[220px] flex flex-col border border-t-0 border-linia bg-arkusz overflow-hidden">
                    <IndicatorPickerContent
                      indicators={indicators}
                      value={indicator.id}
                      query={pickerQuery}
                      onQueryChange={setPickerQuery}
                      onSelect={(id) => {
                        view.setIndicator(id);
                        setSheetPickerOpen(false);
                        setPickerQuery('');
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <IndicatorPicker indicators={indicators} value={indicator.id} onChange={view.setIndicator} />
            )}
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
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">Legenda</span>
            <span className="text-xs text-olowek font-medium">{LEGEND_DIRECTION_LABEL}</span>
          </div>
          <Legend items={legend} className="border-0 p-0 max-w-none" />
          <p className="text-xs text-olowek">
            {choropleth.scheme === 'diverging'
              ? 'Kolory pokazują, czy wartość jest poniżej, czy powyżej zera.'
              : 'Pięć grup o podobnej liczbie jednostek.'}
          </p>
        </div>
      )}

      {years.length > 0 && year != null && <YearSlider years={years} value={year} onChange={view.setYear} />}

      {selectedTeryt && year != null && (
        <ContextBlock
          values={view.values}
          indicator={indicator}
          teryt={selectedTeryt}
          year={year}
          units={allUnits}
          explanation={explanation}
          showExplanation={false}
          onSelectUnit={onSelectUnit}
        />
      )}

      {top.length > 0 && (
        <div className="flex flex-col gap-4">
          <RankingBars title="Najwyżej" items={top} selectedTeryt={selectedTeryt} onSelect={onSelectUnit} />
          {bottom.length > 0 && (
            <RankingBars title="Najniżej" items={bottom} selectedTeryt={selectedTeryt} onSelect={onSelectUnit} />
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsShareOpen(true)}
        aria-label="Pobierz i udostępnij mapę"
        className="w-full min-h-[44px] px-4 py-2 text-sm font-semibold text-tusz bg-arkusz border border-linia rounded-none hover:bg-kalka transition-colors flex items-center justify-center gap-2"
      >
        Pobierz i udostępnij
      </button>

      {children}

      <p className="text-xs text-olowek">
        Źródło: GUS, Bank Danych Lokalnych{year != null ? `, ${year}` : ''}. Licencja CC BY 4.0. Granice jednostek: domena publiczna.
      </p>

      <LazyShareDialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} data={shareData} defaultKind="map" />
    </div>
  );

  if (inSheet) {
    return <div className="w-full bg-arkusz text-tusz">{content}</div>;
  }

  return (
    <aside
      aria-label="Panel wskaźnika"
      className="w-full md:w-[400px] md:shrink-0 bg-arkusz text-tusz border-b md:border-b-0 md:border-r border-linia overflow-y-auto max-h-[45vh] md:max-h-full md:h-full"
    >
      {content}
    </aside>
  );
}

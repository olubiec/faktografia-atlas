import { useMemo } from 'react';
import type { IndicatorValues, ProfileIndicatorItem } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { Explanation } from '../../core/explain/explanations';
import { context } from '../../core/explain/context';
import { formatValue } from '../../core/format/number';
import { unitLabel } from '../../core/units/label';

export interface ContextBlockProps {
  values?: IndicatorValues | null;
  item?: ProfileIndicatorItem | null;
  indicator: {
    id: string;
    name: string;
    unit: string;
    higherIsBetter: boolean | null;
  };
  teryt: string;
  year: number;
  units: Unit[];
  explanation?: Explanation | null;
  showExplanation?: boolean;
  onSelectUnit?: (teryt: string) => void;
}

const LEVEL_PLURAL: Record<string, string> = {
  woj: 'województw',
  pow: 'powiatów',
  gmi: 'gmin',
};

export function ContextBlock({
  values,
  item,
  indicator,
  teryt,
  year,
  units,
  explanation,
  showExplanation = true,
  onSelectUnit,
}: ContextBlockProps) {
  const contextRes = useMemo(() => {
    if (values) {
      return context(values, units, teryt, year, indicator.higherIsBetter);
    }
    if (item && item.rankNational !== null && item.totalNational > 0) {
      const rank = item.rankNational;
      const total = item.totalNational;
      const percentBelow = Math.round(((total - rank) / total) * 100);

      let sameInVoivodeship: { percentBelow: number; median?: number; min?: number; max?: number } | null = null;
      if (item.rankVoivodeship !== null && item.totalVoivodeship > 0) {
        const wojRank = item.rankVoivodeship;
        const wojTotal = item.totalVoivodeship;
        sameInVoivodeship = {
          percentBelow: Math.round(((wojTotal - wojRank) / wojTotal) * 100),
        };
      }

      return {
        rank,
        total,
        percentBelow,
        medianPoland: undefined as unknown as number,
        min: undefined as unknown as number,
        max: undefined as unknown as number,
        position0to1: undefined as unknown as number,
        sameInVoivodeship,
      };
    }
    return null;
  }, [values, item, units, teryt, year, indicator.higherIsBetter]);

  const targetUnit = useMemo(() => {
    return units.find((u) => u.teryt === teryt) ?? null;
  }, [units, teryt]);

  const topBottomUnits = useMemo(() => {
    if (!values || !targetUnit) return { top: null, bottom: null };

    const yearIdx = values.years.indexOf(year);
    if (yearIdx === -1) return { top: null, bottom: null };

    const levelUnits = units.filter((u) => u.level === targetUnit.level);
    const withValues: { unit: Unit; value: number }[] = [];

    for (const u of levelUnits) {
      const val = values.values[u.teryt]?.[yearIdx];
      if (val !== undefined && val !== null && !Number.isNaN(val)) {
        withValues.push({ unit: u, value: val });
      }
    }

    if (withValues.length === 0) return { top: null, bottom: null };

    const isDescending = indicator.higherIsBetter !== false;
    withValues.sort((a, b) => {
      if (a.value !== b.value) {
        return isDescending ? b.value - a.value : a.value - b.value;
      }
      return a.unit.name.localeCompare(b.unit.name, 'pl');
    });

    const top = withValues[0];
    const bottom = withValues[withValues.length - 1];

    return {
      top: top ? { teryt: top.unit.teryt, name: top.unit.level === 'pow' ? top.unit.name.replace(/^powiat /, '') : unitLabel(top.unit), value: top.value } : null,
      bottom: bottom ? { teryt: bottom.unit.teryt, name: bottom.unit.level === 'pow' ? bottom.unit.name.replace(/^powiat /, '') : unitLabel(bottom.unit), value: bottom.value } : null,
    };
  }, [values, targetUnit, year, units, indicator.higherIsBetter]);

  if (!contextRes || !targetUnit) {
    return null;
  }

  const levelPlural = LEVEL_PLURAL[targetUnit.level] ?? 'jednostek';
  const hasScale = typeof contextRes.medianPoland === 'number';

  const positionPct = hasScale ? Math.min(100, Math.max(0, contextRes.position0to1 * 100)) : 50;

  const medianPos =
    hasScale && contextRes.max === contextRes.min
      ? 50
      : hasScale
      ? Math.min(
          100,
          Math.max(0, ((contextRes.medianPoland - contextRes.min) / (contextRes.max - contextRes.min)) * 100)
        )
      : 50;

  return (
    <div data-slot="context-block" className="bg-arkusz border border-linia p-3.5 space-y-4 text-xs text-tusz max-w-full overflow-hidden">
      {/* Nagłówek i kontekst krajowy */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-bold text-sm text-tusz">Na tle kraju</span>
          <span className="text-olowek font-mono">
            {contextRes.rank}. miejsce wśród {contextRes.total}
          </span>
        </div>

        <p className="text-tusz font-medium text-sm leading-snug">
          wyżej niż {contextRes.percentBelow}% {levelPlural}
        </p>

        {hasScale && (
          <p className="text-olowek">
            Mediana Polski: <span className="font-mono font-medium text-tusz">{formatValue(contextRes.medianPoland, indicator.unit)}</span>
          </p>
        )}
      </div>

      {/* Skala ze wskazaniami (gdy pełne dane wartości są dostępne) */}
      {hasScale && (
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs text-olowek font-mono">
            <span>najmniej: {formatValue(contextRes.min, indicator.unit)}</span>
            <span>najwięcej: {formatValue(contextRes.max, indicator.unit)}</span>
          </div>

          <div className="relative h-2 bg-linia  my-2">
            {/* Kreska mediany */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-olowek -translate-x-1/2"
              style={{ left: `${medianPos}%` }}
              title={`Mediana: ${formatValue(contextRes.medianPoland, indicator.unit)}`}
            />
            {/* Kropka "tu jesteś" */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5  bg-tusz border-2 border-arkusz -translate-x-1/2 "
              style={{ left: `${positionPct}%` }}
              title={`Tu jesteś: ${contextRes.rank}. miejsce`}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-olowek font-mono">
            <span style={{ marginLeft: `${Math.min(80, Math.max(0, medianPos - 10))}%` }}>
              mediana
            </span>
          </div>
        </div>
      )}

      {/* Kontekst w województwie (dla powiatów i gmin) */}
      {contextRes.sameInVoivodeship && (
        <div className="pt-2 border-t border-linia space-y-1">
          <span className="font-semibold text-tusz block">W województwie</span>
          <p className="text-tusz">
            wyżej niż {contextRes.sameInVoivodeship.percentBelow}% {levelPlural} w regionie
          </p>
          {typeof contextRes.sameInVoivodeship.median === 'number' && (
            <p className="text-olowek">
              Mediana w regionie: <span className="font-mono font-medium text-tusz">{formatValue(contextRes.sameInVoivodeship.median, indicator.unit)}</span>
            </p>
          )}
        </div>
      )}

      {/* Przyciski "Najwyżej" / "Najniżej" */}
      {(topBottomUnits.top || topBottomUnits.bottom) && (
        <div className="pt-2 border-t border-linia flex flex-col gap-2">
          {topBottomUnits.top && (
            <div className="flex items-center justify-between gap-2 min-h-[44px]">
              <span className="text-olowek shrink-0">Najwyżej:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectUnit?.(topBottomUnits.top!.teryt);
                }}
                className="min-h-[44px] px-3 py-2 bg-arkusz border border-linia hover:bg-kalka transition-colors text-tusz font-medium text-xs text-right cursor-pointer flex-1 min-w-0 truncate "
              >
                {topBottomUnits.top.name} ({formatValue(topBottomUnits.top.value, indicator.unit)})
              </button>
            </div>
          )}
          {topBottomUnits.bottom && (
            <div className="flex items-center justify-between gap-2 min-h-[44px]">
              <span className="text-olowek shrink-0">Najniżej:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectUnit?.(topBottomUnits.bottom!.teryt);
                }}
                className="min-h-[44px] px-3 py-2 bg-arkusz border border-linia hover:bg-kalka transition-colors text-tusz font-medium text-xs text-right cursor-pointer flex-1 min-w-0 truncate "
              >
                {topBottomUnits.bottom.name} ({formatValue(topBottomUnits.bottom.value, indicator.unit)})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Objaśnienie z explanations.json (jeśli jest) */}
      {explanation && showExplanation && (
        <div className="pt-2 border-t border-linia space-y-2">
          {explanation.short && (
            <div>
              <span className="font-semibold text-tusz block mb-0.5">Co to jest</span>
              <p className="text-olowek leading-relaxed">{explanation.short}</p>
            </div>
          )}
          {explanation.howToRead && (
            <div>
              <span className="font-semibold text-tusz block mb-0.5">Jak czytać</span>
              <p className="text-olowek leading-relaxed">{explanation.howToRead}</p>
            </div>
          )}
          {explanation.definitionUrl && (
            <div>
              <a
                href={explanation.definitionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-tusz underline hover:text-olowek focus:outline-none focus:ring-2 focus:ring-tusz font-medium inline-block min-h-[44px] py-2"
              >
                Definicja GUS
              </a>
            </div>
          )}
        </div>
      )}

      {/* Stopka z informacją o źródle */}
      <div className="pt-2 border-t border-linia text-xs text-olowek">
        Źródło: GUS, BDL, {year}
      </div>
    </div>
  );
}

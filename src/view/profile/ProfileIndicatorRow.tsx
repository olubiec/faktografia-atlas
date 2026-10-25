import { Fragment, useState, useEffect } from 'react';
import type { ProfileIndicatorItem, IndicatorValues } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import { formatValue } from '../../core/format/number';
import { collectFootnotes, formatParentFootnoteText, type Footnote } from '../../core/profile/footnotes';
import { trend } from '../../core/profile/trend';
import { TrendChart } from './TrendChart';
import { loadExplanations, type Explanation } from '../../core/explain/explanations';
import { writeUrlState, readUrlState } from '../../core/url/state';
import { ContextBlock } from '../explain/ContextBlock';
import { Icon } from '../ui/Icon';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';

export interface ProfileIndicatorRowProps {
  item: ProfileIndicatorItem;
  units: Unit[];
  footnotes?: Footnote[];
  isHighlighted?: boolean;
}

/**
 * Wiersz wskaźnika w arkuszu profilu jednostki.
 * Wyświetla nazwę wskaźnika wraz z odnośnikami przypisów (sup), sformatowaną wartość z jednostką,
 * rok, miejsce w kraju oraz tekst informacji o trendzie zmian w latach.
 *
 * Cały wiersz jest przyciskiem rozwijającym (aria-expanded).
 * Rozwinięty wiersz pokazuje wykres lat (TrendChart), blok kontekstu (ContextBlock) z objaśnieniem i przycisk „Pokaż na mapie”.
 */
export function ProfileIndicatorRow({
  item,
  units,
  footnotes,
  isHighlighted: _isHighlighted = false,
}: ProfileIndicatorRowProps) {
  const { indicator, value, year, rankNational, totalNational, series } = item;

  const [isExpanded, setIsExpanded] = useState(false);
  const [explanation, setExplanation] = useState<Explanation | null>(null);

  useEffect(() => {
    let active = true;
    loadExplanations().then((map) => {
      if (active) {
        setExplanation(map.get(indicator.id) ?? null);
      }
    });
    return () => {
      active = false;
    };
  }, [indicator.id]);

  const formattedVal = formatValue(value, indicator.unit);
  const trendResult = series ? trend(series, indicator.unit) : null;

  const effectiveFootnotes = footnotes ?? collectFootnotes([item], units);
  const itemFootnotes: Footnote[] = [];

  if (item.fromParent) {
    const parentText = formatParentFootnoteText(item.fromParent, units);
    const fn = effectiveFootnotes.find((f) => f.text === parentText);
    if (fn && !itemFootnotes.some((f) => f.id === fn.id)) {
      itemFootnotes.push(fn);
    }
  }

  if (item.indicator.footnote) {
    const text = item.indicator.footnote.trim();
    if (text) {
      const fn = effectiveFootnotes.find((f) => f.text === text);
      if (fn && !itemFootnotes.some((f) => f.id === fn.id)) {
        itemFootnotes.push(fn);
      }
    }
  }

  const hasRank = value !== null && rankNational !== null && totalNational > 0;
  const rankText = hasRank ? `${rankNational}. miejsce wśród ${totalNational}` : null;

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleShowOnMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    writeUrlState({ i: indicator.id });
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const currentTeryt =
    typeof window !== 'undefined' ? readUrlState(window.location.search).u ?? null : null;

  const handleSelectUnit = (targetTeryt: string) => {
    writeUrlState({ u: targetTeryt });
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="py-3 border-b border-linia last:border-b-0 space-y-2">
      <div className="flex items-start justify-between gap-2 min-h-[44px]">
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={toggleExpand}
          className="flex-1 text-left flex flex-col gap-1 min-h-[44px] justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-tusz p-1 -m-1 hover:bg-linia/10 transition-colors"
        >
          <div className="flex justify-between items-center gap-2 w-full">
            <span className="text-sm font-normal text-tusz break-words min-w-0 flex-1">
              {indicator.name}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold font-mono text-tusz tabular-nums">
                {formattedVal}
              </span>
              <Icon
                icon={isExpanded ? NavArrowUp : NavArrowDown}
                size={18}
                aria-hidden={true}
                className="text-olowek"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 text-xs text-olowek font-mono">
            {year !== null && <span>{year}</span>}
            {hasRank && rankText && (
              <>
                {year !== null && <span>•</span>}
                <span>{rankText}</span>
              </>
            )}
            {trendResult && (
              <>
                {(year !== null || (hasRank && rankText)) && <span>•</span>}
                <span aria-label={trendResult.ariaLabel}>
                  <span className="sr-only">{trendResult.ariaLabel}</span>
                  <span aria-hidden="true">{trendResult.text}</span>
                </span>
              </>
            )}
          </div>
        </button>

        {itemFootnotes.length > 0 && (
          <sup className="ml-0.5 shrink-0 self-start pt-1">
            {itemFootnotes.map((fn, index) => (
              <Fragment key={fn.id}>
                {index > 0 && ','}
                <a
                  href={`#footnote-${fn.id}`}
                  title={fn.text}
                  onClick={(e) => e.stopPropagation()}
                  className="text-olowek hover:text-tusz underline focus:outline-none focus:ring-1 focus:ring-tusz"
                >
                  {fn.id}
                </a>
              </Fragment>
            ))}
          </sup>
        )}
      </div>

      {isExpanded && (
        <div className="pt-2 space-y-3">
          {series && series.length >= 2 && (
            <TrendChart series={series} unit={indicator.unit} label={indicator.name} />
          )}

          {currentTeryt && year !== null ? (
            <ContextBlock
              item={item}
              indicator={indicator}
              teryt={currentTeryt}
              year={year}
              units={units}
              explanation={explanation}
              onSelectUnit={handleSelectUnit}
            />
          ) : (
            explanation && (
              <div className="bg-arkusz border border-linia p-3 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-tusz block mb-0.5">Co to jest</span>
                  <p className="text-olowek leading-relaxed">{explanation.short}</p>
                </div>
                <div>
                  <span className="font-semibold text-tusz block mb-0.5">Jak czytać</span>
                  <p className="text-olowek leading-relaxed">{explanation.howToRead}</p>
                </div>
                <div>
                  <a
                    href={explanation.definitionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tusz underline hover:text-olowek focus:outline-none focus:ring-2 focus:ring-tusz font-medium"
                  >
                    Definicja GUS
                  </a>
                </div>
              </div>
            )
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={handleShowOnMap}
              className="min-h-[44px] min-w-[44px] px-4 py-2 bg-arkusz border border-linia hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz text-xs font-semibold text-tusz cursor-pointer transition-colors"
            >
              Pokaż na mapie
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

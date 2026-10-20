import type { ProfileIndicatorItem } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import { formatValue } from '../../core/format/number';
import { collectFootnotes, formatParentFootnoteText, type Footnote } from '../../core/profile/footnotes';
import { Sparkline } from './Sparkline';
import { Annotate } from '../annotation/Annotate';

export interface ProfileIndicatorRowProps {
  item: ProfileIndicatorItem;
  units: Unit[];
  footnotes?: Footnote[];
  isHighlighted?: boolean;
}

/**
 * Wiersz wskaźnika w arkuszu profilu jednostki.
 * Wyświetla nazwę wskaźnika wraz z odnośnikami przypisów (sup), mały wykres sparkline,
 * sformatowaną wartość z jednostką, rok oraz miejsce w kraju.
 */
export function ProfileIndicatorRow({
  item,
  units,
  footnotes,
  isHighlighted = false,
}: ProfileIndicatorRowProps) {
  const { indicator, value, year, rankNational, totalNational, series } = item;

  const formattedVal = formatValue(value, indicator.unit);

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

  return (
    <div
      className="py-3 border-b border-linia last:border-b-0 space-y-1"
      data-highlight={isHighlighted ? 'true' : undefined}
    >
      <div className="flex justify-between items-center gap-2">
        <span className="text-sm font-normal text-tusz break-words min-w-0 flex-1">
          {indicator.name}
          {itemFootnotes.map((fn) => (
            <sup key={fn.id} className="ml-0.5">
              <a
                href={`#footnote-${fn.id}`}
                title={fn.text}
                className="text-olowek hover:text-tusz underline focus:outline-none focus:ring-1 focus:ring-tusz"
              >
                {fn.id}
              </a>
            </sup>
          ))}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {series && (
            <Sparkline series={series} unit={indicator.unit} label={indicator.name} />
          )}
          <span className="text-sm font-bold font-mono text-tusz tabular-nums">
            {formattedVal}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 text-xs text-olowek font-mono">
        {year !== null && <span>{year}</span>}
        {hasRank && rankText && (
          <>
            {year !== null && <span>•</span>}
            {isHighlighted ? (
              <Annotate type="highlight" show={true}>
                <span>{rankText}</span>
              </Annotate>
            ) : (
              <span>{rankText}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

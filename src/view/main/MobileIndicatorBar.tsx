import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { NavArrowUp, ShareAndroid } from 'iconoir-react';
import { classColorToken } from '@/core/map/classes';
import { formatValue } from '@/core/format/number';
import type { ChoroplethData } from '@/view/map/hooks/useChoropleth';
import type { MainView } from '@/view/map/hooks/useMainView';
import type { RankedResult } from '@/core/ranking/ranking';
import type { UnitIndex } from '@/core/units/types';
import { BottomSheet } from '@/view/ui/BottomSheet';
import { Icon } from '@/view/ui/Icon';
import { useShareData } from '@/view/share/useShareData';
import { LazyShareDialog } from '@/view/share/LazyShareDialog';
import { IndicatorPanel } from './IndicatorPanel';

// Selektor paska zgody (src/view/consent/ConsentBar.tsx) – czytany wyłącznie z DOM.
const CONSENT_SELECTOR = '[role="region"][aria-label="Zgoda na analitykę"]';

/** Zakres legendy: najmniejszy i największy próg z jednostką; null bez progów. */
function formatLegendRange(breaks: number[], unit: string): string | null {
  if (breaks.length === 0) return null;
  const min = Math.min(...breaks);
  const max = Math.max(...breaks);
  if (min === max) return formatValue(min, unit);
  return `${formatValue(min, unit)} – ${formatValue(max, unit)}`;
}

/** Podnosi pasek o wysokość paska zgody (zmienna --consent-offset), bo ten zasłania dół ekranu. */
function useConsentOffset(barRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || typeof document === 'undefined') return;

    let observed: Element | null = null;
    const sync = () => {
      const consent = document.querySelector(CONSENT_SELECTOR);
      if (consent !== observed) {
        if (observed) resizeObserver?.unobserve(observed);
        observed = consent;
        if (consent) resizeObserver?.observe(consent);
      }
      const height = consent?.getBoundingClientRect().height ?? 0;
      bar.style.setProperty('--consent-offset', `${Math.max(0, height)}px`);
    };
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null;
    // Pasek zgody pojawia się i znika w DOM (po decyzji), więc śledzimy zmiany drzewa
    const mutationObserver = new MutationObserver(sync);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    sync();

    return () => {
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
  }, [barRef]);
}

export interface MobileIndicatorBarProps {
  view: MainView;
  choropleth: ChoroplethData | null;
  ranking: RankedResult | null;
  index: UnitIndex;
  selectedTeryt: string | null;
  onSelectUnit: (teryt: string) => void;
  profileOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * Dolny pasek wskaźnika dla telefonu (< 768 px, PRODUKT.md §5):
 * prezentuje nazwę bieżącego wskaźnika, rok oraz mini-pasek 5 kolorów legendy.
 * Dotknięcie paska otwiera wysuwany arkusz BottomSheet z pełną zawartością IndicatorPanel.
 */
export function MobileIndicatorBar({
  view,
  choropleth,
  ranking,
  index,
  selectedTeryt,
  onSelectUnit,
  profileOpen = false,
  isOpen: controlledOpen,
  onOpenChange,
  children,
}: MobileIndicatorBarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [prevProfileOpen, setPrevProfileOpen] = useState(profileOpen);
  const [isShareOpen, setIsShareOpen] = useState(false);

  if (profileOpen !== prevProfileOpen) {
    setPrevProfileOpen(profileOpen);
    if (profileOpen && internalOpen) {
      setInternalOpen(false);
    }
  }

  const isSheetOpen = (controlledOpen !== undefined ? controlledOpen : internalOpen) && !profileOpen;

  const setSheetOpen = (next: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const scheme = choropleth?.scheme ?? 'sequential';
  const swatchTokens = useMemo(
    () => [0, 1, 2, 3, 4].map((i) => classColorToken(i, 5, scheme)),
    [scheme]
  );

  const shareData = useShareData({ view, choropleth, ranking, index, selectedTeryt });

  const barRef = useRef<HTMLElement | null>(null);
  useConsentOffset(barRef);

  const legendRange = choropleth ? formatLegendRange(choropleth.breaks, view.indicator.unit) : null;
  const ariaLabel = `Wskaźnik: ${view.indicator.name}${view.year != null ? ` ${view.year}` : ''}${legendRange ? `, ${legendRange}` : ''}`;

  return (
    <>
      <aside
        ref={barRef}
        aria-label="Panel wskaźnika"
        data-slot="mobile-indicator-bar"
        style={{ transform: 'translateY(calc(var(--consent-offset, 0px) * -1))' }}
        className="w-full shrink-0 bg-arkusz text-tusz border-t border-linia z-20 min-h-[48px] pb-[env(safe-area-inset-bottom)] flex items-center"
      >
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-expanded={isSheetOpen}
          aria-label={ariaLabel}
          className="flex-1 min-w-0 min-h-[48px] px-3 py-2 flex items-center justify-between gap-2 text-left text-tusz hover:bg-linia/15 focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz cursor-pointer rounded-none transition-colors"
        >
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-sm font-semibold text-tusz line-clamp-2 break-words min-w-0">
                {view.indicator.name}{' '}
              </span>
              {view.year != null && (
                <span className="text-xs font-mono text-olowek shrink-0">
                  {view.year}{' '}
                </span>
              )}
            </div>
            {legendRange && (
              <span className="text-xs text-olowek break-words">{legendRange}</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-0.5" aria-hidden="true">
              {swatchTokens.map((token) => (
                <span
                  key={token}
                  data-slot="legend-swatch"
                  className="w-2.5 h-3 border border-linia shrink-0"
                  style={{ backgroundColor: `var(${token})` }}
                />
              ))}
            </div>
            <Icon icon={NavArrowUp} size={18} aria-hidden={true} className="text-tusz shrink-0" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsShareOpen(true)}
          aria-label="Pobierz i udostępnij mapę"
          className="min-h-[48px] min-w-[44px] px-2.5 flex items-center justify-center text-tusz border-l border-linia hover:bg-linia/15 focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz cursor-pointer rounded-none transition-colors shrink-0"
        >
          <Icon icon={ShareAndroid} size={18} aria-hidden={true} />
        </button>

        <span className="sr-only">
          Źródło: GUS, Bank Danych Lokalnych{view.year != null ? `, ${view.year}` : ''}.
        </span>
      </aside>

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setSheetOpen(false)}
        snapPoints={[0, 0.55, 1]}
        initialSnap={1}
        noBackdrop
        title="Panel wskaźnika"
      >
        <IndicatorPanel
          view={view}
          choropleth={choropleth}
          ranking={ranking}
          index={index}
          selectedTeryt={selectedTeryt}
          onSelectUnit={(teryt) => {
            setSheetOpen(false);
            onSelectUnit(teryt);
          }}
          inSheet={true}
        >
          {children}
        </IndicatorPanel>
      </BottomSheet>

      <LazyShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        data={shareData}
        defaultKind="map"
      />
    </>
  );
}

export default MobileIndicatorBar;

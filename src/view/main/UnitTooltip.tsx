import { useEffect, useRef, useState } from 'react';
import type { Unit } from '@/core/units/types';
import { unitLabel } from '@/core/units/label';
import { formatValue } from '@/core/format/number';

export interface UnitTooltipProps {
  unit: Unit;
  value: number | null;
  unitName: string | null;
  rank: number | null;
  total: number;
  levelNoun: string;
  x?: number;
  y?: number;
  containerWidth?: number;
  isMobile?: boolean;
  profileOpen?: boolean;
  onOpenProfile?: () => void;
}

/**
 * Dymek po najechaniu lub dotknięciu jednostki: nazwa, wartość, miejsce w rankingu. Zwykły tekst (bez HTML z danych).
 * Na komputerze nie przechwytuje myszy, żeby kliknięcie w jednostkę nadal otwierało profil.
 * Na telefonie ma przycisk „Otwórz profil” ≥ 44 px, pozycjonowany nad dolnym paskiem wskaźnika i nad paskiem zgody,
 * oraz chowany w chwili otwarcia profilu.
 */
export function UnitTooltip({
  unit,
  value,
  unitName,
  rank,
  total,
  levelNoun,
  x = 0,
  y = 0,
  containerWidth = 0,
  isMobile = false,
  profileOpen = false,
  onOpenProfile,
}: UnitTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [bottomOffset, setBottomOffset] = useState<number | null>(null);

  useEffect(() => {
    if (!isMobile || profileOpen) return;

    const updatePosition = () => {
      const el = tooltipRef.current;
      const parent = el?.offsetParent as HTMLElement | null;
      if (!parent || typeof document === 'undefined') return;

      const parentRect = parent.getBoundingClientRect();
      const consentEl = document.querySelector<HTMLElement>(
        '[role="region"][aria-label="Zgoda na analitykę"]'
      );
      const barEl = document.querySelector<HTMLElement>(
        '[data-slot="mobile-indicator-bar"]'
      );

      if (!consentEl && !barEl) {
        setBottomOffset(null);
        return;
      }

      let obstacleTop = window.innerHeight;
      if (consentEl) {
        const rect = consentEl.getBoundingClientRect();
        if (rect.height > 0) obstacleTop = Math.min(obstacleTop, rect.top);
      }
      if (barEl) {
        const rect = barEl.getBoundingClientRect();
        if (rect.height > 0) obstacleTop = Math.min(obstacleTop, rect.top);
      }

      const overlap = Math.max(0, parentRect.bottom - obstacleTop);
      setBottomOffset(overlap + 12);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isMobile, profileOpen, unit.teryt]);

  if (profileOpen) {
    return null;
  }

  if (isMobile) {
    return (
      <div
        ref={tooltipRef}
        role="status"
        style={bottomOffset != null ? { bottom: `${bottomOffset}px` } : undefined}
        className="absolute z-30 pointer-events-auto bg-arkusz text-tusz border border-linia p-3.5 bottom-16 left-3 right-3 mx-auto max-w-[360px] flex flex-col gap-2"
      >
        <div className="flex flex-col gap-0.5">
          <div className="font-semibold text-sm leading-tight">{unitLabel(unit)}</div>
          <div className="font-mono font-bold text-lg leading-tight">
            {value == null ? 'brak danych' : formatValue(value, unitName)}
          </div>
          {rank != null && (
            <div className="text-xs text-olowek">
              {rank}. miejsce wśród {total} {levelNoun}
            </div>
          )}
        </div>
        {onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-full min-h-[44px] px-4 py-2.5 bg-tusz text-arkusz text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-tusz flex items-center justify-center cursor-pointer"
          >
            Otwórz profil
          </button>
        )}
      </div>
    );
  }

  const flip = x > containerWidth - 260;
  return (
    <div
      role="status"
      className="absolute z-30 pointer-events-none bg-arkusz text-tusz border border-linia p-3 w-[240px]"
      style={{ left: flip ? x - 252 : x + 14, top: y + 14 }}
    >
      <div className="font-semibold text-sm">{unitLabel(unit)}</div>
      <div className="font-mono font-bold text-lg leading-tight">
        {value == null ? 'brak danych' : formatValue(value, unitName)}
      </div>
      {rank != null && (
        <div className="text-xs text-olowek">
          {rank}. miejsce wśród {total} {levelNoun}
        </div>
      )}
      <div className="text-xs text-olowek mt-1">Kliknij, aby otworzyć profil</div>
    </div>
  );
}

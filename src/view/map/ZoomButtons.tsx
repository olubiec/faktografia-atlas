import { Plus, Minus } from 'iconoir-react';
import { Icon } from '@/view/ui/Icon';
import { useSheetInset } from '@/view/map/sheetInset';

type ZoomButtonsProps = {
  onZoom: (delta: 1 | -1) => void;
  canZoomIn?: boolean;
  canZoomOut?: boolean;
};

const BUTTON =
  'flex items-center justify-center min-h-[44px] min-w-[44px] border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz cursor-pointer rounded-none focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz disabled:opacity-50 disabled:cursor-default';

/** Widok przycisków; `bottom` (px) = wysokość dolnego arkusza, żeby go nie zasłaniał. */
export function ZoomButtonsView({
  onZoom,
  canZoomIn = true,
  canZoomOut = true,
  bottom,
}: ZoomButtonsProps & { bottom: number }) {
  return (
    <div
      role="group"
      aria-label="Powiększenie mapy"
      className="absolute right-4 z-10 mb-4 flex flex-col"
      style={{ bottom }}
      onClick={(e) => e.stopPropagation()}
    >
      <button type="button" aria-label="Przybliż" title="Przybliż" disabled={!canZoomIn} onClick={() => onZoom(1)} className={BUTTON}>
        <Icon icon={Plus} aria-hidden={true} size={20} />
      </button>
      <button type="button" aria-label="Oddal" title="Oddal" disabled={!canZoomOut} onClick={() => onZoom(-1)} className={`${BUTTON} border-t-0`}>
        <Icon icon={Minus} aria-hidden={true} size={20} />
      </button>
    </div>
  );
}

export function ZoomButtons(props: ZoomButtonsProps) {
  return <ZoomButtonsView {...props} bottom={useSheetInset()} />;
}

export default ZoomButtons;

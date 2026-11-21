import { NavArrowLeft } from 'iconoir-react';
import { Icon } from '@/view/ui/Icon';
import { TOP_ZONE_CLASS } from './sheetInset';

type BackButtonProps = {
  onClick: () => void;
  visible: boolean;
};

export function BackButton({ onClick, visible }: BackButtonProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Wróć do wyższego poziomu"
      className={`${TOP_ZONE_CLASS} flex items-center gap-2 min-h-[44px] min-w-[44px] px-3 py-2 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-sm font-medium cursor-pointer rounded-none focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz`}
    >
      <Icon icon={NavArrowLeft} aria-hidden={true} size={20} />
      <span>Wróć</span>
    </button>
  );
}

export default BackButton;

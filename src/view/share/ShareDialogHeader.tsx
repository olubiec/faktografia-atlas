import React from 'react';
import { Xmark } from 'iconoir-react';

export interface ShareDialogHeaderProps {
  onClose: () => void;
}

/** Nagłówek okna „Pobierz i udostępnij” z przyciskiem zamknięcia (sticky, zawsze widoczny). */
export const ShareDialogHeader: React.FC<ShareDialogHeaderProps> = ({ onClose }) => (
  <div className="sticky top-0 z-10 bg-arkusz flex items-center justify-between border-b border-linia p-3 md:p-6 shrink-0">
    <h2 className="text-lg md:text-xl font-bold">Pobierz i udostępnij</h2>
    <button
      type="button"
      onClick={onClose}
      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-olowek hover:text-tusz border border-transparent hover:border-linia transition-colors"
      aria-label="Zamknij"
    >
      <Xmark className="w-5 h-5" />
    </button>
  </div>
);

export default ShareDialogHeader;

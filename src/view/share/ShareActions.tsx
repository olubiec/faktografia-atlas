import React from 'react';

export type ShareActionsProps = {
  isProcessing: boolean;
  canNativeShare: boolean;
  canDownloadAll: boolean;
  onDownloadPng: () => void;
  onShare: () => void;
  onShareSet: () => void;
  onDownloadAll: () => void;
  onDownloadCsv: () => void;
};

const PRIMARY =
  'min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold whitespace-normal break-words text-center leading-tight bg-tusz text-kalka hover:opacity-90 transition-opacity grow basis-32 sm:grow-0 sm:basis-auto';
const SECONDARY =
  'min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold whitespace-normal break-words text-center leading-tight bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors grow basis-32 sm:grow-0 sm:basis-auto';

/** Stały dolny pasek: treść nad nim przewija się, a pasek sam przewija się, gdy jest za wysoki. */
export const ShareActions: React.FC<ShareActionsProps> = ({
  isProcessing,
  canNativeShare,
  canDownloadAll,
  onDownloadPng,
  onShare,
  onShareSet,
  onDownloadAll,
  onDownloadCsv,
}) => (
  <div
    data-testid="share-actions"
    className="z-10 bg-arkusz border-t border-linia p-3 md:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0 max-h-[40dvh] overflow-y-auto flex flex-wrap gap-2 items-center justify-between"
  >
    <div className="flex flex-wrap gap-2 w-full max-w-full">
      <button type="button" disabled={isProcessing} onClick={onDownloadPng} className={PRIMARY}>
        Pobierz obraz
      </button>
      {canNativeShare && (
        <button type="button" disabled={isProcessing} onClick={onShare} className={SECONDARY}>
          Udostępnij
        </button>
      )}
      <button type="button" disabled={isProcessing} onClick={onShareSet} className={SECONDARY}>
        Udostępnij zestaw
      </button>
      <button type="button" disabled={isProcessing || !canDownloadAll} onClick={onDownloadAll} className={SECONDARY}>
        Pobierz wszystkie
      </button>
      <button type="button" disabled={isProcessing} onClick={onDownloadCsv} className={SECONDARY}>
        Pobierz dane (CSV)
      </button>
    </div>
  </div>
);

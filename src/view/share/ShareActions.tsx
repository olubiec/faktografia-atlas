import React from "react";

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
  "min-h-[44px] min-w-[44px] px-2 py-2 text-sm font-semibold whitespace-normal break-words text-center leading-tight bg-tusz text-kalka hover:opacity-90 transition-opacity md:grow-0 md:basis-auto md:px-4";
const SECONDARY =
  "min-h-[44px] min-w-[44px] px-2 py-2 text-sm font-semibold whitespace-normal break-words text-center leading-tight bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors md:grow-0 md:basis-auto md:px-4";

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
    <div className="grid grid-cols-2 gap-2 w-full max-w-full [&>*:last-child:nth-child(odd)]:col-span-2 md:flex md:flex-wrap md:[&>*:last-child:nth-child(odd)]:col-span-1">
      <button
        type="button"
        disabled={isProcessing}
        onClick={onDownloadPng}
        aria-label="Pobierz obraz"
        className={PRIMARY}
      >
        <span className="md:hidden">Obraz</span>
        <span className="hidden md:inline">Pobierz obraz</span>
      </button>
      {canNativeShare && (
        <button
          type="button"
          disabled={isProcessing}
          onClick={onShare}
          aria-label="Udostępnij"
          className={SECONDARY}
        >
          Udostępnij
        </button>
      )}
      <button
        type="button"
        disabled={isProcessing}
        onClick={onShareSet}
        aria-label="Udostępnij zestaw"
        className={SECONDARY}
      >
        <span className="md:hidden">Zestaw</span>
        <span className="hidden md:inline">Udostępnij zestaw</span>
      </button>
      <button
        type="button"
        disabled={isProcessing || !canDownloadAll}
        onClick={onDownloadAll}
        aria-label="Pobierz wszystkie"
        className={SECONDARY}
      >
        <span className="md:hidden">Wszystkie</span>
        <span className="hidden md:inline">Pobierz wszystkie</span>
      </button>
      <button
        type="button"
        disabled={isProcessing}
        onClick={onDownloadCsv}
        aria-label="Pobierz dane (CSV)"
        className={SECONDARY}
      >
        <span className="md:hidden">(CSV)</span>
        <span className="hidden md:inline">Pobierz dane (CSV)</span>
      </button>
    </div>
  </div>
);

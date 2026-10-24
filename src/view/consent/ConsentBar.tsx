import { useEffect, useState } from 'react';
import { readConsent, writeConsent, shouldAskForConsent } from '@/core/consent/consent';
import { startAnalytics } from '@/core/consent/analytics';

export interface ConsentBarProps {
  storage?: Storage | null;
}

export function ConsentBar({ storage }: ConsentBarProps) {
  const [visible, setVisible] = useState(() => shouldAskForConsent(storage));

  useEffect(() => {
    const consent = readConsent(storage);
    if (consent === 'granted') {
      void startAnalytics(undefined, storage);
    }
  }, [storage]);

  if (!visible) {
    return null;
  }

  const handleAccept = () => {
    writeConsent(storage, 'granted');
    void startAnalytics(undefined, storage);
    setVisible(false);
  };

  const handleDeny = () => {
    writeConsent(storage, 'denied');
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Zgoda na analitykę"
      className="fixed bottom-0 inset-x-0 z-40 bg-arkusz text-tusz border-t border-linia p-2 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 motion-reduce:transition-none transition-all duration-200"
    >
      <p className="text-xs sm:text-sm text-tusz font-normal m-0 text-center sm:text-left flex items-center justify-center sm:justify-start flex-wrap gap-1 leading-tight sm:leading-normal">
        <span>Czy możemy liczyć anonimowo, czego szukasz?</span>
        <a
          href="/prywatnosc"
          className="underline hover:text-olowek focus:outline-none focus:ring-2 focus:ring-tusz inline-flex items-center justify-center font-medium min-h-[44px] min-w-[44px] p-1 sm:p-0"
        >
          Więcej
        </a>
      </p>
      <div className="flex items-center gap-2 sm:gap-3 flex-nowrap justify-center sm:justify-end w-full sm:w-auto">
        <button
          type="button"
          onClick={handleDeny}
          className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium border border-linia bg-transparent text-tusz hover:bg-linia/20 cursor-pointer rounded-none focus:outline-none focus:ring-2 focus:ring-tusz flex-1 sm:flex-none"
        >
          Nie
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium bg-tusz text-arkusz border border-tusz hover:bg-tusz/90 cursor-pointer rounded-none focus:outline-none focus:ring-2 focus:ring-tusz flex-1 sm:flex-none"
        >
          Zgadzam się
        </button>
      </div>
    </div>
  );
}

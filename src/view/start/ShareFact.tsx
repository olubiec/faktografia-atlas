// Przycisk „Udostępnij” na karcie (W33-O08): tekst z liczbą i linkiem, bez obrazka (D9 zostaje wstrzymane).
import { Check, ShareAndroid } from 'iconoir-react';
import { useState } from 'react';
import { shareOrCopy, shareText, type ShareCard, type ShareResult } from '../../core/facts/share-text';
import { Icon } from '../ui/Icon';

export interface ShareFactProps {
  place: string;
  card: ShareCard;
  /** Adres do wysłania (strona miejsca); dostaje ?ref=karta. */
  link: string;
}

const NOTE: Partial<Record<ShareResult, string>> = { copied: 'Skopiowano', error: 'Nie udało się skopiować' };

export function ShareFact({ place, card, link }: ShareFactProps) {
  const [result, setResult] = useState<ShareResult | null>(null);
  const onClick = async () => {
    const text = shareText(place, card, link);
    setResult(await shareOrCopy(typeof navigator === 'undefined' ? undefined : navigator, `${place} na tle Polski`, text));
  };
  const note = result ? NOTE[result] : undefined;
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void onClick()}
        aria-label="Udostępnij tę kartę"
        className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center border border-linia bg-transparent text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz"
      >
        <Icon icon={result === 'copied' ? Check : ShareAndroid} aria-hidden={true} size={20} />
      </button>
      <span role="status" aria-live="polite" className="text-xs text-olowek">{note ?? ''}</span>
    </span>
  );
}

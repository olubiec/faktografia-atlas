import { useEffect, useRef, useState } from 'react';
import { Copy, Download } from 'iconoir-react';
import { Icon } from '../ui/Icon';
import { isShareEnabled } from '../../core/share/share-flag';

export interface ShareBarProps {
  /** Adres do skopiowania; domyślnie bieżący `window.location.href`. */
  url?: string;
  /** Otwiera okno eksportu (ładowane po kliknięciu – pasek go nie importuje). */
  onOpenDialog?: () => void;
  /** Czy pokazać „Pobierz i udostępnij” (domyślnie tak). */
  showDownload?: boolean;
  /** Opcjonalny nagłówek nad paskiem. */
  label?: string;
}

type CopyState = 'idle' | 'copied' | 'manual';

const COPIED_MS = 2000;

const BUTTON_CLASS =
  'min-h-[44px] min-w-[44px] px-4 py-2 bg-arkusz border border-linia hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz text-xs font-semibold text-tusz cursor-pointer transition-colors flex items-center gap-2';

// Pasek „Kopiuj link · Pobierz i udostępnij”. Render bez efektów ubocznych.
export function ShareBar({ url, onOpenDialog, showDownload = true, label }: ShareBarProps) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const resolveUrl = () => url ?? (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = () => {
    const target = resolveUrl();
    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (!clipboard || typeof clipboard.writeText !== 'function') {
      setState('manual');
      return;
    }
    let pending: Promise<void>;
    try {
      pending = Promise.resolve(clipboard.writeText(target));
    } catch {
      setState('manual');
      return;
    }
    pending.then(
      () => {
        setState('copied');
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setState('idle'), COPIED_MS);
      },
      () => setState('manual'),
    );
  };

  return (
    <div className="flex flex-col gap-2 max-w-full">
      {label ? <span className="text-xs font-semibold text-olowek">{label}</span> : null}
      <div className="flex flex-wrap gap-2 max-w-full">
        <button type="button" onClick={handleCopy} className={BUTTON_CLASS}>
          <Icon icon={Copy} size={16} aria-hidden={true} />
          <span role="status" aria-live="polite" className="inline-block min-w-[10ch] text-left">
            {state === 'copied' ? 'Skopiowano' : 'Kopiuj link'}
          </span>
        </button>
        {showDownload && onOpenDialog && isShareEnabled() ? (
          <button type="button" onClick={onOpenDialog} className={BUTTON_CLASS}>
            <Icon icon={Download} size={16} aria-hidden={true} />
            <span>Pobierz i udostępnij</span>
          </button>
        ) : null}
      </div>
      {state === 'manual' ? (
        <div className="flex flex-col gap-1 max-w-full">
          <span className="text-xs text-olowek">Skopiuj ręcznie</span>
          <input
            readOnly
            aria-label="Link do skopiowania"
            value={resolveUrl()}
            ref={(el) => el?.select()}
            onFocus={(e) => e.currentTarget.select()}
            className="min-h-[44px] w-full max-w-full px-3 py-2 bg-arkusz border border-linia text-xs text-tusz"
          />
        </div>
      ) : null}
    </div>
  );
}

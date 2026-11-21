import { useState } from 'react';
import { Link } from 'iconoir-react';
import { Icon } from '../ui/Icon';

/** „Kopiuj link”: kopiuje aktualny adres i na 2 s pokazuje „Skopiowano”. Pole dotykowe min. 44 px. */
export function CopyLinkButton({ className = '' }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (typeof window === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };
  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={`min-h-[44px] min-w-[44px] px-3 py-2 bg-arkusz border border-linia hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz text-xs font-semibold text-tusz cursor-pointer transition-colors flex items-center justify-center gap-2 ${className}`}
      >
        <Icon icon={Link} size={16} aria-hidden={true} />
        <span>{copied ? 'Skopiowano' : 'Kopiuj link'}</span>
      </button>
      <div aria-live="polite" className="sr-only">
        {copied ? 'Skopiowano link do schowka' : ''}
      </div>
    </>
  );
}

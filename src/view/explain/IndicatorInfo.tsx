import { useEffect, useState } from 'react';
import { HelpCircle } from 'iconoir-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@/view/ui/Icon';
import type { Explanation } from '@/core/explain/explanations';

export interface IndicatorInfoProps {
  indicatorId: string;
  name: string;
  explanation?: Explanation | null;
  variant?: 'popover' | 'inline';
}

function ExplanationSections({ explanation }: { explanation: Explanation }) {
  return (
    <div className="space-y-3 text-tusz text-xs">
      <div>
        <h3 className="font-semibold text-tusz text-xs mb-0.5">Co to jest</h3>
        <p className="text-olowek text-xs leading-relaxed">{explanation.short}</p>
      </div>

      <div>
        <h3 className="font-semibold text-tusz text-xs mb-0.5">Jak czytać</h3>
        <p className="text-olowek text-xs leading-relaxed">{explanation.howToRead}</p>
      </div>

      {explanation.world && (
        <div>
          <h3 className="font-semibold text-tusz text-xs mb-0.5">Polska i świat</h3>
          <p className="text-olowek text-xs leading-relaxed mb-1">{explanation.world.text}</p>
          <a
            href={explanation.world.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-tusz underline hover:text-olowek focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skupienie text-xs"
          >
            {explanation.world.source} ({explanation.world.year})
          </a>
        </div>
      )}

      {explanation.funFact && (
        <div>
          <h3 className="font-semibold text-tusz text-xs mb-0.5">Ciekawostka</h3>
          <p className="text-olowek text-xs leading-relaxed mb-1">{explanation.funFact.text}</p>
          <a
            href={explanation.funFact.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-tusz underline hover:text-olowek focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skupienie text-xs"
          >
            {explanation.funFact.source}
          </a>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-tusz text-xs mb-0.5">Źródła</h3>
        <a
          href={explanation.definitionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-tusz underline hover:text-olowek focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skupienie text-xs"
        >
          GUS — Pojęcia w statystyce publicznej
        </a>
      </div>
    </div>
  );
}

const COARSE_QUERY = '(pointer: coarse), (max-width: 767px)';

// Ekran dotykowy lub wąski: wyjaśnienie w pełnym dialogu zamiast dymku.
function useCompactScreen(): boolean {
  const get = () => typeof window !== 'undefined' && window.matchMedia(COARSE_QUERY).matches;
  const [compact, setCompact] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(COARSE_QUERY);
    const onChange = () => setCompact(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return compact;
}

const TRIGGER_CLASS =
  'inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 text-olowek hover:text-tusz focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skupienie rounded-none transition-colors';

export function IndicatorInfo({
  indicatorId: _indicatorId,
  name,
  explanation,
  variant = 'popover',
}: IndicatorInfoProps) {
  const compact = useCompactScreen();
  if (!explanation) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <div className="bg-arkusz border border-linia p-4 rounded-none">
        <ExplanationSections explanation={explanation} />
      </div>
    );
  }

  if (compact) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" aria-label={`Co to znaczy: ${name}`} className={TRIGGER_CLASS}>
            <Icon icon={HelpCircle} size={20} aria-hidden={true} />
          </button>
        </DialogTrigger>
        {/* Nad arkuszem (react-modal-sheet ma 9999). */}
        <DialogContent
          data-slot="indicator-info-dialog"
          // Escape zamyka tylko to okno, nie arkusz pod spodem (arkusz słucha Escape na window).
          onEscapeKeyDown={(e) => e.stopPropagation()}
          className="z-[10000] inset-0 top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-4 p-4 flex flex-col overflow-y-auto"
        >
          <DialogTitle className="text-sm font-semibold pr-12">{name}</DialogTitle>
          <DialogDescription className="sr-only">Wyjaśnienie wskaźnika</DialogDescription>
          <ExplanationSections explanation={explanation} />
          <DialogClose className="mt-auto min-h-[44px] w-full border border-linia bg-arkusz text-tusz text-sm font-semibold rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skupienie">
            Zamknij
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Co to znaczy: ${name}`} className={TRIGGER_CLASS}>
          <Icon icon={HelpCircle} size={20} aria-hidden={true} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="z-[10000] w-80 max-w-[calc(100vw-32px)] sm:w-96 text-tusz text-xs border border-linia bg-arkusz p-4 rounded-none">
        <ExplanationSections explanation={explanation} />
      </PopoverContent>
    </Popover>
  );
}

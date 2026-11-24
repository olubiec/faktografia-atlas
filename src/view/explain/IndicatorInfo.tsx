import { InfoPopover } from '@/view/ui/InfoPopover';
import type { Explanation } from '@/core/explain/explanations';
import { readingNotes } from '@/core/explain/reading-notes';

export interface IndicatorInfoProps {
  indicatorId: string;
  name: string;
  explanation?: Explanation | null;
  /** Jednostka wskaźnika – z niej biorą się wskazówki „jak czytać” także bez ręcznego opisu. */
  unit?: string;
  variant?: 'popover' | 'inline';
}

function NotesSection({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null;
  return (
    <div data-slot="reading-notes">
      <h3 className="font-semibold text-tusz text-xs mb-0.5">Jak czytać wartości</h3>
      {notes.map((t) => (
        <p key={t} className="text-olowek text-xs leading-relaxed mb-1">{t}</p>
      ))}
    </div>
  );
}

function ExplanationSections({ explanation, notes }: { explanation: Explanation | null; notes: string[] }) {
  if (!explanation) {
    return (
      <div className="space-y-3 text-tusz text-xs">
        <NotesSection notes={notes} />
      </div>
    );
  }
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

      <NotesSection notes={notes} />

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

export function IndicatorInfo({
  indicatorId: _indicatorId,
  name,
  explanation,
  unit = '',
  variant = 'popover',
}: IndicatorInfoProps) {
  const notes = readingNotes(name, unit);
  if (!explanation && notes.length === 0) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <div className="bg-arkusz border border-linia p-4 rounded-none">
        <ExplanationSections explanation={explanation ?? null} notes={notes} />
      </div>
    );
  }

  return (
    <InfoPopover
      label={`Co to znaczy: ${name}`}
      buttonClassName="inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 text-olowek hover:text-tusz focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skupienie rounded-none transition-colors"
    >
      <ExplanationSections explanation={explanation ?? null} notes={notes} />
    </InfoPopover>
  );
}

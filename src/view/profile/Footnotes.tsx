import type { Footnote } from '../../core/profile/footnotes';

export interface FootnotesProps {
  footnotes: Footnote[];
}

/**
 * Komponent prezentujący skonsolidowaną listę numerowanych przypisów na dole profilu.
 */
export function Footnotes({ footnotes }: FootnotesProps) {
  if (!footnotes || footnotes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <h4 className="sr-only">Przypisy</h4>
      <ol className="list-none space-y-1 text-xs text-olowek font-mono">
        {footnotes.map((fn) => (
          <li id={`footnote-${fn.id}`} key={fn.id} className="break-words">
            <span className="font-bold mr-1">{fn.id}.</span>
            <span>{fn.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

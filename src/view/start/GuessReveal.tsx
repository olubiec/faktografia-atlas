// Pytanie przed wynikiem (W34-O09): spokojne, jedno stuknięcie, bez punktów, odznak i zapisu. Bez animacji.
import { useState, type ReactNode } from 'react';
import { guessStart, pick, reveal, type Guess, type GuessState } from '@/core/facts/guess';

export interface GuessRevealProps {
  guess: Guess | null;
  /** Wynik: zdanie główne karty (i reszta karty). */
  children: ReactNode;
  /** Tylko do testów: stan początkowy. */
  initial?: GuessState;
}

const BTN = 'inline-flex min-h-[44px] cursor-pointer items-center border border-linia bg-transparent px-3 text-sm text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz';

export function GuessReveal({ guess, children, initial = guessStart }: GuessRevealProps) {
  const [state, setState] = useState<GuessState>(initial);
  if (!guess || state.shown) {
    const chosen = guess && state.picked !== null ? guess.options[state.picked] : null;
    return (
      <div data-slot="guess-result" className="flex flex-col gap-2">
        {chosen && <p className="m-0 text-sm text-olowek">{`Twoja odpowiedź: ${chosen.label}. Wynik:`}</p>}
        {children}
      </div>
    );
  }
  return (
    <div data-slot="guess-question" className="flex flex-col gap-3">
      <p className="m-0 text-base font-semibold leading-snug text-tusz break-words">{guess.question}</p>
      <div className="flex flex-wrap gap-2">
        {guess.options.map((o, i) => (
          <button key={o.label} type="button" className={BTN} onClick={() => setState((s) => pick(s, i))}>
            {o.label}
          </button>
        ))}
      </div>
      <button type="button" className={`${BTN} self-start underline`} onClick={() => setState((s) => reveal(s))}>
        Pokaż wynik
      </button>
    </div>
  );
}

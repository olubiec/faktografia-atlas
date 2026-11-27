import { END_KEYS, END_LABELS, type EndKey } from '@/core/start/list-ends';

export interface EndSwitchProps {
  value: EndKey;
  onChange: (end: EndKey) => void;
}

/** Przełącznik „Najwyższe | Najniższe”: ten sam na starcie (zestawienia) i na stronie Rankingi. */
export function EndSwitch({ value, onChange }: EndSwitchProps) {
  return (
    <div role="group" aria-label="Który koniec skali" className="flex self-start border border-linia" data-slot="start-list-ends">
      {END_KEYS.map((k) => (
        <button
          key={k}
          type="button"
          aria-pressed={k === value}
          onClick={() => onChange(k)}
          className={`min-h-[44px] min-w-11 cursor-pointer px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tusz ${k === value ? 'bg-tusz font-bold text-arkusz' : 'bg-arkusz text-tusz hover:bg-linia/20'}`}
        >
          {END_LABELS[k]}
        </button>
      ))}
    </div>
  );
}

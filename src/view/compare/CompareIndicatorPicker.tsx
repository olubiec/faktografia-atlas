export interface CompareIndicatorOption {
  id: string;
  name: string;
}

export interface CompareIndicatorPickerProps {
  options: CompareIndicatorOption[];
  selected: string[];
  onToggle: (id: string) => void;
}

/** Pola wyboru wskaźników widocznych w porównaniu (pola dotykowe min. 44 px). */
export function CompareIndicatorPicker({ options, selected, onToggle }: CompareIndicatorPickerProps) {
  const chosen = new Set(selected);
  return (
    <details data-slot="compare-indicator-picker" className="border border-linia bg-arkusz">
      <summary className="flex min-h-11 cursor-pointer items-center px-3 text-xs font-medium text-tusz">
        Wskaźniki ({selected.length} z {options.length})
      </summary>
      <ul className="divide-y divide-linia border-t border-linia">
        {options.map((o) => (
          <li key={o.id}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3 text-xs text-tusz">
              <input
                type="checkbox"
                className="size-5 shrink-0"
                checked={chosen.has(o.id)}
                onChange={() => onToggle(o.id)}
                data-indicator-id={o.id}
              />
              <span className="break-words">{o.name}</span>
            </label>
          </li>
        ))}
      </ul>
    </details>
  );
}

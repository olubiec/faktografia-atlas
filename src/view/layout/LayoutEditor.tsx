// Edytor układu: przyciski góra/dół i przełącznik widoczności (bez przeciągania, dobry na telefon).
import { ArrowDown, ArrowUp, Eye, EyeClosed } from 'iconoir-react';
import { Icon } from '../ui/Icon';
import { BLOCK_LABELS } from './blockLabels';
import {
  moveBlock,
  toggleBlock,
  presetLayout,
  type Layout,
  type PresetName,
} from '../../core/layout/layout';

interface Props {
  layout: Layout;
  onChange: (next: Layout) => void;
}

const btn =
  'inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 border border-linia bg-transparent text-tusz hover:bg-linia/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-tusz disabled:text-olowek disabled:cursor-not-allowed disabled:hover:bg-transparent';

export function LayoutEditor({ layout, onChange }: Props) {
  const presets: PresetName[] = ['podstawowy', 'pełny'];
  return (
    <section aria-labelledby="layout-editor-title" className="flex flex-col gap-3">
      <h2 id="layout-editor-title" className="text-base font-medium text-tusz m-0">
        Układ strony
      </h2>
      <div className="flex flex-wrap gap-2">
        {presets.map((name) => (
          <button key={name} type="button" className={btn} onClick={() => onChange(presetLayout(name))}>
            Układ {name}
          </button>
        ))}
      </div>
      <ol className="list-none p-0 m-0 flex flex-col gap-2">
        {layout.map((block, i) => {
          const label = BLOCK_LABELS[block.id];
          return (
            <li
              key={block.id}
              className="flex items-center justify-between gap-2 border border-linia bg-arkusz p-2"
            >
              <span className={block.visible ? 'text-tusz text-sm' : 'text-olowek text-sm'}>{label}</span>
              <span className="flex gap-1">
                <button
                  type="button"
                  className={btn}
                  aria-pressed={block.visible}
                  aria-label={`${block.visible ? 'Ukryj' : 'Pokaż'}: ${label}`}
                  onClick={() => onChange(toggleBlock(layout, block.id))}
                >
                  <Icon icon={block.visible ? Eye : EyeClosed} aria-hidden />
                </button>
                <button
                  type="button"
                  className={btn}
                  disabled={i === 0}
                  aria-label={`Przesuń w górę: ${label}`}
                  onClick={() => onChange(moveBlock(layout, block.id, -1))}
                >
                  <Icon icon={ArrowUp} aria-hidden />
                </button>
                <button
                  type="button"
                  className={btn}
                  disabled={i === layout.length - 1}
                  aria-label={`Przesuń w dół: ${label}`}
                  onClick={() => onChange(moveBlock(layout, block.id, 1))}
                >
                  <Icon icon={ArrowDown} aria-hidden />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

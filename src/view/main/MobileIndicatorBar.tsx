import type { ReactNode } from 'react';

type MobileIndicatorBarProps = {
  view: {
    indicator: { name: string; unit: string; minLevel: string };
    year: number | null;
  };
  children?: ReactNode;
};

export function MobileIndicatorBar({ view }: MobileIndicatorBarProps) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center border-t border-linia bg-arkusz text-tusz p-3 min-h-[48px] font-medium pb-[calc(12px+env(safe-area-inset-bottom))]"
    >
      <span className="truncate max-w-full">
        {view.indicator.name} <span className="text-olowek">▾</span> · {view.year ?? '...'}
      </span>
    </button>
  );
}

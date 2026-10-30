interface TrendStatusProps {
  liveRegionId: string;
  label: string;
  currentActiveYear: number | null;
  formattedActiveValue: string;
}

export function TrendStatus({
  liveRegionId,
  label,
  currentActiveYear,
  formattedActiveValue,
}: TrendStatusProps) {
  return (
    <div
      id={liveRegionId}
      aria-live="polite"
      className="flex items-center justify-between text-xs font-mono text-olowek mb-2 min-h-[24px]"
    >
      <span className="font-semibold text-tusz">{label}</span>
      <span>
        {currentActiveYear}: {formattedActiveValue}
      </span>
    </div>
  );
}

export function TrendLegend({
  label,
  compareLabel,
  hasCompareSeries,
}: {
  label: string;
  compareLabel?: string;
  hasCompareSeries: boolean;
}) {
  if (!hasCompareSeries || !compareLabel) return null;

  return (
    <div className="flex items-center gap-4 text-xs text-olowek mt-2 border-t border-linia pt-2">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-0.5 bg-tusz inline-block" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-0.5 border-b border-dashed border-olowek inline-block" />
        <span>{compareLabel}</span>
      </div>
    </div>
  );
}

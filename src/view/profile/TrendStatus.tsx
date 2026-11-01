export interface TrendStatusProps {
  id?: string;
  label: string;
  year: number | null;
  formattedValue: string;
}

/**
 * Pasek statusu wykresu trendu z obsługą czytników ekranu (aria-live="polite").
 */
export function TrendStatus({
  id,
  label,
  year,
  formattedValue,
}: TrendStatusProps) {
  return (
    <div
      id={id}
      aria-live="polite"
      className="flex items-center justify-between text-xs font-mono text-olowek mb-2 min-h-[24px]"
    >
      <span className="font-semibold text-tusz">{label}</span>
      <span>
        {year}: {formattedValue}
      </span>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { loadFreshnessLabel } from '../../core/freshness/freshness-label';

/** Sam tekst; brak etykiety = nic. */
export function DataFreshnessText({ label }: { label: string | null }) {
  if (!label) return null;
  return <p className="text-xs font-[400] text-olowek leading-[1.5]">{label}</p>;
}

/** Wczytuje datę odświeżenia danych i pokazuje jedną linijkę. */
export function DataFreshness() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadFreshnessLabel().then((l) => {
      if (!cancelled) setLabel(l);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return <DataFreshnessText label={label} />;
}

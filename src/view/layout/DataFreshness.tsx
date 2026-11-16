import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { freshnessFetchAllowed, loadFreshnessLabel } from '../../core/freshness/freshness-label';

/** Sam tekst; brak etykiety = nic. */
export function DataFreshnessText({ label, className = '' }: { label: string | null; className?: string }) {
  if (!label) return null;
  return <p className={`text-xs font-[400] text-olowek leading-[1.5] ${className}`.trim()}>{label}</p>;
}

/** Wczytuje datę odświeżenia danych i pokazuje jedną linijkę. */
export function DataFreshness({ className }: { className?: string }) {
  const [label, setLabel] = useState<string | null>(null);
  const { pathname } = useLocation();
  const allowed = freshnessFetchAllowed(pathname);
  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    loadFreshnessLabel().then((l) => {
      if (!cancelled) setLabel(l);
    });
    return () => {
      cancelled = true;
    };
  }, [allowed]);
  return <DataFreshnessText label={allowed ? label : null} className={className} />;
}

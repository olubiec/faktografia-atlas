import { useState } from 'react';
import { describeCheck, describeFreshness, formatDay, latestTimestamp } from '../../core/data/freshness';
import type { DataStatus } from '../../core/data/load-status';

export interface DataFreshnessProps {
  /** Data pobrania bieżącego wskaźnika; gdy brak, bierzemy najnowszą z pliku statusu. */
  fetchedAt?: string | null;
  status?: DataStatus | null;
  now?: Date;
  className?: string;
}

/** Napis „Dane z 19.10.2026 · Sprawdzone przez automat: wczoraj”; po 3 dniach ciszy dopisek „uwaga”. */
export function DataFreshness({ fetchedAt, status, now, className = '' }: DataFreshnessProps) {
  const [mountedAt] = useState(() => new Date());
  const current = now ?? mountedAt;
  const dataIso = fetchedAt ?? status?.values?.latestFetchedAt ?? null;
  const dataDate = latestTimestamp([dataIso]);
  const data = dataDate ? `Dane z ${formatDay(dataDate)}` : null;
  const check = describeCheck(status?.checkedAt, current);
  const stale = describeFreshness(status?.checkedAt, current)?.stale ?? false;
  if (!data && !check) return null;
  return (
    <p className={`text-xs text-olowek ${className}`.trim()}>
      {data}
      {data && check ? ' · ' : null}
      {check && (
        <span role={stale ? 'status' : undefined}>
          {stale ? 'Uwaga: ' : ''}
          {check}
        </span>
      )}
    </p>
  );
}

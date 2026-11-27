import { useEffect, useState } from 'react';
import { popularOnly } from '@/core/catalog/curation';
import { loadAvailable, peekAvailable } from '@/core/indicators/load-available';
import type { AvailableFile } from '@/core/indicators/registry';

/**
 * Spis biblioteki dla karuzeli: wczytujemy go dopiero, gdy dane startu są gotowe (`ready`), żeby nie zabierać
 * budżetu pierwszego ładowania. Zwraca popularne wskaźniki z biblioteki (jak menu „Wybierz dane”) albo null przed wczytaniem.
 */
export function useLibraryRing(ready: boolean): AvailableFile | null {
  const [available, setAvailable] = useState<AvailableFile | null>(() => popularOnly(peekAvailable() ?? null));
  useEffect(() => {
    if (!ready || available) return;
    let cancelled = false;
    loadAvailable().then((a) => {
      if (!cancelled) setAvailable(popularOnly(a));
    });
    return () => {
      cancelled = true;
    };
  }, [ready, available]);
  return available;
}

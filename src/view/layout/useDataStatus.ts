import { useEffect, useState, type RefObject } from 'react';
import { loadDataStatus, type DataStatus } from '../../core/data/load-status';

/**
 * Status danych dla stopki. Żądanie idzie dopiero, gdy stopka wjedzie w widok: ekran mapy go nie robi,
 * a brak pliku nie zaśmieca konsoli na starcie. `initial` (testy) pomija pobieranie.
 */
export function useDataStatus(target: RefObject<Element | null>, initial?: DataStatus | null) {
  const [status, setStatus] = useState<DataStatus | null>(initial ?? null);
  useEffect(() => {
    if (initial !== undefined) return;
    let alive = true;
    const run = () => void loadDataStatus().then((s) => alive && setStatus(s));
    const el = target.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      const timer = setTimeout(run, 1500);
      return () => {
        alive = false;
        clearTimeout(timer);
      };
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        run();
      }
    });
    observer.observe(el);
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [initial, target]);
  return status;
}

import { useEffect, useState, type RefObject } from 'react';

/**
 * true od chwili, gdy element zbliży się do ekranu (zapas `margin`), i już tak zostaje.
 * Dane sekcji pod przyciskiem „Otwórz mapę” pobieramy dopiero wtedy – pierwsze wejście na `/` jest lekkie.
 * Bez IntersectionObserver (stare przeglądarki) od razu true.
 */
export function useNearViewport(ref: RefObject<Element | null>, margin = '400px'): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (near) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true);
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}

import { useEffect, useRef, type RefObject } from "react";

/** Przewijanie bez animacji, gdy użytkownik wyłączył ruch w systemie. */
export const scrollBehavior = (): ScrollBehavior =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

/**
 * Tor slajdów z `scroll-snap`: przesunięcie palcem zmienia aktywny slajd (IntersectionObserver na slajdach),
 * a `goTo` przewija tor do wybranego slajdu. W czasie przewijania z `goTo` pośrednie slajdy są ignorowane,
 * żeby pasek wskaźników nie migał po drodze.
 */
export function useCarouselSync(
  track: RefObject<HTMLElement | null>,
  count: number,
  onIndex: (i: number) => void,
) {
  const target = useRef<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const report = useRef(onIndex);
  useEffect(() => {
    report.current = onIndex;
  });

  useEffect(() => {
    const el = track.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const slides = Array.from(el.children);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || e.intersectionRatio < 0.6) continue;
          const i = slides.indexOf(e.target);
          if (i < 0) continue;
          if (target.current !== null) {
            if (i !== target.current) continue;
            target.current = null;
          }
          report.current(i);
        }
      },
      { root: el, threshold: [0.6] },
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [track, count]);

  // Dotyk lub kółko myszy przerywa przewijanie z `goTo`: od tej chwili liczy się ręka użytkownika.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const release = () => {
      target.current = null;
    };
    const events = ['pointerdown', 'touchstart', 'wheel'] as const;
    events.forEach((e) => el.addEventListener(e, release, { passive: true }));
    return () => {
      events.forEach((e) => el.removeEventListener(e, release));
      window.clearTimeout(timer.current);
    };
  }, [track]);

  return (i: number) => {
    const el = track.current;
    if (!el) return;
    // Tor już stoi na tym slajdzie: nic się nie przewinie, więc nie czekamy na zdarzenie dojścia do celu.
    if (Math.abs(el.scrollLeft - i * el.clientWidth) < 2) {
      target.current = null;
      return;
    }
    target.current = i;
    // Zabezpieczenie: gdyby przeglądarka nie zgłosiła dojścia do celu, po chwili znów słuchamy przesunięć.
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      target.current = null;
      if (el.clientWidth > 0) report.current(Math.round(el.scrollLeft / el.clientWidth));
    }, 900);
    el.scrollTo({ left: i * el.clientWidth, behavior: scrollBehavior() });
  };
}

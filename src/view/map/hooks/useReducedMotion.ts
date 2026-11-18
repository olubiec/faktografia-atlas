import { useEffect, useRef } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const query = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(QUERY)
    : null;

/** Ref z aktualnym ustawieniem „ogranicz ruch”; reaguje na zmianę w trakcie sesji. */
export function useReducedMotion() {
  const ref = useRef(query()?.matches ?? false);
  useEffect(() => {
    const mq = query();
    if (!mq) return;
    ref.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      ref.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return ref;
}

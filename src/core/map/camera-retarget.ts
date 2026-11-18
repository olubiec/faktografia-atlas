import type { ViewState } from "./view";

/** Najwięcej zapamiętanych widoków (najstarsze odpadają). */
export const VIEW_STACK_LIMIT = 20;
/** Tolerancja zoomu przy dopasowaniu widoku ze stosu do celu „Wróć”. */
const MATCH_ZOOM = 0.5;

/**
 * Dokłada widok sprzed wejścia w jednostkę (LIFO, limit 20).
 * Zwraca nową tablicę; wejście nie jest modyfikowane.
 */
export function pushView(stack: readonly ViewState[], view: ViewState): ViewState[] {
  const next = [...stack, { ...view }];
  return next.length > VIEW_STACK_LIMIT ? next.slice(next.length - VIEW_STACK_LIMIT) : next;
}

/**
 * Zdejmuje ze stosu widok do „Wróć”. `fit` to widok dopasowany do bbox celu:
 * wpisy głębsze niż cel (zoom większy o > 0,5) są pomijane (skok o kilka poziomów),
 * a odzyskany widok jest użyty tylko, gdy jego zoom jest bliski celu.
 * Gdy nic nie pasuje, `view` = null i wołający dopasowuje do bbox jak dotąd.
 */
export function popView(
  stack: readonly ViewState[],
  fit: ViewState,
): { stack: ViewState[]; view: ViewState | null } {
  const rest = [...stack];
  while (rest.length > 0 && rest[rest.length - 1].zoom > fit.zoom + MATCH_ZOOM) rest.pop();
  const top = rest.pop();
  if (!top || Math.abs(top.zoom - fit.zoom) > MATCH_ZOOM) return { stack: rest, view: null };
  return { stack: rest, view: { ...top } };
}

/**
 * Jedna decyzja o stosie przy zmianie widoku: wejście (`in`) zapamiętuje `before`,
 * „Wróć” (`out`) zdejmuje zapamiętany widok jako cel; inaczej celem jest `fit`.
 */
export function stackStep(
  stack: readonly ViewState[],
  kind: "in" | "out" | "instant",
  fit: ViewState,
  before: ViewState,
): { stack: ViewState[]; target: ViewState } {
  if (kind === "in") return { stack: pushView(stack, before), target: fit };
  if (kind === "out") {
    const popped = popView(stack, fit);
    return { stack: popped.stack, target: popped.view ?? fit };
  }
  return { stack: [...stack], target: fit };
}

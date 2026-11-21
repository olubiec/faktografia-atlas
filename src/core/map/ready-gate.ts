// Prawdziwy sygnał „mapa gotowa”: płótno bezczynne (idle) i kolory narysowane.
// Odpala raz; okładka wejścia i testy czekają na to, zamiast zgadywać po czasie.

export const ATLAS_READY_EVENT = 'atlas:ready';

export type ReadyGate = {
  setIdle: () => void;
  setColored: (colored: boolean) => void;
};

export function createReadyGate(fire: () => void): ReadyGate {
  let idle = false;
  let colored = false;
  let done = false;
  const check = () => {
    if (done || !idle || !colored) return;
    done = true;
    fire();
  };
  return {
    setIdle() {
      idle = true;
      check();
    },
    setColored(value) {
      if (value) colored = true;
      check();
    },
  };
}

/** Ustawia flagę w dokumencie i wysyła zdarzenie na oknie. */
export function announceAtlasReady(win: Pick<Window, 'dispatchEvent' | 'document'>): void {
  win.document.documentElement.setAttribute('data-atlas-ready', '1');
  win.dispatchEvent(new Event(ATLAS_READY_EVENT));
}

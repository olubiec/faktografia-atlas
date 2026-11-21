import { useEffect, useMemo, useRef } from 'react';
import { announceAtlasReady, createReadyGate } from '@/core/map/ready-gate';

/**
 * Sygnał „mapa gotowa” (atlas:ready): mapa bezczynna i kolory narysowane.
 * Zwraca funkcję dla `onIdle` mapy. `onReady` woła się raz, razem ze zdarzeniem.
 */
export function useAtlasReady(colored: boolean, onReady: () => void): () => void {
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  // Bramka jest jedna na egzemplarz mapy; najnowsze onReady czytamy z refa.
  const gate = useMemo(
    () =>
      createReadyGate(() => {
        announceAtlasReady(window);
        onReadyRef.current();
      }),
    []
  );

  // Flaga gotowości dotyczy tylko tego egzemplarza mapy: przy wyjściu znika.
  useEffect(() => () => document.documentElement.removeAttribute('data-atlas-ready'), []);

  // Kolory narysowane: dajemy deck.gl dwie klatki po pojawieniu się danych, potem liczy się „idle”.
  useEffect(() => {
    if (!colored) return;
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => gate.setColored(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [colored, gate]);

  return gate.setIdle;
}

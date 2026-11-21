import { useEffect, useEffectEvent, useState } from 'react';
import { announceAtlasReady, createReadyGate } from '@/core/map/ready-gate';

/**
 * Sygnał „mapa gotowa” (atlas:ready): mapa bezczynna i kolory narysowane.
 * Zwraca funkcję dla `onIdle` mapy. `onReady` woła się raz, razem ze zdarzeniem.
 */
export function useAtlasReady(colored: boolean, onReady: () => void): () => void {
  // Bramka jest jedna na egzemplarz mapy; gotowość przechodzi przez stan, więc onReady woła efekt.
  const [ready, setReady] = useState(false);
  const [gate] = useState(() =>
    createReadyGate(() => {
      announceAtlasReady(window);
      setReady(true);
    })
  );
  const callReady = useEffectEvent(onReady);
  useEffect(() => {
    if (ready) callReady();
  }, [ready]);

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

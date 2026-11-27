import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { DiscoveryView } from '@/core/start/extremes';
import { ExtremesCard } from './ExtremesCard';
import { FactCard } from './FactCard';

export interface DailyDiscoveryProps {
  /** Talia od dzisiejszej ciekawostki (discoveryDeck). */
  deck: DiscoveryView[];
  to: (href: string) => string;
  onWarm?: () => void;
}

/**
 * Odkrycie dnia: najpierw karta dnia (ta sama dla wszystkich), „Pokaż inną ciekawostkę” przechodzi do kolejnej z talii.
 * Para skrajności (najmniej i najwięcej) albo pojedynczy fakt, gdy drugiego bieguna nie ma.
 */
export function DailyDiscovery({ deck, to, onWarm }: DailyDiscoveryProps) {
  const [index, setIndex] = useState(0);
  if (deck.length === 0) return null;
  const item = deck[index % deck.length];
  const next =
    deck.length > 1 ? (
      <Button type="button" variant="ghost" className="px-0 underline underline-offset-4" onClick={() => setIndex((i) => (i + 1) % deck.length)}>
        Pokaż inną ciekawostkę
      </Button>
    ) : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Zmiana karty jest ogłaszana czytnikom ekranu (aria-live), wzrok nie traci przycisku. */}
      <div aria-live="polite">
        {item.extremes ? (
          <ExtremesCard key={item.key} extremes={item.extremes} fact={item.fact} to={to} onWarm={onWarm} extra={next} />
        ) : (
          <FactCard key={item.key} fact={item.fact} place={item.place} to={to} onWarm={onWarm} large extra={next} />
        )}
      </div>
      {deck.length > 1 && (
        <p className="m-0 text-xs text-olowek" data-slot="daily-counter">
          {index === 0 ? `Ciekawostka dnia (1 z ${deck.length})` : `Ciekawostka ${index + 1} z ${deck.length}`}
        </p>
      )}
    </div>
  );
}

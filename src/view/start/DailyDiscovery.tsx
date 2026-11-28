import type { DiscoveryView } from '@/core/start/extremes';
import { ExtremesCard } from './ExtremesCard';
import { FactCard } from './FactCard';

export interface DailyDiscoveryProps {
  /** Talia od dzisiejszej ciekawostki (discoveryDeck); pokazujemy tylko pierwszą. */
  deck: DiscoveryView[];
  to: (href: string) => string;
  onWarm?: () => void;
}

/**
 * Odkrycie dnia: jedna karta, ta sama dla wszystkich danego dnia (decyzja właściciela 27.11.2026, bez „Pokaż inną”).
 * Para skrajności (najmniej i najwięcej) albo pojedynczy fakt, gdy drugiego bieguna nie ma.
 */
export function DailyDiscovery({ deck, to, onWarm }: DailyDiscoveryProps) {
  const item = deck[0];
  if (!item) return null;
  return item.extremes ? (
    <ExtremesCard key={item.key} extremes={item.extremes} fact={item.fact} to={to} onWarm={onWarm} />
  ) : (
    <FactCard key={item.key} fact={item.fact} place={item.place} to={to} onWarm={onWarm} large />
  );
}

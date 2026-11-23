import { useRef, useState, type ComponentType } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const PLACE_INPUT_ID = 'start-place';
export const PLACE_LABEL = 'Wpisz miejscowość';
export const PLACE_PLACEHOLDER = 'np. Wieliczka';

export interface PlaceSearchProps {
  /** Wybrane miejsce: TERYT jednostki (dla miejscowości – jej gminy) i jej nazwa (pusta, gdy nieznana). */
  onPick: (teryt: string, name: string) => void;
}

type Live = ComponentType<PlaceSearchProps & { initialQuery?: string }>;

/**
 * „Wpisz miejscowość”: najpierw zwykłe pole; pierwszy fokus (albo dotyk) pobiera kod szukajki
 * (osobny kawałek), a ona dopiero wtedy listę jednostek i miejscowości. Po wczytaniu pole zostaje
 * podmienione na szukajkę – wpisany w międzyczasie tekst i fokus zostają.
 */
export function PlaceSearch({ onPick }: PlaceSearchProps) {
  const [LiveSearch, setLiveSearch] = useState<Live | null>(null);
  const [query, setQuery] = useState('');
  const loading = useRef(false);

  const arm = () => {
    if (loading.current) return;
    loading.current = true;
    import('./PlaceSearchLive')
      .then((m) => setLiveSearch(() => m.default))
      .catch(() => {
        // Nie udało się pobrać kodu: następny fokus spróbuje jeszcze raz.
        loading.current = false;
      });
  };

  if (LiveSearch) return <LiveSearch onPick={onPick} initialQuery={query} />;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={PLACE_INPUT_ID}>{PLACE_LABEL}</Label>
      <Input
        id={PLACE_INPUT_ID}
        role="combobox"
        aria-expanded={false}
        autoComplete="off"
        className="transition-none"
        placeholder={PLACE_PLACEHOLDER}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={arm}
        onPointerDown={arm}
      />
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { loadAdminTopo } from '@/core/data/load-atlas-data';
import { PLACE_INPUT_ID } from './PlaceSearch';

/** Komunikaty: brak zgody albo błąd → podpowiedź, żeby wpisać miejscowość (szukajka zostaje obok). */
const LOCATE_MESSAGES = {
  unsupported: 'Ta przeglądarka nie podaje lokalizacji. Wpisz miejscowość.',
  denied: 'Bez zgody na lokalizację nie ustalimy gminy. Wpisz miejscowość.',
  failed: 'Nie udało się ustalić lokalizacji. Wpisz miejscowość.',
  outside: 'Ta lokalizacja jest poza Polską. Wpisz miejscowość.',
} as const;

type State = { kind: 'idle' } | { kind: 'busy' } | { kind: 'error'; message: string };

export interface LocateButtonProps {
  /** Ustalona gmina: TERYT (tekst) i nazwa. */
  onLocated: (teryt: string, name: string) => void;
}

/**
 * Czy strona może pytać o lokalizację. Nagłówek Permissions-Policy (vercel.json) może ją wyłączyć –
 * wtedy przycisku nie pokazujemy (zostaje szukajka), zamiast przycisku, który zawsze kończy się błędem.
 * `featurePolicy` zna tylko Chromium; w innych przeglądarkach decyduje sama przeglądarka (błąd → komunikat).
 */
function geolocationAllowed(): boolean {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return false;
  const policy = (document as { featurePolicy?: { allowsFeature?: (f: string) => boolean } }).featurePolicy;
  return policy?.allowsFeature?.('geolocation') !== false;
}

function position(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }),
  );
}

/**
 * „Użyj mojej lokalizacji” (W26-F05, KONCEPT-ODKRYCIA §5). Lokalizacja tylko po kliknięciu; współrzędne
 * nie wychodzą z urządzenia – gminę wyznacza sprawdzenie punktu w granicach z admin.topo.json (pobieranych
 * dopiero teraz, jeśli nie ma ich jeszcze z rozgrzewki mapy). Kod sprawdzania ładuje się osobno, po kliknięciu.
 */
export function LocateButton({ onLocated }: LocateButtonProps) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [allowed] = useState(geolocationAllowed);

  const fail = (message: string) => {
    setState({ kind: 'error', message });
    // Szukajka jest drogą zapasową: fokus od razu w polu „Wpisz miejscowość”.
    document.getElementById(PLACE_INPUT_ID)?.focus();
  };

  const locate = async () => {
    if (!('geolocation' in navigator)) return fail(LOCATE_MESSAGES.unsupported);
    setState({ kind: 'busy' });
    let pos: GeolocationPosition;
    try {
      pos = await position();
    } catch (err) {
      return fail((err as GeolocationPositionError | undefined)?.code === 1 ? LOCATE_MESSAGES.denied : LOCATE_MESSAGES.failed);
    }
    try {
      const [topo, { locateUnit }] = await Promise.all([loadAdminTopo(), import('@/core/geo/locate')]);
      const unit = locateUnit(topo as Parameters<typeof locateUnit>[0], [pos.coords.longitude, pos.coords.latitude]);
      if (!unit) return fail(LOCATE_MESSAGES.outside);
      setState({ kind: 'idle' });
      onLocated(unit.teryt, unit.name);
    } catch {
      fail(LOCATE_MESSAGES.failed);
    }
  };

  if (!allowed) return null;
  return (
    <div className="flex flex-col gap-2" data-slot="locate">
      <Button variant="secondary" className="self-start" onClick={() => void locate()} disabled={state.kind === 'busy'}>
        {state.kind === 'busy' ? 'Ustalamy gminę…' : 'Użyj mojej lokalizacji'}
      </Button>
      {state.kind === 'error' && (
        <p role="status" className="m-0 text-sm text-olowek">
          {state.message}
        </p>
      )}
    </div>
  );
}

export interface LocatedNoteProps {
  name: string;
  onChange: () => void;
}

/** Potwierdzenie po ustaleniu lokalizacji: „Twoja gmina: X. Zmień”. */
export function LocatedNote({ name, onChange }: LocatedNoteProps) {
  return (
    <p role="status" className="m-0 flex flex-wrap items-center gap-x-2 text-sm text-tusz break-words" data-slot="located">
      <span>Twoja gmina: {name}.</span>
      <Button variant="ghost" size="sm" className="px-0 underline" onClick={onChange}>
        Zmień
      </Button>
    </p>
  );
}

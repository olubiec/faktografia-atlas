import { useEffect, useMemo, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Search, Xmark } from 'iconoir-react';
import { Icon } from '@/view/ui/Icon';
import { loadSearchIndex, useSearch } from './useSearch';
import { loadLocalities } from '@/core/search/load-localities';
import { searchLocalities, type LocalitySearchResult } from '@/core/search/localities';
import { writeUrlState } from '@/core/url/state';
import type { SearchResult, Locality } from '@/core/search';
import type { Unit } from '@/core/units/types';

export interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [unitsMap, setUnitsMap] = useState<Map<string, Unit>>(new Map());
  const { results, ready, error } = useSearch(query);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;

      let cancelled = false;
      loadLocalities().then((data) => {
        if (!cancelled) setLocalities(data);
      });

      loadSearchIndex()
        .then((idx) => {
          if (!cancelled) setUnitsMap(idx.unitsMap);
        })
        .catch(() => {
          // Błędy wczytywania jednostek są obsługiwane przez useSearch
        });

      return () => {
        cancelled = true;
      };
    } else if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  }, [open]);

  const localityResults = useMemo(() => {
    if (!query || query.trim().length < 2 || localities.length === 0) {
      return [];
    }
    return searchLocalities(query, localities, unitsMap, { limit: 50 });
  }, [query, localities, unitsMap]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setQuery('');
    }
    onOpenChange(newOpen);
  };

  const handleSelectUnit = (item: SearchResult) => {
    handleOpenChange(false);
    writeUrlState({ u: item.teryt });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleSelectLocality = (item: LocalitySearchResult) => {
    handleOpenChange(false);
    writeUrlState({ u: item.teryt });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('atlas:select-locality', {
          detail: { teryt: item.teryt, lon: item.lon, lat: item.lat },
        })
      );
    }
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-tusz/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-150 motion-reduce:animate-none" />
        <DialogPrimitive.Content
          className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full h-full max-md:top-0 max-md:left-0 max-md:inset-0 max-md:translate-x-0 max-md:translate-y-0 md:max-w-2xl md:h-auto md:max-h-[80vh] bg-arkusz text-tusz border border-linia rounded-none p-0 flex flex-col focus:outline-none overflow-hidden"
        >
          <DialogPrimitive.Title className="sr-only">Wyszukaj miejsce</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Wpisz nazwę gminy, powiatu, województwa lub miejscowości
          </DialogPrimitive.Description>

          <Command
            shouldFilter={false}
            label="Wyszukiwarka jednostek i miejscowości"
            className="flex flex-col w-full h-full md:max-h-[80vh]"
          >
            {/* Pole wyszukiwania */}
            <div className="flex items-center border-b border-linia px-4 py-2 gap-3 bg-arkusz">
              <Icon icon={Search} aria-hidden={true} size={20} className="text-tusz flex-shrink-0" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Gmina, powiat albo miejscowość"
                className="w-full bg-transparent text-tusz text-md placeholder:text-olowek focus:outline-none min-h-[44px]"
                autoFocus
              />
              <button
                type="button"
                onClick={handleClose}
                aria-label="Zamknij wyszukiwarkę"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-tusz hover:bg-linia/20 cursor-pointer rounded-none border-0"
              >
                <Icon icon={Xmark} aria-hidden={true} size={20} />
              </button>
            </div>

            {/* Lista wyników */}
            <Command.List className="flex-1 overflow-y-auto p-2">
              {query.trim().length >= 2 && error && (
                <div role="alert" className="p-6 text-center text-olowek text-sm">
                  Nie udało się wczytać listy miejsc. Odśwież stronę i spróbuj ponownie.
                </div>
              )}

              {query.trim().length >= 2 && !ready && !error && (
                <div role="status" className="p-6 text-center text-olowek text-sm">
                  Ładowanie listy miejsc…
                </div>
              )}

              {query.trim().length >= 2 && ready && results.length === 0 && localityResults.length === 0 && (
                <Command.Empty className="p-6 text-center text-olowek text-sm">
                  Brak wyników dla „{query}”
                </Command.Empty>
              )}

              {query.trim().length < 2 && (
                <div className="p-6 text-center text-olowek text-sm">
                  Wpisz co najmniej 2 znaki, aby wyszukać gminę, powiat lub miejscowość
                </div>
              )}

              {/* Grupa jednostek administracyjnych */}
              {results.length > 0 && (
                <Command.Group
                  heading={localityResults.length > 0 ? 'Jednostki administracyjne' : undefined}
                  className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-olowek"
                >
                  {results.map((item) => (
                    <Command.Item
                      key={`unit:${item.teryt}`}
                      value={`unit:${item.teryt}`}
                      onSelect={() => handleSelectUnit(item)}
                      className="flex items-center justify-between px-4 py-3 min-h-[44px] cursor-pointer text-tusz data-[selected=true]:bg-linia/20 data-[selected=true]:text-tusz hover:bg-linia/20 border-b border-linia/30 last:border-b-0 rounded-none"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                        <span className="font-[600] text-sm text-tusz truncate">{item.name}</span>
                        {item.context && (
                          <span className="text-xs text-olowek truncate">{item.context}</span>
                        )}
                      </div>
                      <span className="text-xs text-olowek border border-linia px-2 py-0.5 bg-kalka flex-shrink-0 whitespace-nowrap font-mono">
                        {item.label}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Grupa miejscowości */}
              {localityResults.length > 0 && (
                <Command.Group
                  heading="Miejscowości"
                  className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-olowek"
                >
                  {localityResults.map((item) => (
                    <Command.Item
                      key={`loc:${item.id}`}
                      value={`loc:${item.id}`}
                      onSelect={() => handleSelectLocality(item)}
                      className="flex items-center justify-between px-4 py-3 min-h-[44px] cursor-pointer text-tusz data-[selected=true]:bg-linia/20 data-[selected=true]:text-tusz hover:bg-linia/20 border-b border-linia/30 last:border-b-0 rounded-none"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                        <span className="font-[600] text-sm text-tusz truncate">
                          {item.name}
                          {item.type && <span className="font-normal text-olowek ml-1">({item.type})</span>}
                        </span>
                        {item.gminaName && (
                          <span className="text-xs text-olowek truncate">
                            {item.context || `gmina ${item.gminaName}`}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-olowek border border-linia px-2 py-0.5 bg-kalka flex-shrink-0 whitespace-nowrap font-mono">
                        {item.type || 'miejscowość'}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

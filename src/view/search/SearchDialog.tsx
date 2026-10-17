import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Command } from 'cmdk';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Search, Xmark } from 'iconoir-react';
import { Icon } from '@/view/ui/Icon';
import { useSearch } from './useSearch';
import type { SearchResult } from '@/core/search';

export interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const results = useSearch(query);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
    } else if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setQuery('');
    }
    onOpenChange(newOpen);
  };

  const handleSelect = (item: SearchResult) => {
    handleOpenChange(false);
    navigate(`/?u=${item.teryt}`);
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
              {query.trim().length >= 2 && results.length === 0 && (
                <Command.Empty className="p-6 text-center text-olowek text-sm">
                  Brak wyników dla „{query}”
                </Command.Empty>
              )}

              {query.trim().length < 2 && (
                <div className="p-6 text-center text-olowek text-sm">
                  Wpisz co najmniej 2 znaki, aby wyszukać gminę, powiat lub miejscowość
                </div>
              )}

              {results.map((item) => (
                <Command.Item
                  key={item.teryt}
                  value={item.teryt}
                  onSelect={() => handleSelect(item)}
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
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

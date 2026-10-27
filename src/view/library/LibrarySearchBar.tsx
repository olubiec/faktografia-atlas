import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Search, Xmark } from 'iconoir-react';
import { Icon } from '@/view/ui/Icon';
import { categoryPath, filterVars, type LibraryIndex, type LibraryQuery } from '@/core/library/query';

export interface LibrarySearchBarProps {
  index: LibraryIndex;
  query: LibraryQuery;
  onQueryChange: (query: LibraryQuery) => void;
  onPick?: (id: string | number) => void;
}

export function LibrarySearchBar({
  index,
  query,
  onQueryChange,
  onPick,
}: LibrarySearchBarProps) {
  const [isOpen, setIsOpen] = useState(() => Boolean(query.text.trim()));
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [prevText, setPrevText] = useState(query.text);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync state during render when query.text prop changes
  if (query.text !== prevText) {
    setPrevText(query.text);
    setActiveIndex(-1);
    setIsOpen(Boolean(query.text.trim()));
  }

  const suggestions = useMemo(() => {
    if (!query.text.trim()) {
      return [];
    }
    return filterVars(index, query).slice(0, 5);
  }, [index, query]);

  // Click outside listener
  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onQueryChange({ ...query, text: e.target.value });
    setIsOpen(true);
  };

  const handleClear = () => {
    onQueryChange({ ...query, text: '' });
    setActiveIndex(-1);
    setIsOpen(false);
  };

  const handleSelectSuggestion = (id: string | number) => {
    onPick?.(id);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      if (suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      if (suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        const selected = suggestions[activeIndex];
        handleSelectSuggestion(selected.id);
      } else {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      data-testid="library-search-bar"
      className="relative w-full space-y-1.5"
    >
      <label
        htmlFor="library-search-input"
        className="block text-sm font-[600] text-tusz"
      >
        Szukaj wskaźnika
      </label>

      <div className="relative flex items-center bg-arkusz border border-linia rounded-none">
        <Icon
          icon={Search}
          aria-hidden={true}
          size={20}
          className="text-olowek ml-3 shrink-0 pointer-events-none"
        />

        <input
          id="library-search-input"
          type="text"
          value={query.text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.text.trim().length > 0) setIsOpen(true);
          }}
          placeholder="Wpisz nazwę wskaźnika…"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls="library-search-suggestions"
          aria-activedescendant={
            activeIndex >= 0 && activeIndex < suggestions.length
              ? `suggestion-option-${activeIndex}`
              : undefined
          }
          className="w-full bg-transparent px-3 py-2 text-tusz text-sm placeholder:text-olowek focus:outline-none min-h-[44px]"
        />

        {query.text.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Wyczyść"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-tusz hover:bg-linia/20 cursor-pointer rounded-none border-0 shrink-0"
          >
            <Icon icon={Xmark} aria-hidden={true} size={20} />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id="library-search-suggestions"
          role="listbox"
          aria-label="Podpowiedzi wskaźników"
          className="absolute top-full left-0 right-0 z-20 mt-1 bg-arkusz border border-linia shadow-md overflow-hidden p-0 m-0 list-none"
        >
          {suggestions.map((item, idx) => {
            const catId = item.cat ?? item.categoryId ?? item.subjectId;
            const path = catId ? categoryPath(index, String(catId)) : [];
            const pathStr = path.map((c) => c.name).join(' / ');
            const isSelected = activeIndex === idx;

            return (
              <li
                key={item.id}
                id={`suggestion-option-${idx}`}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => handleSelectSuggestion(item.id)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`flex flex-col justify-center px-4 py-2.5 min-h-[44px] cursor-pointer text-tusz border-b border-linia/30 last:border-b-0 rounded-none transition-colors ${
                  isSelected ? 'bg-linia/20' : 'hover:bg-linia/20'
                }`}
              >
                <span className="font-[600] text-sm text-tusz truncate">{item.name}</span>
                {pathStr.length > 0 && (
                  <span className="text-xs text-olowek truncate">{pathStr}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

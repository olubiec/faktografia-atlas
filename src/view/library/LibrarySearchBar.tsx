import type { LibraryIndex, LibraryQuery } from '@/core/library/query';

export interface LibrarySearchBarProps {
  index: LibraryIndex;
  query: LibraryQuery;
  onQueryChange: (query: LibraryQuery) => void;
}

export function LibrarySearchBar({ index: _index, query: _query, onQueryChange: _onQueryChange }: LibrarySearchBarProps) {
  return <div data-testid="library-search-bar" />;
}

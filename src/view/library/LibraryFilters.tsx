import type { LibraryIndex, LibraryQuery } from '@/core/library/query';

export interface LibraryFiltersProps {
  index: LibraryIndex;
  query: LibraryQuery;
  onQueryChange: (query: LibraryQuery) => void;
}

export function LibraryFilters({ index: _index, query: _query, onQueryChange: _onQueryChange }: LibraryFiltersProps) {
  return <div data-testid="library-filters" />;
}

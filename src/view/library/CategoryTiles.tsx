import type { LibraryIndex, LibraryQuery } from '@/core/library/query';

export interface CategoryTilesProps {
  index: LibraryIndex;
  query: LibraryQuery;
  onQueryChange: (query: LibraryQuery) => void;
}

export function CategoryTiles({ index: _index, query: _query, onQueryChange: _onQueryChange }: CategoryTilesProps) {
  return <div data-testid="category-tiles" />;
}

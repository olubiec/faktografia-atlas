import type { LibraryIndex, LibraryQuery } from '@/core/library/query';

export interface LibraryResultsProps {
  index: LibraryIndex;
  query: LibraryQuery;
  onQueryChange: (query: LibraryQuery) => void;
}

export function LibraryResults({ index: _index, query: _query, onQueryChange: _onQueryChange }: LibraryResultsProps) {
  return <div data-testid="library-results" />;
}

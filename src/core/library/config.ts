const DEFAULT_LIBRARY_BASE =
  'https://raw.githubusercontent.com/olubiec/faktografia-atlas/data/library/library';

/**
 * Zwraca bazowy URL dla plików biblioteki.
 * Zwraca `import.meta.env.VITE_LIBRARY_BASE` jeśli jest zdefiniowany,
 * w przeciwnym razie domyślny URL (bez końcowego /).
 */
export function libraryBase(): string {
  const envBase =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_LIBRARY_BASE as string | undefined)
      : undefined;
  const base = envBase && envBase.trim() !== '' ? envBase.trim() : DEFAULT_LIBRARY_BASE;
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

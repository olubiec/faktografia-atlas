/**
 * Pamięta ostatni wynik: dopóki klucz jest „taki sam” (wg `same`), zwraca tę samą wartość
 * (tę samą referencję), bez ponownego liczenia.
 */
export function memoLast<K extends unknown[], V>(
  compute: (...key: K) => V,
  same: (a: K, b: K) => boolean = sameRefs,
): (...key: K) => V {
  let last: { key: K; value: V } | null = null;
  return (...key: K): V => {
    if (last && same(last.key, key)) return last.value;
    const value = compute(...key);
    last = { key, value };
    return value;
  };
}

/** Porównanie elementów klucza przez referencję (===). */
export function sameRefs<K extends unknown[]>(a: K, b: K): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

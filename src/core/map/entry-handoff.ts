// Przekazanie „skąd wchodzimy” ze strony `/` do mapy: tylko w pamięci, zużywane raz, wygasa po kilku sekundach.
import type { Bbox } from '@/core/start/poster-frame';

export type Entry = { bbox: Bbox; viewport: { width: number; height: number } };
const TTL_MS = 8000;

let current: { entry: Entry; at: number } | null = null;

export function setEntry(entry: Entry, now: number = Date.now()): void {
  current = { entry, at: now };
}

/** Zwraca wejście i je kasuje; po TTL_MS albo przy braku zwraca null. */
export function takeEntry(now: number = Date.now()): Entry | null {
  const c = current;
  current = null;
  return c && now - c.at < TTL_MS ? c.entry : null;
}

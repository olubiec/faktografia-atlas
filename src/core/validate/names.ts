import type { CatalogEntry } from '../catalog/tree';

export interface NameFinding {
  rule: 'bare-name' | 'repeated-total' | 'raw-suffix' | 'duplicate-in-topic' | 'vague-unit' | 'too-long';
  id: string;
  name: string;
}

const BARE = /^(ogółem|razem|mężczyźni|kobiety|miasta|wieś|\d+)(\s|$|–)/i;

/**
 * Reguły czytelności nazw w drzewie wyboru danych (uruchamiane po nocnym imporcie):
 * nazwa bez podmiotu, „– ogółem – ogółem”, „stan w dniu 31 grudnia”, dwie takie same nazwy w jednym temacie,
 * niejasna jednostka, nazwa dłuższa niż 140 znaków.
 */
export function checkNames(entries: CatalogEntry[]): NameFinding[] {
  const out: NameFinding[] = [];
  const seen = new Map<string, number>();
  for (const e of entries) {
    const push = (rule: NameFinding['rule']) => out.push({ rule, id: e.id, name: e.name });
    if (BARE.test(e.name) && e.name.split(' ').length <= 3) push('bare-name');
    if (/– ogółem – ogółem/i.test(e.name)) push('repeated-total');
    if (/stan w dniu 31 grudnia/i.test(e.name)) push('raw-suffix');
    if (['osoba', 'szt.', '-'].includes(e.unit.trim()) && /\bna\s+\d/.test(e.name)) push('vague-unit');
    if (e.name.length > 140) push('too-long');
    const key = `${e.group}|${e.topic}|${e.name}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
    if (seen.get(key) === 2) push('duplicate-in-topic');
  }
  return out;
}

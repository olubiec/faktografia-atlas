import indicators from '../../../config/indicators.json';
import type { EmbedParams } from './embed-params';

/** Escapuje wartość wstawianą do atrybutu HTML (tylko tekst do skopiowania). */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Buduje zapytanie ze stałą kolejnością kluczy; puste wartości są pomijane. */
function query(pairs: Array<[string, string | number | null | undefined]>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of pairs) {
    if (v !== null && v !== undefined && v !== '') sp.set(k, String(v));
  }
  return sp.toString();
}

/** Adres pełnego widoku (/?i=&l=&u=&y=) bez parametrów osadzania. */
export function fullViewHref(params: EmbedParams, origin: string): string {
  const { i, l, u, y } = params.state;
  return `${origin}/?${query([['i', i], ['l', l], ['u', u], ['y', y]])}`;
}

/** Tekst kodu <iframe> do skopiowania (nigdy nie trafia do DOM jako HTML). */
export function embedSnippet(params: EmbedParams, origin: string): string {
  const { i, l, u, y } = params.state;
  const q = query([
    ['w', params.widget],
    ['i', i],
    ['l', l],
    ['u', u],
    ['y', y],
    ['theme', params.theme],
    ['h', params.height],
  ]);
  const name = indicators.find((x) => x.id === i)?.name ?? 'dane';
  const src = `${origin}/osadz?${q}`;
  return (
    `<iframe src="${escapeAttr(src)}" title="${escapeAttr(`Faktografia Atlas – ${name}`)}" ` +
    `width="100%" height="${params.height}" loading="lazy" style="border:0"></iframe>`
  );
}

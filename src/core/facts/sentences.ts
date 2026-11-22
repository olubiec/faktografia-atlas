// Szablony zdań faktów (KONCEPT-ODKRYCIA §3): słownik neutralny („najwyższa/najniższa”, nigdy ocena),
// bez wykrzykników, każde zdanie z liczbą i rokiem, miejsce zawsze „z N”. Format liczb z src/core/format.
import { changeSince, placeIn, plNumber, shortIndicatorName, showValue } from '../seo/sentences';
import type { Fact, Level } from './types';

export interface SentenceContext {
  indicator: { name: string; unit: string };
  level: Level;
  /** Nazwa województwa (do F2), np. „małopolskie”. */
  voivodeshipName?: string;
  /** Pas typowości w punktach percentyla (config thresholds.typicalBand). */
  typicalBand?: number;
}

/** Jednostki poziomu w dopełniaczu liczby mnogiej: „z 2 479 gmin”. */
const PEERS: Record<Level, string> = { gmi: 'gmin', pow: 'powiatów', woj: 'województw' };

const ordinal = (rank: number) => (rank === 1 ? '' : `${rank}. `);

/** „35 169 zł w 2025 r.” albo „średnio 4,2 na 1000 w latach 2023–2025”. */
function when(f: Fact, unit: string): string {
  const v = showValue(f.value, unit);
  if (f.span && f.span > 1) return `średnio ${v} w latach ${f.year - f.span + 1}–${f.year}`;
  return `${v} w ${f.year} r.`;
}

function changeWord(dir: 1 | -1, delta: number): string {
  if (dir === 1) return delta > 0 ? 'największy wzrost' : 'najmniejszy spadek';
  return delta < 0 ? 'największy spadek' : 'najmniejszy wzrost';
}

/** Zdanie faktu; null, gdy brakuje czegoś do uczciwego zdania (np. nazwy województwa przy F2). */
export function factSentence(f: Fact, ctx: SentenceContext): string | null {
  const { unit } = ctx.indicator;
  const name = shortIndicatorName(ctx.indicator.name, unit);
  const peers = PEERS[ctx.level];
  const c = f.compare;
  if (c.kind === 'rank') {
    if (f.type === 'F2' && !ctx.voivodeshipName) return null;
    const where = f.type === 'F2' ? placeIn('województwo', ctx.voivodeshipName!) : 'w Polsce';
    const word = c.dir === 1 ? 'najwyższa' : 'najniższa';
    const tie = c.tie ? ' (ex aequo)' : '';
    return `${name}: ${when(f, unit)} – ${ordinal(c.rank)}${word} wartość${tie} z ${plNumber(c.total)} ${peers} ${where}.`;
  }
  if (c.kind === 'change') {
    const delta = changeSince(f.value, { value: c.fromValue, year: c.fromYear }, unit);
    if (!delta) return null;
    return `${name}: ${delta} (${when(f, unit)}) – ${ordinal(c.rank)}${changeWord(c.dir, f.value - c.fromValue)} z ${plNumber(c.total)} ${peers} w Polsce.`;
  }
  if (c.kind === 'record') {
    const side = c.dir === 1 ? 'najdalej powyżej' : 'najdalej poniżej';
    return `${name}: ${when(f, unit)} – ${side} mediany ${peers} w Polsce (${showValue(c.median, unit)}) od początku danych (${c.sinceYear} r.).`;
  }
  const band = ctx.typicalBand ?? 10;
  const med = showValue(c.median, unit);
  if (Math.abs(c.percentile - 50) <= band) return `${name}: ${when(f, unit)} – blisko mediany ${peers} w Polsce (${med}).`;
  return `${name}: ${when(f, unit)}; mediana ${peers} w Polsce: ${med}.`;
}

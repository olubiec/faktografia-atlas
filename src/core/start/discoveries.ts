// „Odkrycia” na stronie startowej (W26-F02, KONCEPT-ODKRYCIA §6, §9): czysta logika bez Reacta.
// Dane przychodzą z sieci (facts-start.json, facts/<WW>.json); tu tylko wybór, linki do mapy i teksty kart.
import indicatorsData from '../../../config/indicators.json';
import { decodeFact, type EncodedFact } from '../facts/codec';
import { factSentence } from '../facts/sentences';
import { dailyIndex, type DailyEntry, type FactsStart, type StartList } from '../facts/start';
import type { Fact, Level } from '../facts/types';
import { displayUnit, formatValue, getFractionDigits } from '../format/number';
import { shortIndicatorName } from '../seo/sentences';
import { WOJ_NAMES } from './start-data';

export const FACTS_START_URL = '/data/facts-start.json';

/** Plik faktów województwa, do którego należy jednostka: `/data/facts/12.json`. */
export function factsFileUrl(teryt: string): string {
  return `/data/facts/${teryt.slice(0, 2)}.json`;
}

/** public/data/facts/<WW>.json */
export interface FactsFile {
  woj: string;
  generatedAt: string;
  units: Record<string, EncodedFact[]>;
}

export function levelOf(teryt: string): Level {
  if (teryt.length === 2) return 'woj';
  if (teryt.length === 4) return 'pow';
  return 'gmi';
}

/** Odkrycie dnia: ta sama pozycja dla wszystkich danego dnia (UTC), kolejny dzień = kolejna pozycja. */
export function dailyEntry(start: FactsStart, date: Date): DailyEntry | null {
  if (!start.daily.length) return null;
  return start.daily[dailyIndex(date, start.daily.length)];
}

/** Adres mapy w istniejącym formacie `/mapa?i=…&y=…&u=…&l=…` (brakujące części pomijamy). */
export function mapHref(p: { indicatorId: string; year?: number; teryt?: string; level?: Level }): string {
  const q = [`i=${encodeURIComponent(p.indicatorId)}`];
  if (p.year) q.push(`y=${p.year}`);
  if (p.teryt) q.push(`u=${encodeURIComponent(p.teryt)}`);
  if (p.level) q.push(`l=${p.level}`);
  return `/mapa?${q.join('&')}`;
}

/** Fakt → mapa z jego wskaźnikiem, rokiem, zaznaczoną jednostką i poziomem porównania. */
export function factHref(f: Fact): string {
  return mapHref({ indicatorId: f.indicatorId, year: f.year, teryt: f.teryt, level: levelOf(f.teryt) });
}

/** Zestawienie → mapa z tym wskaźnikiem, rokiem i poziomem (bez zaznaczenia). */
export function listHref(list: StartList): string {
  return mapHref({ indicatorId: list.indicatorId, year: list.year, level: list.level });
}

/** Fakty jednostki z pliku województwa, w kolejności z pliku (najsilniejsze pierwsze). */
export function placeFacts(file: FactsFile, teryt: string, limit = 3): Fact[] {
  return (file.units[teryt] ?? []).slice(0, limit).map((e) => decodeFact(teryt, e));
}

type IndicatorMeta = { id: string; name: string; unit: string };
const INDICATORS = new Map((indicatorsData as IndicatorMeta[]).map((i) => [i.id, i]));

/** Liczba bez jednostki (duża) i jednostka osobno – długie liczby nie wychodzą poza kartę na 360 px. */
export function bigNumber(value: number, unit: string): { number: string; unit: string } {
  const number = formatValue(value, null, getFractionDigits(unit)).replace(/^-/, '−');
  return { number, unit: displayUnit(unit) };
}

export interface FactView {
  key: string;
  sentence: string;
  number: string;
  unit: string;
  href: string;
}

/** Karta faktu: zdanie z szablonu, duża liczba, link do mapy. null, gdy nie da się uczciwie napisać zdania. */
export function factView(f: Fact): FactView | null {
  const ind = INDICATORS.get(f.indicatorId);
  if (!ind) return null;
  const sentence = factSentence(f, {
    indicator: ind,
    level: levelOf(f.teryt),
    voivodeshipName: WOJ_NAMES[f.teryt.slice(0, 2)],
  });
  if (!sentence) return null;
  return { key: `${f.type}-${f.indicatorId}-${f.teryt}`, sentence, ...bigNumber(f.value, ind.unit), href: factHref(f) };
}

const PEERS_NOM: Record<Level, string> = { gmi: 'gminy', pow: 'powiaty', woj: 'województwa' };

export interface ListView {
  key: string;
  title: string;
  subtitle: string;
  rows: { teryt: string; name: string; value: string }[];
  href: string;
}

/** Karta zestawienia: nazwa wskaźnika, „3 gminy z najwyższą wartością, 2025”, 3 pozycje i link do mapy. */
export function listView(list: StartList): ListView | null {
  const ind = INDICATORS.get(list.indicatorId);
  if (!ind) return null;
  const word = list.dir === 1 ? 'najwyższą' : 'najniższą';
  return {
    key: `${list.indicatorId}-${list.level}-${list.dir}`,
    title: shortIndicatorName(ind.name, ind.unit),
    subtitle: `${list.top.length} ${PEERS_NOM[list.level]} z ${word} wartością, ${list.year}`,
    rows: list.top.map(([teryt, name, value]) => ({
      teryt,
      name,
      value: formatValue(value, ind.unit).replace(/^-/, '−'),
    })),
    href: listHref(list),
  };
}

/** Nagłówek stanu B: „Gmina Wieliczka”, „Miasto Kraków”, „Powiat wielicki”, „Województwo małopolskie”. */
export function placeHeading(teryt: string, name: string): string {
  const level = levelOf(teryt);
  if (level === 'woj') return `Województwo ${name}`;
  if (level === 'pow') {
    if (Number(teryt.slice(2, 4)) >= 61) return `Miasto ${name.replace(/^powiat /i, '')}`;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return teryt.endsWith('1') ? `Miasto ${name}` : `Gmina ${name}`;
}

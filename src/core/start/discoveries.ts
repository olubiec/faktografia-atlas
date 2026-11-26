// „Odkrycia” na stronie startowej (W26-F02, KONCEPT-ODKRYCIA §6, §9): czysta logika bez Reacta.
// Dane przychodzą z sieci (facts-start.json, facts/<WW>.json); tu tylko wybór, linki do mapy i teksty kart.
import indicatorsData from '../../../config/indicators.json';
import factsConfig from '../../../config/facts.json';
import { decodeFact, decodeTwin, type EncodedFact } from '../facts/codec';
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
  /** Sąsiedzi jednostki (ten sam poziom), W26-F03. */
  near?: Record<string, string[]>;
  /** Bliźniak F8: ['F8', TERYT bliźniaka, rok, ile wskaźników, odległość]. */
  twins?: Record<string, (string | number)[]>;
}

export function levelOf(teryt: string): Level {
  if (teryt.length === 2) return 'woj';
  if (teryt.length === 4) return 'pow';
  return 'gmi';
}

/** Odkrycie dnia: ta sama pozycja dla wszystkich danego dnia (UTC), kolejny dzień = kolejna pozycja. */
export function dailyEntry(start: FactsStart, date: Date): DailyEntry | null {
  if (!start.daily.length) return null;
  // Widok dekoduje fakt sam i woła factView(fact) – zapamiętujemy [nazwa, jednostka] wskaźników z biblioteki (W29-D09b).
  for (const d of start.daily) rememberLibraryMeta(d.i && decodeFact(d.u, d.f).indicatorId, d.i);
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

/** Widok porównania dwóch miejsc w istniejącym formacie `/mapa?c=a,b`. */
export function compareHref(a: string, b: string): string {
  return `/mapa?c=${encodeURIComponent(a)},${encodeURIComponent(b)}`;
}

/** Pierwszy sąsiad jednostki (do „Porównaj z sąsiadem”); null, gdy plik go nie ma. */
export function firstNeighbour(file: FactsFile, teryt: string): string | null {
  return file.near?.[teryt]?.[0] ?? null;
}

export interface TwinView {
  twin: string;
  year: number;
  dims: number;
  href: string;
}

/** Bliźniak (F8): najbardziej podobna jednostka tego samego poziomu w innym województwie. */
export function twinView(file: FactsFile, teryt: string): TwinView | null {
  const raw = file.twins?.[teryt];
  if (!raw) return null;
  const t = decodeTwin(teryt, raw);
  return { twin: t.twin, year: t.year, dims: t.dims, href: compareHref(teryt, t.twin) };
}

/** „Najbardziej podobna gmina w innym województwie: Ząbki (mazowieckie). Porównaliśmy 11 wskaźników z 2025 r.” */
export function twinSentence(t: TwinView, twinName: string): string {
  const level = levelOf(t.twin);
  const kind =
    level === 'gmi'
      ? 'podobna gmina'
      : level === 'woj'
        ? 'podobne województwo'
        : Number(t.twin.slice(2, 4)) >= 61
          ? 'podobne miasto na prawach powiatu'
          : 'podobny powiat';
  const woj = level === 'woj' ? '' : ` (${WOJ_NAMES[t.twin.slice(0, 2)] ?? t.twin.slice(0, 2)})`;
  return `Najbardziej ${kind} w innym województwie: ${twinName}${woj}. Porównaliśmy ${t.dims} wskaźników z ${t.year} r.`;
}

/** Fakty jednostki z pliku województwa, w kolejności z pliku (najsilniejsze pierwsze). */
export function placeFacts(file: FactsFile, teryt: string, limit = 3): Fact[] {
  return (file.units[teryt] ?? []).slice(0, limit).map((e) => decodeFact(teryt, e));
}

type IndicatorMeta = { id: string; name: string; unit: string };
const INDICATORS = new Map((indicatorsData as IndicatorMeta[]).map((i) => [i.id, i]));

/** Nazwa i jednostka wskaźników z biblioteki (`b<varId>`) z pola `i` w facts-start.json; rejestr strony ich nie zna. */
const LIBRARY_META = new Map<string, [string, string]>();

function rememberLibraryMeta(id: string | undefined | false, i: [string, string] | undefined): void {
  if (id && i && !INDICATORS.has(id)) LIBRARY_META.set(id, i);
}

/** Wskaźnik z configu; gdy go tam nie ma – z pola `i` (zapamiętanego z dailyEntry/listView; bez drugiego parametru, bo PlaceFacts woła `.map(factView)`). Zwykłe wskaźniki bez zmian. */
function resolveIndicator(id: string, i?: [string, string]): { name: string; unit: string } | null {
  const ind = INDICATORS.get(id);
  if (ind) return ind;
  const meta = i ?? LIBRARY_META.get(id);
  return meta ? { name: meta[0], unit: meta[1] } : null;
}

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
  /** Fakt z najnowszego roku świeżego wskaźnika: karta pokazuje etykietę „Nowość” (W28-D06). */
  isNew?: boolean;
}

/** Karta faktu: zdanie z szablonu, duża liczba, link do mapy. null, gdy nie da się uczciwie napisać zdania. */
export function factView(f: Fact): FactView | null {
  const ind = resolveIndicator(f.indicatorId);
  if (!ind) return null;
  const sentence = factSentence(f, {
    indicator: ind,
    level: levelOf(f.teryt),
    voivodeshipName: WOJ_NAMES[f.teryt.slice(0, 2)],
  });
  if (!sentence) return null;
  return { key: `${f.type}-${f.indicatorId}-${f.teryt}`, sentence, ...bigNumber(f.value, ind.unit), href: factHref(f), ...((f as { isNew?: boolean }).isNew ? { isNew: true } : {}) };
}

const PEERS_NOM: Record<Level, string> = { gmi: 'gminy', pow: 'powiaty', woj: 'województwa' };

export interface ListView {
  key: string;
  title: string;
  subtitle: string;
  rows: { teryt: string; name: string; value: string; href: string }[];
  href: string;
}

/** Karta zestawienia: nazwa wskaźnika, „3 gminy z najwyższą wartością, 2025”, 3 pozycje i link do mapy. */
export function listView(list: StartList): ListView | null {
  rememberLibraryMeta(list.indicatorId, list.i);
  const ind = resolveIndicator(list.indicatorId, list.i);
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
      // Wiersz prowadzi do mapy z tą jednostką zaznaczoną (otwiera się jej profil), z tym samym wskaźnikiem i rokiem.
      href: mapHref({ indicatorId: list.indicatorId, year: list.year, teryt, level: list.level }),
    })),
    href: listHref(list),
  };
}

/** Karty zestawień przed pobraniem danych (z config/facts.json): tytuł i link są od razu, pozycje dochodzą. */
export function listPlaceholders(): ListView[] {
  return (factsConfig.start.lists as { indicatorId: string; level: Level; dir: 1 | -1 }[])
    .map((l): ListView | null => {
      const ind = INDICATORS.get(l.indicatorId);
      if (!ind) return null;
      return {
        key: `${l.indicatorId}-${l.level}-${l.dir}`,
        title: shortIndicatorName(ind.name, ind.unit),
        subtitle: '',
        rows: [],
        href: mapHref({ indicatorId: l.indicatorId, level: l.level }),
      };
    })
    .filter((l): l is ListView => l !== null);
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

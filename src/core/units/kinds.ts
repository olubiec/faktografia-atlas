import { isCityCounty } from './label';
import type { Unit } from './types';

/** Rodzaj jednostki podziału administracyjnego (poziom + podtyp). */
export type UnitKindId =
  | 'wojewodztwo'
  | 'powiat-ziemski'
  | 'miasto-na-prawach-powiatu'
  | 'gmina-miejska'
  | 'gmina-wiejska'
  | 'gmina-miejsko-wiejska';

export type UnitKindInfo = {
  id: UnitKindId;
  /** Nazwa rodzaju w mianowniku, np. „Powiat ziemski”. */
  title: string;
  /** 3–4 słowa widoczne pod nazwą jednostki. */
  tagline: string;
  /** Jedno zdanie do podpowiedzi przy znaku zapytania. */
  short: string;
  /** Pełna definicja do słownika. */
  long: string;
  /** Przykład z naszych danych. */
  example: string;
  /** Ile takich jednostek jest w Polsce (sprawdza test na units.json). */
  count: number;
};

/** Kolejność = kolejność w słowniku: od największej jednostki do najmniejszej. */
export const UNIT_KINDS: UnitKindInfo[] = [
  {
    id: 'wojewodztwo',
    tagline: 'największa jednostka kraju',
    title: 'Województwo',
    short: 'Największa jednostka podziału kraju. Dzieli się na powiaty (także miasta na prawach powiatu).',
    long: 'Największa jednostka podziału administracyjnego Polski. Obejmuje powiaty ziemskie i miasta na prawach powiatu. Jest 16 województw.',
    example: 'zachodniopomorskie',
    count: 16,
  },
  {
    id: 'powiat-ziemski',
    tagline: 'związek kilku gmin',
    title: 'Powiat ziemski',
    short: 'Zwykły powiat: obejmuje kilka gmin (miejskich, wiejskich i miejsko-wiejskich). Jego siedziba to miasto, ale samo miasto bywa osobną gminą.',
    long: 'Zwykły powiat, czyli związek kilku sąsiednich gmin. Zawiera gminy różnych rodzajów. Ma siedzibę w jednym z miast, np. Wałcz w powiecie wałeckim, ale to miasto jest tylko jedną z gmin powiatu. Powiatów ziemskich jest 314.',
    example: 'powiat wałecki',
    count: 314,
  },
  {
    id: 'miasto-na-prawach-powiatu',
    tagline: 'miasto i powiat w jednym',
    title: 'Miasto na prawach powiatu',
    short: 'Duże miasto, które jest jednocześnie gminą miejską i powiatem (powiat grodzki). Powiat i gmina to ta sama jednostka, więc ma ten sam obszar i zwykle te same dane.',
    long: 'Miasto, które samo pełni zadania powiatu. Jest jednocześnie gminą miejską i powiatem (stąd nazwa „powiat grodzki”). W danych GUS ma dwa wpisy, powiatowy i gminny, ale to ta sama jednostka. Takich miast jest 66, np. Szczecin, Kraków, Sopot. Numer powiatu w kodzie TERYT jest od 61 wzwyż. GUS niektóre wskaźniki podaje tylko dla powiatów, wtedy dane gminy to dane całego miasta.',
    example: 'Szczecin',
    count: 66,
  },
  {
    id: 'gmina-miejska',
    tagline: 'samo miasto, bez wsi',
    title: 'Gmina miejska',
    short: 'Gmina, którą jest samo miasto, bez okolicznych wsi. Kod TERYT kończy się na 1.',
    long: 'Gmina obejmująca wyłącznie miasto. Jest częścią powiatu ziemskiego (np. Wałcz w powiecie wałeckim) albo, w przypadku miast na prawach powiatu, jest zarazem powiatem. Kod TERYT gminy kończy się na 1. Takich gmin jest 302, w tym 66 miast na prawach powiatu.',
    example: 'Wałcz (miasto)',
    count: 302,
  },
  {
    id: 'gmina-wiejska',
    tagline: 'same wsie, bez miasta',
    title: 'Gmina wiejska',
    short: 'Gmina bez miasta: same wsie. Często ma tę samą nazwę co sąsiednie miasto, ale to osobna gmina. Kod kończy się na 2.',
    long: 'Gmina złożona wyłącznie ze wsi, bez miasta. Często otacza miasto, które jest osobną gminą i ma tę samą nazwę (np. Wałcz miejska i Wałcz wiejska). Kod TERYT gminy kończy się na 2. Takich gmin jest 1459.',
    example: 'Wałcz (gmina wiejska)',
    count: 1459,
  },
  {
    id: 'gmina-miejsko-wiejska',
    tagline: 'miasto razem z wsiami',
    title: 'Gmina miejsko-wiejska',
    short: 'Jedna gmina obejmująca miasto razem z okolicznymi wsiami. Kod kończy się na 3.',
    long: 'Gmina, w której miasto (siedziba gminy) i okoliczne wsie tworzą jedną jednostkę. Dane GUS dotyczą całej gminy, nie samego miasta. Kod TERYT gminy kończy się na 3. Takich gmin jest 718.',
    example: 'Krynica-Zdrój',
    count: 718,
  },
];

const BY_ID = new Map(UNIT_KINDS.map((k) => [k.id, k]));

/** Rodzaj jednostki na podstawie poziomu i kodu TERYT; null dla jednostki, której nie da się sklasyfikować. */
export function unitKindId(unit: Pick<Unit, 'level' | 'teryt'>): UnitKindId | null {
  if (unit.level === 'woj') return 'wojewodztwo';
  if (unit.level === 'pow') return isCityCounty(unit.teryt) ? 'miasto-na-prawach-powiatu' : 'powiat-ziemski';
  const last = unit.teryt.slice(-1);
  if (unit.teryt.length !== 7) return null;
  if (last === '1') return 'gmina-miejska';
  if (last === '2') return 'gmina-wiejska';
  if (last === '3') return 'gmina-miejsko-wiejska';
  return null;
}

/** Jedna linijka „Rodzaj – krótka definicja” albo null. */
export function unitKindLine(unit: Pick<Unit, 'level' | 'teryt'>): string | null {
  const k = unitKindInfo(unit);
  return k ? `${k.title} – ${k.tagline}` : null;
}

/** Definicja rodzaju jednostki albo null. */
export function unitKindInfo(unit: Pick<Unit, 'level' | 'teryt'>): UnitKindInfo | null {
  const id = unitKindId(unit);
  return id ? (BY_ID.get(id) ?? null) : null;
}

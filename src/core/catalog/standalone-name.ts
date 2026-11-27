import { titleCase } from './tree';
import { pkdSection } from './name-pkd';
import { qualifyByTopic, withBudgetOwner } from './name-topic';

const norm = (s: string) => s.toLocaleLowerCase('pl').replace(/ł/g, 'l').normalize('NFKD').replace(/[̀-ͯ]/g, '');
const stems = (s: string) =>
  norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 4).map((w) => w.slice(0, 5));

const GENERIC = new Set([
  'ogolem', 'razem', 'mezczyzni', 'kobiety', 'miasta', 'wies', 'miasto', 'ogolem w', 'chlopcy', 'dziewczeta',
  'chłopcy', 'dziewczęta', 'tak', 'nie', 'pozostale', 'inne',
]);

const GENERIC_STEMS = new Set([...GENERIC].flatMap((g) => stems(g)));

/** Nazwa to sama cecha (płeć, „ogółem”, wiek, liczba) – bez podmiotu. */
function isBareQualifier(name: string): boolean {
  const first = norm(name.split(' – ')[0]).trim();
  return GENERIC.has(first) || /^\d/.test(first) || /^(ogolem|razem)( w | na |\s*\()/.test(first);
}

/**
 * Nazwa wskaźnika zrozumiała bez nagłówka: gdy sama nazwa z GUS to tylko cecha
 * („ogółem – 0”, „mężczyźni”), dopisuje przed nią temat (ostatni człon ścieżki).
 * Gdy nazwa już zawiera słowo z tematu – zostaje bez zmian.
 */
export function standaloneName(name: string, categoryPath?: string | null): string {
  return tidyName(withBudgetOwner(withDivision(ageWords(withTopic(pkdSection(tidyName(name)), categoryPath)), categoryPath), categoryPath));
}

/** „5” na końcu nazwy to wiek: „mężczyźni – 5” → „mężczyźni w wieku 5 lat”. */
function ageWords(name: string): string {
  const m = /^(.*?) – (\d{1,3})$/.exec(name);
  if (!m) return name;
  const n = Number(m[2]);
  const last = n % 10;
  const word = n === 1 ? 'rok' : last >= 2 && last <= 4 && !(n % 100 >= 12 && n % 100 <= 14) ? 'lata' : 'lat';
  return `${m[1]} w wieku ${n} ${word}`;
}

/**
 * Sprząta surową nazwę z GUS: „– ogółem – ogółem”, „stan w dniu 31 grudnia”, „1000*mieszkańców”,
 * początkowe „ogółem – ” przed właściwym opisem; zaczyna wielką literą.
 */
export function tidyName(name: string): string {
  let out = name
    .replace(/\s*\(?\s*stan w dniu 31 grudnia\s*\)?/gi, '')
    .replace(/(\d)\*(\p{L})/gu, '$1 $2')
    .replace(/\s*[-–]\s*wartość liczbowa\s*$/i, '')
    .replace(/^wartość liczbowa(?=\s*[-–]|$)/i, 'ogółem')
    .replace(/\s+[-–]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  const trimmed = out.replace(/( – ogółem)+$/i, '');
  if (trimmed.length > 0 && trimmed !== out && !isBareQualifier(trimmed)) out = trimmed;
  const lead = /^ogółem [-–] (\p{L}.*)$/iu.exec(out);
  if (lead) out = lead[1];
  return out.charAt(0).toLocaleUpperCase('pl') + out.slice(1);
}

function withTopic(name: string, categoryPath?: string | null): string {
  const topicRaw = (categoryPath ?? '').split(' > ').map((p) => p.trim()).filter(Boolean).pop() ?? '';
  if (!topicRaw) return name;
  if (!isBareQualifier(name)) return withSubject(qualifyByTopic(name, topicRaw, categoryPath ?? ''), topicRaw);
  const topicStems = stems(topicRaw).filter((st) => !GENERIC_STEMS.has(st));
  const own = new Set(stems(name));
  if (topicStems.length === 0 || topicStems.some((s) => own.has(s))) return name;
  const capital = name.charAt(0).toLocaleUpperCase('pl') + name.slice(1);
  return `${titleCase(topicRaw)} – ${capital.charAt(0).toLocaleLowerCase('pl') + capital.slice(1)}`;
}

/**
 * Te same wskaźniki budżetowe powtarzają się w każdym „Dziale” (900, 700, 851…) i różnią się
 * tylko ścieżką – dopisujemy dział do nazwy, żeby na liście i w wyszukiwarce były rozróżnialne.
 */
function withDivision(name: string, categoryPath?: string | null): string {
  const topic = (categoryPath ?? '').split(' > ').map((p) => p.trim()).filter(Boolean).pop() ?? '';
  const m = /\bdzia[łl]e?\s+\d+\s*[-–]\s*(.+)$/i.exec(topic);
  if (!m) return name;
  const label = m[1].trim().toLocaleLowerCase('pl');
  return name.toLocaleLowerCase('pl').includes(label) ? name : `${name} (dział: ${label})`;
}

/**
 * Temat „Radni gminy wg grup zawodów” + nazwa „pracownicy biurowi”: sama nazwa nie mówi, kogo dotyczy.
 * Gdy nazwa jest krótka i nie dzieli słowa z podmiotem tematu (część przed „wg”), dopisujemy podmiot.
 */
function withSubject(name: string, topicRaw: string): string {
  const subject = /^(.+?)\s+wg\s+/i.exec(topicRaw)?.[1]?.trim();
  if (!subject || name.length > 70 || name.includes(' – ')) return name;
  const subjectStems = stems(subject).filter((st) => !GENERIC_STEMS.has(st));
  const own = new Set(stems(name));
  if (subjectStems.length === 0 || subjectStems.some((st) => own.has(st))) return name;
  const head = subject === subject.toLocaleUpperCase('pl') ? titleCase(subject) : subject.charAt(0).toLocaleUpperCase('pl') + subject.slice(1);
  return `${head} – ${name.charAt(0).toLocaleLowerCase('pl') + name.slice(1)}`;
}

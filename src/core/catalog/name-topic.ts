import topicRules from '../../../config/name-topics.json';

// Dopisywanie tematu (ostatniego członu ścieżki GUS) do nazw, które same nie mówią, czego dotyczą:
// „krztusiec”, „dobra”, „uczniowie”, „gaz”. Czysta logika, bez sieci.

export const norm = (s: string) => s.toLocaleLowerCase('pl').replace(/ł/g, 'l').normalize('NFKD').replace(/[̀-ͯ]/g, '');
const stemsOf = (s: string) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 4).map((w) => w.slice(0, 5));
const GENERIC = new Set(['ogolem', 'razem', 'mezczyzni', 'kobiety', 'miasta', 'wies', 'miasto', 'chlopcy', 'dziewczeta', 'tak', 'nie', 'pozostale', 'inne']);
const GENERIC_STEMS = new Set([...GENERIC].flatMap(stemsOf));
const significant = (s: string) => stemsOf(s).filter((st) => !GENERIC_STEMS.has(st));

type Rule = { label: string; mode: 'after' | 'before' | 'join' | 'replace' };
/** Początek okruszka zdania („w % ludności…”, „z gospodarstwa…”, „będących pod zarządem…”) – sam nic nie znaczy. */
const FRAGMENT = /^(w|we|z|ze|na|dla|do|od|po|pod|przy|przez|wg|według|będąc\S*|istniejąc\S*|zlikwidowan\S*)\s/i;
const RULES = (Object.entries(topicRules) as [string, Rule][]).filter(([k]) => !k.startsWith('_'));

const lowerFirst = (s: string) => (/^\p{Lu}{2,}/u.test(s) || /\p{Lu}/u.test(s.slice(1)) ? s : s.charAt(0).toLocaleLowerCase('pl') + s.slice(1));
const upperFirst = (s: string) => s.charAt(0).toLocaleUpperCase('pl') + s.slice(1);

/** Temat bez dopisków technicznych GUS: „(stan w dniu 31 XII)”, „– wskaźniki”, „w % ogółu …”, „wg …”, „ogółem”. */
export function cleanTopic(raw: string): string {
  const out = raw
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+[-–]\s*wskaźniki\s*$/i, '')
    .replace(/\s+[-–]?\s*w\s+%\s+ogółu.*$/i, '')
    .replace(/\s+wg\s+.*$/i, '')
    .replace(/\s+(ogółem|razem)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Długi temat skracamy do podmiotu: „Zachorowania na choroby zakaźne i zatrucia” → „Zachorowania”.
  if (out.length > 48) {
    const head = out.split(/\s+(?:na|w|z|dla|oraz|przez)\s+/i)[0] ?? out;
    if (head.split(' ').length >= 2 || head.length >= 8) return upperFirst(head.trim());
  }
  return upperFirst(out);
}

/** Wyjątek z config/name-topics.json (klucz = początek tematu bez polskich znaków i wielkich liter). */
export function topicRule(topicRaw: string): Rule | null {
  const n = norm(topicRaw).replace(/\s+/g, ' ').trim();
  return RULES.find(([k]) => n.startsWith(norm(k)))?.[1] ?? null;
}

/** Nazwa z dopisanym tematem, gdy sama go nie niesie; inaczej bez zmian. */
export function qualifyByTopic(name: string, topicRaw: string, pathRaw = ''): string {
  const rule = topicRule(topicRaw);
  if (rule) {
    if (rule.mode === 'replace') return rule.label;
    if (rule.mode === 'join') return `${rule.label} ${lowerFirst(name)}`;
    return rule.mode === 'before' ? `${rule.label} – ${lowerFirst(name)}` : `${upperFirst(name)} – ${rule.label}`;
  }
  if (/\bdzia[łl]e?\s+\d+/i.test(topicRaw)) return name; // dział budżetu dopisuje withDivision
  const topic = cleanTopic(topicRaw);
  if (!topic) return name;
  const fragment = FRAGMENT.test(`${name} `);
  const words = name.split(/\s+/).filter((w) => !GENERIC.has(norm(w)) && w.length >= 3).length;
  if (words >= 5 && !fragment) return name;
  // Dwa znaczące słowa („Bezrobotni zarejestrowani”) to już pełna nazwa; jedno („Krztusiec”, „Dobra”) wymaga tematu.
  if (words >= 2 && !fragment) return name;
  const own = new Set(stemsOf(name));
  if (significant(topic).some((st) => own.has(st))) {
    return stemsOf(name).every((st) => significant(topic).includes(st)) && !fragment ? topic : name;
  }
  // Słowo z działu lub grupy („Ludność” w dziale Ludność) też wystarcza.
  if (!fragment && significant(pathRaw).some((st) => own.has(st))) return name;
  return `${topic} – ${lowerFirst(name)}`;
}

/** „Dochody budżetów powiatów” i „… województw” mają te same wskaźniki – dopisujemy, czyj to budżet. */
export function withBudgetOwner(name: string, categoryPath?: string | null): string {
  const parts = (categoryPath ?? '').split(' > ').map((p) => p.trim());
  const m = /^(dochody|wydatki) budżetów (.+)$/i.exec(parts[parts.length - 2] ?? '');
  if (!m || /dzia[łl]e?\s+\d+/i.test(parts[parts.length - 1] ?? '')) return name;
  const owner = m[2]!.toLocaleLowerCase('pl');
  if (norm(name).includes(norm(owner))) return name;
  // Nazwa sama wymienia gminy/powiaty: odróżniamy dochody od wydatków tematem, nie dopiskiem o budżecie.
  const shared = significant(owner).some((st) => stemsOf(name).includes(st));
  const leaf = (parts[parts.length - 1] ?? '').toLocaleLowerCase('pl');
  if (shared) return leaf && !norm(name).includes(norm(leaf)) ? `${name} – ${leaf}` : name;
  return `${name} (budżety ${owner})`;
}

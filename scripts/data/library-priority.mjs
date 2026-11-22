// Biblioteka GUS: kolejność pobierania wg priorytetu i kontrola limitów API (czyste funkcje, testowane bez sieci).
// Wagi leżą w config/library-priority.json, żeby dało się je zmieniać bez ruszania kodu.
import { levelsForVariable } from './library-lib.mjs';
import { calendarHits } from './gus-calendar.mjs';

const norm = (s) => String(s ?? '').trim().toLocaleUpperCase('pl');
const names = (v) => [v.n1, v.n2, v.n3, v.n4, v.n5].filter((x) => typeof x === 'string' && x.trim()).map((x) => x.toLocaleLowerCase('pl'));

/** Nazwa działu najwyższego poziomu dla zmiennej (z katalogu); pusta, gdy dział nieznany. */
export function sectionOf(variable, catalog) {
  return norm(catalog?.subjects?.[variable.subjectId]?.path?.[0]);
}

/** Wynik zmiennej: im wyżej, tym wcześniej trafia do pobrania. subjectPath = ścieżka działów z katalogu. */
export function priorityScore(variable, subjectPath, config) {
  const section = norm(subjectPath?.[0]);
  const weights = new Map(Object.entries(config.sectionWeights ?? {}).map(([k, w]) => [norm(k), w]));
  let score = weights.get(section) ?? config.defaultSectionWeight ?? 20;
  // Słowo kluczowe liczy się raz w każdym członie n1–n5 („ogółem | ogółem” = dwa trafienia).
  for (const { match, points } of config.keywordBoosts ?? []) {
    const word = String(match).toLocaleLowerCase('pl');
    score += points * names(variable).filter((n) => n.includes(word)).length;
  }
  const depth = ['n2', 'n3', 'n4', 'n5'].filter((k) => typeof variable[k] === 'string' && variable[k].trim()).length;
  score += depth * (config.depthPenalty ?? -8);
  score += config.levelBonus?.[variable.level >= 6 ? '6' : '5'] ?? 0;
  if ((config.popularIds ?? []).includes(Number(variable.id))) score += config.popularBonus ?? 40;
  // Popularność (liczba otwarć wskaźnika, np. z PostHog): premia rośnie logarytmicznie.
  const hits = Number(config.popularity?.[variable.id] ?? 0);
  if (hits > 0) score += (config.popularityWeight ?? 10) * Math.log10(1 + hits);
  // Kalendarium GUS: temat świeżo opublikowany (config.calendarStems ustawia robot) dostaje premię, maks. 3 trafienia.
  const hitsCal = Math.min(3, calendarHits(variable, subjectPath, config.calendarStems));
  score += hitsCal * (config.calendarBonus ?? 15);
  return score;
}

/**
 * Kolejka pobierania: przypięte → reszta wg wyniku z limitem udziału jednego działu → nieudane (< 3 prób).
 * Pomija pobrane i te, które zawiodły 3 razy. Remis rozstrzyga rosnące id (wynik jest deterministyczny).
 */
export function sortQueueByPriority(variables, catalog, config, state = {}) {
  const done = state.done ?? {};
  const failed = state.failed ?? {};
  const now = state.now ?? Date.now();
  // Po 3 błędach zmienna wraca po retryAfterDays (błąd bywa przejściowy); bez daty błędu zostaje wykluczona.
  const retryDue = (id) => {
    const at = Date.parse(state.failedAt?.[id]);
    return Number.isFinite(at) && now - at >= (config.retryAfterDays ?? 7) * 86400_000;
  };
  const open = variables.filter(
    (v) => levelsForVariable(v).length > 0 && !done[v.id] && ((failed[v.id] ?? 0) < 3 || retryDue(v.id)),
  );
  const scored = open.map((v) => ({
    v,
    section: sectionOf(v, catalog),
    score: priorityScore(v, catalog?.subjects?.[v.subjectId]?.path ?? [], config),
  }));
  const byScore = (a, b) => b.score - a.score || Number(a.v.id) - Number(b.v.id);
  const pinned = new Map((config.pinnedIds ?? []).map((id, i) => [Number(id), i]));
  const isFailed = (x) => (failed[x.v.id] ?? 0) > 0;
  const head = scored
    .filter((x) => !isFailed(x) && pinned.has(Number(x.v.id)))
    .sort((a, b) => pinned.get(Number(a.v.id)) - pinned.get(Number(b.v.id)));
  const tail = scored.filter(isFailed).sort(byScore);
  const rest = scored.filter((x) => !isFailed(x) && !pinned.has(Number(x.v.id))).sort(byScore);
  return [...head, ...limitSectionShare(rest, config.maxSectionShareInRun ?? 0.4), ...tail].map((x) => x.v);
}

// Wybiera po kolei najlepszą zmienną z działu, który w prefiksie nie przekracza udziału `share`.
// Gdy innych działów zabraknie, bierze dalej z tego, co zostało.
function limitSectionShare(sorted, share) {
  const queues = new Map();
  for (const x of sorted) {
    if (!queues.has(x.section)) queues.set(x.section, []);
    queues.get(x.section).push(x);
  }
  const heads = new Map([...queues.keys()].map((k) => [k, 0]));
  const taken = new Map();
  const out = [];
  const better = (a, b) => !b || a.score > b.score || (a.score === b.score && Number(a.v.id) < Number(b.v.id));
  while (out.length < sorted.length) {
    const cap = Math.ceil(share * (out.length + 1));
    let best = null;
    let bestAny = null;
    for (const [key, list] of queues) {
      const x = list[heads.get(key)];
      if (!x) continue;
      if (better(x, bestAny)) bestAny = x;
      if ((taken.get(key) ?? 0) < cap && better(x, best)) best = x;
    }
    const pick = best ?? bestAny;
    out.push(pick);
    heads.set(pick.section, heads.get(pick.section) + 1);
    taken.set(pick.section, (taken.get(pick.section) ?? 0) + 1);
  }
  return out;
}

/** Tabela Markdown „Pobrano w tym przebiegu wg działów” (do logu i podsumowania w Actions). */
export function summarizeBySection(counts, remaining, title = 'Pobrano w tym przebiegu wg działów') {
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'));
  const total = rows.reduce((s, [, n]) => s + n, 0);
  const lines = [`#### ${title}`, '', '| Dział | Zmiennych |', '|---|---:|'];
  for (const [name, n] of rows) lines.push(`| ${name || '(nieznany)'} | ${n} |`);
  if (rows.length === 0) lines.push('| (nic nie pobrano) | 0 |');
  lines.push(`| **Razem** | **${total}** |`, '', `Zmiennych pozostałych w kolejce: ${remaining}.`);
  return lines.join('\n');
}

/** Limity BDL dla klucza (zapytań na okno) i współczynniki bezpieczeństwa. */
export const BDL_LIMITS = { '15m': { seconds: 900, max: 500 }, '12h': { seconds: 43200, max: 5000 }, '7d': { seconds: 604800, max: 50000 } };
export const DEFAULT_SAFETY = { '15m': 0.9, '12h': 0.95, '7d': 0.95 };

/**
 * Sprawdza każde przesuwne okno (15 min, 12 h, 7 dni) dla planu powtarzanego codziennie.
 * Przebieg: { name, startMinute (minuta doby UTC), requests, perSecond (domyślnie 0,5 = 1 zapytanie / 2 s) }.
 * Zapytania w przebiegu rozkładamy równomiernie; maksimum okna leży na brzegu przebiegu, więc sprawdzamy brzegi.
 */
export function checkWindows(runs, limits = BDL_LIMITS, safety = DEFAULT_SAFETY) {
  const DAY = 86400;
  const days = 16;
  const segments = [];
  for (let d = 0; d < days; d++) {
    for (const r of runs) {
      const start = d * DAY + r.startMinute * 60;
      const rate = r.perSecond ?? 0.5;
      segments.push({ start, end: start + r.requests / rate, rate });
    }
  }
  // Liczba zapytań w oknie [a, b]: całka z odcinków (każdy ma stałe tempo).
  const count = (a, b) =>
    segments.reduce((s, g) => s + Math.max(0, Math.min(b, g.end) - Math.max(a, g.start)) * g.rate, 0);
  const points = [...new Set(segments.flatMap((g) => [g.start, g.end]))];
  const windows = Object.entries(limits).map(([name, { seconds, max }]) => {
    const allowed = max * (safety[name] ?? 1);
    let peak = 0;
    // Tylko stan ustalony: koniec okna w ostatnich 8 dobach, żeby okno 7-dniowe było pełne.
    const lo = (days - 8) * DAY;
    for (const p of points) {
      for (const end of [p, p + seconds]) {
        if (end < lo || end > (days - 1) * DAY) continue;
        peak = Math.max(peak, count(end - seconds, end));
      }
    }
    return { name, peak: Math.round(peak), allowed, ok: peak <= allowed + 1e-6 };
  });
  return { ok: windows.every((w) => w.ok), windows };
}

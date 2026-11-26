// Tablica „Kalendarium danych” (W28-D07): Markdown ze stanami z księgi library/calendar.json,
// pobranymi i wdrożonymi danymi oraz odkryciami ze świeżych danych. Zdania i liczby tylko z plików danych
// i szablonów src/core/facts (bez AI, bez wpisywania ręcznego). Czyste funkcje + cienkie wejście/wyjście.
// Wejście z wiersza poleceń (workflow calendar-board.yml):
//   node scripts/data/calendar-board.mjs --lib lib-wt/library --out board.md --badge lib-wt/library/badge.json [--issue]
//     [--materials lib-wt/library/materials [--materials-force]]   (W29-D08: pakiet „Do materiałów”)
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ISSUE_LABEL = 'kalendarium';
export const ISSUE_TITLE = 'Kalendarium danych';
/** Limit treści zgłoszenia GitHub. */
export const BODY_LIMIT = 65_536;
export const SITE = 'https://faktografia.eu';
const AHEAD_DAYS = 14;
const DONE_DAYS = 14;
const REJECTED_DAYS = 30;
const MAX_FACTS = 5;
const DASH = '—';
const DAY = 86_400_000;

const dayDiff = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);
const plural = (n, one, few, many) => (n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many);
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

/** Powód odrzucenia po ludzku (księga trzyma tylko kod powodu). */
export const REASONS = {
  niszowe: 'niszowe: za mało gmin w ostatnim roku albo za krótka seria',
  'brak-gmin': 'brak danych na poziomie gmin',
  'brak-nowego-roku-14-dni': 'GUS nie dał nowego roku w 14 dni',
  'poza-wytycznymi': 'poza wytycznymi biblioteki',
};
export const reasonText = (code) => REASONS[code] ?? String(code ?? 'bez podanego powodu');

const levelOf = (teryt) => (teryt.length === 2 ? 'woj' : teryt.length === 4 ? 'pow' : 'gmi');

/** Adres mapy; zmienna biblioteki ma id z przedrostkiem „b” (`/mapa?i=b<id>`). */
export function mapUrl({ id, year, teryt, level }) {
  const q = [`i=${encodeURIComponent(id)}`];
  if (year) q.push(`y=${year}`);
  if (teryt) q.push(`u=${encodeURIComponent(teryt)}`);
  if (level) q.push(`l=${level}`);
  return `${SITE}/mapa?${q.join('&')}`;
}

const link = (text, href) => `[${cell(text)}](${href})`;

/** Dane do tablicy z księgi (każdy stan osobno, bez zegara: „dziś” podaje wywołanie). */
export function collectStates(ledger, today) {
  const out = { planned: [], waiting: [], downloaded: [], rejected: [] };
  for (const e of ledger?.entries ?? []) {
    for (const v of e.library ?? []) {
      const item = { entry: e, v };
      if (v.state === 'planned') {
        if (e.date >= today && dayDiff(today, e.date) <= AHEAD_DAYS) out.planned.push(item);
      } else if (v.state === 'waiting') out.waiting.push(item);
      else if (v.state === 'downloaded') {
        if (dayDiff(v.on ?? e.date, today) <= DONE_DAYS) out.downloaded.push(item);
      } else if (v.state === 'rejected' && dayDiff(e.date, today) <= REJECTED_DAYS) out.rejected.push(item);
    }
  }
  return out;
}

/** Zaplanowane premiery: po jednym wierszu na publikację z dopasowaniem w 14 dniach naprzód (także te, które mają tylko wskaźniki główne). */
function plannedRows(ledger, today) {
  return (ledger?.entries ?? [])
    .filter((e) => e.date >= today && dayDiff(today, e.date) <= AHEAD_DAYS)
    .sort((a, b) => a.date.localeCompare(b.date) || a.href.localeCompare(b.href));
}

/** Wskaźniki główne z nowym rokiem w ostatnich `days` dniach (księga świeżości facts/fresh.json; 1970 = „nie świeży”). */
export function freshMain(fresh, today, days = DONE_DAYS) {
  return Object.entries(fresh ?? {})
    .filter(([, e]) => e?.since && !e.since.startsWith('1970') && e.since.slice(0, 10) <= today && dayDiff(e.since.slice(0, 10), today) <= days)
    .map(([id, e]) => ({ id, year: e.year, since: e.since.slice(0, 10) }))
    .sort((a, b) => b.since.localeCompare(a.since) || a.id.localeCompare(b.id));
}

/** Najmocniejsze fakty ze świeżych danych (facts-start.json): wskaźnik świeży i fakt z jego najnowszego roku. */
export function pickDiscoveries(start, freshIds, limit = MAX_FACTS) {
  const year = new Map(freshIds.map((f) => [f.id, f.year]));
  return (start?.daily ?? [])
    .filter((d) => year.has(String(d.f?.[1])) && Number(d.f[2]) >= year.get(String(d.f[1])))
    .sort((a, b) => Number(b.f[4]) - Number(a.f[4]) || a.u.localeCompare(b.u))
    .slice(0, limit);
}

const nameOf = (available, id) => (available?.variables ?? []).find((x) => String(x.id) === String(id));
const lastYear = (x) => (x?.y?.length ? Math.max(...x.y.map(Number)) : undefined);

/**
 * Sekcje tablicy jako listy wierszy (bez przycinania). `sentenceOf(daily)` składa zdanie z szablonu (wstrzykiwane,
 * bo szablony są w TypeScript); zwraca null, gdy nie da się uczciwie ułożyć zdania.
 */
export function buildSections({ today, ledger, available, start, fresh, freshDays = DONE_DAYS, indicators = [], sentenceOf = () => null, topics = [], materials = [] }) {
  const st = collectStates(ledger, today);
  const varLabel = (id) => nameOf(available, id)?.n ?? `zmienna ${id}`;
  const indName = (id) => indicators.find((i) => i.id === id)?.name ?? id;
  const pub = (e) => link(e.title, e.href);
  const freshIds = freshMain(fresh, today);
  const discoveryIds = freshMain(fresh, today, freshDays);

  const planned = plannedRows(ledger, today).map((e) => {
    const lib = e.library?.length ?? 0;
    const main = e.main?.length ?? 0;
    const what = [main ? `${main} ${plural(main, 'wskaźnik główny', 'wskaźniki główne', 'wskaźników głównych')}` : '', lib ? `${lib} ${plural(lib, 'zmienna biblioteki', 'zmienne biblioteki', 'zmiennych biblioteki')}` : ''].filter(Boolean).join(', ');
    return `| ${e.date} | ${pub(e)} | pobierzemy: ${what || DASH} |`;
  });

  const waiting = st.waiting
    .sort((a, b) => a.entry.date.localeCompare(b.entry.date) || a.v.id - b.v.id)
    .map(({ entry, v }) => `| od ${entry.date} | ${cell(varLabel(v.id))} (${pub(entry)}) |`);

  const downloaded = [
    ...st.downloaded.map(({ entry, v }) => ({ on: v.on ?? entry.date, text: `zmienna biblioteki: ${cell(varLabel(v.id))}` })),
    ...freshIds.map((f) => ({ on: f.since, text: `wskaźnik: ${cell(indName(f.id))} (${f.year})` })),
  ]
    .sort((a, b) => b.on.localeCompare(a.on) || a.text.localeCompare(b.text))
    .map((r) => `| ${r.on} | ${r.text} |`);

  const rejected = st.rejected
    .sort((a, b) => b.entry.date.localeCompare(a.entry.date) || a.v.id - b.v.id)
    .map(({ entry, v }) => `| ${entry.date} | ${cell(varLabel(v.id))} | ${reasonText(v.reason)} |`);

  const deployed = [
    ...st.downloaded
      .filter(({ v }) => nameOf(available, v.id))
      .map(({ v }) => ({ on: v.on ?? '', text: link(varLabel(v.id), mapUrl({ id: `b${v.id}`, year: lastYear(nameOf(available, v.id)) })) })),
    ...freshIds.map((f) => ({ on: f.since, text: link(indName(f.id), mapUrl({ id: f.id, year: f.year })) })),
  ]
    .sort((a, b) => b.on.localeCompare(a.on) || a.text.localeCompare(b.text))
    .map((r) => `| ${r.text} |`);

  const discoveries = pickDiscoveries(start, discoveryIds).flatMap((d) => {
    const sentence = sentenceOf(d);
    if (!sentence) return [];
    const f = d.f;
    const href = mapUrl({ id: f[1], year: Number(f[2]), teryt: d.u, level: levelOf(d.u) });
    return [`| ${cell(d.n)} | ${cell(sentence)} | ${link('Zobacz na mapie', href)} |`];
  });

  const trends = topics.map((t) => `| ${cell(t.topic ?? t)} | ${t.change != null ? cell(t.change) : DASH} |`);

  // „Do materiałów” (W29-D08): pakiet z src/core/facts/materials.ts, tytuł = zdanie z szablonu, link do widoku na mapie.
  // Bez ściskania spacji: liczby mają twarde spacje, a zdanie ma zostać identyczne jak w pakiecie.
  const esc = (s) => String(s).replace(/\|/g, '\\|');
  const kindLabel = { premiere: 'premiera GUS', fresh: 'świeże dane', extreme: 'skrajność', trend: 'temat na czasie' };
  const forMaterials = materials.map((m, i) => `| ${i + 1} | ${kindLabel[m.kind] ?? m.kind} | ${esc(m.title)} | ${esc(m.value.text)} | ${link(m.source.text, `${SITE}${m.source.map}`)} |`);

  return [
    { title: 'Zaplanowane (14 dni)', head: ['Data', 'Publikacja GUS', 'Co pobierzemy'], rows: planned },
    { title: 'Czeka na BDL', head: ['Od kiedy', 'Zmienna (publikacja)'], rows: waiting },
    { title: 'Pobrane', head: ['Data', 'Wskaźnik / zmienna'], rows: downloaded },
    { title: 'Odrzucone', head: ['Data', 'Zmienna', 'Powód'], rows: rejected },
    { title: 'Wdrożone (na stronie)', head: ['Mapa'], rows: deployed },
    { title: 'Odkrycia', head: ['Jednostka', 'Fakt', 'Mapa'], rows: discoveries },
    { title: 'Tematy na czasie', head: ['Temat', 'Zmiana'], rows: trends },
    { title: 'Do materiałów', head: ['#', 'Rodzaj', 'Zdanie', 'Liczba', 'Źródło i mapa'], rows: forMaterials },
  ];
}

/** Pakiet „Do materiałów” zapisujemy w poniedziałek (co tydzień) i w dniu, w którym księga ma nowe `downloaded` (premiera GUS). */
export function shouldBuildMaterials({ today, ledger, force = false }) {
  if (force || new Date(`${today}T00:00:00Z`).getUTCDay() === 1) return true;
  return (ledger?.entries ?? []).some((e) => (e.library ?? []).some((v) => v.state === 'downloaded' && (v.on ?? e.date) === today));
}

/** latest.json pakietu „Do materiałów”: ta sama treść co plik .md, w strukturze (deterministyczny zapis). */
export const materialsJson = (pack) => `${JSON.stringify(pack, null, 2)}\n`;

const KIND_LABEL = { premiere: 'Premiera GUS', fresh: 'Świeże dane', extreme: 'Skrajność', trend: 'Temat na czasie' };

/** Plik library/materials/<data>.md; `site` dopisuje domenę do linków mapy. */
export function renderMaterialsMarkdown(pack, { site = '' } = {}) {
  const rows = (list) => (list.length ? list.map((r) => `${r.rank}. ${r.name} (${r.teryt}) – ${r.text}`).join('; ') : DASH);
  const lines = [`# Do materiałów – ${pack.date}`, '', '_Pakiet tekstowy robota: zdania ze stałych szablonów, liczby wyłącznie z danych GUS (BDL). Bez grafik i bez AI._', ''];
  if (pack.items.length === 0) lines.push('Brak pozycji w tym tygodniu.', '');
  pack.items.forEach((it, i) => {
    const what = it.premiere ? `${KIND_LABEL[it.kind]}: [${it.premiere.title}](${it.premiere.href}), ${it.premiere.date}` : `${KIND_LABEL[it.kind]}${it.topic ? ` (${it.topic})` : ''}`;
    lines.push(`## ${i + 1}. ${it.title}`, '', `- Rodzaj: ${what}`, `- Jednostka: ${it.unitName} (${it.teryt})`, `- Liczba: ${it.value.text} (${it.year} r.)`);
    if (it.context.average) lines.push(`- Średnia: ${it.context.average.text} (${it.context.average.basis})`);
    if (it.context.change10) lines.push(`- Zmiana w 10 lat: ${it.context.change10}`);
    lines.push(`- Najwyżej: ${rows(it.ranking.top)}`, `- Najniżej: ${rows(it.ranking.bottom)}`);
    lines.push(`- Źródło: ${it.source.text}${it.source.bdlVarId != null ? `, zmienna BDL ${it.source.bdlVarId}` : ''} · [mapa](${site}${it.source.map})`);
    if (it.warnings.length) lines.push(`- Uwaga: ${it.warnings.join('; ')}`);
    lines.push('');
  });
  return lines.join('\n');
}

const renderSection = (s, limit) => {
  const cols = s.head.length;
  const shown = s.rows.slice(0, limit);
  const more = s.rows.length - shown.length;
  const body = shown.length ? shown : [`| ${DASH} |${' |'.repeat(cols - 1)}`];
  const tail = more > 0 ? [`\n_i ${more} więcej_`] : [];
  return [`## ${s.title}`, '', `| ${s.head.join(' | ')} |`, `|${' --- |'.repeat(cols)}`, ...body, ...tail, ''].join('\n');
};

/** Tablica w Markdown; sekcje przycinane tak, żeby treść mieściła się w limicie zgłoszenia (dopisek „i N więcej”). */
export function renderBoard(sections, { updated, limit = BODY_LIMIT } = {}) {
  const head = `# ${ISSUE_TITLE}\n\n_Odświeża robot (${updated ?? DASH}). Treść jest podmieniana automatycznie; nie edytuj ręcznie._\n\n`;
  let text = head;
  for (const per of [100, 50, 25, 10, 5, 2, 0]) {
    text = head + sections.map((s) => renderSection(s, per)).join('\n');
    if (text.length <= limit) return text;
  }
  return text.slice(0, limit);
}

/** Cała tablica z danych wejściowych (bez sieci). */
export function buildBoard(input) {
  const sections = buildSections(input);
  const counts = {
    premieres: sections[0].rows.length,
    news: sections[2].rows.length,
  };
  return { markdown: renderBoard(sections, { updated: input.today }), counts, sections };
}

/** library/badge.json w formacie endpointu shields.io: „3 premiery · 2 nowości”. */
export function buildBadge({ premieres, news }) {
  const p = `${premieres} ${plural(premieres, 'premiera', 'premiery', 'premier')}`;
  const n = `${news} ${plural(news, 'nowość', 'nowości', 'nowości')}`;
  return { schemaVersion: 1, label: 'Kalendarium', message: `${p} · ${n}`, color: premieres + news ? 'blue' : 'lightgrey' };
}

/**
 * Zgłoszenie z etykietą „kalendarium”: edytuje istniejące (nie tworzy drugiego, nie komentuje), a gdy go nie ma,
 * zakłada raz. api: { findIssue(label) → {number}|null, updateIssue(number, {title, body}), createIssue({title, body, labels}) }.
 */
export async function upsertIssue(api, body, { title = ISSUE_TITLE, label = ISSUE_LABEL } = {}) {
  const existing = await api.findIssue(label);
  if (existing) {
    await api.updateIssue(existing.number, { title, body });
    return { number: existing.number, created: false };
  }
  const made = await api.createIssue({ title, body, labels: [label] });
  return { number: made.number, created: true };
}

/** Klient API GitHub na fetch (tylko GITHUB_TOKEN; bez zależności). */
export function githubClient({ repo, token, fetchFn = fetch }) {
  const call = async (method, url, payload) => {
    const res = await fetchFn(`https://api.github.com/repos/${repo}${url}`, {
      method,
      headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'content-type': 'application/json' },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    if (!res.ok) throw new Error(`GitHub API ${method} ${url}: ${res.status}`);
    return res.json();
  };
  return {
    // state=all: znajdzie też zamknięte (nie zakładamy drugiego); wyniki z PR odrzucamy.
    findIssue: async (label) => (await call('GET', `/issues?labels=${encodeURIComponent(label)}&state=all&per_page=20&sort=created&direction=asc`)).find((i) => !i.pull_request) ?? null,
    updateIssue: (number, data) => call('PATCH', `/issues/${number}`, data),
    createIssue: (data) => call('POST', '/issues', data),
  };
}

const readJson = async (file, fallback) => {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
};

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const lib = path.resolve(arg('lib') ?? 'library');
  const data = path.join(root, 'public/data');
  const indicators = await readJson(path.join(root, 'config/indicators.json'), []);
  const start = await readJson(path.join(data, 'facts-start.json'), null);
  const fresh = await readJson(path.join(data, 'facts/fresh.json'), {});
  const topics = await readJson(path.join(root, arg('topics') ?? 'public/data/topics-trend.json'), []);
  let sentenceOf = () => null;
  const { createServer } = await import('vite');
  const vite = await createServer({ root, configFile: false, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false, watch: null }, resolve: { alias: { '@': path.join(root, 'src') } }, optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    const { decodeFact } = await vite.ssrLoadModule('/src/core/facts/codec.ts');
    const { factSentence } = await vite.ssrLoadModule('/src/core/facts/sentences.ts');
    const byId = new Map(indicators.map((i) => [i.id, i]));
    sentenceOf = (d) => {
      const ind = byId.get(String(d.f[1]));
      if (!ind) return null;
      return factSentence(decodeFact(d.u, d.f), { indicator: { name: ind.name, unit: ind.unit }, level: levelOf(d.u) });
    };
    const today = new Date().toISOString().slice(0, 10);
    const ledger = await readJson(path.join(lib, 'calendar.json'), null);
    const factsConfig = await readJson(path.join(root, 'config/facts.json'), {});
    // Pakiet „Do materiałów” (W29-D08): liczby tylko z public/data, zdania z szablonów src/core/facts.
    const { buildMaterials } = await vite.ssrLoadModule('/src/core/facts/materials.ts');
    const values = {};
    for (const i of indicators) {
      const v = await readJson(path.join(data, 'values', `${i.id}.json`), null);
      if (v) values[i.id] = v;
    }
    const pack = buildMaterials({
      today,
      indicators,
      values,
      units: await readJson(path.join(data, 'units.json'), []),
      config: factsConfig,
      gminaMinPopulation: (await readJson(path.join(root, 'config/lists.json'), {})).gminaMinPopulation ?? 5000,
      fresh,
      premieres: ledger?.entries ?? [],
      daily: start?.daily ?? [],
    });
    const materialsDir = arg('materials');
    if (materialsDir && shouldBuildMaterials({ today, ledger, force: process.argv.includes('--materials-force') })) {
      await mkdir(materialsDir, { recursive: true });
      await writeFile(path.join(materialsDir, `${today}.md`), renderMaterialsMarkdown(pack, { site: SITE }));
      await writeFile(path.join(materialsDir, 'latest.json'), materialsJson(pack));
      console.log(`Do materiałów: ${pack.items.length} pozycji → ${materialsDir}`);
    }
    const { markdown, counts } = buildBoard({
      today,
      materials: pack.items,
      ledger,
      available: await readJson(path.join(lib, 'available.json'), null),
      start,
      fresh,
      freshDays: factsConfig.fresh?.days ?? DONE_DAYS,
      indicators,
      sentenceOf,
      topics: Array.isArray(topics) ? topics : [],
    });
    const out = arg('out');
    if (out) await writeFile(out, markdown);
    const badge = arg('badge');
    if (badge) await writeFile(badge, JSON.stringify(buildBadge(counts)));
    console.log(`Tablica: ${markdown.length} znaków, premier ${counts.premieres}, nowości ${counts.news}`);
    if (process.argv.includes('--issue')) {
      const { number, created } = await upsertIssue(githubClient({ repo: process.env.GITHUB_REPOSITORY, token: process.env.GITHUB_TOKEN }), markdown);
      console.log(`Zgłoszenie #${number}: ${created ? 'założone (przypnij je ręcznie)' : 'zaktualizowane'}`);
    }
  } finally {
    await vite.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();

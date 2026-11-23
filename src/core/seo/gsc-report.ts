// Tygodniowy raport z Google Search Console (S12, docs/SEO.md §8). Czyste funkcje: odpowiedzi API → Markdown.
// Sieć, podpis JWT i tworzenie zgłoszenia są w scripts/seo/gsc-report.mjs.

export interface GscRow { keys?: string[]; clicks: number; impressions: number; ctr?: number; position: number }
export interface GscAnalytics { rows?: GscRow[] }
/** Trzy zapytania searchanalytics.query: bez wymiaru (sumy), wg zapytania, wg strony. */
export interface WeekData { totals: GscAnalytics; query: GscAnalytics; page: GscAnalytics }
export interface GscSitemap {
  path: string;
  errors?: string | number;
  warnings?: string | number;
  isPending?: boolean;
  lastDownloaded?: string;
  contents?: { type?: string; submitted?: string | number; indexed?: string | number }[];
}
export interface IndexStatus { verdict?: string; coverageState?: string; pageFetchState?: string }
/** Wynik urlInspection.index.inspect dla adresu; `result: null` = API nie odpowiedziało. */
export interface InspectedUrl { url: string; result: { inspectionResult?: { indexStatusResult?: IndexStatus } } | null }
/** Stan zapisywany w zgłoszeniu (komentarz HTML), żeby następny raport mógł porównać. */
export interface ReportState { indexedShare: number | null; sampleSize: number }
export interface Range { start: string; end: string }
export interface ReportWindow { current: Range; previous: Range }
export interface ReportInput {
  window: ReportWindow;
  current: WeekData;
  previous: WeekData;
  sitemaps: { sitemap?: GscSitemap[] };
  inspections: InspectedUrl[];
  previousState: ReportState | null;
}
export interface Totals { clicks: number; impressions: number; position: number }
export interface Drop { page: string; before: number; after: number; change: number }

/** Próg spadku kliknięć strony (> 50 %) i minimum kliknięć tydzień wcześniej, żeby 1 → 0 nie było alarmem. */
export const DROP_THRESHOLD = 0.5;
export const DROP_MIN_CLICKS = 3;
const TOP = 20;
const STATE_RE = /<!-- gsc-state:(\{.*?\}) -->/;

const iso = (d: Date) => d.toISOString().slice(0, 10);
const shift = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

/** Dane Search Console mają 2–3 dni opóźnienia: okno kończy się 3 dni temu; 7 dni + poprzednie 7. */
export function reportWindow(today: Date): ReportWindow {
  const end = shift(today, -3);
  return {
    current: { start: iso(shift(end, -6)), end: iso(end) },
    previous: { start: iso(shift(end, -13)), end: iso(shift(end, -7)) },
  };
}

/** Sumy tygodnia (pierwszy wiersz zapytania bez wymiaru); brak wierszy → null („za mało danych”). */
export function totalsOf(a: GscAnalytics): Totals | null {
  const r = a.rows?.[0];
  return r && r.impressions > 0 ? { clicks: r.clicks, impressions: r.impressions, position: r.position } : null;
}

const byKey = (a: GscAnalytics) => new Map((a.rows ?? []).map((r) => [r.keys?.[0] ?? '', r]));

/** Strony, których kliknięcia spadły o więcej niż 50 % (od największego spadku). */
export function pageDrops(cur: GscAnalytics, prev: GscAnalytics): Drop[] {
  const now = byKey(cur);
  return (prev.rows ?? [])
    .filter((r) => r.clicks >= DROP_MIN_CLICKS)
    .map((r) => {
      const page = r.keys?.[0] ?? '';
      const after = now.get(page)?.clicks ?? 0;
      return { page, before: r.clicks, after, change: (after - r.clicks) / r.clicks };
    })
    .filter((d) => -d.change > DROP_THRESHOLD)
    .sort((a, b) => a.change - b.change);
}

/** Zapytania z wyświetleniami w tym tygodniu, których nie było tydzień wcześniej. */
export function newQueries(cur: GscAnalytics, prev: GscAnalytics): GscRow[] {
  const before = byKey(prev);
  return (cur.rows ?? []).filter((r) => !before.has(r.keys?.[0] ?? ''));
}

/** Losowa próbka n różnych elementów (częściowe tasowanie Fishera–Yatesa). */
export function sample<T>(items: readonly T[], n: number, random: () => number = Math.random): T[] {
  const a = [...items];
  const k = Math.min(n, a.length);
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(random() * (a.length - i));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a.slice(0, k);
}

/** Wszystkie `<loc>` z pliku mapy strony (adresy stron albo plików w indeksie). */
export function sitemapLocations(xml: string): string[] {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((m) => (m[1] ?? '').trim().replace(/&amp;/g, '&'));
}

export function parseState(body: string): ReportState | null {
  const m = STATE_RE.exec(body);
  if (!m) return null;
  try {
    const s = JSON.parse(m[1] ?? '') as ReportState;
    return typeof s.sampleSize === 'number' ? s : null;
  } catch {
    return null;
  }
}

const status = (u: InspectedUrl) => u.result?.inspectionResult?.indexStatusResult;
const num = (v: string | number | undefined) => Number(v ?? 0) || 0;

export function buildReport(input: ReportInput) {
  const totals = totalsOf(input.current.totals);
  const previousTotals = totalsOf(input.previous.totals);
  const drops = previousTotals ? pageDrops(input.current.page, input.previous.page) : [];
  const fresh = previousTotals ? newQueries(input.current.query, input.previous.query) : null;
  const answered = input.inspections.filter((u) => status(u));
  const indexed = answered.filter((u) => status(u)?.verdict === 'PASS').length;
  const state: ReportState = { indexedShare: answered.length ? indexed / answered.length : null, sampleSize: answered.length };
  const coverage = new Map<string, number>();
  for (const u of answered) {
    const k = status(u)?.coverageState ?? 'brak stanu';
    coverage.set(k, (coverage.get(k) ?? 0) + 1);
  }

  const flags: string[] = [];
  const pct = (x: number) => `${Math.round(Math.abs(x) * 100)} %`;
  for (const d of drops) flags.push(`Spadek kliknięć o ${pct(d.change)} na ${d.page} (${d.before} → ${d.after}).`);
  const prevShare = input.previousState?.indexedShare;
  if (prevShare && state.indexedShare !== null && (prevShare - state.indexedShare) / prevShare > 0.2)
    flags.push(`Spadek zaindeksowanych stron o ${pct((prevShare - state.indexedShare) / prevShare)} w tydzień (próbka ${state.sampleSize} adresów: ${pct(prevShare)} → ${pct(state.indexedShare)}).`);
  const gminy = answered.filter((u) => u.url.includes('/gmina/'));
  const discovered = gminy.filter((u) => status(u)?.coverageState === 'Discovered - currently not indexed').length;
  if (gminy.length >= 5 && discovered / gminy.length > 0.5)
    flags.push(`„Wykryto – obecnie nie zindeksowano” na ${pct(discovered / gminy.length)} stron gmin z próbki – jeśli gminy są w mapie strony od ≥ 8 tygodni: poprawiamy istniejące strony, nie dokładamy nowych.`);
  const errors5xx = answered.filter((u) => status(u)?.pageFetchState === 'SERVER_ERROR');
  if (errors5xx.length) flags.push(`Błędy 5xx przy pobieraniu przez Google: ${errors5xx.map((u) => u.url).join(', ')}.`);
  for (const s of input.sitemaps.sitemap ?? [])
    if (num(s.errors) > 0) flags.push(`Mapa strony ${s.path}: ${num(s.errors)} błędów.`);

  return { window: input.window, totals, previousTotals, drops, fresh, sitemaps: input.sitemaps.sitemap ?? [], coverage, state, flags, current: input.current };
}

export type Report = ReturnType<typeof buildReport>;

const nf = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 });
const cell = (s: string) => s.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/\n/g, ' ');
const change = (a: number, b: number) => (b === 0 ? '–' : `${a >= b ? '+' : '−'}${Math.round((Math.abs(a - b) / b) * 100)} %`);
const table = (head: string[], rows: string[][]) =>
  [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`)].join('\n');
const rowsTable = (a: GscAnalytics, label: string) =>
  a.rows?.length
    ? table([label, 'Kliknięcia', 'Wyświetlenia', 'Śr. pozycja'], a.rows.slice(0, TOP).map((r) => [r.keys?.[0] ?? '', nf.format(r.clicks), nf.format(r.impressions), nf.format(r.position)]))
    : 'Brak danych.';

/** Markdown po polsku; pierwsza sekcja to zawsze „Co wymaga działania”. */
export function renderMarkdown(r: Report): string {
  const { current: c, previous: p } = r.window;
  const out: string[] = ['## Co wymaga działania', ''];
  out.push(r.flags.length ? r.flags.map((f) => `- **${f}**`).join('\n') : 'Nic – wszystko w normie.');
  out.push('', `## Ruch z Google (${c.start} – ${c.end} vs ${p.start} – ${p.end})`, '');
  if (!r.totals) out.push('Brak danych z tego tygodnia (za mało danych).');
  else {
    const t = r.totals;
    const q = r.previousTotals;
    const line = (name: string, a: number, b: number | undefined, lowerIsBetter = false) => [
      name, nf.format(a), b === undefined ? 'za mało danych' : nf.format(b),
      b === undefined ? '–' : lowerIsBetter ? `${a <= b ? '−' : '+'}${nf.format(Math.abs(a - b))} poz.` : change(a, b),
    ];
    out.push(table(['Miernik', 'Ten tydzień', 'Poprzedni', 'Zmiana'], [
      line('Kliknięcia', t.clicks, q?.clicks),
      line('Wyświetlenia', t.impressions, q?.impressions),
      line('Średnia pozycja', t.position, q?.position, true),
    ]));
  }
  out.push('', '## Strony ze spadkiem kliknięć > 50 %', '');
  if (!r.previousTotals) out.push('Za mało danych z poprzedniego tygodnia.');
  else out.push(r.drops.length ? table(['Strona', 'Przedtem', 'Teraz', 'Zmiana'], r.drops.map((d) => [d.page, String(d.before), String(d.after), change(d.after, d.before)])) : 'Brak.');
  out.push('', '## Nowe zapytania', '');
  if (!r.fresh) out.push('Za mało danych z poprzedniego tygodnia.');
  else out.push(r.fresh.length ? rowsTable({ rows: r.fresh }, 'Zapytanie') : 'Brak.');
  out.push('', `## ${TOP} zapytań`, '', rowsTable(r.current.query, 'Zapytanie'));
  out.push('', `## ${TOP} stron`, '', rowsTable(r.current.page, 'Strona'));
  out.push('', '## Mapy strony', '');
  out.push(r.sitemaps.length
    ? table(['Plik', 'Wysłane', 'Zaindeksowane', 'Błędy', 'Ostatnio pobrana'], r.sitemaps.map((s) => [
      s.path, String((s.contents ?? []).reduce((n, x) => n + num(x.submitted), 0)),
      String((s.contents ?? []).reduce((n, x) => n + num(x.indexed), 0)), String(num(s.errors)), s.lastDownloaded?.slice(0, 10) ?? '–',
    ]))
    : 'Search Console nie zna żadnej mapy strony.');
  out.push('', `## Indeksowanie – próbka ${r.state.sampleSize} adresów z mapy strony`, '');
  out.push(r.coverage.size ? table(['Stan', 'Adresy'], [...r.coverage].map(([k, v]) => [k, String(v)])) : 'Brak wyników inspekcji.');
  out.push('', '_Ręcznych działań API nie pokazuje – raz w miesiącu zajrzyj do Search Console (Bezpieczeństwo i ręczne działania)._');
  out.push('', `<!-- gsc-state:${JSON.stringify(r.state)} -->`, '');
  return out.join('\n');
}

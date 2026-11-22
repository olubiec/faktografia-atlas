export interface GscRow { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }
export interface GscPeriod { totals: { clicks: number; impressions: number; position: number }; queries: GscRow[]; pages: GscRow[] }
export interface GscSitemap { path: string; submitted: number; indexed: number; errors: number; warnings: number }
export interface GscInspection { url: string; verdict: string; coverageState: string }
export interface ReportInput {
  window: { start: string; end: string };
  current: GscPeriod;
  /** Poprzednie 7 dni; `null` = jeszcze za mało danych. */
  previous: GscPeriod | null;
  sitemaps: GscSitemap[];
  inspections: GscInspection[];
}
export interface Report { markdown: string; flags: string[] }

const DROP_PAGE = 0.5;
const MIN_PREV_CLICKS = 10;
const GOAL_INDEXED = 0.8;
const NOT_INDEXED_FLAG = 0.5;
const nf = (n: number, digits = 0) => n.toLocaleString('pl-PL', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const pct = (cur: number, prev: number) => (prev === 0 ? '–' : `${cur >= prev ? '+' : '−'}${nf((Math.abs(cur - prev) / prev) * 100, 0)}%`);
const row = (r: GscRow) => `| ${r.keys[0]} | ${nf(r.clicks)} | ${nf(r.impressions)} | ${nf(r.position, 1)} |`;
const table = (head: string, rows: GscRow[]) =>
  rows.length ? `| ${head} | Kliknięcia | Wyświetlenia | Pozycja |\n|---|---:|---:|---:|\n${rows.map(row).join('\n')}` : '_Brak danych._';

/** Strony, których kliknięcia spadły o ponad 50 % (przy co najmniej 10 kliknięciach wcześniej). */
export function droppedPages(current: GscRow[], previous: GscRow[]): { page: string; from: number; to: number }[] {
  const now = new Map(current.map((r) => [r.keys[0]!, r.clicks]));
  return previous
    .filter((p) => p.clicks >= MIN_PREV_CLICKS)
    .map((p) => ({ page: p.keys[0]!, from: p.clicks, to: now.get(p.keys[0]!) ?? 0 }))
    .filter((x) => x.to < x.from * (1 - DROP_PAGE));
}

/** Zapytania, które pojawiły się w tym tygodniu, a nie było ich w poprzednim. */
export function newQueries(current: GscRow[], previous: GscRow[]): GscRow[] {
  const before = new Set(previous.map((r) => r.keys[0]));
  return current.filter((r) => !before.has(r.keys[0]));
}

/** Raport tygodniowy w Markdown (po polsku); na początku sekcja „Co wymaga działania”. */
export function buildReport(input: ReportInput): Report {
  const { current, previous, sitemaps, inspections } = input;
  const flags: string[] = [];
  if (previous) {
    for (const d of droppedPages(current.pages, previous.pages)) flags.push(`Strona ${d.page}: kliknięcia z ${nf(d.from)} do ${nf(d.to)} (spadek ponad 50%)`);
  }
  for (const s of sitemaps) {
    if (s.errors > 0) flags.push(`Mapa strony ${s.path}: błędy (${s.errors})`);
    if (s.submitted > 0 && s.indexed / s.submitted < GOAL_INDEXED) flags.push(`Mapa strony ${s.path}: zaindeksowano ${nf(s.indexed)} z ${nf(s.submitted)} (cel: ${GOAL_INDEXED * 100}%)`);
  }
  const notIndexed = inspections.filter((i) => i.verdict !== 'PASS');
  if (inspections.length > 0 && notIndexed.length / inspections.length > NOT_INDEXED_FLAG) {
    flags.push(`W próbce ${inspections.length} adresów ${notIndexed.length} nie jest zaindeksowanych (ponad 50%)`);
  }

  const action = flags.length ? flags.map((f) => `- 🔴 ${f}`).join('\n') : '- Nic nie wymaga działania.';
  const compare = previous
    ? `| | Teraz | Poprzedni tydzień | Zmiana |\n|---|---:|---:|---:|\n` +
      `| Kliknięcia | ${nf(current.totals.clicks)} | ${nf(previous.totals.clicks)} | ${pct(current.totals.clicks, previous.totals.clicks)} |\n` +
      `| Wyświetlenia | ${nf(current.totals.impressions)} | ${nf(previous.totals.impressions)} | ${pct(current.totals.impressions, previous.totals.impressions)} |\n` +
      `| Średnia pozycja | ${nf(current.totals.position, 1)} | ${nf(previous.totals.position, 1)} | |`
    : `Za mało danych do porównania z poprzednim tygodniem (kliknięcia: ${nf(current.totals.clicks)}, wyświetlenia: ${nf(current.totals.impressions)}).`;
  const fresh = previous ? newQueries(current.queries, previous.queries).slice(0, 20) : [];
  const maps = sitemaps.length
    ? `| Mapa strony | Wysłane | Zaindeksowane | Błędy |\n|---|---:|---:|---:|\n${sitemaps.map((s) => `| ${s.path} | ${nf(s.submitted)} | ${nf(s.indexed)} | ${nf(s.errors)} |`).join('\n')}`
    : '_Brak map stron w Search Console._';
  const states = new Map<string, number>();
  for (const i of inspections) states.set(i.coverageState || i.verdict, (states.get(i.coverageState || i.verdict) ?? 0) + 1);
  const insp = inspections.length
    ? `Próbka ${inspections.length} adresów z mapy strony:\n\n${[...states].map(([k, n]) => `- ${k}: ${n}`).join('\n')}`
    : '_Brak próbki inspekcji adresów._';

  const markdown = [
    '## Co wymaga działania',
    action,
    `## Tydzień ${input.window.start} – ${input.window.end}`,
    compare,
    '## Zapytania (20 najczęstszych)',
    table('Zapytanie', current.queries.slice(0, 20)),
    '## Strony (20 najczęstszych)',
    table('Strona', current.pages.slice(0, 20)),
    '## Nowe zapytania',
    fresh.length ? table('Zapytanie', fresh) : '_Brak nowych zapytań albo za mało danych._',
    '## Indeksowanie',
    maps,
    insp,
  ].join('\n\n');
  return { markdown: `${markdown}\n`, flags };
}

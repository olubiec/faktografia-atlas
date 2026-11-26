// Publiczne kalendarium (W30-D10): mały plik public/data/calendar.json robota i dwie sekcje strony `/nowe-dane`.
// Plik czyta wyłącznie generator stron statycznych (jak news.json); przeglądarka go nie pobiera.
// Z księgi library/calendar.json bierzemy tylko to, co pobierzemy albo już pobraliśmy – odrzuconych nie pokazujemy.
import { escapeAttr as attr, escapeHtml as text } from '../seo/html';
import { H2, LINK, SECTION } from '../seo/page-template';

export const CALENDAR_DAYS = 14;
export const CALENDAR_MAX_BYTES = 5000;
export const TITLE_MAX = 120;
export const EMPTY_SENTENCE = 'Na razie nic nowego – zajrzyj po najbliższej publikacji GUS.';

export interface PublicPlanned {
  date: string;
  title: string;
  href: string;
}
export interface PublicDone {
  date: string;
  name: string;
  /** Id wskaźnika do mapy; zmienna biblioteki ma przedrostek „b”. */
  id: string;
  year: number;
}
export interface PublicCalendar {
  planned: PublicPlanned[];
  done: PublicDone[];
}

const DAY = 86_400_000;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);
const MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];

/** „2026-12-02” → „2 grudnia 2026”. */
export function plDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1] ?? ''} ${m[1]}`;
}

/** Skraca tytuł do `max` znaków bez ucinania słów (dodaje „…”). */
export function shortTitle(title: string, max = TITLE_MAX): string {
  const t = title.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > 0 ? cut.slice(0, space) : cut).replace(/[\s,;:.–-]+$/, '')}…`;
}

const safeHref = (h: unknown): h is string => typeof h === 'string' && /^https?:\/\/\S+$/.test(h);

interface LedgerVar {
  id: number | string;
  state: string;
  on?: string;
}
interface LedgerEntry {
  date: string;
  title: string;
  href: string;
  library?: LedgerVar[];
}
export interface BuildCalendarInput {
  today: string;
  ledger: { entries?: LedgerEntry[] } | null | undefined;
  available?: { variables?: { id: string | number; n: string; y?: number[] }[] } | null;
  fresh?: Record<string, { year: number; since: string }> | null;
  indicators?: readonly { id: string; name: string }[];
}

/** Z księgi, świeżości i katalogu biblioteki składa publiczne kalendarium: zaplanowane i pobrane w 14 dni. */
export function buildPublicCalendar(input: BuildCalendarInput): PublicCalendar {
  const { today } = input;
  const entries = (input.ledger?.entries ?? []).filter((e) => ISO.test(e.date));
  const planned = entries
    .filter((e) => e.date >= today && dayDiff(today, e.date) <= CALENDAR_DAYS && safeHref(e.href) && e.title)
    .map((e) => ({ date: e.date, title: shortTitle(e.title), href: e.href }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.href.localeCompare(b.href));
  const done: PublicDone[] = [];
  const vars = new Map((input.available?.variables ?? []).map((v) => [String(v.id), v]));
  for (const e of entries) {
    for (const v of e.library ?? []) {
      if (v.state !== 'downloaded') continue;
      const on = (v.on ?? e.date).slice(0, 10);
      const info = vars.get(String(v.id));
      const year = info?.y?.length ? Math.max(...info.y.map(Number)) : undefined;
      if (!info || !year || !ISO.test(on) || on > today || dayDiff(on, today) > CALENDAR_DAYS) continue;
      done.push({ date: on, name: info.n, id: `b${v.id}`, year });
    }
  }
  const names = new Map((input.indicators ?? []).map((i) => [i.id, i.name]));
  for (const [id, f] of Object.entries(input.fresh ?? {})) {
    const since = f?.since?.slice(0, 10) ?? '';
    if (!ISO.test(since) || since.startsWith('1970') || since > today || dayDiff(since, today) > CALENDAR_DAYS) continue;
    done.push({ date: since, name: names.get(id) ?? id, id, year: f.year });
  }
  done.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  return { planned, done: done.filter((d, i) => done.findIndex((x) => x.id === d.id && x.year === d.year) === i) };
}

/** Plik bez wcięć; przy przekroczeniu 5 KB ucina najstarsze pozycje (najpierw pobrane, potem najdalsze zaplanowane). */
export function serializeCalendar(cal: PublicCalendar, maxBytes = CALENDAR_MAX_BYTES): string {
  const c: PublicCalendar = { planned: [...cal.planned], done: [...cal.done] };
  let out = JSON.stringify(c);
  while (new TextEncoder().encode(out).length > maxBytes && (c.done.length > 0 || c.planned.length > 0)) {
    if (c.done.length > 0) c.done.pop();
    else c.planned.pop();
    out = JSON.stringify(c);
  }
  return out;
}

/** Odczyt pliku z weryfikacją kształtu; zepsute pozycje odpadają, brak lub błąd pliku = null. */
export function parsePublicCalendar(raw: unknown): PublicCalendar | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const list = (v: unknown) => (Array.isArray(v) ? v : []) as Record<string, unknown>[];
  const str = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
  const planned = list(r.planned)
    .filter((p) => str(p.date) && ISO.test(p.date) && str(p.title) && safeHref(p.href))
    .map((p) => ({ date: p.date as string, title: p.title as string, href: p.href as string }));
  const done = list(r.done)
    .filter((d) => str(d.date) && ISO.test(d.date) && str(d.name) && str(d.id) && Number.isInteger(d.year))
    .map((d) => ({ date: d.date as string, name: d.name as string, id: d.id as string, year: d.year as number }));
  return { planned, done };
}

const li = (inner: string) => `<li class="mt-3">${inner}</li>`;
const section = (id: string, title: string, items: string[]) =>
  `<section aria-labelledby="${id}" class="${SECTION}"><h2 id="${id}" class="${H2}">${text(title)}</h2>${
    items.length ? `<ul class="mt-3">${items.join('')}</ul>` : `<p class="mt-3 max-w-prose">${text(EMPTY_SENTENCE)}</p>`
  }</section>`;

/** Dwie sekcje strony `/nowe-dane`; `newsPaths` = adresy istniejących stron `/nowe-dane/<id>-<rok>`. Dane tylko jako tekst. */
export function renderCalendarSections(cal: PublicCalendar | null | undefined, newsPaths: ReadonlySet<string> = new Set()): string {
  const planned = (cal?.planned ?? [])
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => li(`<time datetime="${attr(p.date)}">${text(plDate(p.date))}</time> – <a href="${attr(p.href)}" class="${LINK}" rel="noopener">${text(shortTitle(p.title))}</a>`));
  const done = (cal?.done ?? [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
    .map((d) => {
      const map = `/mapa?i=${encodeURIComponent(d.id)}&y=${d.year}`;
      const page = `/nowe-dane/${d.id}-${d.year}`;
      const label = `${d.name} (${d.year})`;
      const pageLink = newsPaths.has(page) ? ` · <a href="${attr(page)}" class="${LINK}">Strona „Nowe dane GUS”</a>` : '';
      return li(
        `<time datetime="${attr(d.date)}">${text(plDate(d.date))}</time> – ${text(label)} · <a href="${attr(map)}" class="${LINK}" aria-label="${attr(`Zobacz na mapie: ${label}`)}">Zobacz na mapie</a>${pageLink}`,
      );
    });
  return `${section('wkrotce', 'Wkrótce od GUS', planned)}\n${section('nowosci', 'Nowości na mapie (14 dni)', done)}`;
}

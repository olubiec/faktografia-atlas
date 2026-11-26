// Kalendarium GUS (stat.gov.pl/kalendarium): co GUS opublikował w ostatnich dniach.
// Tytuły publikacji zamieniamy na rdzenie słów; zmienne BDL o pasujących nazwach dostają premię w kolejce
// i są sprawdzane pod kątem nowego roku od razu, a nie dopiero po dwóch tygodniach. Brak sieci = brak premii (nic się nie psuje).
const STOP = new Set(['roku', 'latach', 'oraz', 'według', 'wybrane', 'informacje', 'sytuacja', 'stan', 'miesiącu', 'kwartał', 'kwartale']);

export const dayUrl = (d) => {
  const [y, m, day] = d.toISOString().slice(0, 10).split('-');
  return `https://stat.gov.pl/kalendarium/${day}-${m}-${y}.html`;
};

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').trim();

/** Publikacje GUS z podstrony dnia (tylko sekcja „Publikacje GUS”, bez urzędów statystycznych i spoza służb). */
export function parseDay(html) {
  const start = html.indexOf('Publikacje GUS</h2>');
  if (start < 0) return [];
  const next = html.indexOf('</h2>', start + 20);
  const block = html.slice(start, next < 0 ? undefined : next);
  const out = [];
  const re = /<h3 class="title">\s*<a href="([^"]+)">([^<]+)<\/a>\s*<\/h3>\s*(?:<div class="desc">([\s\S]*?)<\/div>)?/g;
  for (const m of block.matchAll(re)) {
    out.push({ title: decode(m[2]), href: m[1], desc: decode(m[3] ?? '') });
  }
  return out;
}

/** Rdzenie słów (5 pierwszych liter słów o ≥5 literach) z tytułów; bez słów pospolitych i liczb. */
export function stemsFromTitles(titles) {
  const stems = new Set();
  for (const t of titles) {
    for (const w of t.toLocaleLowerCase('pl').match(/\p{L}{5,}/gu) ?? []) {
      if (!STOP.has(w)) stems.add(w.slice(0, 5));
    }
  }
  return [...stems].sort();
}

/**
 * Pobiera ostatnie `days` dni (łącznie z dzisiaj) i opcjonalnie `ahead` dni naprzód (harmonogram).
 * fetchText(url) → html | null. Zwraca { stems, latest, titles, items }:
 *  - stems/latest/titles dotyczą tylko dni już opublikowanych (dziś i wcześniej),
 *  - items = każda publikacja { date, title, href, desc } także z przyszłych dni.
 * `ahead` domyślnie 0: sprawdzone 25.11.2026 – podstrony przyszłych dni istnieją (z urzędami statystycznymi),
 * ale sekcja „Publikacje GUS” jest na nich pusta (GUS ogłasza harmonogram dopiero w dniu publikacji).
 */
export async function loadCalendar(fetchText, { now = new Date(), days = 3, ahead = 0 } = {}) {
  const titles = [];
  const items = [];
  let latest = null;
  for (let i = -ahead; i < days; i++) {
    const d = new Date(now.getTime() - i * 86400_000);
    const html = await fetchText(dayUrl(d)).catch(() => null);
    const found = html ? parseDay(html) : [];
    const date = d.toISOString().slice(0, 10);
    items.push(...found.map((x) => ({ date, ...x })));
    if (i < 0) continue;
    if (found.length && !latest) latest = date;
    titles.push(...found.map((x) => x.title));
  }
  items.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, 'pl'));
  return { stems: stemsFromTitles(titles), latest, titles, items };
}

/** Ile rdzeni z kalendarium występuje w nazwach zmiennej lub ścieżce działów. */
export function calendarHits(variable, subjectPath, stems) {
  if (!stems?.length) return 0;
  const text = [...(subjectPath ?? []), variable.n1, variable.n2, variable.n3, variable.n4, variable.n5]
    .filter((x) => typeof x === 'string').join(' ').toLocaleLowerCase('pl');
  return stems.filter((s) => text.includes(s)).length;
}

export async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'faktografia-atlas-robot' }, signal: AbortSignal.timeout(20000) });
  return res.ok ? res.text() : null;
}

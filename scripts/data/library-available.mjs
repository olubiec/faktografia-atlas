// Spis pobranych wskaźników biblioteki: library/available.json (mały plik czytany przez stronę zamiast index.json).
// Użycie: node scripts/data/library-available.mjs <katalog-library>
// Czyta <katalog>/index.json, <katalog>/catalog.json (gdy jest) i <katalog>/values/*.json,
// zapisuje <katalog>/available.json (JSON bez wcięć).
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Poziom w pliku wartości (l3/l5/l6) → nazwa poziomu na stronie; kolejność = kolejność w `lv`.
const LEVELS = [['l3', 'woj'], ['l5', 'pow'], ['l6', 'gmi']];

/** Ścieżka działu „Dział > Poddział” z nazw (nie id), od korzenia do działu zmiennej. */
function categoryPath(categories, subjectId) {
  const names = [];
  const seen = new Set();
  let id = subjectId;
  while (id != null && categories[id] && !seen.has(id)) {
    seen.add(id);
    names.unshift(categories[id].n);
    id = categories[id].p;
  }
  return names.join(' > ');
}

/**
 * Spis biblioteki (index.json) obejmuje tylko zmienne z powiatami lub gminami. Robot pobiera też
 * wskaźniki podawane przez GUS tylko dla województw (poziom 2–4) – ich opis bierzemy z katalogu,
 * żeby trafiły do wyboru na stronie. Czysta funkcja: zwraca nowy spis, wejścia nie zmienia.
 */
export function withRegionalVariables(indexFile, catalog) {
  const known = new Set((indexFile?.variables ?? []).map((v) => String(v.id)));
  const units = [...(indexFile?.units ?? [])];
  const categories = { ...(indexFile?.categories ?? {}) };
  for (const [id, subject] of Object.entries(catalog?.subjects ?? {})) {
    categories[id] ??= { n: subject.name, p: subject.parent ?? null };
  }
  const extra = [];
  for (const v of Object.values(catalog?.variables ?? {})) {
    const lvl = Number(v.level);
    if (known.has(String(v.id)) || !(lvl >= 2 && lvl < 5)) continue;
    const unit = v.unit ?? v.measureUnitName ?? '';
    if (!units.includes(unit)) units.push(unit);
    const n = [v.n1, v.n2, v.n3, v.n4, v.n5].filter((x) => typeof x === 'string' && x.trim()).join(' – ');
    extra.push({ id: v.id, s: v.subjectId ?? v.s, n, l: 2, u: units.indexOf(unit), has: 0 });
  }
  return { ...indexFile, categories, units, variables: [...(indexFile?.variables ?? []), ...extra] };
}

const DAY_MS = 86_400_000;

// Ta sama definicja co src/core/facts/fresh-label.ts (isNewSince/newIdList); test w tests/unit/w28-d06-new-badge.test.tsx pilnuje zgodności.
const isNewSince = (since, now, days) => {
  if (!since) return false;
  const diff = Date.parse(now) - Date.parse(since);
  return Number.isFinite(diff) && diff >= 0 && diff <= days * DAY_MS;
};

/**
 * Lista `new` w available.json (W28-D06): id wskaźników głównych z księgi public/data/facts/fresh.json (nowy rok ≤ days dni)
 * oraz zmiennych biblioteki `downloaded` w library/calendar.json (≤ days dni). Brak którejś księgi = brak jej wkładu.
 */
export function buildNewIds({ ledger, calendar, now, days = 7 }) {
  const ids = new Set();
  for (const [id, e] of Object.entries(ledger ?? {})) if (isNewSince(e?.since, now, days)) ids.add(id);
  for (const e of calendar?.entries ?? []) {
    for (const v of e.library ?? []) if (v.state === 'downloaded' && isNewSince(v.on, now, days)) ids.add(String(v.id));
  }
  return [...ids].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

/** Czysta funkcja (bez I/O): spis zmiennych, które mają plik wartości z jakimikolwiek danymi. `newIds` → pole `new`. */
export function buildAvailable(indexFile, valuesFiles, generatedAt = new Date().toISOString(), newIds = []) {
  const byId = new Map((indexFile?.variables ?? []).map((v) => [String(v.id), v]));
  const variables = [];
  for (const file of valuesFiles) {
    const meta = byId.get(String(file?.v));
    if (!meta) continue;
    const lv = [];
    const years = new Set();
    for (const [key, name] of LEVELS) {
      const level = file[key];
      if (!level || Object.keys(level.d ?? {}).length === 0) continue;
      lv.push(name);
      for (const y of level.y ?? []) years.add(Number(y));
    }
    if (lv.length === 0) continue;
    variables.push({
      id: String(meta.id),
      n: meta.n,
      u: indexFile.units?.[meta.u] ?? '',
      s: String(meta.s),
      c: categoryPath(indexFile.categories ?? {}, meta.s),
      lv,
      y: [...years].sort((a, b) => a - b),
    });
  }
  variables.sort((a, b) => Number(a.id) - Number(b.id));
  return { version: 1, generatedAt, variables, ...(newIds.length > 0 ? { new: newIds } : {}) };
}

/** Czy plik wartości ma jakąkolwiek daną na którymkolwiek poziomie. */
function hasData(file) {
  return LEVELS.some(([key]) => Object.keys(file?.[key]?.d ?? {}).length > 0);
}

/**
 * Czysta funkcja: kontrola spisu względem pobranych plików.
 * fetched = pliki z jakąkolwiek daną, listed = wpisy w spisie, empty = pliki bez danych (nie luka),
 * missing = id plików z danymi, których nie ma w spisie (powinno być puste).
 */
export function countGap(indexFile, valuesFiles) {
  const listedIds = new Set(buildAvailable(indexFile, valuesFiles).variables.map((v) => v.id));
  const withData = valuesFiles.filter(hasData);
  return {
    fetched: withData.length,
    listed: listedIds.size,
    empty: valuesFiles.filter((f) => !hasData(f)).map((f) => String(f?.v)),
    missing: withData.map((f) => String(f.v)).filter((id) => !listedIds.has(id)),
  };
}

/** Linia do podsumowania przebiegu w Actions. */
export function formatGapLine(gap) {
  return `Pobrane: ${gap.fetched} · w spisie wyboru: ${gap.listed} · puste (bez danych): ${gap.empty.length} · brakuje: ${gap.missing.length}`;
}

/** Cienka nakładka: czyta katalog, woła buildAvailable, zapisuje atomowo. Błąd = wyjątek (nic nie zapisujemy). */
export async function writeAvailable(dir, onGap, opts = {}) {
  let index;
  try {
    index = JSON.parse(await readFile(path.join(dir, 'index.json'), 'utf8'));
  } catch (err) {
    throw new Error(`Nie mogę wczytać ${path.join(dir, 'index.json')}: ${err.message}`);
  }
  let names;
  try {
    names = (await readdir(path.join(dir, 'values'))).filter((n) => n.endsWith('.json'));
  } catch (err) {
    throw new Error(`Nie mogę odczytać katalogu ${path.join(dir, 'values')}: ${err.message}`);
  }
  try {
    const catalog = JSON.parse(await readFile(path.join(dir, 'catalog.json'), 'utf8'));
    index = withRegionalVariables(index, catalog);
  } catch {
    // Brak katalogu – spis tylko z index.json (wskaźniki wyłącznie wojewódzkie pominięte).
  }
  const files = [];
  for (const name of names) {
    files.push(JSON.parse(await readFile(path.join(dir, 'values', name), 'utf8')));
  }
  const readOptional = async (file) => {
    try {
      return JSON.parse(await readFile(file, 'utf8'));
    } catch {
      return null; // brak księgi = brak etykiet z niej, spis i tak powstaje
    }
  };
  const ledger = await readOptional(opts.freshPath ?? path.join('public', 'data', 'facts', 'fresh.json'));
  const calendar = await readOptional(path.join(dir, 'calendar.json'));
  const generatedAt = new Date().toISOString();
  const out = buildAvailable(index, files, generatedAt, buildNewIds({ ledger, calendar, now: generatedAt, days: opts.days ?? 7 }));
  if (onGap) onGap(countGap(index, files));
  const target = path.join(dir, 'available.json');
  await mkdir(dir, { recursive: true });
  await writeFile(`${target}.tmp`, JSON.stringify(out));
  await rename(`${target}.tmp`, target);
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('Użycie: node scripts/data/library-available.mjs <katalog-library>');
    process.exit(1);
  }
  let line = '';
  writeAvailable(dir, (gap) => {
    line = formatGapLine(gap);
  })
    .then((out) => {
      console.log(`available.json: ${out.variables.length} wskaźników.`);
      console.log(line);
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

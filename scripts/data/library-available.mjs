// Spis pobranych wskaźników biblioteki: library/available.json (mały plik czytany przez stronę zamiast index.json).
// Użycie: node scripts/data/library-available.mjs <katalog-library>
// Czyta <katalog>/index.json i <katalog>/values/*.json, zapisuje <katalog>/available.json (JSON bez wcięć).
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

/** Czysta funkcja (bez I/O): spis zmiennych, które mają plik wartości z jakimikolwiek danymi. */
export function buildAvailable(indexFile, valuesFiles, generatedAt = new Date().toISOString()) {
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
  return { version: 1, generatedAt, variables };
}

/** Cienka nakładka: czyta katalog, woła buildAvailable, zapisuje atomowo. Błąd = wyjątek (nic nie zapisujemy). */
export async function writeAvailable(dir) {
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
  const files = [];
  for (const name of names) {
    files.push(JSON.parse(await readFile(path.join(dir, 'values', name), 'utf8')));
  }
  const out = buildAvailable(index, files);
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
  writeAvailable(dir)
    .then((out) => console.log(`available.json: ${out.variables.length} wskaźników.`))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

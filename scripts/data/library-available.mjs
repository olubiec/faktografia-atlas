// Spis pobranych wskaźników biblioteki: mały plik library/available.json czytany przez stronę
// zamiast pełnego index.json. Użycie: node scripts/data/library-available.mjs <katalog-library>
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Poziomy zapisane w pliku wartości (l3/l5/l6) → nazwy poziomów w spisie.
const LEVELS = [['l3', 'woj'], ['l5', 'pow'], ['l6', 'gmi']];

// Ścieżka „Dział > Poddział” z nazw (od korzenia); chroni przed pętlą w danych.
function categoryPath(categories, subjectId) {
  const names = [];
  const seen = new Set();
  let id = subjectId;
  while (id != null && categories?.[id] && !seen.has(id)) {
    seen.add(id);
    names.unshift(categories[id].n);
    id = categories[id].p;
  }
  return names.join(' > ');
}

// Czysta funkcja: indexFile = zawartość index.json, valuesFiles = { [id zmiennej]: zawartość pliku wartości }.
export function buildAvailable(indexFile, valuesFiles, generatedAt = new Date().toISOString()) {
  const variables = [];
  for (const v of indexFile?.variables ?? []) {
    const values = valuesFiles?.[v.id];
    if (!values) continue;
    const lv = [];
    const years = new Set();
    for (const [key, name] of LEVELS) {
      const level = values[key];
      if (!level || Object.keys(level.d ?? {}).length === 0) continue;
      lv.push(name);
      for (const year of level.y ?? []) years.add(year);
    }
    if (lv.length === 0) continue;
    variables.push({
      id: String(v.id),
      n: v.n,
      u: indexFile.units?.[v.u] ?? '',
      s: String(v.s),
      c: categoryPath(indexFile.categories, v.s),
      lv,
      y: [...years].sort((a, b) => a - b),
    });
  }
  return { version: 1, generatedAt, variables };
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (err) {
    throw new Error(`Nie można odczytać ${file}: ${err.message}`);
  }
}

// Cienka nakładka I/O: czyta index.json i values/*.json, zapisuje available.json (bez wcięć).
export async function writeAvailable(dir) {
  const index = await readJson(path.join(dir, 'index.json'));
  let names;
  try {
    names = await readdir(path.join(dir, 'values'));
  } catch (err) {
    throw new Error(`Brak katalogu wartości ${path.join(dir, 'values')}: ${err.message}`);
  }
  const valuesFiles = {};
  for (const name of names.filter((f) => f.endsWith('.json'))) {
    valuesFiles[name.slice(0, -5)] = await readJson(path.join(dir, 'values', name));
  }
  const available = buildAvailable(index, valuesFiles);
  const target = path.join(dir, 'available.json');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(`${target}.tmp`, JSON.stringify(available));
  await rename(`${target}.tmp`, target);
  return available;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('Użycie: node scripts/data/library-available.mjs <katalog-library>');
    process.exit(1);
  }
  writeAvailable(dir)
    .then((a) => console.log(`Spis pobranych: ${a.variables.length} wskaźników.`))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

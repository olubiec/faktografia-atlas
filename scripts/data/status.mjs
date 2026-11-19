// Status danych: mały plik status.json (kiedy robot sprawdzał, z kiedy są dane, ile wskaźników mamy).
// Użycie: node scripts/data/status.mjs --values public/data/values --library <katalog-library> --out <plik>
// Zapisywany zawsze (nawet gdy liczby się nie zmieniły), bez wartości danych – tylko daty i liczby.
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const size = (x) => (Array.isArray(x) ? x.length : x && typeof x === 'object' ? Object.keys(x).length : null);
const time = (iso) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
};

/** Czysta funkcja (bez I/O): składa status z plików wartości, spisu biblioteki i stanu robota. */
export function buildStatus({ valuesFiles = [], available = null, state = null, now = new Date() }) {
  const dates = valuesFiles.map((f) => f?.fetchedAt).filter((d) => time(d) !== null);
  dates.sort((a, b) => time(a) - time(b));
  const years = valuesFiles.flatMap((f) => (Array.isArray(f?.years) ? f.years.map(Number) : []));
  return {
    version: 1,
    checkedAt: now.toISOString(),
    values: {
      count: valuesFiles.length,
      latestFetchedAt: dates.at(-1) ?? null,
      latestYear: years.length ? Math.max(...years) : null,
      oldestFetchedAt: dates[0] ?? null,
    },
    library: {
      availableCount: available ? size(available.variables) : null,
      availableGeneratedAt: available?.generatedAt ?? null,
      doneCount: state ? size(state.done) : null,
      pendingCount: state ? size(state.pending) : null,
    },
  };
}

const readJson = async (file) => {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
};

/** Cienka nakładka: czyta katalogi, zapisuje atomowo (.tmp + rename). Brak źródła = pola null. */
export async function writeStatus({ valuesDir, libraryDir, out, now = new Date() }) {
  const names = (await readdir(valuesDir)).filter((n) => n.endsWith('.json'));
  const valuesFiles = (await Promise.all(names.map((n) => readJson(path.join(valuesDir, n))))).filter(Boolean);
  const available = libraryDir ? await readJson(path.join(libraryDir, 'available.json')) : null;
  const state = libraryDir ? await readJson(path.join(libraryDir, 'state.json')) : null;
  const status = buildStatus({ valuesFiles, available, state, now });
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(`${out}.tmp`, JSON.stringify(status));
  await rename(`${out}.tmp`, out);
  return status;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = (name) => process.argv[process.argv.indexOf(name) + 1];
  const [valuesDir, libraryDir, out] = ['--values', '--library', '--out'].map((n) =>
    process.argv.includes(n) ? arg(n) : undefined,
  );
  if (!valuesDir || !out) {
    console.error('Użycie: node scripts/data/status.mjs --values <katalog-values> [--library <katalog-library>] --out <plik>');
    process.exit(1);
  }
  writeStatus({ valuesDir, libraryDir, out })
    .then((s) => console.log(`status.json: ${s.values.count} plików wartości, sprawdzono ${s.checkedAt}.`))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

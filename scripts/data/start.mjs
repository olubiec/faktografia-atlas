// Wartości czterech wskaźników dla strony startowej: public/data/start.json.
// Wejście: public/data/values/*.json i config/indicators.json (nic wpisanego ręcznie, bez sieci).
// Użycie: node scripts/data/start.mjs [--out ścieżka]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// Kolejność ma znaczenie: pierwszy wskaźnik (ludność) to pierwszy kadr strony.
export const START_IDS = ['population', 'unemployment-rate', 'avg-wage', 'density'];
const WOJ_COUNT = 16;

/** Wartości województw (TERYT 2 cyfry) z roku o indeksie idx lub null, gdy brak kompletu. */
function sliceAt(values, idx) {
  const out = {};
  for (const teryt of Object.keys(values).sort()) {
    if (teryt.length !== 2) continue;
    const v = values[teryt][idx];
    if (typeof v !== 'number' || !Number.isFinite(v)) return null;
    out[teryt] = v;
  }
  return Object.keys(out).length === WOJ_COUNT ? out : null;
}

/**
 * @param {{id:string,name:string,unit:string}[]} indicators - config/indicators.json
 * @param {Record<string,{years:number[],values:Record<string,(number|null)[]>}>} valuesById
 * @param {string} generatedAt - ISO; podawany z zewnątrz, żeby wynik był deterministyczny
 */
export function buildStart(indicators, valuesById, generatedAt) {
  const result = START_IDS.map((id) => {
    const meta = indicators.find((i) => i.id === id);
    const src = valuesById[id];
    if (!meta || !src) throw new Error(`start: brak wskaźnika ${id}`);
    for (let idx = src.years.length - 1; idx >= 0; idx--) {
      const values = sliceAt(src.values, idx);
      if (values) return { id, name: meta.name, unit: meta.unit, year: src.years[idx], values };
    }
    throw new Error(`start: ${id} nie ma roku z wartościami dla 16 województw`);
  });
  return { version: 1, generatedAt, indicators: result };
}

function main() {
  const i = process.argv.indexOf('--out');
  const out = i > -1 ? path.resolve(process.argv[i + 1]) : path.join(ROOT, 'public/data/start.json');
  const indicators = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/indicators.json'), 'utf8'));
  const valuesById = {};
  for (const id of START_IDS) {
    valuesById[id] = JSON.parse(fs.readFileSync(path.join(ROOT, `public/data/values/${id}.json`), 'utf8'));
  }
  // generatedAt = najnowszy znacznik pobrania wartości (deterministycznie, bez zegara)
  const generatedAt = START_IDS.map((id) => valuesById[id].fetchedAt ?? '').sort().at(-1) || '1970-01-01T00:00:00.000Z';
  const json = JSON.stringify(buildStart(indicators, valuesById, generatedAt));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${json}\n`);
  console.log(`start: ${json.length} B -> ${path.relative(ROOT, out)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

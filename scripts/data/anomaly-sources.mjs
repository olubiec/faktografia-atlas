// Źródła anomalii (config/anomalies.json): z biblioteki GUS (gałąź data/library) bierze wskaźniki gminne, które da się porównać,
// i zwraca je w kształcie AnomalySource. Odczyt plików: readLibraryFile (git show), bez API BDL.
export async function loadAnomalySources({ vite, readLibraryFile, units, population, log = console.log }) {
  const { isPopular } = await vite.ssrLoadModule('/src/core/catalog/curation.ts');
  const { valuesByTeryt } = await vite.ssrLoadModule('/src/core/library/load-library.ts');
  const { sourceKind, describeSource, perThousand, normalizeUnit, dedupeKey, PER_CAPITA_UNIT } = await vite.ssrLoadModule('/src/core/facts/anomaly-sources.ts');
  const available = readLibraryFile('available.json');
  if (!available?.variables) return [];
  const sources = [];
  const seen = new Set();
  let tried = 0;
  for (const v of available.variables) {
    if (!v.lv?.includes('gmi') || !isPopular(v)) continue;
    const kind = sourceKind(v);
    if (!kind) continue;
    const info = describeSource(v);
    const norm = normalizeUnit(info.unit);
    const key = `${dedupeKey(info.name)}|${kind === 'count' ? PER_CAPITA_UNIT : norm.unit}`;
    if (seen.has(key)) continue;
    const raw = readLibraryFile(`values/${v.id}.json`);
    if (!raw?.l6) continue;
    tried++;
    const merged = valuesByTeryt(raw, 'gmi', units);
    let values = merged.values;
    if (norm.factor !== 1 && kind === 'rate') {
      values = Object.fromEntries(Object.entries(values).map(([t, a]) => [t, a.map((x) => (typeof x === 'number' ? x * norm.factor : x))]));
    }
    if (kind === 'count') {
      values = {};
      for (const [t, series] of Object.entries(merged.values)) {
        values[t] = series.map((x, i) => {
          const pi = population.years.indexOf(merged.years[i]);
          return pi < 0 ? null : perThousand(x, population.values[t]?.[pi]);
        });
      }
    }
    seen.add(key);
    sources.push({ id: `b${v.id}`, name: info.name, unit: kind === 'count' ? PER_CAPITA_UNIT : norm.unit, topic: info.topic, years: merged.years, values, derived: kind === 'count' || norm.changed });
  }
  log(`anomalie: ${sources.length} wskaźników z biblioteki (z ${available.variables.length} zmiennych)`);
  return sources;
}

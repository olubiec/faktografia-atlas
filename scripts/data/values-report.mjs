import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function formatLevels(minLevel) {
  if (minLevel === 'gmi') return 'woj., pow., gmi.';
  if (minLevel === 'pow') return 'woj., pow.';
  if (minLevel === 'woj') return 'woj.';
  return minLevel ?? 'brak';
}

function getLowestLevel(minLevel) {
  if (minLevel === 'gmi') return 'gmi';
  if (minLevel === 'pow') return 'pow';
  if (minLevel === 'woj') return 'woj';
  return minLevel;
}

export function buildValuesReport(files, indicators, units) {
  const unitsByTeryt = new Map();
  const countByLevel = { woj: 0, pow: 0, gmi: 0 };

  for (const u of units) {
    unitsByTeryt.set(u.teryt, u);
    if (u.level in countByLevel) {
      countByLevel[u.level]++;
    }
  }

  const rows = [];

  for (const ind of indicators) {
    const data = files instanceof Map ? files.get(ind.id) : files?.[ind.id];

    const name = ind.name ?? ind.id;
    const levelsStr = formatLevels(ind.minLevel);
    const lowestLevel = getLowestLevel(ind.minLevel);

    let yearsStr = 'brak';
    let coverageStr = '0.0%';
    let fetchedAtStr = 'brak danych';

    if (data) {
      if (data.fetchedAt) {
        fetchedAtStr = data.fetchedAt;
      }

      const years = data.years ?? [];
      if (years.length > 0) {
        yearsStr =
          years.length === 1
            ? String(years[0])
            : `${years[0]}–${years[years.length - 1]}`;

        const lastYearIdx = years.length - 1;
        const totalLowestUnits = countByLevel[lowestLevel] ?? 0;

        let hasValueCount = 0;
        if (data.values && lastYearIdx >= 0) {
          for (const [teryt, vals] of Object.entries(data.values)) {
            const u = unitsByTeryt.get(teryt);
            if (u && u.level === lowestLevel) {
              const val = vals[lastYearIdx];
              if (val !== null && val !== undefined) {
                hasValueCount++;
              }
            }
          }
        }

        if (totalLowestUnits > 0) {
          const pct = (hasValueCount / totalLowestUnits) * 100;
          coverageStr = `${pct.toFixed(1)}%`;
        }
      }
    }

    rows.push(
      `| ${name} | ${ind.id} | ${levelsStr} | ${yearsStr} | ${coverageStr} | ${fetchedAtStr} |`
    );
  }

  return [
    '# Raport danych z plików (public/data/values/)',
    '',
    '<!-- Plik wygenerowany automatycznie przez scripts/data/values-report.mjs -->',
    '',
    '| Wskaźnik | ID | Poziomy | Lata | % jedn. z wart. (ost. rok, najniższy poziom) | Data pobrania (fetchedAt) |',
    '|---|---|---|---|---|---|',
    ...rows,
    '',
  ].join('\n');
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const unitsPath = path.join(root, 'public/data/units.json');
  const indicatorsPath = path.join(root, 'config/indicators.json');
  const valuesDir = path.join(root, 'public/data/values');
  const outputPath = path.join(root, 'docs/data-report.md');

  const units = JSON.parse(await readFile(unitsPath, 'utf8'));
  const indicators = JSON.parse(await readFile(indicatorsPath, 'utf8'));

  const filesMap = new Map();

  for (const ind of indicators) {
    const valPath = path.join(valuesDir, `${ind.id}.json`);
    try {
      const content = JSON.parse(await readFile(valPath, 'utf8'));
      filesMap.set(ind.id, content);
    } catch {
      // Plik może nie istnieć
    }
  }

  const reportContent = buildValuesReport(filesMap, indicators, units);
  await writeFile(outputPath, reportContent, 'utf8');
  console.log(`Zapisano raport do ${outputPath}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error(`Error: ${err?.message ?? err}`);
    process.exit(1);
  });
}

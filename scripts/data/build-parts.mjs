import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Buduje szardy części (miasto / obszar wiejski) dla każdego województwa.
 *
 * @param {Record<string, Object> | Array<Object> | Map<string, Object>} partsByIndicator
 * @param {Array<Object>} units - Lista jednostek z public/data/units.json
 * @returns {Record<string, Object>} Mapa wojTeryt -> PartsShard
 */
export function buildPartsShards(partsByIndicator, units) {
  let partsList = [];
  if (Array.isArray(partsByIndicator)) {
    partsList = partsByIndicator;
  } else if (partsByIndicator instanceof Map) {
    partsList = Array.from(partsByIndicator.values());
  } else if (partsByIndicator && typeof partsByIndicator === 'object') {
    partsList = Object.values(partsByIndicator);
  }

  const validWojTeryts = new Set();
  if (Array.isArray(units)) {
    for (const u of units) {
      if (u && typeof u.teryt === 'string') {
        if (u.level === 'woj') {
          validWojTeryts.add(u.teryt);
        } else if (u.teryt.length >= 2) {
          validWojTeryts.add(u.teryt.slice(0, 2));
        }
      }
    }
  }

  const shardMap = new Map();

  for (const partVal of partsList) {
    if (!partVal || !partVal.values) continue;
    for (const partTeryt of Object.keys(partVal.values)) {
      if (typeof partTeryt !== 'string' || partTeryt.length !== 7) continue;
      const wojTeryt = partTeryt.slice(0, 2);
      if (validWojTeryts.size > 0 && !validWojTeryts.has(wojTeryt)) continue;

      if (!shardMap.has(wojTeryt)) {
        shardMap.set(wojTeryt, {
          voivodeship: wojTeryt,
          years: {},
          values: {},
        });
      }
    }
  }

  for (const partVal of partsList) {
    if (!partVal || !partVal.indicatorId) continue;
    const indId = String(partVal.indicatorId);
    const indYears = Array.isArray(partVal.years) ? partVal.years : [];

    if (partVal.values) {
      for (const [partTeryt, valArr] of Object.entries(partVal.values)) {
        if (typeof partTeryt !== 'string' || partTeryt.length !== 7) continue;
        const wojTeryt = partTeryt.slice(0, 2);
        const shard = shardMap.get(wojTeryt);
        if (!shard) continue;

        shard.years[indId] = indYears;
        if (!shard.values[partTeryt]) {
          shard.values[partTeryt] = {};
        }
        shard.values[partTeryt][indId] = Array.isArray(valArr) ? valArr : [];
      }
    }
  }

  const result = {};
  const sortedWojKeys = Array.from(shardMap.keys()).sort();

  for (const wojTeryt of sortedWojKeys) {
    const rawShard = shardMap.get(wojTeryt);

    const sortedYearsKeys = Object.keys(rawShard.years).sort();
    const sortedYears = {};
    for (const k of sortedYearsKeys) {
      sortedYears[k] = rawShard.years[k];
    }

    const sortedPartKeys = Object.keys(rawShard.values).sort();
    const sortedValues = {};
    for (const partTeryt of sortedPartKeys) {
      const indMap = rawShard.values[partTeryt];
      const sortedIndKeys = Object.keys(indMap).sort();
      const sortedIndMap = {};
      for (const indKey of sortedIndKeys) {
        sortedIndMap[indKey] = indMap[indKey];
      }
      sortedValues[partTeryt] = sortedIndMap;
    }

    result[wojTeryt] = {
      voivodeship: wojTeryt,
      years: sortedYears,
      values: sortedValues,
    };
  }

  return result;
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const unitsPath = path.join(root, 'public/data/units.json');
  const partsSrcDir = path.join(root, 'data/parts');
  const partsOutDir = path.join(root, 'public/data/parts');

  let units = [];
  try {
    units = JSON.parse(await readFile(unitsPath, 'utf8'));
  } catch {
    // Brak units.json
  }

  const partsByIndicator = {};
  try {
    const files = await readdir(partsSrcDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(partsSrcDir, file);
        try {
          const content = await readFile(filePath, 'utf8');
          const data = JSON.parse(content);
          if (data && data.indicatorId) {
            partsByIndicator[data.indicatorId] = data;
          }
        } catch {
          // Ignoruj uszkodzone pliki JSON
        }
      }
    }
  } catch {
    // Ignoruj brak katalogu data/parts
  }

  const shards = buildPartsShards(partsByIndicator, units);

  await mkdir(partsOutDir, { recursive: true });

  for (const [wojTeryt, shard] of Object.entries(shards)) {
    const outputPath = path.join(partsOutDir, `${wojTeryt}.json`);
    const jsonContent = JSON.stringify(shard);

    let existingContent = null;
    try {
      existingContent = await readFile(outputPath, 'utf8');
    } catch {
      // Plik nie istnieje
    }

    if (existingContent !== jsonContent) {
      await writeFile(outputPath, jsonContent, 'utf8');
      console.log(`Zapisano części dla województwa ${wojTeryt}: ${outputPath} (${jsonContent.length} B)`);
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error(`Error: ${err?.message ?? err}`);
    process.exit(1);
  });
}

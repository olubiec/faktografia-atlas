import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LEVEL_WEIGHT = {
  gmi: 1,
  pow: 2,
  woj: 3,
};

/**
 * Buduje szardy profili dla każdego województwa z podanych wskaźników, ich wartości i jednostek.
 *
 * @param {Array<Object>} indicators
 * @param {Record<string, Object>} valuesById
 * @param {Array<Object>} units
 * @returns {Record<string, Object>} Mapa wojTeryt -> Shard
 */
export function buildProfileShards(indicators, valuesById, units) {
  const unitsByTeryt = new Map();
  for (const u of units) {
    unitsByTeryt.set(u.teryt, u);
  }

  // Grupowanie jednostek wg województw (dwucyfrowy TERYT)
  const unitsByWoj = new Map();
  for (const u of units) {
    const wojTeryt = u.teryt.slice(0, 2);
    if (!unitsByWoj.has(wojTeryt)) {
      unitsByWoj.set(wojTeryt, []);
    }
    unitsByWoj.get(wojTeryt).push(u);
  }

  // Pre-indeksowanie i sortowanie wartości dla błyskawicznego liczenia rankingów
  const indexByIndicatorYearLevel = new Map();

  for (const indicator of indicators) {
    const indValues = valuesById[indicator.id];
    if (!indValues || !indValues.years || indValues.years.length === 0) {
      continue;
    }

    for (let yearIdx = 0; yearIdx < indValues.years.length; yearIdx++) {
      const nationalByLevel = { gmi: [], pow: [], woj: [] };
      const voivodeshipByLevel = { gmi: new Map(), pow: new Map(), woj: new Map() };

      for (const u of units) {
        const uVal = indValues.values?.[u.teryt]?.[yearIdx];
        if (uVal !== undefined && uVal !== null) {
          nationalByLevel[u.level].push(uVal);
          const wojTeryt = u.teryt.slice(0, 2);
          if (!voivodeshipByLevel[u.level].has(wojTeryt)) {
            voivodeshipByLevel[u.level].set(wojTeryt, []);
          }
          voivodeshipByLevel[u.level].get(wojTeryt).push(uVal);
        }
      }

      for (const level of ['gmi', 'pow', 'woj']) {
        nationalByLevel[level].sort((a, b) => a - b);
        for (const arr of voivodeshipByLevel[level].values()) {
          arr.sort((a, b) => a - b);
        }
      }

      const key = `${indicator.id}:${yearIdx}`;
      indexByIndicatorYearLevel.set(key, {
        nationalByLevel,
        voivodeshipByLevel,
      });
    }
  }

  // Wyciągamy lata per wskaźnik do poziomu szardu, aby uniknąć duplikacji lat w każdym wierszu
  const yearsByIndicator = {};
  for (const indicator of indicators) {
    const indValues = valuesById[indicator.id];
    yearsByIndicator[indicator.id] = indValues?.years ?? [];
  }

  // Znacznik czasu pochodzi z danych (najnowsze fetchedAt), nie z zegara: te same dane dają identyczny plik,
  // więc nocne pobieranie nie tworzy fałszywych zmian.
  let generatedAt = '1970-01-01T00:00:00.000Z';
  for (const v of Object.values(valuesById)) {
    if (typeof v?.fetchedAt === 'string' && v.fetchedAt > generatedAt) generatedAt = v.fetchedAt;
  }
  const shards = {};

  const wojLevelUnits = units.filter((u) => u.level === 'woj');

  // Pre-obliczanie profili dla 16 województw (dla porównań ogólnokrajowych w każdym szardzie)
  const voivodeshipProfiles = {};
  for (const wojUnit of wojLevelUnits) {
    const profileItems = [];
    for (const indicator of indicators) {
      const indValues = valuesById[indicator.id];
      const years = indValues?.years ?? [];
      const effectiveUnitValues = indValues?.values?.[wojUnit.teryt];
      const series = years.map((_, i) => effectiveUnitValues?.[i] ?? null);

      if (!indValues || !indValues.years || indValues.years.length === 0) {
        profileItems.push({
          indicatorId: indicator.id,
          year: null,
          value: null,
          rankNational: null,
          rankVoivodeship: null,
          totalNational: 0,
          totalVoivodeship: 0,
          neutral: indicator.higherIsBetter === null,
          years,
          series,
        });
        continue;
      }

      let yearIdx = -1;
      for (let i = indValues.years.length - 1; i >= 0; i--) {
        const val = indValues.values?.[wojUnit.teryt]?.[i];
        if (val !== undefined && val !== null) {
          yearIdx = i;
          break;
        }
      }

      if (yearIdx === -1) {
        profileItems.push({
          indicatorId: indicator.id,
          year: null,
          value: null,
          rankNational: null,
          rankVoivodeship: null,
          totalNational: 0,
          totalVoivodeship: 0,
          neutral: indicator.higherIsBetter === null,
          years,
          series,
        });
        continue;
      }

      const year = indValues.years[yearIdx];
      const value = indValues.values[wojUnit.teryt][yearIdx];
      const key = `${indicator.id}:${yearIdx}`;
      const indexed = indexByIndicatorYearLevel.get(key);
      const nationalValues = indexed?.nationalByLevel.woj ?? [];

      let rankNational = null;
      if (value !== null) {
        if (indicator.higherIsBetter === false) {
          let betterNat = 0;
          for (let i = 0; i < nationalValues.length; i++) {
            if (nationalValues[i] < value) betterNat++;
            else break;
          }
          rankNational = 1 + betterNat;
        } else {
          let betterNat = 0;
          for (let i = nationalValues.length - 1; i >= 0; i--) {
            if (nationalValues[i] > value) betterNat++;
            else break;
          }
          rankNational = 1 + betterNat;
        }
      }

      profileItems.push({
        indicatorId: indicator.id,
        year,
        value,
        rankNational,
        rankVoivodeship: rankNational,
        totalNational: nationalValues.length,
        totalVoivodeship: nationalValues.length,
        neutral: indicator.higherIsBetter === null,
        years,
        series,
      });
    }

    voivodeshipProfiles[wojUnit.teryt] = profileItems.map((item) => {
      const { years: _y, ...rest } = item;
      return rest;
    });
  }

  for (const [wojTeryt, wojUnits] of unitsByWoj.entries()) {
    const shardUnits = {};

    for (const targetUnit of wojUnits) {
      const profileItems = [];

      for (const indicator of indicators) {
        let effectiveUnit = targetUnit;
        while (
          LEVEL_WEIGHT[effectiveUnit.level] < LEVEL_WEIGHT[indicator.minLevel] &&
          effectiveUnit.parent !== null
        ) {
          const parentUnit = unitsByTeryt.get(effectiveUnit.parent);
          if (!parentUnit) {
            break;
          }
          effectiveUnit = parentUnit;
        }

        const fromParent =
          effectiveUnit.teryt !== targetUnit.teryt ? effectiveUnit.teryt : undefined;

        const indValues = valuesById[indicator.id];
        const years = indValues?.years ?? [];
        const effectiveUnitValues = indValues?.values?.[effectiveUnit.teryt];
        const series = years.map((_, i) => effectiveUnitValues?.[i] ?? null);

        if (!indValues || !indValues.years || indValues.years.length === 0) {
          profileItems.push({
            indicatorId: indicator.id,
            year: null,
            value: null,
            rankNational: null,
            rankVoivodeship: null,
            totalNational: 0,
            totalVoivodeship: 0,
            neutral: indicator.higherIsBetter === null,
            ...(fromParent ? { fromParent } : {}),
            years,
            series,
          });
          continue;
        }

        let yearIdx = -1;
        for (let i = indValues.years.length - 1; i >= 0; i--) {
          const val = indValues.values?.[effectiveUnit.teryt]?.[i];
          if (val !== undefined && val !== null) {
            yearIdx = i;
            break;
          }
        }

        if (yearIdx === -1) {
          profileItems.push({
            indicatorId: indicator.id,
            year: null,
            value: null,
            rankNational: null,
            rankVoivodeship: null,
            totalNational: 0,
            totalVoivodeship: 0,
            neutral: indicator.higherIsBetter === null,
            ...(fromParent ? { fromParent } : {}),
            years,
            series,
          });
          continue;
        }

        const year = indValues.years[yearIdx];
        const value = indValues.values[effectiveUnit.teryt][yearIdx];

        const key = `${indicator.id}:${yearIdx}`;
        const indexed = indexByIndicatorYearLevel.get(key);
        const targetWojTeryt = effectiveUnit.teryt.slice(0, 2);

        const nationalValues = indexed?.nationalByLevel[effectiveUnit.level] ?? [];
        const voivodeshipValues =
          indexed?.voivodeshipByLevel[effectiveUnit.level]?.get(targetWojTeryt) ?? [];

        let rankNational = null;
        let rankVoivodeship = null;

        if (value !== null) {
          if (indicator.higherIsBetter === false) {
            let betterNat = 0;
            for (let i = 0; i < nationalValues.length; i++) {
              if (nationalValues[i] < value) betterNat++;
              else break;
            }
            rankNational = 1 + betterNat;

            let betterWoj = 0;
            for (let i = 0; i < voivodeshipValues.length; i++) {
              if (voivodeshipValues[i] < value) betterWoj++;
              else break;
            }
            rankVoivodeship = 1 + betterWoj;
          } else {
            let betterNat = 0;
            for (let i = nationalValues.length - 1; i >= 0; i--) {
              if (nationalValues[i] > value) betterNat++;
              else break;
            }
            rankNational = 1 + betterNat;

            let betterWoj = 0;
            for (let i = voivodeshipValues.length - 1; i >= 0; i--) {
              if (voivodeshipValues[i] > value) betterWoj++;
              else break;
            }
            rankVoivodeship = 1 + betterWoj;
          }
        }

        profileItems.push({
          indicatorId: indicator.id,
          year,
          value,
          rankNational,
          rankVoivodeship,
          totalNational: nationalValues.length,
          totalVoivodeship: voivodeshipValues.length,
          neutral: indicator.higherIsBetter === null,
          ...(fromParent ? { fromParent } : {}),
          years,
          series,
        });
      }

      shardUnits[targetUnit.teryt] = profileItems;
    }

    shards[wojTeryt] = {
      woj: wojTeryt,
      generatedAt,
      years: yearsByIndicator,
      units: shardUnits,
      voivodeships: voivodeshipProfiles,
    };
  }

  return shards;
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const unitsPath = path.join(root, 'public/data/units.json');
  const indicatorsPath = path.join(root, 'config/indicators.json');
  const valuesDir = path.join(root, 'public/data/values');
  const profilesDir = path.join(root, 'public/data/profiles');

  const units = JSON.parse(await readFile(unitsPath, 'utf8'));
  const indicators = JSON.parse(await readFile(indicatorsPath, 'utf8'));

  const valuesById = {};
  for (const ind of indicators) {
    const valPath = path.join(valuesDir, `${ind.id}.json`);
    try {
      valuesById[ind.id] = JSON.parse(await readFile(valPath, 'utf8'));
    } catch {
      // Ignoruj brakujące pliki
    }
  }

  const shards = buildProfileShards(indicators, valuesById, units);

  await mkdir(profilesDir, { recursive: true });

  for (const [wojTeryt, shard] of Object.entries(shards)) {
    // Odchudzanie JSON pliku: wyciągamy lata per wskaźnik na poziom szardu
    const shardToSave = {
      ...shard,
      units: {},
    };

    for (const [teryt, items] of Object.entries(shard.units)) {
      shardToSave.units[teryt] = items.map((item) => {
        const { years: _y, ...rest } = item;
        return rest;
      });
    }

    const outputPath = path.join(profilesDir, `${wojTeryt}.json`);
    const jsonContent = JSON.stringify(shardToSave);
    await writeFile(outputPath, jsonContent, 'utf8');
    console.log(`Zapisano profil dla województwa ${wojTeryt}: ${outputPath} (${jsonContent.length} B)`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error(`Error: ${err?.message ?? err}`);
    process.exit(1);
  });
}

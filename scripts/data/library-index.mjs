import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function buildIndex(catalog, state) {
  const categories = {};
  for (const [id, subject] of Object.entries(catalog?.subjects ?? {})) {
    categories[id] = {
      n: subject.name,
      p: subject.parent ?? null,
    };
  }

  const units = [];
  const unitMap = new Map();

  function getUnitIndex(unitName) {
    const name = unitName ?? '';
    if (!unitMap.has(name)) {
      unitMap.set(name, units.length);
      units.push(name);
    }
    return unitMap.get(name);
  }

  const rawVars = Object.values(catalog?.variables ?? {});
  const filtered = rawVars.filter((v) => {
    const lvl = Number(v.level);
    return Number.isFinite(lvl) && lvl >= 5;
  });

  filtered.sort((a, b) => Number(a.id) - Number(b.id));

  const variables = filtered.map((v) => {
    const parts = [v.n1, v.n2, v.n3, v.n4, v.n5].filter(
      (part) => typeof part === 'string' && part.trim().length > 0,
    );
    const name = parts.join(' – ');
    const lvl = Number(v.level);
    const level = lvl >= 6 ? 6 : 5;
    const unitName = v.unit ?? v.measureUnitName ?? '';
    const u = getUnitIndex(unitName);
    const has = state?.done?.[v.id] ? 1 : 0;

    return {
      id: v.id,
      s: v.subjectId ?? v.s,
      n: name,
      l: level,
      u,
      has,
    };
  });

  return {
    version: 1,
    categories,
    units,
    variables,
  };
}

async function main() {
  const dir = process.env.LIBRARY_DIR ?? 'library';

  async function readJson(file, fallback) {
    try {
      return JSON.parse(await readFile(path.join(dir, file), 'utf8'));
    } catch {
      return fallback;
    }
  }

  async function writeJson(file, data) {
    const target = path.join(dir, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(`${target}.tmp`, JSON.stringify(data));
    await rename(`${target}.tmp`, target);
  }

  const catalog = await readJson('catalog.json', { subjects: {}, variables: {} });
  const state = await readJson('state.json', { done: {} });

  const index = buildIndex(catalog, state);
  await writeJson('index.json', index);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

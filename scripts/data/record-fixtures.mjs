import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://bdl.stat.gov.pl/api/v1';
const FIXTURES_DIR = join(__dirname, '../../tests/fixtures/bdl');

const endpoints = [
  {
    filename: 'units.json',
    path: '/units',
    params: { level: '2', format: 'json', lang: 'pl', 'page-size': '100' },
  },
  {
    filename: 'variables-search.json',
    path: '/variables/search',
    params: { name: 'ludność', format: 'json', lang: 'pl', 'page-size': '100' },
  },
  {
    filename: 'data-by-variable.json',
    path: '/data/by-variable/60559',
    params: { 'unit-level': '2', year: '2022', format: 'json', lang: 'pl', 'page-size': '100' },
  },
];

async function recordFixtures() {
  await mkdir(FIXTURES_DIR, { recursive: true });

  for (const { filename, path, params } of endpoints) {
    const url = new URL(`${BASE_URL}${path}`);
    for (const [key, val] of Object.entries(params)) {
      url.searchParams.set(key, val);
    }

    console.log(`Fetching ${url.toString()}...`);
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url.toString()}: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const filePath = join(FIXTURES_DIR, filename);
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Saved ${filePath}`);
  }
}

recordFixtures().catch((err) => {
  console.error(err);
  process.exit(1);
});

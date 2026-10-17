import fs from 'fs';
import path from 'path';
import mapshaper from 'mapshaper';

const CACHE_DIR = '/tmp/geo-src';
const OUTPUT_DIR = path.resolve('public/geo');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'admin.topo.json');

const RAW_BASE_URL = 'https://raw.githubusercontent.com/waszkiewiczja/GeoJSON-Polska-Wojewodztwa-Powiaty-Gminy/main';

const FILES = [
  { name: 'woj', fileName: 'wojewodztwa.json', terytLen: 2, simplifyPct: '8%' },
  { name: 'pow', fileName: 'powiaty.json', terytLen: 4, simplifyPct: '6%' },
  { name: 'gmi', fileName: 'gminy.json', terytLen: 7, simplifyPct: '5%' }
];

async function ensureCachedFile(fileName) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const filePath = path.join(CACHE_DIR, fileName);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
    console.log(`[cache] Using cached file: ${filePath}`);
    return filePath;
  }

  const url = `${RAW_BASE_URL}/${fileName}`;
  console.log(`[download] Fetching ${url} ...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filePath, buffer);
  console.log(`[download] Saved ${filePath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
  return filePath;
}

async function main() {
  console.log('--- Building admin TopoJSON ---');

  // 1. Download / cache source GeoJSON files
  const fileBuffers = {};
  for (const item of FILES) {
    const filePath = await ensureCachedFile(item.fileName);
    fileBuffers[item.fileName] = fs.readFileSync(filePath);
  }

  // 2. Build mapshaper command string
  const inputCmd = FILES.map(item => item.fileName).join(' ');
  const layerNames = FILES.map(item => item.name).join(',');

  const transformCmds = FILES.map(item =>
    `-target ${item.name} -each "teryt=String(JPT_KOD_JE).padStart(${item.terytLen},'0'), name=JPT_NAZWA_" -filter-fields teryt,name`
  ).join(' ');

  const simplifyCmds = FILES.map(item =>
    `-target ${item.name} -simplify weighted keep-shapes ${item.simplifyPct}`
  ).join(' ');

  const commandString = [
    `-i ${inputCmd} combine-files`,
    `-rename-layers ${layerNames}`,
    transformCmds,
    simplifyCmds,
    `-target *`,
    `-o out.topo.json format=topojson quantization=100000`
  ].join(' ');

  console.log('[mapshaper] Executing commands...');
  const output = await mapshaper.applyCommands(commandString, fileBuffers);

  if (!output['out.topo.json']) {
    throw new Error('Mapshaper output out.topo.json not found in output object');
  }

  const resultBuffer = output['out.topo.json'];
  const sizeMB = (resultBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`[mapshaper] TopoJSON size: ${sizeMB} MB (${resultBuffer.length} bytes)`);

  if (resultBuffer.length > 3 * 1024 * 1024) {
    throw new Error(`Output file exceeds size limit of 3 MB: ${sizeMB} MB`);
  }

  // 3. Write output file
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, resultBuffer);
  console.log(`[success] Written ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Error during build:', err);
  process.exit(1);
});

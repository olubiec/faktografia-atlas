import fs from 'fs';
import path from 'path';
import mapshaper from 'mapshaper';

const INPUT_FILE = path.resolve('public/geo/admin.topo.json');
const OUTPUT_DIR = path.resolve('public/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'units.json');

const LAYERS = [
  { name: 'woj', level: 'woj' },
  { name: 'pow', level: 'pow' },
  { name: 'gmi', level: 'gmi' }
];

async function main() {
  console.log('--- Generating public/data/units.json ---');

  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Input file not found: ${INPUT_FILE}`);
  }

  const inputBuffer = fs.readFileSync(INPUT_FILE);
  const round4 = (val) => Number(val.toFixed(4));
  const units = [];

  for (const layer of LAYERS) {
    const command = `-i admin.topo.json -target ${layer.name} -each "f_bbox=[this.bbox[0], this.bbox[1], this.bbox[2], this.bbox[3]], f_inner=[this.innerX, this.innerY]" -o out.json format=geojson`;
    const output = await mapshaper.applyCommands(command, { 'admin.topo.json': inputBuffer });

    if (!output['out.json']) {
      throw new Error(`Failed to extract layer ${layer.name} from admin.topo.json`);
    }

    const geojson = JSON.parse(output['out.json'].toString());

    for (const feature of geojson.features) {
      const props = feature.properties;
      const teryt = String(props.teryt);
      let parent = null;

      if (layer.level === 'pow') {
        parent = teryt.slice(0, 2);
      } else if (layer.level === 'gmi') {
        parent = teryt.slice(0, 4);
      }

      units.push({
        teryt,
        bdlId: null,
        name: props.name,
        level: layer.level,
        parent,
        bbox: props.f_bbox.map(round4),
        centroid: props.f_inner.map(round4)
      });
    }
  }

  // Sort strictly by teryt code ascending
  units.sort((a, b) => a.teryt.localeCompare(b.teryt));

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const jsonContent = JSON.stringify(units);
  fs.writeFileSync(OUTPUT_FILE, jsonContent, 'utf8');

  const sizeKB = (Buffer.byteLength(jsonContent, 'utf8') / 1024).toFixed(2);
  console.log(`[success] Generated ${OUTPUT_FILE}`);
  console.log(`[stats] Total units: ${units.length} (woj: 16, pow: 380, gmi: 2479)`);
  console.log(`[stats] File size: ${sizeKB} KB`);
}

main().catch((err) => {
  console.error('Error generating units:', err);
  process.exit(1);
});

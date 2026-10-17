import fs from 'node:fs';
import path from 'node:path';
import topojson from 'topojson-client';

const topoPath = path.resolve('public/geo/admin.topo.json');
const outputPath = path.resolve('public/geo/kalka.svg');

const topoRaw = fs.readFileSync(topoPath, 'utf-8');
const topo = JSON.parse(topoRaw);

// Find geographic bounds across all layers
let minLon = Infinity;
let maxLon = -Infinity;
let minLat = Infinity;
let maxLat = -Infinity;

const gmiFeature = topojson.feature(topo, topo.objects.gmi);

function scanCoords(coords) {
  if (typeof coords[0] === 'number') {
    const [lon, lat] = coords;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  } else {
    for (const c of coords) {
      scanCoords(c);
    }
  }
}

scanCoords(gmiFeature.features.map((f) => f.geometry.coordinates));

const COS_52 = Math.cos((52 * Math.PI) / 180);

const minX = minLon * COS_52;
const maxX = maxLon * COS_52;
const minY = minLat;
const maxY = maxLat;

// Fix height to 800px, calculate width proportionally
const HEIGHT = 800;
const scale = HEIGHT / (maxY - minY);
const WIDTH = Math.round((maxX - minX) * scale);

function project([lon, lat]) {
  const x = (lon * COS_52 - minX) * scale;
  const y = (maxY - lat) * scale;
  return [x, y];
}

function processMultiLineString(multiLineString) {
  const pathParts = [];

  for (const line of multiLineString.coordinates) {
    if (line.length < 2) continue;

    const projectedPoints = [];
    let prev = null;

    for (let i = 0; i < line.length; i++) {
      const pt = project(line[i]);
      if (!prev) {
        projectedPoints.push(pt);
        prev = pt;
      } else {
        const dist = Math.hypot(pt[0] - prev[0], pt[1] - prev[1]);
        if (dist >= 1.0 || i === line.length - 1) {
          projectedPoints.push(pt);
          prev = pt;
        }
      }
    }

    if (projectedPoints.length < 2) continue;

    const lineCommands = projectedPoints.map(
      ([x, y], idx) => `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    );
    pathParts.push(lineCommands.join(''));
  }

  return pathParts.join('');
}

// Extract meshes
const countryMesh = topojson.mesh(topo, topo.objects.woj, (a, b) => a === b);
const wojMesh = topojson.mesh(topo, topo.objects.woj);
const powMesh = topojson.mesh(topo, topo.objects.pow);
const gmiMesh = topojson.mesh(topo, topo.objects.gmi);

const countryPath = processMultiLineString(countryMesh);
const wojPath = processMultiLineString(wojMesh);
const powPath = processMultiLineString(powMesh);
const gmiPath = processMultiLineString(gmiMesh);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" fill="none">
  <path d="${gmiPath}" stroke="#000" stroke-width="0.5" stroke-opacity="0.16" stroke-linecap="round" stroke-linejoin="round" />
  <path d="${powPath}" stroke="#000" stroke-width="0.8" stroke-opacity="0.38" stroke-linecap="round" stroke-linejoin="round" />
  <path d="${wojPath}" stroke="#000" stroke-width="1.1" stroke-opacity="0.75" stroke-linecap="round" stroke-linejoin="round" />
  <path d="${countryPath}" stroke="#000" stroke-width="1.6" stroke-opacity="1" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

fs.writeFileSync(outputPath, svg, 'utf-8');
const stats = fs.statSync(outputPath);
console.log(`Generated public/geo/kalka.svg: ${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB)`);

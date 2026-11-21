// Uproszczony obrys 16 województw dla strony startowej: public/geo/start-outline.json.
// Wejście: warstwa `woj` z public/geo/admin.topo.json. Bez sieci, wynik deterministyczny.
// Użycie: node scripts/geo/start-outline.mjs [--out ścieżka]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EPS = 1.2; // próg Douglasa–Peuckera w jednostkach ok. 1/100 stopnia

// Web Mercator, tak jak mapa: dzięki temu plakat pokrywa się z pierwszym kadrem mapy.
// Skala: 1 stopień długości = ok. 61,6 jednostki (jak dotąd), więc próg EPS i rozmiar pliku bez zmian.
const R = (Math.cos((52 * Math.PI) / 180) * 100 * 180) / Math.PI;
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/** Rzut długość/szerokość -> płaszczyzna Mercatora (y rośnie na południe). */
function project(lon, lat) {
  return [((lon * Math.PI) / 180) * R, -mercY(lat) * R];
}

function distToSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = dx * dx + dy * dy;
  if (len === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len));
  return Math.hypot(p[0] - (a[0] + u * dx), p[1] - (a[1] + u * dy));
}

/** Douglas–Peucker bez rekurencji (stos), zostają punkty odchylone o więcej niż eps. */
export function simplifyLine(points, eps) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let max = 0;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = distToSegment(points[i], points[s], points[e]);
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (idx !== -1 && max > eps) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return points.filter((_, i) => keep[i] === 1);
}

const num = (v) => String(Number(v.toFixed(1)));

function ringToPath(ring, x0, y0) {
  // pierścień zamknięty: ostatni punkt = pierwszy, więc go pomijamy (Z zamyka)
  const pts = ring.slice(0, -1);
  if (pts.length < 3) return '';
  return `M${pts.map(([x, y]) => `${num(x - x0)} ${num(y - y0)}`).join('L')}Z`;
}

/**
 * @param {object} topo - zawartość admin.topo.json
 * @returns {{version:1, viewBox:[number,number], bbox:[number,number,number,number], paths:{teryt:string,d:string}[]}}
 */
export function buildOutline(topo) {
  const fc = feature(topo, topo.objects.woj);
  const shapes = fc.features
    .map((f) => {
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      const rings = polys.flatMap((poly) =>
        poly.map((r) => simplifyLine(r.map(([lon, lat]) => project(lon, lat)), EPS)),
      );
      return { teryt: String(f.properties.teryt), rings: rings.filter((r) => r.length >= 4) };
    })
    .sort((a, b) => a.teryt.localeCompare(b.teryt));
  // Granice kraju z pełnych (nieuproszczonych) współrzędnych: to samo, co mapa bierze z units.json.
  const lons = [];
  const lats = [];
  for (const f of fc.features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) for (const [lon, lat] of poly[0]) {
        lons.push(lon);
        lats.push(lat);
      }
  }
  const bbox = [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)].map((v) => Number(v.toFixed(4)));
  const [x0, y0] = project(bbox[0], bbox[3]);
  const [x1, y1] = project(bbox[2], bbox[1]);
  const w = Number((x1 - x0).toFixed(1));
  const h = Number((y1 - y0).toFixed(1));
  const paths = shapes.map((s) => ({
    teryt: s.teryt,
    d: s.rings.map((r) => ringToPath(r, x0, y0)).join(''),
  }));
  return { version: 1, viewBox: [w, h], bbox, paths };
}

function main() {
  const i = process.argv.indexOf('--out');
  const out = i > -1 ? path.resolve(process.argv[i + 1]) : path.join(ROOT, 'public/geo/start-outline.json');
  const topo = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/geo/admin.topo.json'), 'utf8'));
  const json = JSON.stringify(buildOutline(topo));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${json}\n`);
  console.log(`start-outline: ${json.length} B -> ${path.relative(ROOT, out)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

// Generuje znak nagłówkowy: F ze znaku na konturze Polski z siatką powiatów.
// Uruchom: node scripts/brand/naglowek.mjs  (wymaga public/geo/admin.topo.json)
import fs from 'node:fs';
import { mesh } from 'topojson-client';

const t = JSON.parse(fs.readFileSync('public/geo/admin.topo.json', 'utf8'));
const znak = fs.readFileSync('public/brand/faktografia-znak-granat.svg', 'utf8');
const fGroup = znak.slice(znak.indexOf('<g transform'), znak.lastIndexOf('</g>'));

const k = Math.cos((52 * Math.PI) / 180);
const proj = ([lon, lat]) => [lon * k, -lat];
const SZ = 100;

const powM = mesh(t, t.objects.pow, (a, b) => a !== b);
const wojM = mesh(t, t.objects.woj, (a, b) => a !== b);
const outer = mesh(t, t.objects.woj, (a, b) => a === b);

const pts = outer.coordinates.flat().map(proj);
const minX = Math.min(...pts.map((p) => p[0]));
const maxX = Math.max(...pts.map((p) => p[0]));
const minY = Math.min(...pts.map((p) => p[1]));
const maxY = Math.max(...pts.map((p) => p[1]));
const side = Math.max(maxX - minX, maxY - minY) * 1.04;
const x0 = minX - (side - (maxX - minX)) / 2;
const y0 = minY - (side - (maxY - minY)) / 2;
const s = SZ / side;

// Punkty bliżej niż 1.1 jednostki są pomijane: przy 48 px i tak ich nie widać, a plik jest 4-5x mniejszy.
function d(ml) {
  return ml.coordinates
    .map((line) => {
      const out = [];
      let lx = 0;
      let ly = 0;
      line.forEach((p, i) => {
        const [x, y] = proj(p);
        const X = (x - x0) * s;
        const Y = (y - y0) * s;
        if (i === 0 || i === line.length - 1 || Math.hypot(X - lx, Y - ly) >= 1.1) {
          out.push(`${X.toFixed(1)},${Y.toFixed(1)}`);
          lx = X;
          ly = Y;
        }
      });
      return out.length > 1 ? `M${out.join('L')}` : '';
    })
    .join('');
}

function svg(ink, red) {
  const F = fGroup.replaceAll('#15233F', ink).replaceAll('#E3242B', red);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SZ} ${SZ}" role="img" aria-label="Faktografia Atlas">
<g fill="none" stroke="${ink}" stroke-linejoin="round" stroke-linecap="round">
<path d="${d(powM)}" stroke-opacity="0.35" stroke-width="0.35"/>
<path d="${d(wojM)}" stroke-opacity="0.56" stroke-width="0.7"/>
<path d="${d(outer)}" stroke-opacity="0.63" stroke-width="0.7"/>
</g>
<g transform="translate(50 52) scale(0.62) translate(-153 22)">${F}</g></svg>`;
}

fs.writeFileSync('public/brand/faktografia-naglowek-granat.svg', svg('#15233F', '#E3242B'));
fs.writeFileSync('public/brand/faktografia-naglowek-jasny.svg', svg('#E7ECF3', '#FF5A5F'));
console.log('Zapisano public/brand/faktografia-naglowek-{granat,jasny}.svg');

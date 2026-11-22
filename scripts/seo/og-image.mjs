// Generuje obrazek do udostępnień (og:image) 1200×630: logo z public/brand/, hasło ze strony startowej,
// kolory i krój z config/tokens.json. Uruchomienie: node scripts/seo/og-image.mjs
// Wynik: public/og/faktografia.png (≤ 150 KB, sprawdza test tests/unit/s03-page-meta.test.tsx).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '../..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_BYTES = 150 * 1024;
const OUT = path.join(root, 'public/og/faktografia.png');

const tokens = JSON.parse(read('config/tokens.json'));
const colors = tokens.color.light;
const fontFamily = tokens.font.sans;

// Hasło bierzemy z kodu strony startowej, żeby obrazek i strona mówiły to samo.
const tagline = read('src/view/start/StartPage.tsx').match(/const TAGLINE = '([^']+)'/)?.[1];
if (!tagline) throw new Error('Nie znaleziono TAGLINE w src/view/start/StartPage.tsx');

const logo = pathToFileURL(path.join(root, 'public/brand/faktografia-logo-granat.svg')).href;
const fontDir = path.join(root, 'node_modules/@fontsource/atkinson-hyperlegible-next/files');
const font = (subset, weight) =>
  pathToFileURL(path.join(fontDir, `atkinson-hyperlegible-next-${subset}-${weight}-normal.woff2`)).href;

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Atkinson Hyperlegible Next'; font-weight: 800; src: url('${font('latin', 800)}') format('woff2'); }
  @font-face { font-family: 'Atkinson Hyperlegible Next'; font-weight: 800; src: url('${font('latin-ext', 800)}') format('woff2'); unicode-range: U+0100-024F; }
  @font-face { font-family: 'Atkinson Hyperlegible Next'; font-weight: 400; src: url('${font('latin', 400)}') format('woff2'); }
  @font-face { font-family: 'Atkinson Hyperlegible Next'; font-weight: 400; src: url('${font('latin-ext', 400)}') format('woff2'); unicode-range: U+0100-024F; }
  html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; }
  body { background: ${colors.kalka}; color: ${colors.tusz}; font-family: ${fontFamily};
    display: flex; flex-direction: column; justify-content: center; padding: 0 96px; box-sizing: border-box;
    border-bottom: 16px solid ${colors.korekta}; }
  /* viewBox logo zaczyna się od -30, więc przesuwamy je o ten margines, by litery trzymały linię tekstu. */
  img { width: 520px; height: auto; display: block; margin-left: -50px; }
  h1 { margin: 56px 0 0; font-size: 64px; line-height: 1.1; font-weight: 800; letter-spacing: -0.02em; }
  p { margin: 24px 0 0; font-size: 32px; color: ${colors.olowek}; }
</style></head>
<body>
  <img src="${logo}" alt="Faktografia">
  <h1>${escapeHtml(tagline)}</h1>
  <p>Dane GUS na mapie Polski · faktografia.eu</p>
</body></html>`;

// Opcjonalnie własna przeglądarka (gdy wersja pobrana przez Playwright nie pasuje do środowiska).
const browser = await chromium.launch({ executablePath: process.env.OG_CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  const tmp = path.join(root, 'public/og/.og-image.html');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(tmp, html);
  try {
    await page.goto(pathToFileURL(tmp).href);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: OUT, type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  } finally {
    fs.rmSync(tmp, { force: true });
  }
} finally {
  await browser.close();
}

const size = fs.statSync(OUT).size;
if (size > MAX_BYTES) throw new Error(`Obrazek za duży: ${size} B (limit ${MAX_BYTES} B)`);
console.log(`Zapisano ${path.relative(root, OUT)} (${WIDTH}×${HEIGHT}, ${Math.round(size / 1024)} KB)`);

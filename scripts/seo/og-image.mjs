// Generuje obrazek do udostępnień 1200×630 (public/og/faktografia.png).
// Uruchomienie: node scripts/seo/og-image.mjs  (przeglądarka z Playwright; CHROMIUM_PATH opcjonalnie)
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { chromium } from 'playwright';

const tokens = JSON.parse(readFileSync('config/tokens.json', 'utf8'));
const c = tokens.color.light;
const logo = readFileSync('public/brand/faktografia-logo-granat.svg').toString('base64');
const TAGLINE = 'Sprawdź swoją miejscowość i okolicę.';
const SUB = 'Mapa gmin i powiatów z danymi GUS';

const html = `<!doctype html><html><body style="margin:0;width:1200px;height:630px;background:${c.kalka};
font-family:${tokens.font.sans};color:${c.tusz};display:flex;flex-direction:column;justify-content:center;
padding:0 96px;box-sizing:border-box;border-left:24px solid ${c.korekta}">
<img src="data:image/svg+xml;base64,${logo}" style="height:150px;align-self:flex-start;margin-bottom:56px"/>
<div style="font-size:64px;font-weight:800;letter-spacing:-0.02em;line-height:1.1">${TAGLINE}</div>
<div style="font-size:36px;color:${c.olowek};margin-top:24px">${SUB}</div>
</body></html>`;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
mkdirSync('public/og', { recursive: true });
const png = await page.screenshot({ type: 'png' });
writeFileSync('public/og/faktografia.png', png);
await browser.close();
console.log(`public/og/faktografia.png: ${statSync('public/og/faktografia.png').size} B`);

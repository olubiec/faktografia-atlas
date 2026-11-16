// Generuje PNG z logo SVG: og-image 1200x630 oraz ikony 192/512.
// Źródło: wyłącznie pliki z public/brand/, kolory z config/tokens.json.
// Uruchom: node scripts/brand/make-png.mjs (używa Playwright/Chromium z projektu).
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const brand = join(root, 'public', 'brand')
const tokens = JSON.parse(readFileSync(join(root, 'config', 'tokens.json'), 'utf8'))
const bg = tokens.color.light.arkusz

const dataUri = (file) =>
  'data:image/svg+xml;base64,' + readFileSync(join(brand, file)).toString('base64')

const jobs = [
  { out: 'faktografia-og-1200x630.png', w: 1200, h: 630, img: 'faktografia-logo-granat.svg', iw: 840 },
  { out: 'faktografia-icon-192.png', w: 192, h: 192, img: 'faktografia-znak-granat.svg', iw: 192 },
  { out: 'faktografia-icon-512.png', w: 512, h: 512, img: 'faktografia-znak-granat.svg', iw: 512 },
]

const browser = await chromium.launch()
try {
  for (const j of jobs) {
    const page = await browser.newPage({ viewport: { width: j.w, height: j.h } })
    await page.setContent(
      `<!doctype html><body style="margin:0;width:${j.w}px;height:${j.h}px;background:${bg};display:flex;align-items:center;justify-content:center">` +
        `<img id="i" src="${dataUri(j.img)}" style="width:${j.iw}px;display:block"></body>`,
    )
    await page.waitForFunction(() => document.getElementById('i').complete)
    writeFileSync(join(brand, j.out), await page.screenshot({ type: 'png' }))
    await page.close()
    console.log('OK', j.out)
  }
} finally {
  await browser.close()
}

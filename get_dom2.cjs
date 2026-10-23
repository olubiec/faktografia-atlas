const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:4173/?i=population-density&y=2023');
  await page.waitForSelector('canvas.maplibregl-canvas');
  // dump header element
  const headerHTML = await page.evaluate(() => document.querySelector('header').outerHTML);
  console.log(headerHTML);
  await browser.close();
})();

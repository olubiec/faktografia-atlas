const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:4173/?i=population-density&y=2023');
  await page.waitForSelector('canvas.maplibregl-canvas');
  const isHidden = await page.evaluate(() => {
     const panel = document.querySelector('aside[aria-label="Panel wskaźnika"]');
     return panel === null;
  });
  console.log('Is panel hidden?', isHidden);
  await browser.close();
})();

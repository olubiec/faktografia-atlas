import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve('scripts/shots.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return false;
}

async function run() {
  console.log('Starting preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], { stdio: 'inherit' });

  const serverReady = await waitForServer('http://localhost:4173');
  if (!serverReady) {
    console.error('Server failed to start');
    server.kill();
    process.exit(1);
  }

  const browser = await chromium.launch();

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ];

  const themes = ['light', 'dark'];

  const outDir = path.resolve('docs/shots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const view of config) {
    for (const vp of viewports) {
      for (const theme of themes) {
        console.log(`Taking screenshot: ${view.name} - ${vp.name} - ${theme}`);
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });

        const page = await context.newPage();
        await page.goto(`http://localhost:4173${view.url}`);
        await page.evaluate((t) => {
          document.documentElement.setAttribute('data-theme', t);
        }, theme);
        await page.waitForTimeout(500);

        const fileName = `${view.name === 'home' ? '' : view.name + '-'}${vp.name}-${theme}.jpg`;
        await page.screenshot({ path: path.join(outDir, fileName), type: 'jpeg', quality: 80 });
        await context.close();
      }
    }
  }

  // Zrzuty ekranu poszczególnych typów zakreśleń z /__test/annotation
  const types = ['circle', 'underline', 'bracket', 'box'];
  for (const type of types) {
    for (const theme of themes) {
      console.log(`Taking annotation screenshot: ${type} - ${theme}`);
      const context = await browser.newContext({
        viewport: { width: 1200, height: 800 },
        colorScheme: theme,
      });

      const page = await context.newPage();
      await page.goto('http://localhost:4173/__test/annotation');
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
      }, theme);
      await page.waitForTimeout(300);

      // Kliknij odpowiedni przycisk zakreślenia
      const btnName = `Pokaż ${type}`;
      await page.getByRole('button', { name: btnName }).click();
      await page.waitForTimeout(700); // Czas na animację zakreślenia (600ms)

      const fileName = `annotation-${type}-${theme}.png`;
      await page.screenshot({ path: path.join(outDir, fileName) });
      await context.close();
    }
  }

  await browser.close();
  server.kill();
  console.log('Screenshots completed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

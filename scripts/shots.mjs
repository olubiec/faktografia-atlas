import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve('scripts/shots.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

async function isPortInUse(url) {
  try {
    await fetch(url);
    return true;
  } catch {
    return false;
  }
}

async function waitForServer(urls, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    for (const url of urls) {
      if (await isPortInUse(url)) return true;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

async function run() {
  const testUrls = ['http://localhost:4173', 'http://127.0.0.1:4173'];
  let server = null;
  let serverReady = await waitForServer(testUrls, 1000);

  if (!serverReady) {
    console.log('Starting preview server...');
    const viteBin = path.resolve('node_modules/.bin/vite');
    server = spawn(viteBin, ['preview', '--port', '4173'], { stdio: 'inherit' });
    serverReady = await waitForServer(testUrls, 30000);
  } else {
    console.log('Preview server already running on port 4173.');
  }

  if (!serverReady) {
    console.error('Server failed to start');
    if (server) server.kill();
    process.exit(1);
  }

  const browser = await chromium.launch();

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 }
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
          colorScheme: theme
        });

        const page = await context.newPage();
        await page.goto(`http://localhost:4173${view.url}`);
        // ensure theme sets on load
        await page.evaluate(() => {
          localStorage.setItem('faktografia-theme', 'system');
        });
        await page.waitForTimeout(500); // allow render

        const fileName = `${view.name === 'home' ? '' : view.name + '-'}${vp.name}-${theme}.jpg`;
        await page.screenshot({ path: path.join(outDir, fileName), type: 'jpeg', quality: 80 });
        await context.close();
      }
    }
  }

  await browser.close();
  if (server) {
    server.kill();
  }
  console.log('Screenshots completed.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

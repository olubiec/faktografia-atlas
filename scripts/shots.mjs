import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve('scripts/shots.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

async function run() {
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 }
  ];

  const themes = ['light', 'dark'];

  const outDir = path.resolve('docs/shots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let baseUrl = 'http://localhost:4173';
  let server = null;

  try {
    const res = await fetch('http://localhost:4173');
    if (res.ok || res.status === 200) {
      console.log('Preview server already running on port 4173.');
    } else {
      throw new Error('Not running');
    }
  } catch {
    console.log('Starting preview server...');
    const viteBin = path.resolve('node_modules/.bin/vite');
    server = spawn(viteBin, ['preview', '--port', '4173'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' }
    });

    baseUrl = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server start timed out after 30s'));
      }, 30000);

      const onData = (data) => {
        const text = data.toString();
        process.stdout.write(text);

        // Strip non-printable characters for clean matching
        const cleanText = text.replace(/[^\x20-\x7E\s]/g, '');
        const match = cleanText.match(/http:\/\/[^\s:]+:(\d+)/);
        if (match) {
          clearTimeout(timeout);
          resolve(`http://localhost:${match[1]}`);
        }
      };

      server.stdout.on('data', onData);
      server.stderr.on('data', (d) => process.stderr.write(d));
      server.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      await fetch(baseUrl);
      ready = true;
      break;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (!ready) {
    if (server) server.kill();
    throw new Error(`Server at ${baseUrl} is not responding`);
  }

  const browser = await chromium.launch();

  for (const view of config) {
    for (const vp of viewports) {
      for (const theme of themes) {
        console.log(`Taking screenshot: ${view.name} - ${vp.name} - ${theme}`);
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme
        });

        const page = await context.newPage();
        await page.goto(`${baseUrl}${view.url}`);
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

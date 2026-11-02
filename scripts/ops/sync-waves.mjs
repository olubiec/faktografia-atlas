#!/usr/bin/env node
/**
 * Synchronizes tasks/ and tasks/poczekalnia/ markdown task files into waves.yaml.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

function parseTaskFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(REPO_ROOT, filePath).replace(/\\/g, '/');
  const filename = path.basename(filePath);

  const matchId = filename.match(/^((?:W-[A-Z]+|W\d+)-[A-Z0-9]+)/i) || filename.match(/^([A-Z0-9_.-]+)/i);
  const id = matchId ? matchId[1] : filename.replace(/\.md$/, '');

  const titleMatch = content.match(/^#\s*(.*?)$/m);
  const title = titleMatch ? titleMatch[1].trim() : filename;

  const getHeader = (pattern) => {
    const m = content.match(pattern);
    return m ? m[1].trim() : '';
  };

  const zmieniajRaw = getHeader(/(?:Zmieniaj|Change):\s*([^\r\n]+)/i);
  const weryfikacja = getHeader(/(?:Weryfikacja|Verify):\s*([^\r\n]+)/i) || 'pnpm lint && pnpm typecheck && pnpm test && pnpm build';

  const files = zmieniajRaw
    ? zmieniajRaw.split(/[,;\s]+/)
        .map(s => s.trim().replace(/^`|`$/g, ''))
        .filter(Boolean)
    : [];

  return {
    id,
    title,
    files,
    prompt_file: relPath,
    test_command: weryfikacja
  };
}

function generateWavesYaml() {
  const tasksDir = path.join(REPO_ROOT, 'tasks');
  const poczekalniaDir = path.join(tasksDir, 'poczekalnia');

  const allFiles = [];

  // Active tasks in tasks/
  if (fs.existsSync(tasksDir)) {
    const files = fs.readdirSync(tasksDir).filter(f => /^W\d+-.*\.md$/i.test(f)).sort();
    for (const f of files) {
      allFiles.push(path.join(tasksDir, f));
    }
  }

  // Poczekalnia tasks
  if (fs.existsSync(poczekalniaDir)) {
    const files = fs.readdirSync(poczekalniaDir).filter(f => /^W\d+-.*\.md$/i.test(f)).sort();
    for (const f of files) {
      allFiles.push(path.join(poczekalniaDir, f));
    }
  }

  // Group by wave id (e.g. w16, w17, w18)
  const waveMap = new Map();
  for (const filePath of allFiles) {
    const filename = path.basename(filePath);
    const m = filename.match(/^(W\d+)/i);
    const waveId = m ? m[1].toLowerCase() : 'other';
    if (!waveMap.has(waveId)) {
      waveMap.set(waveId, []);
    }
    waveMap.get(waveId).push(parseTaskFile(filePath));
  }

  const waves = [];
  for (const [id, tasks] of waveMap.entries()) {
    waves.push({ id, tasks });
  }

  let yaml = 'version: 1\nwaves:\n';
  for (const wave of waves) {
    yaml += `  - id: ${wave.id}\n    tasks:\n`;
    for (const t of wave.tasks) {
      yaml += `      - id: ${t.id}\n`;
      yaml += `        title: "${t.title.replace(/"/g, '\\"')}"\n`;
      yaml += `        files:\n`;
      for (const f of t.files) {
        yaml += `          - "${f}"\n`;
      }
      yaml += `        prompt_file: ${t.prompt_file}\n`;
      yaml += `        test_command: "${t.test_command.replace(/"/g, '\\"')}"\n\n`;
    }
  }

  const outPath = path.join(REPO_ROOT, 'waves.yaml');
  fs.writeFileSync(outPath, yaml, 'utf8');
  console.log(`Zapisano ${outPath} (${waves.length} fal, ${waves.reduce((a, b) => a + b.tasks.length, 0)} zadań)`);
}

generateWavesYaml();

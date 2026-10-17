import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const outPath = path.resolve('GEMINI_HANDOFF.md');
const pkgPath = path.resolve('package.json');
const stanPath = path.resolve('STAN_PROJEKTU.md');

// 1. Data
const date = new Date().toISOString().split('T')[0];

// 2. Ostatni akapit STAN_PROJEKTU.md
const stan = fs.readFileSync(stanPath, 'utf-8');
const stanParagraphs = stan.trim().split('\n\n');
const lastStan = stanParagraphs[stanParagraphs.length - 1];

// 3. Drzewo plików (z pominięciem node_modules, dist, .git, playwright-report, test-results, etc.)
let tree = '';
try {
  tree = execSync('find . -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/.git/*" -not -path "*/playwright-report/*" -not -path "*/test-results/*" -type f | sort').toString();
} catch {
  tree = "Failed to generate tree";
}

// 4. Zależności z package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const depsList = Object.entries(deps).map(([k, v]) => `${k}: ${v}`).join('\n');

// 5. Exports
let exportsList = 'Wymagany TypeScript Compiler API w kolejnej iteracji, jeśli wyrażenia regularne zawiodą.\n';

try {
  const files = execSync('find src -type f -name "*.ts" -o -name "*.tsx"').toString().trim().split('\n');
  files.forEach(f => {
    if (!f) return;
    const content = fs.readFileSync(f, 'utf-8');
    const exports = [...content.matchAll(/export\s+(function|const|class|type|interface)\s+([a-zA-Z0-9_]+)/g)];
    if (exports.length > 0) {
      exportsList += `\n${f}:\n`;
      exports.forEach(m => {
        exportsList += `  - ${m[2]} (${m[1]})\n`;
      });
    }
  });
} catch {}

// 6. Wynik testów
let testResult = '';
try {
  const result = execSync('npx vitest run tests/unit --reporter=verbose', { encoding: 'utf-8' });
  testResult = result;
} catch (e) {
  testResult = e.stdout || e.message;
}

// 7. Rozmiary plików w public/data i public/geo
let publicFiles = '';
try {
  publicFiles = execSync('find public/data public/geo -type f -exec ls -lh {} + 2>/dev/null || true').toString();
} catch {}

const md = `# GEMINI_HANDOFF
Data: ${date}

## Ostatni stan projektu
${lastStan}

## Drzewo plików
\`\`\`
${tree}
\`\`\`

## Zależności
\`\`\`
${depsList}
\`\`\`

## Eksporty w src/
\`\`\`
${exportsList}
\`\`\`

## Testy
\`\`\`
${testResult}
\`\`\`

## Pliki danych (rozmiary)
\`\`\`
${publicFiles}
\`\`\`
`;

fs.writeFileSync(outPath, md);
console.log('GEMINI_HANDOFF.md generated.');

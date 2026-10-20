// Zbiera dane PR z API GitHuba i zapisuje je jako wejście dla pr-rules-cli.mjs.
// Użycie (w workflow): PR=123 REPO=owner/repo GH_TOKEN=... node scripts/ci/pr-rules-collect.mjs <zapalne.txt> <wyjście.json>
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const [zapalnePath, outPath] = process.argv.slice(2);
const { PR, REPO } = process.env;
if (!PR || !REPO || !zapalnePath || !outPath) {
  console.error('Użycie: PR=<nr> REPO=<owner/repo> node scripts/ci/pr-rules-collect.mjs <zapalne.txt> <wyjście.json>');
  process.exit(1);
}

const gh = (path, ...args) => JSON.parse(execFileSync('gh', ['api', path, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
const ghText = (path) => {
  try {
    return execFileSync('gh', ['api', path, '-H', 'Accept: application/vnd.github.raw+json'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  } catch {
    return null;
  }
};

const pr = gh(`repos/${REPO}/pulls/${PR}`);
const files = gh(`repos/${REPO}/pulls/${PR}/files?per_page=100`, '--paginate').map((f) => ({ filename: f.filename, status: f.status }));

let labels = pr.labels.map((l) => l.name);
// Etykieta „sprawdzone” dotyczy tylko obejrzanych commitów: po nowym commicie przestaje obowiązywać.
if (process.env.EVENT_ACTION === 'synchronize' && labels.includes('sprawdzone')) {
  labels = labels.filter((l) => l !== 'sprawdzone');
  try {
    execFileSync('gh', ['api', '-X', 'DELETE', `repos/${REPO}/issues/${PR}/labels/sprawdzone`], { stdio: 'ignore' });
  } catch {
    // brak uprawnień (np. PR z forka) – sprawdzenie i tak liczy PR bez tej etykiety
  }
}

let linkedIssue = null;
const m = (pr.body ?? '').match(/\b(?:Fixes|Closes|Resolves|Zamyka)\s+#(\d+)\b/i);
if (m) {
  try {
    const issue = gh(`repos/${REPO}/issues/${m[1]}`);
    linkedIssue = { number: issue.number, title: issue.title, body: issue.body ?? '' };
  } catch {
    linkedIssue = null;
  }
}

const zapalne = readFileSync(zapalnePath, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

let packageJson = null;
if (files.some((f) => f.filename === 'package.json')) {
  const base = ghText(`repos/${REPO}/contents/package.json?ref=${pr.base.sha}`);
  const head = ghText(`repos/${REPO}/contents/package.json?ref=${pr.head.sha}`);
  if (base && head) packageJson = { base, head };
}

writeFileSync(
  outPath,
  JSON.stringify({ title: pr.title, body: pr.body ?? '', branch: pr.head.ref, labels, files, linkedIssue, zapalne, packageJson }, null, 2)
);
console.log(`PR #${PR}: ${files.length} plików, etykiety: ${labels.join(', ') || 'brak'}, zgłoszenie: ${linkedIssue ? '#' + linkedIssue.number : 'brak'}`);

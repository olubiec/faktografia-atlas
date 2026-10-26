// Ręczna pętla (od 25.10.2026): „Ty scalasz, Claude puszcza kolejne”. Automat (automat.mjs) stoi pod etykietą `automat-stop`.
// Ten skrypt robi to samo, co krok „starty” automatu, ale bez pamięci automatu: stan bierze z GitHuba
// (scalone PR-y, których tytuł zaczyna się od `Wx.y`, oraz otwarte issue z etykietą `jules`).
//
//   node scripts/ops/start-tasks.mjs                 – pokazuje, co jest gotowe do startu (nic nie zmienia)
//   node scripts/ops/start-tasks.mjs --start         – zakłada issue i nakłada `jules` dla wszystkich gotowych
//   node scripts/ops/start-tasks.mjs W2.24 W2.28 --start   – tylko wskazane (muszą być gotowe)
//   node scripts/ops/start-tasks.mjs --status        – ile zrobione, ile zostało, które trwają
// Wymaga `gh` z dostępem do repo (sesja Claude z dołączonym repo). Nigdy nie scala i nie zamyka niczego.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extractSection, filesCollide, issueBody, taskIdFromTitle } from './plan.mjs';

const queue = JSON.parse(readFileSync('scripts/ops/automat-kolejka.json', 'utf8'));
const s = queue.settings;
const args = process.argv.slice(2);
const start = args.includes('--start');
const wanted = args.filter((a) => /^W\d\.\d+$/.test(a));

const gh = (method, path, body) => {
  const out = execFileSync('gh', ['api', '-X', method, `repos/${s.repo}/${path}`, '--input', '-'], { input: JSON.stringify(body ?? {}), encoding: 'utf8' });
  return out ? JSON.parse(out) : {};
};
// Strony pobieramy ręcznie (bez `--paginate`: proxy sesji Claude blokuje odnośniki „repositories/<id>”).
const lines = (path, jq) => {
  const out = [];
  for (let page = 1; page <= 10; page++) {
    let chunk;
    try {
      chunk = execFileSync('gh', ['api', `repos/${s.repo}/${path}&page=${page}`, '--jq', jq], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).split('\n').filter(Boolean);
    } catch (err) {
      console.error(`Błąd gh: ${String(err.stderr ?? err.message).split('\n')[0]}`);
      process.exit(1);
    }
    out.push(...chunk);
    if (chunk.length === 0) break;
  }
  return out;
};

// Zrobione = zrobione przed automatem + scalony PR z identyfikatorem zadania na początku tytułu.
const merged = new Set(lines('pulls?state=closed&per_page=100', '.[] | select(.merged_at != null) | .title')
  .map((t) => /^(?:feat\(|fix\()?(W\d\.\d+)\b/i.exec(t)?.[1]).filter(Boolean).map((id) => id.toUpperCase()));
const done = new Set([...queue.doneBefore, ...merged]);

// Trwające = otwarte issue z etykietą `jules` albo `zadanie` (zadanie czeka na start lub na scalenie).
const open = lines('issues?state=open&labels=zadanie&per_page=100', '.[] | select(.pull_request == null) | "\\(.number)\\t\\(.title)\\t\\([.labels[].name] | join(","))"')
  .map((l) => { const [number, title, labels] = l.split('\t'); return { number: Number(number), id: taskIdFromTitle(title), labels }; });
const busyIds = new Set(open.map((i) => i.id));
const busy = queue.tasks.filter((t) => busyIds.has(t.id) && !done.has(t.id));

const todo = queue.tasks.filter((t) => !done.has(t.id));
if (args.includes('--status')) {
  console.log(`Zrobione: ${queue.tasks.filter((t) => done.has(t.id)).length}/${queue.tasks.length}. Zostało: ${todo.length}. Trwa: ${busy.map((t) => t.id).join(', ') || 'nic'}.`);
  for (const w of [...new Set(todo.map((t) => t.wave))].sort((a, b) => a - b)) console.log(`F${w}: ${todo.filter((t) => t.wave === w).map((t) => t.id).join(' ')}`);
  process.exit(0);
}

const slots = Math.max(0, s.maxParallel - busy.length);
const ready = [];
for (const t of [...todo].sort((a, b) => a.wave - b.wave || queue.tasks.indexOf(a) - queue.tasks.indexOf(b))) {
  if (ready.length >= slots) break;
  if (busyIds.has(t.id)) continue;
  if (!t.dependsOn.every((d) => done.has(d))) continue;
  if ([...busy, ...ready].some((o) => filesCollide(o, t))) continue;
  ready.push(t);
}
const picked = wanted.length ? ready.filter((t) => wanted.includes(t.id)) : ready;
const missing = wanted.filter((id) => !picked.some((t) => t.id === id));
if (missing.length) console.error(`Nie są gotowe (zależności, kolizja plików, limit ${s.maxParallel} naraz albo już trwają): ${missing.join(', ')}`);

console.log(`Zrobione ${queue.tasks.filter((t) => done.has(t.id)).length}/${queue.tasks.length}, trwa ${busy.length}, wolnych miejsc ${slots}.`);
console.log(picked.length ? `Gotowe do startu: ${picked.map((t) => `${t.id} (F${t.wave})`).join(', ')}` : 'Nic gotowego do startu.');
if (!start || picked.length === 0) process.exit(0);

const arch = readFileSync(s.architecture, 'utf8');
const footer = readFileSync(s.footer, 'utf8');
const common = arch.split('\n').find((l) => l.startsWith('Wspólne „Gotowe, gdy”')) ?? '';
for (const t of picked) {
  const section = extractSection(arch, t.id);
  if (!section) { console.error(`Brak sekcji ${t.id} w ARCHITEKTURA.md – pomijam.`); continue; }
  const created = gh('POST', 'issues', { title: `[${t.id}] ${t.title}`, body: issueBody(t, section, footer, common), labels: ['zadanie'] });
  gh('POST', `issues/${created.number}/labels`, { labels: ['jules'] });
  console.log(`START ${t.id} #${created.number}`);
}

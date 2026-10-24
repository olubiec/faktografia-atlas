// Automat prowadzący fale (docs/AUTOMAT.md). Uruchamia go posłaniec co godzinę:
//   node scripts/ops/automat.mjs --apply        – działa
//   node scripts/ops/automat.mjs --dry-run      – tylko wypisuje, co by zrobił
//   node scripts/ops/automat.mjs --apply --only W1.2   – start tylko tego zadania (pilot)
//   node scripts/ops/automat.mjs --repairs      – lista zadań do naprawy (dla Naprawiacza)
// Pierwsze słowo wyniku: NIC · OK · ZGŁOSZENIE · KONIEC · BŁĄD.
import { readFileSync } from 'node:fs';
import { makeGh } from './gh.mjs';
import { gather } from './facts.mjs';
import { taskStatuses } from './plan.mjs';
import { parseMemory, renderMemory, fingerprint } from './state.mjs';
import { runActions } from './actions.mjs';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);

function main() {
  const queue = JSON.parse(readFileSync('scripts/ops/automat-kolejka.json', 'utf8'));
  const dryRun = !flag('--apply');
  const out = [];
  const gh = makeGh({ repo: queue.settings.repo, dryRun, log: (l) => out.push(l) });
  const now = Date.now();

  const facts = gather(gh, queue);
  if (!facts.stateIssue) return 'ZGŁOSZENIE: brak otwartego issue z etykietą automat-stan';
  const stateLabels = facts.stateIssue.labels.map((l) => l.name);
  if (stateLabels.includes('automat-stop')) return 'NIC (zatrzymany etykietą automat-stop)';

  if (flag('--repairs')) {
    const list = facts.issues.filter((i) => i.state === 'open' && i.labels.includes('wymaga-naprawy'));
    return list.length ? list.map((i) => `NAPRAWA #${i.number} ${i.title}`).join('\n') : 'NIC';
  }

  const comments = gh.getAll(`issues/${facts.stateIssue.number}/comments`);
  const stateComment = comments.find((c) => (c.body ?? '').includes('<!-- automat-stan'));
  const memory = parseMemory(stateComment?.body);
  if (memory.lock && now - Date.parse(memory.lock) < queue.settings.lockMin * 60_000) return 'NIC (inny przebieg w toku)';

  const fp = fingerprint([
    facts.mainSha, facts.mainState,
    facts.issues.map((i) => [i.number, i.state, i.labels, i.comments, i.updated_at]),
    facts.openPrs.map((p) => [p.number, p.head.sha, p.updated_at]),
  ]);
  const due = memory.nextCheckAt && now >= Date.parse(memory.nextCheckAt);
  const activeCount = [...taskStatuses(queue, facts.issues, memory).values()].filter((s) => s.status === 'active').length;
  // Przy zadaniach w toku CI na PR-ach może się skończyć bez zmiany odcisku – wtedy sprawdzamy dalej.
  if (fp === memory.fingerprint && !due && activeCount === 0 && !opt('--only')) return 'NIC';

  const saveState = (statuses) => {
    const body = renderMemory(memory, statuses, queue, now);
    if (stateComment) gh.patch(`issues/comments/${stateComment.id}`, { body });
    else gh.post(`issues/${facts.stateIssue.number}/comments`, { body });
  };
  memory.lock = new Date(now).toISOString();
  if (!dryRun) saveState(taskStatuses(queue, facts.issues, memory));

  let result;
  try {
    result = runActions({ gh, queue, facts, memory, now, only: opt('--only'), dryRun });
  } finally {
    memory.lock = null;
    memory.fingerprint = fp;
    const statuses = taskStatuses(queue, facts.issues, memory);
    if (!dryRun) saveState(statuses);
  }
  const lines = [...out];
  if (result.finished) lines.unshift(`KONIEC: wszystkie ${queue.tasks.length} zadania scalone, raport w issue #${facts.stateIssue.number}`);
  else if (result.notices.length) lines.unshift(`ZGŁOSZENIE: ${result.notices.join(' | ')}`);
  else if (result.actions.length) lines.unshift(`OK: ${result.actions.join('; ')}`);
  else lines.unshift('NIC');
  return lines.join('\n');
}

try {
  console.log(main());
} catch (err) {
  console.log(`BŁĄD: ${String(err?.message ?? err).split('\n')[0]}`);
  process.exitCode = 1;
}

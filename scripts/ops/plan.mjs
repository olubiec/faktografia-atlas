// Planowanie automatu – czyste funkcje (testy: tests/unit/ops-plan.test.ts).
// Fale liczone na bieżąco: zależności scalone, pliki rozłączne z zadaniami w toku, najwyżej `waveLookahead` fal do przodu.
import { matchesGlob } from './glob.mjs';

const TITLE = /^\[(W\d+\.\d+)\]/;

export function taskIdFromTitle(title) {
  return TITLE.exec(title ?? '')?.[1] ?? null;
}

/** Czy dwa wzorce ścieżek mogą wskazać ten sam plik. */
export function pathsOverlap(a, b) {
  if (a === b || matchesGlob(a, b) || matchesGlob(b, a)) return true;
  const stem = (p) => p.split('*')[0];
  return (a.includes('*') || b.includes('*')) && (stem(a).startsWith(stem(b)) || stem(b).startsWith(stem(a)));
}

export function taskPaths(task) {
  return [...task.files.map((f) => f.path), ...task.testsAppend, ...task.testsChange, ...task.deletions];
}

export function filesCollide(a, b) {
  return taskPaths(a).some((p) => taskPaths(b).some((q) => pathsOverlap(p, q)));
}

/**
 * Stan zadań z faktów GitHuba.
 * issues: [{ number, title, state, labels: string[] }] (etykieta `zadanie`), memory: stan automatu.
 */
export function taskStatuses(queue, issues, memory) {
  const out = new Map();
  for (const t of queue.tasks) {
    const own = issues.filter((i) => taskIdFromTitle(i.title) === t.id);
    const open = own.find((i) => i.state === 'open');
    const merged = queue.doneBefore.includes(t.id) || Boolean(memory.tasks?.[t.id]?.merged) || own.some((i) => i.labels.includes('scalone'));
    let status = 'todo';
    if (merged) status = 'done';
    else if (open?.labels.includes('wymaga-decyzji')) status = 'decision';
    else if (open?.labels.includes('wymaga-naprawy')) status = 'repair';
    else if (open?.labels.includes('jules')) status = 'active';
    else if (open) status = 'queued';
    else if (own.some((i) => i.labels.includes('wymaga-naprawy'))) status = 'todo';
    out.set(t.id, { status, issue: open?.number ?? null, task: t });
  }
  return out;
}

/** Zadania gotowe do startu w tej kolejności, w jakiej je uruchamiamy. */
export function readyToStart(queue, statuses, { startsLast24h = 0 } = {}) {
  const s = queue.settings;
  const tasks = queue.tasks;
  const isDone = (id) => queue.doneBefore.includes(id) || statuses.get(id)?.status === 'done';
  const unfinished = tasks.filter((t) => !isDone(t.id));
  if (unfinished.length === 0) return [];
  const minWave = Math.min(...unfinished.map((t) => t.wave));
  const busy = tasks.filter((t) => ['active', 'decision', 'repair'].includes(statuses.get(t.id)?.status));
  const slots = Math.min(s.maxParallel - busy.length, s.maxStartsPerRun, s.maxStartsPer24h - startsLast24h);
  const picked = [];
  const ordered = [...unfinished].sort((a, b) => a.wave - b.wave || tasks.indexOf(a) - tasks.indexOf(b));
  for (const t of ordered) {
    if (picked.length >= slots) break;
    const st = statuses.get(t.id)?.status;
    if (st !== 'todo' && st !== 'queued') continue;
    if (t.wave > minWave + s.waveLookahead) continue;
    if (!t.dependsOn.every(isDone)) continue;
    if ([...busy, ...picked].some((o) => filesCollide(o, t))) continue;
    picked.push(t);
  }
  return picked;
}

/** Wycina sekcję zadania z docs/ARCHITEKTURA.md (od nagłówka `#### Wx.y –` do następnego nagłówka). */
export function extractSection(markdown, id) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => l.startsWith(`#### ${id} –`));
  if (start < 0) return null;
  let end = lines.findIndex((l, i) => i > start && /^#{2,4} /.test(l));
  if (end < 0) end = lines.length;
  return lines.slice(start, end).join('\n').trim();
}

export function issueBody(task, section, footerTemplate, commonDone) {
  const files = taskPaths(task).map((p) => `\`${p}\``).join(', ');
  const footer = footerTemplate.replaceAll('{ID}', task.id).replaceAll('{PLIKI}', files);
  const visible = /^W[23]\./.test(task.id);
  return [
    `Zadanie **${task.id}** z \`docs/ARCHITEKTURA.md\` §3 (kopia sekcji z main).`,
    ...(visible ? ['', commonDone] : []),
    '',
    section,
    '',
    footer,
  ].join('\n');
}

/** Treść „Ty sprawdzasz” z sekcji zadania. */
export function ownerCheck(section) {
  const line = (section ?? '').split('\n').find((l) => l.includes('**Ty sprawdzasz'));
  return line ? line.replace(/^- \*\*Ty sprawdzasz[^*]*:\*\*\s*/, '').trim() : '✅';
}

export function checkpointReady(queue, statuses, id) {
  return queue.tasks.filter((t) => t.checkpoint === id).every((t) => statuses.get(t.id)?.status === 'done');
}

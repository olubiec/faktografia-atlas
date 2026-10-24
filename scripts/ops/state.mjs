// Pamięć automatu: jeden komentarz w issue z etykietą `automat-stan` (JSON w komentarzu HTML + tabela dla ludzi).
// Fakty (issue, PR, CI) zawsze czytamy z GitHuba; tu tylko liczniki, czasy i ślad scaleń.
import { createHash } from 'node:crypto';

const MARK = /<!-- automat-stan ([\s\S]*?) -->/;
const STAN_START = '<!-- automat:start -->';
const STAN_END = '<!-- automat:end -->';

export function emptyMemory() {
  return { v: 1, lock: null, fingerprint: null, nextCheckAt: null, tasks: {}, merges: [], starts: [], checkpointsDone: [], reverts: [], events: [], stanPr: null, revertPr: null };
}

export function parseMemory(body) {
  const m = MARK.exec(body ?? '');
  if (!m) return emptyMemory();
  try {
    return { ...emptyMemory(), ...JSON.parse(m[1].replaceAll('-\\->', '-->')) };
  } catch {
    return emptyMemory();
  }
}

export function taskMemory(memory, id) {
  memory.tasks[id] ??= { fixes: 0, prs: [], labeledAt: null, relabeledAt: null, lastFixSha: null, lastFixAt: null, snapshotsUsed: false, merged: null };
  return memory.tasks[id];
}

export function logEvent(memory, now, text) {
  memory.events.unshift(`${new Date(now).toISOString().slice(0, 16).replace('T', ' ')} ${text}`);
  memory.events = memory.events.slice(0, 25);
}

export function startsLast24h(memory, now) {
  memory.starts = memory.starts.filter((t) => now - Date.parse(t) < 24 * 3600_000);
  return memory.starts.length;
}

export function fingerprint(parts) {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex').slice(0, 16);
}

const LABEL = { done: 'scalone', active: 'u Julesa', queued: 'czeka na start', decision: 'WYMAGA DECYZJI', repair: 'do naprawy', todo: '–' };

export function renderMemory(memory, statuses, queue, now) {
  const rows = queue.tasks.map((t) => {
    const s = statuses.get(t.id);
    const m = memory.tasks[t.id] ?? {};
    const pr = m.merged ?? m.prs?.at(-1);
    return `| ${t.id} | F${t.wave} | ${LABEL[s?.status] ?? '–'} | ${s?.issue ? `#${s.issue}` : ''} | ${pr ? `#${pr}` : ''} | ${m.fixes ?? 0} |`;
  });
  const done = queue.tasks.filter((t) => statuses.get(t.id)?.status === 'done').length;
  const json = JSON.stringify(memory).replaceAll('-->', '-\\->');
  return [
    `### Automat – stan (${new Date(now).toISOString().slice(0, 16).replace('T', ' ')} UTC)`,
    `Zrobione: **${done} / ${queue.tasks.length}** · punkty kontrolne: ${memory.checkpointsDone.join(', ') || 'brak'}`,
    'Zatrzymanie: dodaj etykietę `automat-stop` do tego issue. Wznowienie: zdejmij ją.',
    '',
    '| Zadanie | Fala | Stan | Issue | PR | Poprawki |',
    '|---|---|---|---|---|---|',
    ...rows,
    '',
    '<details><summary>Ostatnie zdarzenia</summary>',
    '',
    ...memory.events.map((e) => `- ${e}`),
    '</details>',
    '',
    `<!-- automat-stan ${json} -->`,
  ].join('\n');
}

/** Podmienia blok automatu w docs/STAN.md (między znacznikami). */
export function updateStanBlock(stan, block) {
  const a = stan.indexOf(STAN_START);
  const b = stan.indexOf(STAN_END);
  if (a < 0 || b < a) throw new Error('docs/STAN.md nie ma znaczników bloku automatu');
  return `${stan.slice(0, a + STAN_START.length)}\n${block.trim()}\n${stan.slice(b)}`;
}

export function stanBlock(queue, statuses, memory, now) {
  const date = new Date(now).toISOString().slice(0, 10);
  const lines = [`Aktualizacja automatu ${date}. Zrobione ${queue.tasks.filter((t) => statuses.get(t.id)?.status === 'done').length} z ${queue.tasks.length} zadań.`];
  for (const k of queue.checkpoints) {
    const tasks = queue.tasks.filter((t) => t.checkpoint === k.id);
    const items = tasks.map((t) => {
      const m = memory.tasks[t.id] ?? {};
      const st = statuses.get(t.id)?.status;
      return st === 'done' ? `${t.id}${m.merged ? ` (#${m.merged})` : ''}` : `${t.id} – ${LABEL[st] ?? 'czeka'}`;
    });
    const mark = memory.checkpointsDone.includes(k.id) ? 'zamknięty' : 'w toku';
    lines.push(`- **${k.id} ${k.name}** (${mark}): ${items.join(' · ')}`);
  }
  const blocked = queue.tasks.filter((t) => statuses.get(t.id)?.status === 'decision');
  if (blocked.length) lines.push(`- Czeka na Twoją decyzję: ${blocked.map((t) => `${t.id} (#${statuses.get(t.id).issue})`).join(', ')}`);
  return lines.join('\n');
}

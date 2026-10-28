// Pliki fali dla Jules Loop: z kolejki (automat-kolejka.json) i sekcji zadań (ARCHITEKTURA.md §3) powstają
// pliki `tasks/W<fala>-<id>-<nazwa>.md` w formacie pętli (Zmieniaj / Wymagane / Weryfikacja). Bez tokenów, bez sieci.
//
//   node scripts/ops/wave-files.mjs --list              – fale i zadania z kolejki
//   node scripts/ops/wave-files.mjs F10                 – zapisuje do tasks/poczekalnia/ (pętla ich NIE widzi)
//   node scripts/ops/wave-files.mjs F10 --launch        – zapisuje do tasks/ (push na main = start fali)
//
// Nazwa: W<n> w pliku = numer fali pętli = numer fali F<n> (F10 → W10); id zadania bez kropki (W2.24 → W224).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { extractSection, filesCollide, taskPaths } from './plan.mjs';

export const fileId = (id) => id.replaceAll('.', '');

export function slug(title) {
  const map = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };
  return title.toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => map[c])
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '');
}

export const taskFileName = (task) => `W${task.wave}-${fileId(task.id)}-${slug(task.title)}.md`;
export const loopId = (task) => `W${task.wave}-${fileId(task.id)}`;

const VERIFY = 'pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e';

/** Treść pliku zadania. `common` = wspólne „Gotowe, gdy” (tylko W2/W3), `footer` = scripts/jules-loop/dopisek.md. */
export function taskFileBody(task, section, common, footer) {
  const body = section.split('\n').slice(1).join('\n').trim();
  const cel = /^- \*\*Po ludzku:\*\*\s*(.+)$/m.exec(section)?.[1] ?? task.title;
  const required = task.files.filter((f) => f.mode === 'new' && f.path.startsWith('tests/')).map((f) => f.path);
  const partial = task.files.filter((f) => f.mode === 'partial').map((f) => `${f.path} – najwyżej ${f.maxLines} linii zmiany`);
  const lines = [
    `# ${task.id} – ${task.title}`,
    `Cel: ${cel}`,
    `Zmieniaj: ${taskPaths(task).join(', ')}`,
    ...(required.length ? [`Wymagane: ${required.join(', ')}`] : []),
    `Weryfikacja: ${VERIFY}`,
    ...(partial.length ? [`Limity zmian w plikach wspólnych: ${partial.join('; ')}`] : []),
    ...(task.snapshots ? ['Zrzuty: zadanie zmienia wzorce zrzutów; nie generuj ich u siebie, napisz w PR, że trzeba uruchomić „Update snapshots”.'] : []),
    '',
    ...(/^W[23]\./.test(task.id) && common ? [common, ''] : []),
    `Zadanie ${task.id} z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):`,
    '',
    body,
    '',
    '## Zasady pętli',
    footer.replaceAll('{ID}', loopId(task)).trim(),
    '',
  ];
  return lines.join('\n');
}

/** Problemy fali: zależność w tej samej lub późniejszej fali, kolizja plików. */
export function waveProblems(queue, wave) {
  const tasks = queue.tasks.filter((t) => t.wave === wave);
  const problems = [];
  if (!tasks.length) problems.push(`Fala F${wave}: brak zadań w kolejce`);
  for (const t of tasks) {
    for (const d of t.dependsOn) {
      const dep = queue.tasks.find((x) => x.id === d);
      if (dep && dep.wave >= wave && !queue.doneBefore.includes(d)) problems.push(`${t.id} zależy od ${d} z fali F${dep.wave} (zależność musi być w wcześniejszej fali)`);
      if (!dep && !queue.doneBefore.includes(d)) problems.push(`${t.id} zależy od nieznanego ${d}`);
    }
    for (const o of tasks) if (o.id < t.id && filesCollide(o, t)) problems.push(`Kolizja plików: ${o.id} i ${t.id}`);
  }
  return problems;
}

export function waveFiles(queue, arch, footer, wave) {
  const common = arch.split('\n').find((l) => l.startsWith('Wspólne „Gotowe, gdy”')) ?? '';
  const out = [];
  for (const t of queue.tasks.filter((x) => x.wave === wave)) {
    const section = extractSection(arch, t.id);
    if (!section) throw new Error(`Brak sekcji ${t.id} w ARCHITEKTURA.md`);
    out.push({ name: taskFileName(t), text: taskFileBody(t, section, common, footer), id: t.id });
  }
  return out;
}

function main(args) {
  const queue = JSON.parse(readFileSync('scripts/ops/automat-kolejka.json', 'utf8'));
  if (args.includes('--list')) {
    for (const w of [...new Set(queue.tasks.map((t) => t.wave))].sort((a, b) => a - b)) {
      console.log(`F${w}: ${queue.tasks.filter((t) => t.wave === w).map((t) => t.id).join(' ')}`);
    }
    return 0;
  }
  const wave = Number(/^F(\d+)$/.exec(args.find((a) => /^F\d+$/.test(a)) ?? '')?.[1]);
  if (!wave) { console.error('Użycie: node scripts/ops/wave-files.mjs F<n> [--launch] | --list'); return 2; }
  const problems = waveProblems(queue, wave);
  if (problems.length) { console.error(`Fala F${wave} odrzucona:\n - ${problems.join('\n - ')}`); return 1; }
  const files = waveFiles(queue, readFileSync(queue.settings.architecture, 'utf8'), readFileSync('scripts/jules-loop/dopisek.md', 'utf8'), wave);
  const dir = args.includes('--launch') ? 'tasks' : 'tasks/poczekalnia';
  mkdirSync(dir, { recursive: true });
  for (const f of files) { writeFileSync(`${dir}/${f.name}`, f.text); console.log(`${dir}/${f.name}`); }
  console.log(args.includes('--launch')
    ? `Zapisano ${files.length} plików do tasks/. Start fali = commit i push na main (workflow „Jules Loop”).`
    : `Zapisano ${files.length} plików do tasks/poczekalnia/ (pętla ich nie widzi). Start: git mv tasks/poczekalnia/W${wave}-*.md tasks/ → commit → push na main.`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));

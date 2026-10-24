// Zbieranie faktów z GitHuba (tylko odczyt) dla jednego przebiegu automatu.

const JULES = 'google-labs-jules[bot]';

export function checksState(runs, required) {
  const present = required.filter((n) => runs.some((r) => r.name === n));
  if (present.length < Math.min(2, required.length)) return 'pending';
  const relevant = runs.filter((r) => present.includes(r.name));
  if (relevant.some((r) => r.status === 'completed' && !['success', 'neutral', 'skipped'].includes(r.conclusion))) return 'red';
  if (relevant.some((r) => r.status !== 'completed')) return 'pending';
  return 'green';
}

function compactRuns(res) {
  return (res.check_runs ?? []).map((r) => ({ id: r.id, name: r.name, status: r.status, conclusion: r.conclusion }));
}

export function prData(gh, number) {
  const pr = gh.get(`pulls/${number}`);
  return {
    pr: {
      number: pr.number, state: pr.state, draft: pr.draft, merged: pr.merged, title: pr.title, body: pr.body ?? '',
      mergeable: pr.mergeable, created_at: pr.created_at,
      base: { ref: pr.base.ref }, head: { ref: pr.head.ref, sha: pr.head.sha, repo: { full_name: pr.head.repo?.full_name ?? null } },
    },
    files: gh.getAll(`pulls/${number}/files`).map((f) => ({ filename: f.filename, status: f.status, additions: f.additions, deletions: f.deletions, patch: f.patch, previous_filename: f.previous_filename })),
    commits: gh.getAll(`pulls/${number}/commits`).map((c) => ({ sha: c.sha, author: { login: c.author?.login ?? null }, commit: { author: { date: c.commit.author.date } } })),
    checkRuns: compactRuns(gh.get(`commits/${pr.head.sha}/check-runs?per_page=100`)),
  };
}

/** Numer PR-a zadania: komentarz Julesa w issue albo `#<issue>` / `Wx.y` w PR. */
export function findTaskPr(openPrs, issueNumber, taskId, julesComments) {
  const ref = new RegExp(`#${issueNumber}\\b`);
  const byBody = openPrs.filter((p) => ref.test(p.body ?? '') || (p.title ?? '').replace(/^\[/, '').startsWith(`${taskId} `));
  const fromComments = julesComments.map((c) => /\/pull\/(\d+)/.exec(c.body ?? '')?.[1]).filter(Boolean).map(Number);
  const candidates = [...byBody.map((p) => p.number), ...fromComments.filter((n) => openPrs.some((p) => p.number === n))];
  return candidates.length ? Math.max(...candidates) : null;
}

export function gather(gh, queue) {
  const req = queue.settings.requiredChecks;
  const stateIssues = gh.get('issues?labels=automat-stan&state=open');
  const issues = gh.getAll('issues?labels=zadanie&state=all').filter((i) => !i.pull_request).map((i) => ({
    number: i.number, title: i.title, state: i.state, labels: i.labels.map((l) => l.name), updated_at: i.updated_at, comments: i.comments,
  }));
  const openPrs = gh.getAll('pulls?state=open').map((p) => ({ number: p.number, title: p.title, body: p.body ?? '', head: { sha: p.head.sha, ref: p.head.ref }, updated_at: p.updated_at, user: p.user?.login }));
  const mainSha = gh.get('commits/main').sha;
  const mainRuns = compactRuns(gh.get(`commits/${mainSha}/check-runs?per_page=100`));
  return { stateIssue: stateIssues[0] ?? null, issues, openPrs, mainSha, mainRuns, mainState: checksState(mainRuns, req) };
}

export function julesComments(gh, issueNumber) {
  return gh.getAll(`issues/${issueNumber}/comments`).filter((c) => c.user?.login === JULES).map((c) => ({ body: c.body, created_at: c.created_at }));
}

/** Czy czerwone CI to wyłącznie różnica zrzutów (adnotacje checka „testy”). */
export function onlySnapshotFailure(gh, runs) {
  const failed = runs.filter((r) => r.name === 'testy' && r.conclusion === 'failure');
  if (failed.length === 0) return false;
  const notes = failed.flatMap((r) => gh.get(`check-runs/${r.id}/annotations`));
  const errors = notes.filter((n) => n.annotation_level === 'failure');
  return errors.length > 0 && errors.every((n) => /design\.spec\.ts|toHaveScreenshot|screenshot/i.test(`${n.path} ${n.message}`));
}

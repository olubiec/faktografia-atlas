// Operacje git automatu: tylko nowe gałęzie `automat/*` (bez --force, bez zmian main).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const ID = ['-c', 'user.name=Automat Faktografia', '-c', 'user.email=automat@users.noreply.github.com'];

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function onFreshBranch(branch, work) {
  const back = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  git(['fetch', '--quiet', 'origin', 'main', '--depth=100']);
  git(['checkout', '--quiet', '-B', branch, 'origin/main']);
  try {
    work();
    git(['push', '--quiet', 'origin', `HEAD:refs/heads/${branch}`]);
  } finally {
    git(['checkout', '--quiet', back]);
  }
}

/** Gałąź z nową treścią pliku (np. docs/STAN.md). */
export function branchWithFile(branch, path, transform, message) {
  onFreshBranch(branch, () => {
    const before = readFileSync(path, 'utf8');
    const after = transform(before);
    if (after === before) throw new Error(`Brak zmian w ${path}`);
    writeFileSync(path, after);
    git(['add', path]);
    git([...ID, 'commit', '--quiet', '-m', message]);
  });
}

/** Gałąź z wycofaniem jednego commita z main. */
export function branchWithRevert(branch, sha, message) {
  onFreshBranch(branch, () => {
    git([...ID, 'revert', '--no-edit', sha]);
    git([...ID, 'commit', '--quiet', '--amend', '-m', message]);
  });
}

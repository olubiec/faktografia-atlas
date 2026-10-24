// Jedyne miejsce, gdzie automat rozmawia z GitHubem: `gh api` (REST), z listą dozwolonych zapisów.
// GraphQL jest zablokowany w środowisku sesji, więc go nie używamy (bez `gh pr merge`, `gh pr checks`).
import { execFileSync } from 'node:child_process';

const WRITE_ALLOW = [
  ['POST', /^issues$/],
  ['POST', /^issues\/\d+\/comments$/],
  ['POST', /^issues\/\d+\/labels$/],
  ['DELETE', /^issues\/\d+\/labels\/[^/]+$/],
  ['PATCH', /^issues\/\d+$/],
  ['PATCH', /^issues\/comments\/\d+$/],
  ['PATCH', /^pulls\/\d+$/],
  ['POST', /^pulls$/],
  ['PUT', /^pulls\/\d+\/merge$/],
];

export function makeGh({ repo, dryRun = false, log = () => {} }) {
  const base = `repos/${repo}`;
  function call(method, path, body) {
    if (method !== 'GET') {
      if (!WRITE_ALLOW.some(([m, re]) => m === method && re.test(path))) throw new Error(`Zapis niedozwolony: ${method} ${path}`);
      if (dryRun) {
        log(`[na sucho] ${method} ${path}${body ? ` ${JSON.stringify(body).slice(0, 160)}` : ''}`);
        return {};
      }
    }
    const args = ['api', '-X', method, `${base}/${path}`, '-H', 'Accept: application/vnd.github+json'];
    if (body) args.push('--input', '-');
    const out = execFileSync('gh', args, { input: body ? JSON.stringify(body) : undefined, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return out.trim() ? JSON.parse(out) : {};
  }
  return {
    get: (path) => call('GET', path),
    /** Wszystkie strony listy (per_page=100). */
    getAll(path, key) {
      const out = [];
      for (let page = 1; page <= 30; page++) {
        const sep = path.includes('?') ? '&' : '?';
        const res = call('GET', `${path}${sep}per_page=100&page=${page}`);
        const items = key ? res[key] : res;
        out.push(...items);
        if (items.length < 100) break;
      }
      return out;
    },
    post: (path, body) => call('POST', path, body),
    patch: (path, body) => call('PATCH', path, body),
    put: (path, body) => call('PUT', path, body),
    del: (path) => call('DELETE', path),
  };
}

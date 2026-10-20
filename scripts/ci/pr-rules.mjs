/**
 * PR Rules enforcement logic for Faktografia Atlas CI
 */

/**
 * Finds task ID (CC<number>(.<part>)*) from PR input.
 * Priority:
 * 1. linkedIssue title if PR body has Fixes|Closes|Resolves|Zamyka #N
 * 2. "Zadanie: <ID>" line in PR body
 * 3. Anywhere in PR title
 */
export function findTaskId(input) {
  if (!input) return null;

  const fixesRegex = /\b(?:Fixes|Closes|Resolves|Zamyka)\s+#\d+\b/i;
  if (input.body && fixesRegex.test(input.body) && input.linkedIssue?.title) {
    const match = input.linkedIssue.title.match(/\bCC\d+(?:\.[a-zA-Z0-9]+)*\b/i);
    if (match) return match[0];
  }

  if (input.body) {
    const taskLineMatch = input.body.match(/Zadanie:\s*(CC\d+(?:\.[a-zA-Z0-9]+)*)/i);
    if (taskLineMatch) return taskLineMatch[1];
  }

  if (input.title) {
    const titleMatch = input.title.match(/\bCC\d+(?:\.[a-zA-Z0-9]+)*\b/i);
    if (titleMatch) return titleMatch[0];
  }

  return null;
}

/**
 * Parses path patterns in backticks under "Zakres" heading in issue body.
 */
export function parseScope(issueBody) {
  if (!issueBody || typeof issueBody !== 'string') return [];

  const zakresIndex = issueBody.search(/\bZakres\b/i);
  if (zakresIndex === -1) return [];

  const afterZakres = issueBody.slice(zakresIndex);
  const sectionSplit = afterZakres.split(/\n\s*(?:###?|Warunki|Poza|Cel|Kontekst|Wejście|Wymaga|Zasady)\b/i);
  const scopeText = sectionSplit[0] || '';

  const backtickMatches = scopeText.match(/`([^`]+)`/g) || [];

  const allowedPaths = [];
  for (const raw of backtickMatches) {
    const content = raw.slice(1, -1).trim();
    if (content.includes('(') || content.includes(')') || content.includes(' ')) {
      continue;
    }
    if (content.includes('/') || content.includes('.') || content.endsWith('/')) {
      allowedPaths.push(content);
    }
  }

  return allowedPaths;
}

/**
 * Custom glob matching supporting **, *, and trailing / for directories.
 */
export function matchGlob(pattern, path) {
  if (!pattern || !path) return false;

  let normPath = path.replace(/^\//, '');
  let normPattern = pattern.replace(/^\//, '');

  let basePattern = normPattern;
  let isDirectory = false;
  if (basePattern.endsWith('/')) {
    isDirectory = true;
    basePattern = basePattern.slice(0, -1);
  }

  const hasSlash = basePattern.includes('/');

  let p = normPattern;
  if (isDirectory) {
    p = basePattern + '/**';
  }

  if (!hasSlash && !p.startsWith('**')) {
    p = '**/' + p;
  }

  const regexStr = p
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '___DOUBLESTAR_SLASH___')
    .replace(/\*\*/g, '___DOUBLESTAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___DOUBLESTAR_SLASH___/g, '(?:^|.*/)')
    .replace(/___DOUBLESTAR___/g, '.*');

  const regex = new RegExp(`^${regexStr}$`);
  return regex.test(normPath);
}

/**
 * Validates PR against rules: task ID, scope, zapalne, new dependencies.
 */
export function checkPr(input) {
  const errors = [];
  const warnings = [];

  const labels = input?.labels || [];
  const isChecked = labels.includes('sprawdzone');
  const isNewDepAllowed = labels.includes('nowa-zaleznosc');

  // 1. Task ID check
  const taskId = findTaskId(input);
  if (!taskId && !isChecked) {
    errors.push('Brak ID zadania. Dodaj w opisie PR linię Fixes #<numer issue> albo Zadanie: CCx.y (AGENTS.md, sekcja „Pull request”).');
  }

  // 2. Scope check
  const issueBody = input?.linkedIssue?.body || (input?.body?.includes('Zakres') ? input.body : '');
  const scope = parseScope(issueBody);
  const files = input?.files || [];

  for (const file of files) {
    const filename = file.filename;
    const isRemoved = file.status === 'removed' || file.status === 'deleted';

    const isSnapshot = matchGlob('*-snapshots/', filename) || filename.includes('-snapshots/');
    if (isSnapshot) {
      warnings.push(`PR zmienia zrzuty wzorcowe: ${filename}`);
      continue;
    }

    const isSessionDoc = taskId
      ? filename === `docs/sessions/${taskId}.md` || matchGlob('docs/sessions/*.md', filename)
      : matchGlob('docs/sessions/*.md', filename);

    if (isSessionDoc) {
      continue;
    }

    if (isRemoved) {
      if (!isChecked) {
        errors.push(`Plik usunięty z repozytorium: ${filename}`);
      }
      continue;
    }

    let inScope = false;
    for (const pattern of scope) {
      if (matchGlob(pattern, filename)) {
        inScope = true;
        break;
      }
    }

    if (!inScope && !isChecked) {
      errors.push(`Plik poza zakresem: ${filename}`);
    }
  }

  // 3. Zapalne files check
  const zapalnePatterns = input?.zapalne || [];
  if (!isChecked) {
    for (const file of files) {
      for (const pattern of zapalnePatterns) {
        if (matchGlob(pattern, file.filename)) {
          errors.push(`PR zmienia plik zapalny ${file.filename}. Potrzebny przegląd Sonneta; po przeglądzie dostanie etykietę sprawdzone.`);
          break;
        }
      }
    }
  }

  // 4. New dependencies check
  if (input?.packageJson && !isNewDepAllowed) {
    try {
      const baseObj = typeof input.packageJson.base === 'string' ? JSON.parse(input.packageJson.base) : input.packageJson.base;
      const headObj = typeof input.packageJson.head === 'string' ? JSON.parse(input.packageJson.head) : input.packageJson.head;

      if (baseObj && headObj) {
        const baseDeps = { ...(baseObj.dependencies || {}), ...(baseObj.devDependencies || {}) };
        const headDeps = { ...(headObj.dependencies || {}), ...(headObj.devDependencies || {}) };

        for (const pkg of Object.keys(headDeps)) {
          if (!(pkg in baseDeps)) {
            errors.push(`Nowa zależność '${pkg}' w package.json bez etykiety nowa-zaleznosc.`);
          }
        }
      }
    } catch {
      // Ignore JSON parsing errors
    }
  }

  return {
    ok: errors.length === 0,
    taskId,
    errors,
    warnings
  };
}

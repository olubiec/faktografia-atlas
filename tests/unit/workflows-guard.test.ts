import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Strażnik konfiguracji robotów danych (tylko odczyt plików workflowów).
// Parsera YAML nie dodajemy (bez nowych pakietów), więc sprawdzamy tekst plików wyrażeniami regularnymi.

const FETCH_DATA = '.github/workflows/fetch-data.yml';
const FETCH_LIBRARY = '.github/workflows/fetch-library.yml';

function read(file: string): string {
  return fs.readFileSync(path.resolve(file), 'utf-8');
}

/** Usuwa komentarze całych linii, żeby opis w komentarzu nie udawał prawdziwego ustawienia. */
function withoutComments(text: string): string {
  return text
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n');
}

/** Komunikat porażki po polsku: nazwa pliku i brakujący niezmiennik. */
function failureMessage(file: string, invariant: string): string {
  return `${file}: brakuje niezmiennika „${invariant}”`;
}

/** Zbiera niezmienniki, które nie zachodzą; test kończy `expect(problems).toEqual([])` z czytelną listą. */
function createChecker() {
  const problems: string[] = [];
  const must = (file: string, invariant: string, ok: boolean) => {
    if (!ok) problems.push(failureMessage(file, invariant));
  };
  return { problems, must };
}

const dataYml = withoutComments(read(FETCH_DATA));
const libraryYml = withoutComments(read(FETCH_LIBRARY));

describe('Strażnik workflowów danych', () => {
  it('fetch-data.yml ma harmonogram (cron) i grupę kolejki fetch-data', () => {
    const { problems, must } = createChecker();
    must(FETCH_DATA, 'schedule z cron', /schedule:\s*\n\s*-\s*cron:\s*'[^']+'/.test(dataYml));
    must(
      FETCH_DATA,
      'concurrency.group: fetch-data',
      /concurrency:\s*\n\s*group:\s*fetch-data\s*\n/.test(dataYml)
    );
    // Nocny robot ma startować o godzinie 1 UTC. GitHub potrafi opóźnić start nawet o kilka godzin,
    // więc test pilnuje ustawienia, a nie rzeczywistej godziny przebiegu.
    const cron = dataYml.match(/cron:\s*'([^']+)'/)?.[1] ?? '';
    const hour = cron.split(/\s+/)[1];
    must(FETCH_DATA, 'cron nocny z godziną 1 UTC', hour === '1');
    expect(problems).toEqual([]);
  });

  it('fetch-library.yml ma harmonogram (cron) i TĘ SAMĄ grupę kolejki co fetch-data.yml', () => {
    const { problems, must } = createChecker();
    must(FETCH_LIBRARY, 'schedule z cron', /schedule:\s*\n\s*-\s*cron:\s*'[^']+'/.test(libraryYml));
    const groupData = dataYml.match(/concurrency:\s*\n\s*group:\s*(\S+)/)?.[1];
    const groupLibrary = libraryYml.match(/concurrency:\s*\n\s*group:\s*(\S+)/)?.[1];
    must(FETCH_LIBRARY, 'concurrency.group: fetch-data', groupLibrary === 'fetch-data');
    must(FETCH_LIBRARY, 'ta sama grupa kolejki co fetch-data.yml', groupLibrary === groupData);
    must(
      FETCH_LIBRARY,
      'cancel-in-progress: false (przebieg w toku nie jest przerywany)',
      /cancel-in-progress:\s*false/.test(libraryYml)
    );
    expect(problems).toEqual([]);
  });

  it('żaden z workflowów nie wypycha na main; dane idą na data/nightly i data/library', () => {
    const { problems, must } = createChecker();
    for (const [file, text] of [
      [FETCH_DATA, dataYml],
      [FETCH_LIBRARY, libraryYml],
    ] as const) {
      must(file, 'brak HEAD:refs/heads/main', !/HEAD:refs\/heads\/main\b/.test(text));
      must(file, 'brak git push origin main', !/git\s+push[^\n]*\borigin\s+main\b/.test(text));
    }
    // fetch-data.yml: gałąź domyślna to data/nightly, a krok odmawia zapisu na main
    must(FETCH_DATA, 'domyślna gałąź data/nightly', /\|\|\s*'data\/nightly'/.test(dataYml));
    must(
      FETCH_DATA,
      'krok odmawiający zapisu na main',
      /\[\s*"\$BRANCH"\s*=\s*"main"\s*\][\s\S]{0,200}exit 1/.test(dataYml)
    );
    must(FETCH_DATA, 'push tylko na "$BRANCH"', /HEAD:refs\/heads\/\$BRANCH/.test(dataYml));
    must(
      FETCH_DATA,
      'PR otwierany z gałęzi roboczej do main (head=$BRANCH, base=main)',
      /-f head="\$BRANCH" -f base=main/.test(dataYml)
    );
    // fetch-library.yml: zapis tylko na data/library, przez krok library-available.mjs
    must(FETCH_LIBRARY, 'BRANCH: data/library', /BRANCH:\s*data\/library/.test(libraryYml));
    must(FETCH_LIBRARY, 'push na "$BRANCH"', /HEAD:refs\/heads\/\$BRANCH/.test(libraryYml));
    must(FETCH_LIBRARY, 'krok library-available.mjs', /library-available\.mjs/.test(libraryYml));
    expect(problems).toEqual([]);
  });

  it('fetch-data.yml zgłasza błąd nocnego pobierania (nie przy ręcznym uruchomieniu)', () => {
    const { problems, must } = createChecker();
    must(
      FETCH_DATA,
      "krok zgłoszenia błędu z warunkiem failure() && github.event_name != 'workflow_dispatch'",
      /if:\s*failure\(\)\s*&&\s*github\.event_name\s*!=\s*'workflow_dispatch'/.test(dataYml)
    );
    must(FETCH_DATA, 'zgłoszenie tworzy issue (repos/.../issues)', /issues"\s+-f title=/.test(dataYml));
    must(FETCH_DATA, 'uprawnienie issues: write', /issues:\s*write/.test(dataYml));
    expect(problems).toEqual([]);
  });

  it('BDL_CLIENT_ID pochodzi tylko z secrets, a w plikach nie ma stałych tokenów', () => {
    const problems: string[] = [];
    for (const [file, text] of [
      [FETCH_DATA, dataYml],
      [FETCH_LIBRARY, libraryYml],
    ] as const) {
      const assignments = [...text.matchAll(/BDL_CLIENT_ID:\s*(.+)/g)].map((m) => m[1].trim());
      if (assignments.length === 0) problems.push(failureMessage(file, 'zmienna BDL_CLIENT_ID jest ustawiana'));
      for (const value of assignments) {
        if (!/^\$\{\{\s*secrets\.BDL_CLIENT_ID\s*\}\}$/.test(value)) {
          problems.push(failureMessage(file, `BDL_CLIENT_ID tylko z \${{ secrets.* }} (znaleziono: ${value})`));
        }
      }
      if (/BDL_CLIENT_ID:\s*[A-Za-z0-9-]{8,}\s*$/m.test(text)) {
        problems.push(failureMessage(file, 'brak literalnego BDL_CLIENT_ID: <ciąg znaków>'));
      }
      if (/ghp_[A-Za-z0-9]{10,}/.test(text)) problems.push(failureMessage(file, 'brak tokenu ghp_'));
      if (/github_pat_[A-Za-z0-9_]{10,}/.test(text)) problems.push(failureMessage(file, 'brak tokenu github_pat_'));
    }
    expect(problems).toEqual([]);
  });

  it('komunikat porażki wskazuje plik i brakujący niezmiennik (po polsku)', () => {
    const { problems, must } = createChecker();
    must(FETCH_DATA, 'nieistniejący niezmiennik', false);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain(FETCH_DATA);
    expect(problems[0]).toContain('brakuje niezmiennika');
    expect(problems[0]).toContain('nieistniejący niezmiennik');
  });
});

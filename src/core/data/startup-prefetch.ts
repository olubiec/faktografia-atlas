import { loadUnits, loadAdminTopo } from './load-atlas-data';
import { loadProfileShard } from './load-profile';

type Loaders = {
  loadUnits: () => Promise<unknown>;
  loadAdminTopo: () => Promise<unknown>;
  loadProfileShard: (woj: string) => Promise<unknown>;
};

const defaultDeps: Loaders = { loadUnits, loadAdminTopo, loadProfileShard };

/**
 * Wczesne pobranie danych mapy i profilu przy wejściu z linku, równolegle z kodem mapy.
 * Loadery mają pamięć i łączą wywołania, więc późniejsze wywołanie z widoku nie doda żądań.
 * Błędy są ciche – obsłuży je widok przy właściwym wywołaniu.
 * Zwraca nazwy wywołanych loaderów (dla testów).
 */
export function startupPrefetch(
  loc: { pathname: string; search: string },
  deps: Loaders = defaultDeps,
): string[] {
  if (loc.pathname !== '/') return [];
  const called: string[] = [];
  const run = (name: string, p: () => Promise<unknown>) => {
    called.push(name);
    try {
      p().catch(() => {});
    } catch {
      /* loader rzucił synchronicznie – widok obsłuży błąd sam */
    }
  };
  run('loadUnits', () => deps.loadUnits());
  run('loadAdminTopo', () => deps.loadAdminTopo());

  const u = new URLSearchParams(loc.search).get('u');
  if (u && /^\d+$/.test(u) && [2, 4, 7].includes(u.length)) {
    const woj = u.slice(0, 2);
    const n = Number(woj);
    if (n >= 2 && n <= 32 && n % 2 === 0) run('loadProfileShard', () => deps.loadProfileShard(woj));
  }
  return called;
}

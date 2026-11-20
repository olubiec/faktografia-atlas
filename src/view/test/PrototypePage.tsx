import { lazy, Suspense, type ComponentType, type ReactElement } from 'react';
import { Link, useParams } from 'react-router';

// Prototypy z badań (etap R planu uproszczenia). Każdy plik src/view/test/proto/<nazwa>.tsx
// z eksportem domyślnym jest dostępny pod /__test/proto/<nazwa> – zadania nie muszą zmieniać App.tsx.
const modules = import.meta.glob<{ default: ComponentType }>('./proto/*.tsx');

function nameOf(path: string): string {
  return path.replace('./proto/', '').replace('.tsx', '');
}

function lazyElement(loader: () => Promise<{ default: ComponentType }>): ReactElement {
  const Proto = lazy(loader);
  return (
    <Suspense fallback={<p className="p-4">Ładowanie…</p>}>
      <Proto />
    </Suspense>
  );
}

// Elementy tworzone raz, przy wczytaniu modułu (nie w trakcie renderu).
const prototypes = new Map<string, ReactElement>(
  Object.entries(modules).map(([path, loader]) => [nameOf(path), lazyElement(loader)]),
);
const prototypeNames = [...prototypes.keys()].sort();

export function PrototypePage() {
  const { name = '' } = useParams();
  const element = prototypes.get(name);
  if (element) return element;
  return (
    <main className="p-4">
      <h1 className="text-xl">Prototypy</h1>
      {prototypeNames.length === 0 ? (
        <p>Brak prototypów.</p>
      ) : (
        <ul>
          {prototypeNames.map((n) => (
            <li key={n}>
              <Link to={`/__test/proto/${n}`}>{n}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

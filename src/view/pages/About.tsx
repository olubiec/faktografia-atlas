import { useState, useSyncExternalStore } from 'react';
import { Header } from '../Header';
import { Link } from 'react-router';
import tokens from '../../../config/tokens.json';

function subscribeSystemTheme(callback: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getSystemIsDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function About() {
  const systemIsDark = useSyncExternalStore(subscribeSystemTheme, getSystemIsDark, () => false);
  const [theme] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('faktografia-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'system';
  });

  const isDark = theme === 'dark' || (theme === 'system' && systemIsDark);
  const logoSrc = isDark
    ? '/brand/faktografia-znak-jasny.svg'
    : '/brand/faktografia-znak-granat.svg';

  const seqColors = isDark ? tokens.data.sequential.dark : tokens.data.sequential.light;
  const divColors = isDark ? tokens.data.diverging.dark : tokens.data.diverging.light;

  return (
    <div className="min-h-screen flex flex-col bg-kalka text-tusz">
      <Header />
      <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
        <article className="max-w-[70ch] space-y-12">
          <header className="flex flex-col gap-8 pb-4">
            <img
              src={logoSrc}
              alt="Znak Faktografii"
              className="h-[128px] w-auto self-start"
            />
            <h1 className="text-4xl font-[800] leading-[1.05] tracking-[-0.02em]">
              O projekcie
            </h1>
            <p className="text-base font-[400] leading-[1.6]">
              Faktografia Atlas to interaktywna mapa Polski przedstawiająca dane statystyczne
              z Banku Danych Lokalnych Głównego Urzędu Statystycznego.
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-[700] leading-[1.3]">
              Atlas w liczbach
            </h2>
            <ul className="grid grid-cols-2 gap-4 font-mono text-sm">
              <li className="flex flex-col p-4 border border-linia bg-kalka">
                <span className="text-2xl font-bold mb-1">16</span>
                <span className="text-olowek">województw</span>
              </li>
              <li className="flex flex-col p-4 border border-linia bg-kalka">
                <span className="text-2xl font-bold mb-1">380</span>
                <span className="text-olowek">powiatów</span>
              </li>
              <li className="flex flex-col p-4 border border-linia bg-kalka">
                <span className="text-2xl font-bold mb-1">2477</span>
                <span className="text-olowek">gmin</span>
              </li>
              <li className="flex flex-col p-4 border border-linia bg-kalka">
                <span className="text-2xl font-bold mb-1">63 960</span>
                <span className="text-olowek">zmiennych BDL</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-[700] leading-[1.3]">
              Jak czytać mapę
            </h2>
            <p className="text-sm font-[400] leading-[1.6]">
              Projekt powstał z myślą o zapewnieniu rzetelnego i przystępnego dostępu do wiedzy
              o społecznościach lokalnych. Językiem wizualnym serwisu jest prostota i przejrzystość:
              dane są czyste i spokojne, a uwagę użytkownika kieruje pojedynczy, ręczny akcent.
            </p>
            <div className="flex flex-col gap-6 pt-2">
              <div>
                <p className="text-xs font-bold mb-2 uppercase tracking-wide text-olowek">Skala sekwencyjna</p>
                <div className="h-6 w-full flex">
                  {seqColors.map((color: string, index: number) => (
                    <div key={index} className="flex-1" style={{ backgroundColor: color }}></div>
                  ))}
                </div>
                <p className="text-xs mt-2 text-olowek">Do pokazywania natężenia zjawiska (np. gęstość zaludnienia).</p>
              </div>
              <div>
                <p className="text-xs font-bold mb-2 uppercase tracking-wide text-olowek">Skala dywergentna</p>
                <div className="h-6 w-full flex">
                  {divColors.map((color: string, index: number) => (
                    <div key={index} className="flex-1" style={{ backgroundColor: color }}></div>
                  ))}
                </div>
                <p className="text-xs mt-2 text-olowek">Do zjawisk z naturalnym punktem zerowym (np. saldo migracji).</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-[700] leading-[1.3]">
              Pułapki w danych GUS
            </h2>
            <ul className="space-y-3 text-sm font-[400] leading-[1.6] list-disc pl-5">
              <li><strong>Bezrobocie rejestrowane vs BAEL:</strong> Stopa bezrobocia w BDL to bezrobocie rejestrowane w urzędach pracy, które często różni się od faktycznego bezrobocia badanego metodą BAEL.</li>
              <li><strong>Wynagrodzenia:</strong> Podawane przez GUS przeciętne wynagrodzenie dotyczy wyłącznie firm zatrudniających powyżej 9 osób (nie obejmuje mikrofirm).</li>
              <li><strong>Samochody:</strong> Zawyżone wskaźniki w niektórych miastach i powiatach to efekt rejestracji dużych flot leasingowych.</li>
              <li><strong>Budżety:</strong> Dochody i wydatki gmin na mieszkańca mogą być trudne do porównania między różnymi typami gmin, szczególnie gminami miejsko-wiejskimi a otaczającymi je obwarzankami.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-[700] leading-[1.3]">
              Deklaracja dostępności
            </h2>
            <p className="text-sm font-[400] leading-[1.6]">
              Serwis używa kroju pisma Atkinson Hyperlegible stworzonego przez Braille Institute, aby ułatwić czytanie osobom słabowidzącym. Zapewniamy wysoki kontrast minimalny 13:1 dla głównego tekstu i pełną zgodność ze standardami WCAG 2.2 na poziomie AA.
            </p>
          </section>
        </article>
      </main>
      <footer className="py-8 px-4 border-t border-linia mt-16 text-center text-sm">
        <div className="flex gap-4 justify-center">
          <Link to="/o-projekcie" className="hover:underline">O projekcie</Link>
          <Link to="/zrodla" className="hover:underline">Źródła</Link>
          <Link to="/prywatnosc" className="hover:underline">Prywatność</Link>
        </div>
      </footer>
    </div>
  );
}

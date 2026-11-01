import { SiteLayout } from '../layout/SiteLayout';

export function About() {
  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-12 text-tusz">
        {/* Nagłówek z dużym znakiem */}
        <header className="flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-linia pb-8">
          <picture className="shrink-0">
            <source srcSet="/brand/faktografia-znak-jasny.svg" media="(prefers-color-scheme: dark)" />
            <img
              src="/brand/faktografia-znak-granat.svg"
              alt="Znak Faktografia"
              width={128}
              height={128}
              className="w-32 h-32 block object-contain"
            />
          </picture>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-[800] tracking-[-0.02em]">
              O projekcie Faktografia Atlas
            </h1>
            <p className="text-sm md:text-base text-olowek leading-[1.6]">
              Publiczny atlas statystyczny Polski – otwarty dostęp do danych GUS dla każdego obywatela, badacza i samorządowca.
            </p>
          </div>
        </header>

        {/* Siatka 1 px: Atlas w liczbach */}
        <section aria-labelledby="atlas-w-liczbach" className="space-y-4">
          <h2 id="atlas-w-liczbach" className="text-lg font-[700] tracking-[-0.01em]">
            Atlas w liczbach
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-linia border border-linia">
            <div className="bg-arkusz p-4 text-center space-y-1">
              <span className="block font-mono text-2xl md:text-3xl font-[700] text-tusz">16</span>
              <span className="block text-xs text-olowek">Województw</span>
            </div>
            <div className="bg-arkusz p-4 text-center space-y-1">
              <span className="block font-mono text-2xl md:text-3xl font-[700] text-tusz">380</span>
              <span className="block text-xs text-olowek">Powiatów</span>
            </div>
            <div className="bg-arkusz p-4 text-center space-y-1">
              <span className="block font-mono text-2xl md:text-3xl font-[700] text-tusz">2477</span>
              <span className="block text-xs text-olowek">Gmin</span>
            </div>
            <div className="bg-arkusz p-4 text-center space-y-1">
              <span className="block font-mono text-2xl md:text-3xl font-[700] text-tusz">63 960</span>
              <span className="block text-xs text-olowek">Zmiennych BDL</span>
            </div>
          </div>
        </section>

        {/* Jak czytać mapę */}
        <section aria-labelledby="jak-czytac-mape" className="space-y-4">
          <h2 id="jak-czytac-mape" className="text-lg font-[700] tracking-[-0.01em]">
            Jak czytać mapę
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-arkusz border border-linia p-5 space-y-2">
              <h3 className="font-semibold text-sm">Skala sekwencyjna (jednokierunkowa)</h3>
              <p className="text-xs text-olowek leading-[1.6]">
                Stosowana przy wielkościach bezwzględnych lub natężeniach (np. gęstość zaludnienia, dochody). Ciemniejszy odcień oznacza wyższą wartość wskaźnika.
              </p>
            </div>
            <div className="bg-arkusz border border-linia p-5 space-y-2">
              <h3 className="font-semibold text-sm">Skala dywergentna (dwukierunkowa)</h3>
              <p className="text-xs text-olowek leading-[1.6]">
                Stosowana przy wskaźnikach z naturalnym punktem odniesienia (np. przyrost naturalny, saldo migracji, odchylenie od średniej krajowej).
              </p>
            </div>
          </div>
        </section>

        {/* Pułapki w danych GUS */}
        <section aria-labelledby="pulapki-danych" className="space-y-4">
          <h2 id="pulapki-danych" className="text-lg font-[700] tracking-[-0.01em]">
            Pułapki w danych GUS
          </h2>
          <ul className="space-y-3 text-xs md:text-sm text-olowek leading-[1.6]">
            <li className="bg-arkusz border border-linia p-4">
              <strong className="text-tusz font-semibold block mb-1">Bezrobocie rejestrowane vs BAEL:</strong>
              Dane powiatowe opierają się na rejestrach urzędów pracy (osoby formalnie zarejestrowane), podczas gdy badanie BAEL mierzy faktyczną bierność zawodową wg standardów Eurostat.
            </li>
            <li className="bg-arkusz border border-linia p-4">
              <strong className="text-tusz font-semibold block mb-1">Wynagrodzenia bez mikroprzedsiębiorstw:</strong>
              Oficjalne statystyki przeciętnego wynagrodzenia w BDL nie uwzględniają podmiotów zatrudniających do 9 pracowników, co zawyża średnią w regionach o dużym udziale mikrobiznesu.
            </li>
            <li className="bg-arkusz border border-linia p-4">
              <strong className="text-tusz font-semibold block mb-1">Floty leasingowe i rejestracje pojazdów:</strong>
              Liczba samochodów na 1000 mieszkańców bywa drastycznie zawyżona w gminach, gdzie siedzibę mają ogólnokrajowe firmy leasingowe.
            </li>
            <li className="bg-arkusz border border-linia p-4">
              <strong className="text-tusz font-semibold block mb-1">Budżety gmin miejsko-wiejskich:</strong>
              Dochody i wydatki budżetowe raportowane są wspólnie dla całej gminy, uniemożliwiając rozdzielenie finansów miasta od wsi.
            </li>
          </ul>
        </section>

        {/* Dostępność */}
        <section aria-labelledby="dostepnosc" className="space-y-2 border-t border-linia pt-6">
          <h2 id="dostepnosc" className="text-base font-[700]">
            Dostępność cyfrowa (WCAG 2.2)
          </h2>
          <p className="text-xs text-olowek leading-[1.6]">
            Serwis zaprojektowano z użyciem kroju Atkinson Hyperlegible, zapewniającego maksymalną czytelność dla osób słabowidzących. Kontrast tekstu do tła wynosi min. 13:1, a wszystkie elementy interaktywne spełniają wymóg pola dotykowego min. 44×44 px.
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}

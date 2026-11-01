import { SiteLayout } from '../layout/SiteLayout';
import { SourcesIndicatorTable } from './SourcesIndicatorTable';

interface RegistryCardProps {
  title: string;
  sourceName: string;
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
  scope: string;
  attribution: string;
}

function RegistryCard({
  title,
  sourceName,
  sourceUrl,
  license,
  licenseUrl,
  scope,
  attribution,
}: RegistryCardProps) {
  return (
    <article className="bg-arkusz border border-linia p-5 md:p-6 space-y-3 flex flex-col justify-between">
      <div className="space-y-2">
        <h3 className="text-base md:text-lg font-[700] leading-[1.3] text-tusz">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-olowek leading-[1.6]">
          {scope}
        </p>
      </div>

      <dl className="text-xs space-y-1.5 pt-2 border-t border-linia">
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-olowek font-medium">Źródło:</dt>
          <dd className="text-tusz">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-olowek focus:outline-none focus:ring-1 focus:ring-tusz"
            >
              {sourceName}
            </a>
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-olowek font-medium">Licencja:</dt>
          <dd className="text-tusz">
            {licenseUrl ? (
              <a
                href={licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-olowek focus:outline-none focus:ring-1 focus:ring-tusz"
              >
                {license}
              </a>
            ) : (
              license
            )}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-olowek font-medium">Atrybucja:</dt>
          <dd className="text-tusz font-mono text-xs leading-relaxed">
            {attribution}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function Sources() {
  return (
    <SiteLayout
      className="p-4 md:p-8 pb-24 md:pb-32 max-w-5xl mx-auto w-full space-y-10"
      meta={{
        title: 'Skąd są dane — Rejestry i metodologia — Faktografia Atlas',
        description:
          'Oficjalne źródła danych statystycznych i przestrzennych w portalu Faktografia Atlas: GUS BDL, TERYT SIMC, GUGiK PRNG i TopoJSON.',
      }}
    >
      <header className="space-y-3 max-w-[70ch]">
        <h1 className="text-3xl font-[800] leading-[1.05] tracking-[-0.02em]">
          Skąd są dane
        </h1>
        <p className="text-sm font-[400] leading-[1.6]">
          Faktografia Atlas opiera się wyłącznie na oficjalnych, otwartych rejestrach publicznych
          Rzeczypospolitej Polskiej. Wszystkie liczby są pobierane i weryfikowane przez automatyczne
          roboty danych, bez subiektywnej ingerencji w wartości wskaźników.
        </p>
      </header>

      {/* Karty 4 rejestrów z pełną atrybucją wg ELEMENTY.md */}
      <section className="space-y-4" aria-labelledby="heading-rejestry">
        <div className="space-y-1">
          <h2 id="heading-rejestry" className="text-xl font-[700] leading-[1.3]">
            Rejestry publiczne i atrybucja
          </h2>
          <p className="text-xs md:text-sm text-olowek leading-[1.6]">
            Zgodnie z wymaganiami dokumentacji ELEMENTY.md każdy zasób zewnętrzny posiada jednoznaczne
            źródło, licencję oraz określenie zasad atrybucji.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <RegistryCard
            title="GUS Bank Danych Lokalnych (BDL)"
            sourceName="bdl.stat.gov.pl (API v1)"
            sourceUrl="https://bdl.stat.gov.pl"
            license="CC BY 4.0"
            licenseUrl="https://creativecommons.org/licenses/by/4.0/"
            scope="Wszystkie wartości liczbowe, wskaźniki społeczno-gospodarcze oraz szeregi czasowe dla województw, powiatów i gmin."
            attribution="Źródło: GUS, Bank Danych Lokalnych (synchronizacja nocna)"
          />

          <RegistryCard
            title="Rejestr TERYT SIMC"
            sourceName="eteryt.stat.gov.pl"
            sourceUrl="https://eteryt.stat.gov.pl"
            license="Otwarte dane publiczne GUS"
            scope="Krajowy Rejestr Urzędowego Podziału Terytorialnego Kraju: System Identyfikatorów i Nazw Miejscowości, kody TERYT jednostek."
            attribution="Główny Urząd Statystyczny – Rejestr TERYT SIMC"
          />

          <RegistryCard
            title="GUGiK PRNG (Miejscowości)"
            sourceName="ogcapi.geoportal.gov.pl"
            sourceUrl="https://ogcapi.geoportal.gov.pl/res/ims/maps/PRNG/apiFeatures"
            license="Otwarte dane GUGiK"
            scope="Państwowy Rejestr Nazw Geograficznych: urzędowe współrzędne geograficzne miejscowości w Polsce do celów pozycjonowania i wyszukiwania."
            attribution="Główny Urząd Geodezji i Kartografii – Rejestr PRNG"
          />

          <RegistryCard
            title="Granice TopoJSON"
            sourceName="GeoJSON-Polska-Wojewodztwa-Powiaty-Gminy"
            sourceUrl="https://github.com/waszkiewiczja/GeoJSON-Polska-Wojewodztwa-Powiaty-Gminy"
            license="Public Domain (domena publiczna)"
            scope="Uproszczona i zoptymalizowana topologia wektorowa granic województw, powiatów i gmin Polski w formacie TopoJSON."
            attribution="Wektory geometrii podziału administracyjnego w domenie publicznej"
          />
        </div>
      </section>

      {/* Tabela 20 wskaźników */}
      <section className="space-y-4" aria-labelledby="heading-wskazniki">
        <div className="space-y-1">
          <h2 id="heading-wskazniki" className="text-xl font-[700] leading-[1.3]">
            Wykaz 20 wskaźników głównych
          </h2>
          <p className="text-xs md:text-sm text-olowek leading-[1.6]">
            Zestawienie wszystkich kluczowych wskaźników atlasu wraz z działem tematycznym,
            kodem zmiennej w BDL GUS, najniższym poziomem agregacji oraz odnośnikiem do mapy.
          </p>
        </div>
        <SourcesIndicatorTable />
      </section>
    </SiteLayout>
  );
}

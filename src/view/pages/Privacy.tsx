import { useState } from 'react';
import { clearConsent } from '@/core/consent/consent';
import { Header } from '../Header';

export function Privacy() {
  const [revoked, setRevoked] = useState(false);

  const handleRevoke = () => {
    clearConsent();
    setRevoked(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-kalka text-tusz">
      <Header />
      <main className="flex-grow p-4 md:p-8 pb-24 md:pb-32 max-w-4xl mx-auto w-full">
        <article className="max-w-[70ch] space-y-6">
          <h1 className="text-3xl font-[800] leading-[1.05] tracking-[-0.02em]">
            Prywatność
          </h1>

          <section className="space-y-3">
            <h2 className="text-lg font-[700] leading-[1.3]">
              Co i dlaczego liczymy
            </h2>
            <p className="text-sm font-[400] leading-[1.6]">
              Za Twoją dobrowolną zgodą zliczamy wyłącznie anonimowe wyszukiwania fraz i miejsc
              w serwisie. Dzięki temu wiemy, które wskaźniki i regiony są najbardziej interesujące,
              co pomaga w dalszym rozwoju serwiser.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-[700] leading-[1.3]">
              Gdzie przechowywane są dane
            </h2>
            <p className="text-sm font-[400] leading-[1.6]">
              Do analityki wykorzystujemy usługę PostHog. Wszystkie dane analityczne przetwarzane są
              wyłącznie na serwerach zlokalizowanych w Unii Europejskiej (UE).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-[700] leading-[1.3]">
              Czego nie zbieramy
            </h2>
            <p className="text-sm font-[400] leading-[1.6]">
              Szanujemy Twoją prywatność. Nie gromadzimy danych osobowych (takich jak imię, nazwisko,
              adres e-mail), adresów IP ani unikalnych identyfikatorów urządzeń. Nie śledzimy Twojej
              aktywności poza naszym serwisem.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-[700] leading-[1.3]">
              Zarządzanie zgodą
            </h2>
            <p className="text-sm font-[400] leading-[1.6]">
              W każdej chwili możesz cofnąć udzieloną wcześniej zgodę na analitykę. Użyj przycisku
              poniżej, aby usunąć zapisaną decyzję z pamięci przeglądarki.
            </p>

            <div className="pt-2 flex flex-col gap-3 items-start">
              <button
                type="button"
                onClick={handleRevoke}
                className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium bg-tusz text-arkusz border border-tusz hover:bg-tusz/90 cursor-pointer rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
              >
                Cofnij zgodę
              </button>

              {revoked && (
                <p
                  role="status"
                  className="text-sm font-medium text-tusz m-0"
                >
                  Zgoda została cofnięta. Po odświeżeniu strony ponownie zobaczysz zapytanie o zgodę.
                </p>
              )}
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}

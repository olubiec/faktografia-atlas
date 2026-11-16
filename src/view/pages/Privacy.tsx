import { useState } from 'react';
import { clearConsent } from '@/core/consent/consent';
import { stopAnalytics } from '@/core/consent/analytics';
import { SiteLayout } from '../layout/SiteLayout';

export function Privacy() {
  const [revoked, setRevoked] = useState(false);

  const handleRevoke = () => {
    clearConsent();
    stopAnalytics();
    setRevoked(true);
  };

  return (
    <SiteLayout
      className="p-4 md:p-8 pb-24 md:pb-32 max-w-4xl mx-auto w-full"
      meta={{
        title: 'Prywatność',
        description: 'Polityka prywatności: administrator, przetwarzane dane, podstawy prawne, Twoje prawa i zarządzanie zgodą na anonimową analitykę w Faktografia Atlas.',
      }}
    >
      <article className="max-w-[70ch] space-y-6">
        <h1 className="text-3xl font-[800] leading-[1.05] tracking-[-0.02em]">
          Prywatność
        </h1>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">
            1. Administrator i kontakt
          </h2>
          <p className="text-sm font-[400] leading-[1.6]">
            Administratorem danych jest Mateusz Ołubiec, właściciel serwisu faktografia.eu (Faktografia Atlas). Kontakt w sprawach prywatności: <a href="mailto:mateuszolubiec05@gmail.com" className="underline">mateuszolubiec05@gmail.com</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">
            2. Jakie dane przetwarzamy
          </h2>
          <ul className="list-disc pl-5 text-sm font-[400] leading-[1.6] space-y-1">
            <li>
              Logi hostingu (Vercel): adres IP, czas i adres żądania, dane przeglądarki. Zapisuje je dostawca hostingu w związku z działaniem serwisu.
            </li>
            <li>
              Analityka (PostHog), tylko po Twojej zgodzie. Nie zbieramy imienia ani e-maila, nie nagrywamy sesji, a automatyczne zbieranie kliknięć i odsłon jest wyłączone. Zapisywanie adresu IP w analityce jest wyłączone w konfiguracji.
            </li>
            <li>
              Pamięć przeglądarki (localStorage), zapisywana na Twoim urządzeniu:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>
                  <code className="font-mono bg-arkusz px-1.5 py-0.5 border border-linia">faktografia-theme</code> – wybrany motyw graficzny (jasny, ciemny lub systemowy).
                </li>
                <li>
                  <code className="font-mono bg-arkusz px-1.5 py-0.5 border border-linia">fa-consent-v1</code> – Twoja decyzja o zgodzie na anonimowe statystyki wraz z datą.
                </li>
              </ul>
            </li>
          </ul>
          <p className="text-sm font-[400] leading-[1.6]">
            PostHog działa z trwałością „memory”: identyfikator istnieje tylko w pamięci karty i znika po jej zamknięciu, dlatego nie zapisujemy kluczy ph_* ani ciasteczek analitycznych.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">
            3. Cel i podstawa prawna
          </h2>
          <ul className="list-disc pl-5 text-sm font-[400] leading-[1.6] space-y-1">
            <li>
              Anonimowe statystyki wyszukiwań: wiemy, które wskaźniki i regiony są najbardziej interesujące, co pomaga w dalszym rozwoju serwisu. Podstawa: zgoda, art. 6 ust. 1 lit. a RODO.
            </li>
            <li>
              Logi hostingu (bezpieczeństwo i działanie serwisu): prawnie uzasadniony interes administratora, art. 6 ust. 1 lit. f RODO.
            </li>
            <li>
              Zapis motywu i decyzji o zgodzie: niezbędny do działania serwisu, bez profilowania.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">
            4. Okres przechowywania
          </h2>
          <ul className="list-disc pl-5 text-sm font-[400] leading-[1.6] space-y-1">
            <li>Decyzja o zgodzie jest ważna 12 miesięcy, potem zapytamy o nią ponownie.</li>
            <li>Zdarzenia w PostHog i logi w Vercel są przechowywane zgodnie z ustawieniami tych usług.</li>
            <li>Dane w localStorage zostają na Twoim urządzeniu, dopóki ich nie usuniesz.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">
            5. Odbiorcy danych
          </h2>
          <ul className="list-disc pl-5 text-sm font-[400] leading-[1.6] space-y-1">
            <li>Vercel Inc. – hosting serwisu; logi techniczne mogą być przetwarzane także poza UE.</li>
            <li>PostHog – analityka po zgodzie; zdarzenia trafiają na serwery w UE (eu.i.posthog.com).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">
            6. Twoje prawa
          </h2>
          <p className="text-sm font-[400] leading-[1.6]">
            Masz prawo do dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz sprzeciwu wobec przetwarzania opartego na uzasadnionym interesie. Zgodę możesz cofnąć w każdej chwili (przycisk poniżej), bez wpływu na zgodność z prawem wcześniejszego przetwarzania. Masz też prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (UODO). Aby skorzystać z praw, napisz na adres z punktu 1.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">
            7. Zewnętrzne linki
          </h2>
          <p className="text-sm font-[400] leading-[1.6]">
            Przy funkcji „Zamów wskaźnik” kierujemy do serwisu GitHub. Tam obowiązuje osobna polityka prywatności GitHuba, na którą nie mamy wpływu.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">
            8. Zmiany polityki
          </h2>
          <p className="text-sm font-[400] leading-[1.6]">
            Politykę możemy aktualizować, gdy zmieni się sposób działania serwisu. Aktualna wersja jest zawsze na tej stronie. Data ostatniej aktualizacji: 15 listopada 2026.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-[700] leading-[1.3]">
            Zarządzanie zgodą
          </h3>
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
    </SiteLayout>
  );
}

import { SiteLayout } from '../layout/SiteLayout';

const MAIL = 'mateuszolubiec05@gmail.com';
const ISSUES_URL = 'https://github.com/olubiec/faktografia-atlas/issues';

const LINK_CLASS =
  'inline-flex items-center min-h-[44px] underline hover:text-tusz rounded-none focus:outline-none focus:ring-2 focus:ring-tusz';

/** Strona z danymi kontaktowymi i linkiem do zgłoszeń błędów. */
export default function Contact() {
  return (
    <SiteLayout
      className="p-4 md:p-8 pb-24 md:pb-32 max-w-4xl mx-auto w-full"
      meta={{
        title: 'Kontakt',
        description: 'Kontakt z autorem Faktografia Atlas: e-mail oraz zgłaszanie błędów i uwag w repozytorium projektu.',
      }}
    >
      <article className="max-w-[70ch] space-y-6 text-tusz">
        <h1 className="text-3xl font-[800] leading-[1.05] tracking-[-0.02em]">Kontakt</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">Autor</h2>
          <p className="text-sm leading-[1.6]">Mateusz Ołubiec</p>
          <p className="text-sm leading-[1.6]">
            E-mail:{' '}
            <a href={`mailto:${MAIL}`} className={LINK_CLASS}>
              {MAIL}
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">Zgłaszanie błędów</h2>
          <p className="text-sm text-olowek leading-[1.6]">
            Znalazłeś błąd w danych lub w działaniu strony? Opisz go w zgłoszeniu w repozytorium projektu albo napisz e-mail.
            Podaj adres strony oraz, jeśli to możliwe, wskaźnik, rok i jednostkę, której dotyczy uwaga.
          </p>
          <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            Zgłoszenia na GitHubie
          </a>
        </section>
      </article>
    </SiteLayout>
  );
}

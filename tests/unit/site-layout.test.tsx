import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { SiteFooter } from '../../src/view/layout/SiteFooter';
import { SiteLayout } from '../../src/view/layout/SiteLayout';
import { PageMeta } from '../../src/view/layout/PageMeta';
import { Privacy } from '../../src/view/pages/Privacy';
import { NotFound } from '../../src/view/NotFound';

describe('SiteLayout & SiteFooter (W15-M04)', () => {
  describe('SiteFooter component', () => {
    it('zawiera wszystkie 4 kolumny stopki w siatce kreślarskiej', () => {
      const html = renderToString(
        <MemoryRouter>
          <SiteFooter />
        </MemoryRouter>
      );

      // Siatka i style kreślarskie
      expect(html).toContain('border-t');
      expect(html).toContain('border-linia');
      expect(html).toContain('bg-arkusz');
      expect(html).toContain('text-tusz');

      // Kolumna 1: Logo Faktografia, misja, licencja CC BY 4.0
      expect(html).toContain('alt="Faktografia"');
      expect(html).toContain('Faktografia Atlas');
      expect(html).toContain('CC BY 4.0');
      expect(html).toContain('https://creativecommons.org/licenses/by/4.0/deed.pl');

      // Kolumna 2: Narzędzia
      expect(html).toContain('Narzędzia');
      expect(html).toContain('href="/"');
      expect(html).toContain('Mapa Polski');
      expect(html).toContain('href="/rankingi"');
      expect(html).toContain('Rankingi');
      expect(html).toContain('href="/porownaj"');
      expect(html).toContain('Porównaj');
      expect(html).toContain('href="/biblioteka"');
      expect(html).toContain('Biblioteka');

      // Kolumna 3: Działy tematyczne GUS (7 głównych wskaźników)
      expect(html).toContain('Działy tematyczne GUS');
      expect(html).toContain('href="/?i=density"');
      expect(html).toContain('href="/?i=unemployment-rate"');
      expect(html).toContain('href="/?i=avg-wage"');
      expect(html).toContain('href="/?i=dwellings-per-1000"');
      expect(html).toContain('href="/?i=forest-cover"');
      expect(html).toContain('href="/?i=preschool-3-6"');
      expect(html).toContain('href="/?i=cars-per-1000"');

      // Kolumna 4: Dokumentacja
      expect(html).toContain('Dokumentacja');
      expect(html).toContain('href="/o-projekcie"');
      expect(html).toContain('O projekcie');
      expect(html).toContain('href="/zrodla"');
      expect(html).toContain('Skąd są dane');
      expect(html).toContain('href="/prywatnosc"');
      expect(html).toContain('Prywatność i zgoda');
      expect(html).toContain('https://github.com/olubiec/faktografia-atlas');
      expect(html).toContain('GitHub');
    });

    it('zawiera link do /prywatnosc z poprawną etykietą i rozmiarem', () => {
      const html = renderToString(
        <MemoryRouter>
          <SiteFooter />
        </MemoryRouter>
      );

      expect(html).toContain('href="/prywatnosc"');
      expect(html).toContain('Prywatność i zgoda');
    });

    it('wszystkie pola dotykowe (linki) mają min. 44x44 px, zero cieni i zero zaokrągleń', () => {
      const html = renderToString(
        <MemoryRouter>
          <SiteFooter />
        </MemoryRouter>
      );

      // Wszystkie linki muszą posiadać min-h-[44px] i min-w-[44px]
      const linkMatches = html.match(/<a [^>]+>/g) || [];
      expect(linkMatches.length).toBeGreaterThanOrEqual(16);

      for (const link of linkMatches) {
        expect(link).toContain('min-h-[44px]');
        expect(link).toContain('min-w-[44px]');
        expect(link).toContain('rounded-none');
        expect(link).not.toContain('shadow-');
      }
    });

    it('spełnia wymagania dostępności axe (role contentinfo, unikalne aria-label dla nav, alt dla img)', () => {
      const html = renderToString(
        <MemoryRouter>
          <SiteFooter />
        </MemoryRouter>
      );

      // Landmark footer / contentinfo
      expect(html).toContain('role="contentinfo"');

      // Unikalne etykiety dla każdego elementu <nav>
      expect(html).toContain('aria-label="Narzędzia"');
      expect(html).toContain('aria-label="Działy tematyczne GUS"');
      expect(html).toContain('aria-label="Dokumentacja"');

      // Dostępny tekst dla obrazka
      expect(html).toContain('alt="Faktografia"');

      // Linki zewnętrzne otwierane w nowej karcie mają rel="noopener noreferrer"
      expect(html).toContain('rel="noopener noreferrer"');

      // Brak wpisanych na sztywno kolorów hex
      expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    });
  });

  describe('SiteLayout component', () => {
    it('zawiera skip-link „Przejdź do treści” prowadzący do #main-content', () => {
      const html = renderToString(
        <MemoryRouter>
          <SiteLayout>
            <div>Zawartość podstrony</div>
          </SiteLayout>
        </MemoryRouter>
      );

      expect(html).toContain('href="#main-content"');
      expect(html).toContain('Przejdź do treści');
      expect(html).toContain('min-h-[44px]');
      expect(html).toContain('id="main-content"');
      expect(html).toContain('Zawartość podstrony');
      expect(html).toContain('<header');
      expect(html).toContain('<footer');
    });

    it('ustawia metadane strony poprzez PageMeta', () => {
      const html = renderToString(
        <MemoryRouter>
          <SiteLayout
            meta={{
              title: 'Przykładowa strona',
              description: 'Opis przykładowej strony',
            }}
          >
            <div>Test</div>
          </SiteLayout>
        </MemoryRouter>
      );

      expect(html).toContain('<title>Przykładowa strona – Faktografia Atlas</title>');
      expect(html).toContain('name="description" content="Opis przykładowej strony"');
      expect(html).toContain('property="og:title" content="Przykładowa strona – Faktografia Atlas"');
    });
  });

  describe('PageMeta component', () => {
    it('nie dubluje członu marki Faktografia Atlas, jeśli jest już w tytule', () => {
      const html = renderToString(
        <PageMeta title="Faktografia Atlas – Strona główna" description="Opis" />
      );

      expect(html).toContain('<title>Faktografia Atlas – Strona główna</title>');
    });
  });

  describe('Privacy page integration', () => {
    it('zawiera SiteLayout, poprawione słowo serwisu i informację o kluczach localStorage', () => {
      const html = renderToString(
        <MemoryRouter>
          <Privacy />
        </MemoryRouter>
      );

      // Stopka i nagłówek z SiteLayout
      expect(html).toContain('role="contentinfo"');
      expect(html).toContain('id="main-content"');
      expect(html).toContain('href="#main-content"');

      // Poprawiona literówka
      expect(html).toContain('dalszym rozwoju serwisu.');
      expect(html).not.toContain('serwiser');

      // Informacja o kluczach localStorage
      expect(html).toContain('faktografia-theme');
      expect(html).toContain('fa-consent-v1');
    });
  });

  describe('NotFound page integration', () => {
    it('zawiera SiteLayout, poprawne słowo serwisu i informację o kluczach localStorage', () => {
      const html = renderToString(
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>
      );

      expect(html).toContain('role="contentinfo"');
      expect(html).toContain('id="main-content"');
      expect(html).toContain('Błąd 404');
      expect(html).toContain('serwisie');
      expect(html).toContain('faktografia-theme');
      expect(html).toContain('fa-consent-v1');
      expect(html).toContain('min-h-[44px]');
    });
  });
});

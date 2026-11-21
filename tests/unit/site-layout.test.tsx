import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { SiteLayout } from '../../src/view/layout/SiteLayout';
import { PageMeta } from '../../src/view/layout/PageMeta';
import { Privacy } from '../../src/view/pages/Privacy';
import { NotFound } from '../../src/view/NotFound';

describe('SiteLayout & SiteFooter (W15-M04)', () => {
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

      expect(html).toContain('<title>Przykładowa strona – Faktografia</title>');
      expect(html).toContain('name="description" content="Opis przykładowej strony"');
      expect(html).toContain('property="og:title" content="Przykładowa strona – Faktografia"');
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

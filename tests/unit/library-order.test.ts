import { describe, expect, it } from 'vitest';
import { orderIssueUrl } from '../../src/core/library/order';

describe('orderIssueUrl - generator linku zamówienia wskaźnika', () => {
  it('zwraca adres zaczynający się od https://github.com/olubiec/faktografia-atlas/issues/new?', () => {
    const url = orderIssueUrl({
      id: 'gmi-unemployment',
      name: 'Stopa bezrobocia',
      categoryPath: ['Praca', 'Bezrobocie'],
      level: 'gmi',
    });
    expect(url.startsWith('https://github.com/olubiec/faktografia-atlas/issues/new?')).toBe(true);
  });

  it('poprawnie koduje tytuł, etykietę i treść zgłoszenia z polskimi znakami', () => {
    const params = {
      id: 12345,
      name: 'Przeciętne wynagrodzenie brutto w złotych (żółć)',
      categoryPath: ['Pieniądze', 'Wynagrodzenia'],
      level: 'pow',
    };

    const urlString = orderIssueUrl(params);
    const parsedUrl = new URL(urlString);

    expect(parsedUrl.searchParams.get('title')).toBe(
      'Zamówienie wskaźnika: Przeciętne wynagrodzenie brutto w złotych (żółć) (12345)'
    );
    expect(parsedUrl.searchParams.get('labels')).toBe('zamowienie-wskaznika');

    const body = parsedUrl.searchParams.get('body') || '';
    expect(body).toContain('ID wskaźnika: 12345');
    expect(body).toContain('Nazwa: Przeciętne wynagrodzenie brutto w złotych (żółć)');
    expect(body).toContain('Ścieżka kategorii: Pieniądze > Wynagrodzenia');
    expect(body).toContain('Poziom: pow');
    expect(body).toContain('Proszę o dodanie wskaźnika do Faktografia Atlas. Zgłoszenie nie zawiera danych osobowych.');
  });

  it('mieści 400-znakową nazwę w limicie 1800 znaków', () => {
    const longName = 'A'.repeat(400);
    const url = orderIssueUrl({
      id: 'long-indicator-id',
      name: longName,
      categoryPath: ['Kategoria Testowa', 'Podkategoria'],
      level: 'gmi',
    });

    expect(url.length).toBeLessThanOrEqual(1800);
    const parsedUrl = new URL(url);
    expect(parsedUrl.searchParams.get('body')).toContain('long-indicator-id');
  });

  it('skraca ultra długą nazwę (np. 2000 znaków) tak, aby adres nie przekraczał 1800 znaków', () => {
    const ultraLongName = 'Wskaźnik z niezwykle długą nazwą z polskimi znakami ąęćłńóśźż '.repeat(35);
    const url = orderIssueUrl({
      id: 'ultra-long-id',
      name: ultraLongName,
      categoryPath: ['Kategoria', 'Podkategoria'],
      level: 'pow',
    });

    expect(url.length).toBeLessThanOrEqual(1800);
    const parsedUrl = new URL(url);
    const title = parsedUrl.searchParams.get('title') || '';
    expect(title).toContain('…');
    expect(title).toContain('ultra-long-id');
  });

  it('zawiera id wskaźnika w treści zgłoszenia', () => {
    const url = orderIssueUrl({
      id: 'custom-indicator-99',
      name: 'Liczba łóżek szpitalnych',
    });

    const parsedUrl = new URL(url);
    const body = parsedUrl.searchParams.get('body') || '';
    expect(body).toContain('custom-indicator-99');
  });
});

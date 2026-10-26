import { describe, expect, it } from 'vitest';
import { orderIssueUrl } from '../../src/core/library/order';

describe('orderIssueUrl - generator linku zamówienia wskaźnika', () => {
  it('zwraca adres zaczynający się od https://github.com/olubiec/faktografia-atlas/issues/new?template=zamowienie-wskaznika.yml&', () => {
    const url = orderIssueUrl({
      id: 'gmi-unemployment',
      name: 'Stopa bezrobocia',
      categoryPath: ['Praca', 'Bezrobocie'],
      level: 'gmi',
    });
    expect(
      url.startsWith(
        'https://github.com/olubiec/faktografia-atlas/issues/new?template=zamowienie-wskaznika.yml&'
      )
    ).toBe(true);
  });

  it('brak parametru labels= w wygenerowanym adresie', () => {
    const url = orderIssueUrl({
      id: 'gmi-unemployment',
      name: 'Stopa bezrobocia',
      categoryPath: ['Praca', 'Bezrobocie'],
      level: 'gmi',
    });
    expect(url.includes('labels=')).toBe(false);
  });

  it('poprawnie koduje tytuł i pola formularza zgłoszenia z polskimi znakami', () => {
    const params = {
      id: 12345,
      name: 'Przeciętne wynagrodzenie brutto w złotych (żółć)',
      categoryPath: ['Pieniądze', 'Wynagrodzenia'],
      level: 'pow',
    };

    const urlString = orderIssueUrl(params);
    const parsedUrl = new URL(urlString);

    expect(parsedUrl.searchParams.get('template')).toBe('zamowienie-wskaznika.yml');
    expect(parsedUrl.searchParams.get('title')).toBe(
      'Zamówienie wskaźnika: Przeciętne wynagrodzenie brutto w złotych (żółć) (12345)'
    );
    expect(parsedUrl.searchParams.get('id')).toBe('12345');
    expect(parsedUrl.searchParams.get('nazwa')).toBe(
      'Przeciętne wynagrodzenie brutto w złotych (żółć)'
    );
    expect(parsedUrl.searchParams.get('dzial')).toBe('Pieniądze > Wynagrodzenia');
    expect(parsedUrl.searchParams.get('poziom')).toBe('pow');
    expect(parsedUrl.searchParams.get('labels')).toBeNull();
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
    expect(parsedUrl.searchParams.get('id')).toBe('long-indicator-id');
    expect(parsedUrl.searchParams.get('nazwa')).toBe(longName);
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

  it('zawiera id wskaźnika w polu id formularza zgłoszenia', () => {
    const url = orderIssueUrl({
      id: 'custom-indicator-99',
      name: 'Liczba łóżek szpitalnych',
    });

    const parsedUrl = new URL(url);
    expect(parsedUrl.searchParams.get('id')).toBe('custom-indicator-99');
  });
});

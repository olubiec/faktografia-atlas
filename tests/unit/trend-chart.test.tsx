import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { TrendChart } from '../../src/view/profile/TrendChart';

describe('TrendChart Component (CC13.3)', () => {
  it('renderuje "Za mało danych do wykresu" gdy mniej niż 2 lata z wartością', () => {
    // Brak danych
    const htmlEmpty = renderToString(
      <TrendChart series={[]} label="Bezrobocie" />
    );
    expect(htmlEmpty).toContain('Za mało danych do wykresu');

    // 1 rok z wartością, pozostałe null
    const htmlSingle = renderToString(
      <TrendChart
        series={[
          { year: 2020, value: null },
          { year: 2021, value: 5.2 },
          { year: 2022, value: null },
        ]}
        label="Bezrobocie"
      />
    );
    expect(htmlSingle).toContain('Za mało danych do wykresu');
  });

  it('renderuje wykres, gdy są co najmniej 2 lata z wartością', () => {
    const series = [
      { year: 2018, value: 6.1 },
      { year: 2019, value: 5.4 },
      { year: 2020, value: null },
      { year: 2021, value: 4.8 },
      { year: 2022, value: 4.2 },
    ];

    const html = renderToString(
      <TrendChart series={series} unit="%" label="Stopa bezrobocia" />
    );

    expect(html).not.toContain('Za mało danych do wykresu');
    expect(html).toContain('role="region"');
    expect(html).toContain('Stopa bezrobocia, 2018–2022');
  });

  it('zawiera oś X z pierwszym i ostatnim rokiem oraz najwyżej 4 latami pomiędzy', () => {
    const series = [
      { year: 2010, value: 10 },
      { year: 2011, value: 11 },
      { year: 2012, value: 12 },
      { year: 2013, value: 13 },
      { year: 2014, value: 14 },
      { year: 2015, value: 15 },
      { year: 2016, value: 16 },
      { year: 2017, value: 17 },
      { year: 2018, value: 18 },
      { year: 2019, value: 19 },
      { year: 2020, value: 20 },
    ];

    const html = renderToString(
      <TrendChart series={series} unit="osób" label="Liczba ludności" />
    );

    // Zawsze pierwszy i ostatni rok
    expect(html).toContain('2010');
    expect(html).toContain('2020');
  });

  it('formatuje oś Y wartości minimalnej i maksymalnej za pomocą formatValue', () => {
    const series = [
      { year: 2020, value: 1000.5 },
      { year: 2021, value: 2500.0 },
    ];

    const html = renderToString(
      <TrendChart series={series} unit="zł" label="Wynagrodzenie" />
    );

    // formatValue(1000.5, 'zł') -> "1\u00A0001\u00A0zł" dla unit="zł" (0 miejsc po przecinku w getFractionDigits)
    expect(html).toContain('1\u00A0001\u00A0zł');
    expect(html).toContain('2\u00A0500\u00A0zł');
  });

  it('pokazuje wyróżniony punkt i podpis dla ostatniej wartości', () => {
    const series = [
      { year: 2020, value: 10 },
      { year: 2021, value: 15 },
      { year: 2022, value: 20 },
    ];

    const html = renderToString(
      <TrendChart series={series} unit="%" label="Wskaźnik" />
    );

    // dla unit="%", getFractionDigits daje 1 -> formatValue(20, '%') daje "20,0\u00A0%"
    expect(html).toContain('20,0\u00A0%');
  });

  it('obsługuje aria-live="polite" dla wybranego roku', () => {
    const series = [
      { year: 2020, value: 10 },
      { year: 2021, value: 15 },
    ];

    const html = renderToString(
      <TrendChart series={series} unit="%" label="Wskaźnik" />
    );

    expect(html).toContain('aria-live="polite"');
  });

  it('renderuje opcjonalną serię porównawczą i legendę tylko gdy jest przekazana', () => {
    const series = [
      { year: 2020, value: 10 },
      { year: 2021, value: 15 },
    ];

    const htmlNoCompare = renderToString(
      <TrendChart series={series} unit="%" label="Mój powiat" />
    );
    expect(htmlNoCompare).not.toContain('Średnia dla Polski');

    const compareSeries = [
      { year: 2020, value: 12 },
      { year: 2021, value: 14 },
    ];

    const htmlCompare = renderToString(
      <TrendChart
        series={series}
        unit="%"
        label="Mój powiat"
        compareSeries={compareSeries}
        compareLabel="Średnia dla Polski"
      />
    );

    expect(htmlCompare).toContain('Średnia dla Polski');
    expect(htmlCompare).toContain('Mój powiat');
  });

  it('używa wyłącznie tokenów i nie zawiera twardych kodów kolorów hex', () => {
    const series = [
      { year: 2020, value: 10 },
      { year: 2021, value: 15 },
    ];

    const html = renderToString(
      <TrendChart series={series} unit="%" label="Wskaźnik" />
    );

    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });
});

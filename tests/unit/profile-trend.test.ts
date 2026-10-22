import { describe, expect, it } from 'vitest';
import { trend } from '../../src/core/profile/trend';

describe('trend pure function', () => {
  it('zwraca trend dla serii rosnącej z inną jednostką niż % (używa %)', () => {
    const series = [
      { year: 2018, value: 100 },
      { year: 2019, value: 101 },
      { year: 2020, value: 102 },
      { year: 2021, value: 102 },
      { year: 2022, value: 103 },
      { year: 2023, value: 103.4 },
    ];
    const res = trend(series, 'osoba');
    expect(res).not.toBeNull();
    expect(res?.direction).toBe('up');
    expect(res?.compareYear).toBe(2018);
    expect(res?.formattedChange).toBe('+3,4%');
    expect(res?.text).toBe('↗ +3,4% od 2018');
    expect(res?.ariaLabel).toBe('rośnie o 3,4% od 2018');
  });

  it('zwraca trend dla serii malejącej z inną jednostką niż %', () => {
    const series = [
      { year: 2018, value: 1000 },
      { year: 2023, value: 950 },
    ];
    const res = trend(series, 'zł');
    expect(res).not.toBeNull();
    expect(res?.direction).toBe('down');
    expect(res?.compareYear).toBe(2018);
    expect(res?.formattedChange).toBe('-5,0%');
    expect(res?.text).toBe('↘ -5,0% od 2018');
    expect(res?.ariaLabel).toBe('maleje o 5,0% od 2018');
  });

  it('zwraca trend dla serii stałej z inną jednostką niż %', () => {
    const series = [
      { year: 2018, value: 500 },
      { year: 2023, value: 500 },
    ];
    const res = trend(series, 'os./km²');
    expect(res).not.toBeNull();
    expect(res?.direction).toBe('same');
    expect(res?.compareYear).toBe(2018);
    expect(res?.formattedChange).toBe('0,0%');
    expect(res?.text).toBe('→ 0,0% od 2018');
    expect(res?.ariaLabel).toBe('bez zmian (0,0%) od 2018');
  });

  it('jednostka % daje punkty procentowe (p.p.)', () => {
    const seriesUp = [
      { year: 2018, value: 5.0 },
      { year: 2023, value: 6.2 },
    ];
    const resUp = trend(seriesUp, '%');
    expect(resUp).not.toBeNull();
    expect(resUp?.direction).toBe('up');
    expect(resUp?.formattedChange).toBe('+1,2 p.p.');
    expect(resUp?.text).toBe('↗ +1,2 p.p. od 2018');
    expect(resUp?.ariaLabel).toBe('rośnie o 1,2 p.p. od 2018');

    const seriesDown = [
      { year: 2018, value: 10.5 },
      { year: 2023, value: 8.0 },
    ];
    const resDown = trend(seriesDown, '%');
    expect(resDown).not.toBeNull();
    expect(resDown?.direction).toBe('down');
    expect(resDown?.formattedChange).toBe('-2,5 p.p.');
    expect(resDown?.text).toBe('↘ -2,5 p.p. od 2018');
    expect(resDown?.ariaLabel).toBe('maleje o 2,5 p.p. od 2018');
  });

  it('wartość początkowa 0 daje sam kierunek bez procentu', () => {
    const seriesUp = [
      { year: 2020, value: 0 },
      { year: 2023, value: 25 },
    ];
    const resUp = trend(seriesUp, 'osoba');
    expect(resUp).not.toBeNull();
    expect(resUp?.direction).toBe('up');
    expect(resUp?.formattedChange).toBe('');
    expect(resUp?.text).toBe('↗ od 2020');
    expect(resUp?.ariaLabel).toBe('rośnie od 2020');

    const seriesSame = [
      { year: 2020, value: 0 },
      { year: 2023, value: 0 },
    ];
    const resSame = trend(seriesSame, 'osoba');
    expect(resSame).not.toBeNull();
    expect(resSame?.direction).toBe('same');
    expect(resSame?.formattedChange).toBe('');
    expect(resSame?.text).toBe('→ od 2020');
    expect(resSame?.ariaLabel).toBe('bez zmian od 2020');
  });

  it('pomija brakujące lata (null w serii) i wybiera najstarszy rok z danymi jeśli brak 5 lat', () => {
    const series = [
      { year: 2018, value: null },
      { year: 2019, value: null },
      { year: 2020, value: 100 },
      { year: 2021, value: null },
      { year: 2022, value: 108 },
      { year: 2023, value: null },
    ];
    const res = trend(series, 'osoba');
    expect(res).not.toBeNull();
    expect(res?.compareYear).toBe(2020);
    expect(res?.direction).toBe('up');
    expect(res?.formattedChange).toBe('+8,0%');
    expect(res?.text).toBe('↗ +8,0% od 2020');
  });

  it('zwraca null jeśli różnica lat wynosi mniej niż 2 lata lub gdy jest mniej niż 2 poprawne lata', () => {
    // 1 rok
    expect(trend([{ year: 2023, value: 100 }], 'osoba')).toBeNull();

    // 2 lata ale ta sama lub tylko 1 rok różnicy
    expect(
      trend(
        [
          { year: 2022, value: 100 },
          { year: 2023, value: 105 },
        ],
        'osoba'
      )
    ).toBeNull();

    // wartości null zostawiają < 2 lata
    expect(
      trend(
        [
          { year: 2020, value: null },
          { year: 2021, value: null },
          { year: 2022, value: 100 },
        ],
        'osoba'
      )
    ).toBeNull();
  });
});

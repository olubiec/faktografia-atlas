import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import * as Plot from '@observablehq/plot';
import { Sparkline } from '../../src/view/profile/Sparkline';

function createMiniDoc() {
  let doc: any;
  const createElem = (tag: string) => {
    const children: any[] = [];
    const attrs: Record<string, string> = {};
    const elem: any = {
      nodeName: tag,
      tagName: tag.toUpperCase(),
      children,
      childNodes: children,
      attributes: attrs,
      style: {},
      get ownerDocument() {
        return doc;
      },
      setAttribute(k: string, v: any) {
        attrs[k] = String(v);
      },
      getAttribute(k: string) {
        return attrs[k];
      },
      removeAttribute(k: string) {
        delete attrs[k];
      },
      addEventListener() {},
      removeEventListener() {},
      namespaceURI: 'http://www.w3.org/2000/svg',
      get outerHTML() {
        const attrStr = Object.entries(attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        const childStr = children
          .map((c) => (typeof c === 'string' ? c : c.outerHTML || ''))
          .join('');
        return `<${tag}${attrStr ? ' ' + attrStr : ''}>${childStr}</${tag}>`;
      },
    };
    elem.appendChild = (c: any) => {
      children.push(c);
      c.parentNode = elem;
      return c;
    };
    elem.insertBefore = (c: any) => {
      children.push(c);
      c.parentNode = elem;
      return c;
    };
    elem.removeChild = (c: any) => {
      const idx = children.indexOf(c);
      if (idx >= 0) children.splice(idx, 1);
      return c;
    };
    return elem;
  };

  doc = {
    documentElement: createElem('html'),
    createElement(tag: string) {
      return createElem(tag);
    },
    createElementNS(_ns: string, tag: string) {
      return createElem(tag);
    },
  };
  return doc;
}

describe('Sparkline Component', () => {
  it('zwraca null bez błędu gdy liczba nie-null wartości jest mniejsza niż 2', () => {
    // 0 lat
    const html0 = renderToString(<Sparkline series={[]} label="Ludność ogółem" />);
    expect(html0).toBe('');

    // 1 rok z wartością
    const html1 = renderToString(
      <Sparkline
        series={[
          { year: 2022, value: 100 },
          { year: 2023, value: null },
        ]}
        label="Ludność ogółem"
      />
    );
    expect(html1).toBe('');
  });

  it('renderuje wykres z 2 lub więcej lat z wartością bez błędu', () => {
    const series = [
      { year: 2021, value: 100 },
      { year: 2022, value: null },
      { year: 2023, value: 150 },
    ];
    const html = renderToString(<Sparkline series={series} label="Ludność ogółem" unit="osób" />);
    expect(html).toBeDefined();
    expect(html).toContain('inline-flex');
  });

  it('tworzy wykres Plot z role="img", aria-label i kolorem currentColor bez kodu hex', () => {
    const doc = createMiniDoc();
    const series = [
      { year: 2015, value: 100 },
      { year: 2016, value: 120 },
      { year: 2017, value: null },
      { year: 2024, value: 180 },
    ];

    const validPoints = series.filter((s) => s.value !== null);
    const minYear = validPoints[0].year;
    const maxYear = validPoints[validPoints.length - 1].year;
    const ariaLabel = `Ludność ogółem, ${minYear}–${maxYear}`;

    const chart = Plot.plot({
      document: doc,
      width: 64,
      height: 16,
      margin: 1,
      x: { axis: null },
      y: { axis: null },
      ariaLabel,
      marks: [
        Plot.lineY(series, {
          x: 'year',
          y: 'value',
          stroke: 'currentColor',
          strokeWidth: 1.5,
        }),
      ],
    });
    chart.setAttribute('role', 'img');
    chart.setAttribute('aria-label', ariaLabel);

    expect(chart.getAttribute('role')).toBe('img');
    expect(chart.getAttribute('aria-label')).toBe('Ludność ogółem, 2015–2024');

    const svgStr = chart.outerHTML;
    expect(svgStr).toContain('stroke="currentColor"');
    expect(svgStr).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });
});

import { useEffect, useState } from 'react';
import { absoluteUrl, canonicalFor } from '@/core/seo/site';
import { loadUnitPathTable, unitPagePath } from '@/core/seo/unit-link';
import { PageMeta } from './PageMeta';

/**
 * Meta ekranu mapy. Adres kanoniczny: `/mapa`, a przy `?u=<teryt>` strona miejsca (decyzja D6 w docs/SEO.md).
 * Tabela adresów jest pobierana tylko wtedy, gdy w adresie jest `u` (próg wejścia na /mapa: PRODUKT §7).
 */
export function MapCanonical() {
  const [canonical, setCanonical] = useState(() => canonicalFor('/mapa'));
  useEffect(() => {
    const u = new URLSearchParams(window.location.search).get('u');
    if (!u) return;
    let active = true;
    loadUnitPathTable().then((table) => {
      const path = unitPagePath(u, table);
      if (active && path) setCanonical(absoluteUrl(path));
    });
    return () => {
      active = false;
    };
  }, []);
  return <PageMeta title="Faktografia" description="Mapa Polski z danymi GUS: województwa, powiaty i gminy, wskaźniki i porównania." canonical={canonical} />;
}

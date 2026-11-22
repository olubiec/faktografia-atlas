import { serializeLd } from '@/core/seo/json-ld';

/** Dane strukturalne w <script type="application/ld+json">; treść jako tekst (bez wstawiania HTML). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json">{serializeLd(data)}</script>;
}

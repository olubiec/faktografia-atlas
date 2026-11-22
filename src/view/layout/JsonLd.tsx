import { serializeLd, type JsonLd as JsonLdData } from '@/core/seo/json-ld';

/** Dane strukturalne dla wyszukiwarek. Treść jako tekst potomny (bez dangerouslySetInnerHTML), znaki < > & zamienione w serializeLd. */
export function JsonLd({ data }: { data: JsonLdData }) {
  return <script type="application/ld+json">{serializeLd(data)}</script>;
}

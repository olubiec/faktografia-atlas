import { UNIT_KINDS } from '../../core/units/kinds';

/** Słownik: województwo, powiat ziemski, miasto na prawach powiatu, rodzaje gmin. Kotwice `#<id>` prowadzą ze znaku „?”. */
export function UnitKindsGlossary() {
  return (
    <section id="jednostki" className="space-y-4 scroll-mt-20" aria-labelledby="heading-jednostki">
      <div className="space-y-1">
        <h2 id="heading-jednostki" className="text-xl font-[700] leading-[1.3]">
          Czym jest województwo, powiat, gmina i miasto
        </h2>
        <p className="text-xs md:text-sm text-olowek leading-[1.6]">
          Polska dzieli się na województwa, te na powiaty, a powiaty na gminy. Miasto i wieś nie są osobnym szczeblem:
          to rodzaj gminy. Miejscowość (wieś, osada) jest częścią gminy.
        </p>
      </div>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {UNIT_KINDS.map((k) => (
          <div key={k.id} id={k.id} className="bg-arkusz border border-linia p-5 space-y-2 scroll-mt-20">
            <dt className="text-base font-[700] text-tusz">{k.title}</dt>
            <dd className="text-sm text-tusz leading-[1.6]">{k.long}</dd>
            <dd className="text-xs text-olowek">Przykład: {k.example} · w Polsce: {k.count}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

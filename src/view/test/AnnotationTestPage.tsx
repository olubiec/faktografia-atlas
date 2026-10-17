// Strona testowa dla zakreśleń czerwonym długopisem (dostępna tylko pod /__test/annotation).

import React, { useState } from 'react';
import { AnnotationProvider } from '../annotation/AnnotationProvider';
import { Annotate } from '../annotation/Annotate';
import type { RoughAnnotationType } from 'rough-notation/lib/model';

export const AnnotationTestPage: React.FC = () => {
  const [activeType, setActiveType] = useState<RoughAnnotationType | null>('circle');

  return (
    <AnnotationProvider>
      <main className="p-8 max-w-2xl mx-auto space-y-6 bg-arkusz border border-linia text-tusz">
        <h1 className="text-xl font-bold">Strona testowa zakreśleń (CC2.3)</h1>

        <p className="text-sm leading-relaxed">
          Wartość do zakreślenia:{' '}
          {activeType ? (
            <Annotate type={activeType} show={true}>
              <strong className="text-lg font-bold">37 840 000</strong>
            </Annotate>
          ) : (
            <strong className="text-lg font-bold">37 840 000</strong>
          )}
        </p>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-linia">
          {(['circle', 'underline', 'bracket', 'box'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 border text-sm font-medium cursor-pointer ${
                activeType === type
                  ? 'border-korekta text-korekta'
                  : 'border-linia hover:border-tusz'
              }`}
            >
              Pokaż {type}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setActiveType(null)}
            className="px-4 py-2 border border-linia hover:border-tusz text-sm font-medium cursor-pointer"
          >
            Ukryj zakreślenie
          </button>
        </div>
      </main>
    </AnnotationProvider>
  );
};

export default AnnotationTestPage;

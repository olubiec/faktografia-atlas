import React, { useMemo } from 'react';
import { cardScene, type CardKind, type CardData, type CardTheme } from '../../core/share/card';
import type { ShareFormatKey } from '../../core/share/formats';
import type { MeasureFn } from '../../core/share/text-fit';
import { CardSvg } from './CardSvg';
import { SharePreviewPager } from './SharePreviewPager';

export interface SharePreviewPanelProps {
  /** Rodzaj karty widocznej w podglądzie. */
  kind: CardKind;
  /** Dane jednej strony karty (z numeracją strony). */
  data: CardData;
  page: { number: number; total: number };
  format: ShareFormatKey;
  theme: CardTheme;
  measure: MeasureFn;
  /** Pozycja w pagerze (od 0), liczba stron i id karty do przełączania. */
  index: number;
  total: number;
  cardId: string;
  onChange: (index: number) => void;
}

/** Podgląd SVG wybranej karty w pagerze; scena liczona z danych strony, format i motywu. */
export const SharePreviewPanel: React.FC<SharePreviewPanelProps> = ({
  kind,
  data,
  page,
  format,
  theme,
  measure,
  index,
  total,
  cardId,
  onChange,
}) => {
  const scene = useMemo(
    () => cardScene(kind, data, format, theme, { measure, siteUrl: 'faktografia.eu', page }),
    [kind, data, page, format, theme, measure],
  );

  return (
    <SharePreviewPager index={index} total={total} cardId={cardId} onChange={onChange}>
      <CardSvg scene={scene} page={page} className="block w-full min-w-0 h-auto max-h-[38vh] md:max-h-[48vh]" />
    </SharePreviewPager>
  );
};

export default SharePreviewPanel;

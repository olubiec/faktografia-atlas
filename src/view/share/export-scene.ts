import { cardScene, type CardData, type CardKind, type CardScene, type CardTheme } from '../../core/share/card';
import type { ShareFormatKey, ShareScale } from '../../core/share/formats';
import type { MeasureFn } from '../../core/share/text-fit';

/** Scena karty do pliku (PNG): jedno miejsce, które ustala adres strony i skalę eksportu. */
export function buildExportScene(
  kind: CardKind,
  data: CardData,
  format: ShareFormatKey,
  theme: CardTheme,
  { measure, scale, page }: { measure: MeasureFn; scale: ShareScale; page?: { number: number; total: number } },
): CardScene {
  return cardScene(kind, data, format, theme, { measure, siteUrl: 'faktografia.eu', scale, page });
}

import React from 'react';
import type { CardKind, CardTheme } from '../../core/share/card';
import type { ShareFormatKey } from '../../core/share/formats';
import { SHARE_FORMATS } from '../../core/share/formats';

export interface ShareControlsProps {
  availableKinds: CardKind[];
  activeKind: CardKind;
  onSelectKind: (kind: CardKind) => void;
  selectedFormat: ShareFormatKey;
  onSelectFormat: (format: ShareFormatKey) => void;
  selectedTheme: CardTheme;
  onSelectTheme: (theme: CardTheme) => void;
}

const FORMAT_LABELS: Record<ShareFormatKey, string> = {
  post: 'Post (4:5)',
  square: 'Kwadrat (1:1)',
  story: 'Story (9:16)',
  wide: 'Poziomy (16:9)',
};

const KIND_LABELS: Record<CardKind, string> = {
  map: 'Mapa',
  ranking: 'Ranking',
  profile: 'Profil',
  compare: 'Porównanie',
};

export const ShareControls: React.FC<ShareControlsProps> = ({
  availableKinds,
  activeKind,
  onSelectKind,
  selectedFormat,
  onSelectFormat,
  selectedTheme,
  onSelectTheme,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 max-w-full">
      {/* Karta */}
      <div className="flex flex-col gap-1.5 max-w-full">
        <span className="text-xs font-semibold text-olowek tracking-wider">Karta</span>
        <div className="flex flex-wrap gap-1.5 max-w-full">
          {(['map', 'ranking', 'profile', 'compare'] as CardKind[]).map((k) => {
            const isAvailable = availableKinds.includes(k);
            const isSelected = activeKind === k;
            return (
              <button
                key={k}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelectKind(k)}
                className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-tusz text-kalka border-tusz'
                    : isAvailable
                    ? 'bg-arkusz text-tusz border-linia hover:bg-kalka'
                    : 'opacity-40 cursor-not-allowed border-linia'
                }`}
              >
                {KIND_LABELS[k]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Format */}
      <div className="flex flex-col gap-1.5 max-w-full">
        <span className="text-xs font-semibold text-olowek tracking-wider">Format</span>
        <div className="flex flex-wrap gap-1.5 max-w-full">
          {(Object.keys(SHARE_FORMATS) as ShareFormatKey[]).map((fmtKey) => {
            const isSelected = selectedFormat === fmtKey;
            return (
              <button
                key={fmtKey}
                type="button"
                onClick={() => onSelectFormat(fmtKey)}
                className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-tusz text-kalka border-tusz'
                    : 'bg-arkusz text-tusz border-linia hover:bg-kalka'
                }`}
              >
                {FORMAT_LABELS[fmtKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Motyw */}
      <div className="flex flex-col gap-1.5 max-w-full">
        <span className="text-xs font-semibold text-olowek tracking-wider">Motyw</span>
        <div className="flex gap-1.5 max-w-full">
          {(['light', 'dark'] as CardTheme[]).map((th) => {
            const isSelected = selectedTheme === th;
            return (
              <button
                key={th}
                type="button"
                onClick={() => onSelectTheme(th)}
                className={`min-h-[44px] min-w-[44px] flex-1 px-3 py-2 text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-tusz text-kalka border-tusz'
                    : 'bg-arkusz text-tusz border-linia hover:bg-kalka'
                }`}
              >
                {th === 'light' ? 'Jasny' : 'Ciemny'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

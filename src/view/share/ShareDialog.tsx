import React, { useState, useEffect, useMemo } from 'react';
import {
  cardScene,
  type CardKind,
  type CardTheme,
  type CardData,
  type MapCardData,
  type RankingCardData,
  type ProfileCardData,
  type CompareCardData,
} from '../../core/share/card';
import type { ShareFormatKey } from '../../core/share/formats';
import { SHARE_FORMATS } from '../../core/share/formats';
import {
  indicatorTableCsv,
  profileCsv,
  compareCsv,
  shareFileName,
  toCsv,
} from '../../core/share/csv';
import type { UnitProfile, Indicator, IndicatorValues } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { CompareRow } from '../../core/compare/compare';
import { CardSvg } from './CardSvg';
import { createMeasureFn, renderPng } from './render-png';
import { shareFiles, downloadFile } from './share-file';

export type ShareDialogData = {
  map?: MapCardData;
  ranking?: RankingCardData;
  profile?: ProfileCardData;
  compare?: CompareCardData;
  csvContent?: string;
  csvFileName?: string;
  // Options for CSV generation
  units?: Unit[];
  indicatorValues?: IndicatorValues;
  indicator?: Indicator;
  year?: number;
  unitProfile?: UnitProfile;
  compareRows?: CompareRow[];
  compareUnitA?: UnitProfile | Unit | string;
  compareUnitB?: UnitProfile | Unit | string;
};

export type ShareDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultKind?: CardKind;
  data?: ShareDialogData;
};

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

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  defaultKind = 'map',
  data = {},
}) => {
  const availableKinds = useMemo<CardKind[]>(() => {
    const kinds: CardKind[] = [];
    if (data.map) kinds.push('map');
    if (data.ranking) kinds.push('ranking');
    if (data.profile) kinds.push('profile');
    if (data.compare) kinds.push('compare');
    if (kinds.length === 0) kinds.push('map');
    return kinds;
  }, [data]);

  const [selectedKind, setSelectedKind] = useState<CardKind>(defaultKind);
  const [selectedFormat, setSelectedFormat] = useState<ShareFormatKey>('post');
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('light');
  const [isProcessing, setIsProcessing] = useState(false);

  const activeKind = availableKinds.includes(selectedKind)
    ? selectedKind
    : availableKinds[0] || 'map';

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const measure = useMemo(() => createMeasureFn(), []);

  // Determine active card data
  const activeCardData = useMemo<CardData>(() => {
    if (activeKind === 'map' && data.map) return data.map;
    if (activeKind === 'ranking' && data.ranking) return data.ranking;
    if (activeKind === 'profile' && data.profile) return data.profile;
    if (activeKind === 'compare' && data.compare) return data.compare;

    return (
      data.map || {
        indicator: { name: 'Gęstość zaludnienia', unit: 'os./km²', year: 2025 },
        year: 2025,
      }
    );
  }, [activeKind, data]);

  // Generate current SVG Scene
  const scene = useMemo(() => {
    return cardScene(activeKind, activeCardData, selectedFormat, selectedTheme, {
      measure,
      siteUrl: 'faktografia.pl',
    });
  }, [activeKind, activeCardData, selectedFormat, selectedTheme, measure]);

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    typeof navigator.share === 'function';

  // Handle PNG Download
  const handleDownloadPng = async () => {
    setIsProcessing(true);
    try {
      const blob = await renderPng(scene);
      const year = 'year' in activeCardData ? activeCardData.year : 2025;
      const fileName = shareFileName(
        'faktografia',
        [activeKind, selectedFormat, year],
        'png'
      );
      const file = new File([blob], fileName, { type: 'image/png' });
      downloadFile(file);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Native Share
  const handleShare = async () => {
    setIsProcessing(true);
    try {
      const blob = await renderPng(scene);
      const year = 'year' in activeCardData ? activeCardData.year : 2025;
      const fileName = shareFileName(
        'faktografia',
        [activeKind, selectedFormat, year],
        'png'
      );
      const file = new File([blob], fileName, { type: 'image/png' });
      await shareFiles([file], 'Faktografia Atlas');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Share Set (multiple PNG cards)
  const handleShareSet = async () => {
    setIsProcessing(true);
    try {
      const files: File[] = [];
      const kindsToShare: CardKind[] = ['map', 'ranking'];
      if (data.profile) kindsToShare.push('profile');

      for (const k of kindsToShare) {
        const cData = data[k];
        if (cData) {
          const cScene = cardScene(k, cData, selectedFormat, selectedTheme, {
            measure,
            siteUrl: 'faktografia.pl',
          });
          const blob = await renderPng(cScene);
          const year = 'year' in cData ? cData.year : 2025;
          const fileName = shareFileName('faktografia', [k, selectedFormat, year], 'png');
          files.push(new File([blob], fileName, { type: 'image/png' }));
        }
      }

      if (files.length === 0) {
        const blob = await renderPng(scene);
        const fileName = shareFileName('faktografia', [activeKind, selectedFormat, 2025], 'png');
        files.push(new File([blob], fileName, { type: 'image/png' }));
      }

      await shareFiles(files, 'Zestaw kart – Faktografia Atlas');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle CSV Download
  const handleDownloadCsv = () => {
    let csvStr = '';
    let fileName = '';

    if (data.csvContent) {
      csvStr = data.csvContent;
      fileName = data.csvFileName || shareFileName('faktografia', [activeKind, 'dane'], 'csv');
    } else if (activeKind === 'profile' && data.unitProfile) {
      csvStr = profileCsv(data.unitProfile);
      fileName = shareFileName('faktografia', ['profil', data.unitProfile.teryt], 'csv');
    } else if (activeKind === 'compare' && data.compareRows) {
      csvStr = compareCsv(data.compareRows, data.compareUnitA, data.compareUnitB);
      fileName = shareFileName('faktografia', ['porownanie'], 'csv');
    } else if (data.units && data.indicatorValues && data.indicator && data.year) {
      csvStr = indicatorTableCsv(
        data.units,
        data.indicatorValues,
        data.indicator,
        data.year
      );
      fileName = shareFileName(
        'faktografia',
        [data.indicator.id, data.indicator.minLevel, data.year],
        'csv'
      );
    } else {
      const cols = ['Tytuł', 'Wartość', 'Źródło'];
      const rows = [['Faktografia Atlas', 'Dane GUS', 'GUS, Bank Danych Lokalnych (CC BY 4.0)']];
      csvStr = toCsv(cols, rows);
      fileName = shareFileName('faktografia', ['dane'], 'csv');
    }

    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, fileName);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-tusz/40 backdrop-blur-xs overflow-x-hidden overflow-y-auto max-w-full"
      role="dialog"
      aria-modal="true"
      aria-label="Pobierz i udostępnij"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-arkusz text-tusz border border-linia rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-x-hidden overflow-y-auto p-3 sm:p-6 shadow-xl max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-linia pb-3 mb-4">
          <h2 className="text-xl font-bold">Pobierz i udostępnij</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-olowek hover:text-tusz rounded-lg border border-transparent hover:border-linia transition-colors"
            aria-label="Zamknij"
          >
            ✕
          </button>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 max-w-full">
          {/* Choice: Kind */}
          <div className="flex flex-col gap-1.5 max-w-full">
            <span className="text-xs font-semibold text-olowek uppercase tracking-wider">Karta</span>
            <div className="flex flex-wrap gap-1.5 max-w-full">
              {(['map', 'ranking', 'profile', 'compare'] as CardKind[]).map((k) => {
                const isAvailable = availableKinds.includes(k);
                const isSelected = activeKind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedKind(k)}
                    className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
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

          {/* Choice: Format */}
          <div className="flex flex-col gap-1.5 max-w-full">
            <span className="text-xs font-semibold text-olowek uppercase tracking-wider">Format</span>
            <div className="flex flex-wrap gap-1.5 max-w-full">
              {(Object.keys(SHARE_FORMATS) as ShareFormatKey[]).map((fmtKey) => {
                const isSelected = selectedFormat === fmtKey;
                return (
                  <button
                    key={fmtKey}
                    type="button"
                    onClick={() => setSelectedFormat(fmtKey)}
                    className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
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

          {/* Choice: Theme */}
          <div className="flex flex-col gap-1.5 max-w-full">
            <span className="text-xs font-semibold text-olowek uppercase tracking-wider">Motyw</span>
            <div className="flex gap-1.5 max-w-full">
              {(['light', 'dark'] as CardTheme[]).map((th) => {
                const isSelected = selectedTheme === th;
                return (
                  <button
                    key={th}
                    type="button"
                    onClick={() => setSelectedTheme(th)}
                    className={`min-h-[44px] min-w-[44px] flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
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

        {/* SVG Preview Box */}
        <div className="flex-1 min-h-[220px] flex items-center justify-center p-2 sm:p-3 bg-kalka rounded-xl border border-linia mb-4 overflow-hidden max-w-full">
          <CardSvg scene={scene} className="max-h-[48vh] w-auto max-w-full drop-shadow-sm" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 items-center justify-between border-t border-linia pt-4 max-w-full">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto max-w-full">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadPng}
              className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold bg-tusz text-kalka rounded-lg hover:opacity-90 transition-opacity flex-1 sm:flex-none"
            >
              Pobierz obraz
            </button>

            {canNativeShare && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleShare}
                className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold bg-arkusz text-tusz border border-linia rounded-lg hover:bg-kalka transition-colors flex-1 sm:flex-none"
              >
                Udostępnij
              </button>
            )}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleShareSet}
              className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold bg-arkusz text-tusz border border-linia rounded-lg hover:bg-kalka transition-colors flex-1 sm:flex-none"
            >
              Udostępnij zestaw
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadCsv}
              className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold bg-arkusz text-tusz border border-linia rounded-lg hover:bg-kalka transition-colors flex-1 sm:flex-none"
            >
              Pobierz dane (CSV)
            </button>
          </div>
        </div>

        {/* Rights notice from PRODUKT §4b */}
        <p className="mt-3 text-xs text-olowek text-center sm:text-left">
          Możesz używać i udostępniać, podając źródło: Faktografia Atlas, dane GUS.
        </p>
      </div>
    </div>
  );
};

export default ShareDialog;

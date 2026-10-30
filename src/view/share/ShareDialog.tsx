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
import { Xmark } from 'iconoir-react';
import { ShareControls } from './ShareControls';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-tusz/40 overflow-hidden max-w-full"
      role="dialog"
      aria-modal="true"
      aria-label="Pobierz i udostępnij"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-arkusz text-tusz border border-linia w-full max-w-4xl max-h-[92vh] max-md:fixed max-md:inset-0 max-md:h-dvh max-md:max-h-none flex flex-col overflow-hidden max-w-full">
                {/* Mobile Layout Wrapper */}
        <div className="flex-none sticky top-0 bg-arkusz">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-linia p-3 sm:p-6 pb-3">
            <h2 className="text-xl font-bold">Pobierz i udostępnij</h2>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-olowek hover:text-tusz border border-transparent hover:border-linia transition-colors p-2"
              aria-label="Zamknij"
            >
              <Xmark />
            </button>
          </div>

          {/* SVG Preview Box */}
          <div className="flex items-center justify-center p-2 sm:p-3 bg-kalka border-b border-linia overflow-hidden max-w-full">
            <CardSvg scene={scene} className="max-h-[30vh] md:max-h-[48vh] w-auto max-w-full" />
          </div>
        </div>

        {/* Scrollable Middle */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <ShareControls
            availableKinds={availableKinds}
            activeKind={activeKind}
            setSelectedKind={setSelectedKind}
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
          />
        </div>

        {/* Sticky Bottom */}
        <div className="flex-none sticky bottom-0 bg-arkusz border-t border-linia p-3 sm:p-6 pb-[env(safe-area-inset-bottom)]">
          <div className="flex flex-wrap gap-2 items-center justify-between max-w-full">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto max-w-full">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDownloadPng}
                className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold bg-tusz text-kalka hover:opacity-90 transition-opacity flex-1 sm:flex-none"
              >
                Pobierz obraz
              </button>

              {canNativeShare && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleShare}
                  className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors flex-1 sm:flex-none"
                >
                  Udostępnij
                </button>
              )}

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleShareSet}
                className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors flex-1 sm:flex-none"
              >
                Udostępnij zestaw
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDownloadCsv}
                className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors flex-1 sm:flex-none"
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
    </div>
  );
};

export default ShareDialog;

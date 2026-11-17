import React, { useState, useEffect, useMemo } from 'react';
import { Xmark } from 'iconoir-react';
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
import type { ShareFormatKey, ShareScale } from '../../core/share/formats';
import { shareFileName } from '../../core/share/csv';
import { dialogCsv } from './dialog-csv';
import type { UnitProfile, Indicator, IndicatorValues } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { CompareRow } from '../../core/compare/compare';
import { CardSvg } from './CardSvg';
import { createMeasureFn, renderPng } from './render-png';
import { cardPages } from '../../core/share/card-pages';
import { shareFiles, downloadFile } from './share-file';
import { buildExportScene } from './export-scene';
import { ShareControls } from './ShareControls';
import { CardSetList } from './CardSetList';
import { useCardSet } from './useCardSet';
import { cardSetFileParts } from '../../core/share/card-set';

export type ShareDialogData = {
  map?: MapCardData;
  ranking?: RankingCardData;
  profile?: ProfileCardData;
  compare?: CompareCardData;
  csvContent?: string;
  csvFileName?: string;
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
  const [scale, setScale] = useState<ShareScale>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeKind = availableKinds.includes(selectedKind)
    ? selectedKind
    : availableKinds[0] || 'map';

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

  // Zestaw „Pobierz wszystkie”: stabilne źródło (pola z data), żeby zestaw nie wracał do domyślnego przy każdym renderze.
  const { map, ranking, profile, compare, compareUnitA, compareUnitB } = data;
  const cardSource = useMemo(
    () => ({ map, ranking, profile, compare, compareUnitA, compareUnitB }),
    [map, ranking, profile, compare, compareUnitA, compareUnitB],
  );
  const cardSet = useCardSet(cardSource, isOpen);
  const setPreview = cardSet.previewPage;

  const firstPage = useMemo(() => cardPages(activeKind, activeCardData)[0], [activeKind, activeCardData]);
  // Podgląd: karta wybrana z zestawu (z numeracją zestawu) albo karta z przełącznika „Karta”.
  const previewKind = setPreview ? setPreview.entry.kind : activeKind;
  const previewData = setPreview ? setPreview.entry.data : activeCardData;
  const pagePreview = setPreview ? setPreview.page : firstPage.page;
  const previewPageData = setPreview ? setPreview.data : firstPage.data;

  const scene = useMemo(() => {
    return cardScene(previewKind, previewPageData, selectedFormat, selectedTheme, {
      measure,
      siteUrl: 'faktografia.eu',
      page: pagePreview,
    });
  }, [previewKind, previewPageData, pagePreview, selectedFormat, selectedTheme, measure]);

  const exportScene = (k: CardKind, d: CardData) => // podgląd zostaje w skali 1
    buildExportScene(k, d, selectedFormat, selectedTheme, { measure, scale });
  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    typeof navigator.share === 'function';

  const handleDownloadPng = async () => {
    setIsProcessing(true);
    try {
      const blob = await renderPng(exportScene(previewKind, previewData), { scale });
      const year = 'year' in previewData ? previewData.year : 2025;
      const file = new File([blob], shareFileName('faktografia', [previewKind, selectedFormat, year], 'png'), { type: 'image/png' });
      downloadFile(file);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    setIsProcessing(true);
    try {
      const blob = await renderPng(exportScene(previewKind, previewData), { scale });
      const year = 'year' in previewData ? previewData.year : 2025;
      const file = new File([blob], shareFileName('faktografia', [previewKind, selectedFormat, year], 'png'), { type: 'image/png' });
      await shareFiles([file], 'Faktografia Atlas');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShareSet = async () => {
    setIsProcessing(true);
    try {
      const files: File[] = [];
      const kindsToShare: CardKind[] = ['map', 'ranking'];
      if (data.profile) kindsToShare.push('profile');

      for (const k of kindsToShare) {
        const cData = data[k];
        if (cData) {
          const blob = await renderPng(exportScene(k, cData), { scale });
          const year = 'year' in cData ? cData.year : 2025;
          const fileName = shareFileName('faktografia', [k, selectedFormat, year], 'png');
          files.push(new File([blob], fileName, { type: 'image/png' }));
        }
      }

      if (files.length === 0) {
        const blob = await renderPng(exportScene(activeKind, activeCardData), { scale });
        const name = shareFileName('faktografia', [activeKind, selectedFormat, 2025], 'png');
        files.push(new File([blob], name, { type: 'image/png' }));
      }

      await shareFiles(files, 'Zestaw kart – Faktografia Atlas');
    } finally {
      setIsProcessing(false);
    }
  };

  /** Karty zestawu w kolejności wybranej przez użytkownika (każda strona osobno, numeracja n/N całego zestawu). */
  const renderAllFiles = async (): Promise<File[]> => {
    const files: File[] = [];
    for (const p of cardSet.pages) {
      const sc = buildExportScene(p.entry.kind, p.data, selectedFormat, selectedTheme, { measure, scale, page: p.page });
      const blob = await renderPng(sc, { scale });
      files.push(new File([blob], shareFileName('faktografia', cardSetFileParts(p, selectedFormat), 'png'), { type: 'image/png' }));
    }
    return files;
  };

  const handleDownloadAll = async () => {
    setIsProcessing(true);
    try {
      const files = await renderAllFiles();
      // Telefony: jedno okno udostępniania z wieloma plikami; w innych przypadkach sekwencyjne pobrania.
      await shareFiles(files, 'Wszystkie karty – Faktografia Atlas');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCsv = () => {
    const { csv, fileName } = dialogCsv(data, activeKind);
    downloadFile(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), fileName);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-tusz/40 overflow-x-hidden overflow-y-auto max-w-full w-full min-w-0"
      role="dialog"
      aria-modal="true"
      aria-label="Pobierz i udostępnij"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-arkusz text-tusz border-linia w-full md:max-w-4xl md:border md:max-h-[92vh] max-md:fixed max-md:inset-0 max-md:h-dvh max-md:max-h-none flex flex-col overflow-hidden max-w-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-arkusz flex items-center justify-between border-b border-linia p-3 md:p-6 shrink-0">
          <h2 className="text-lg md:text-xl font-bold">Pobierz i udostępnij</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-olowek hover:text-tusz border border-transparent hover:border-linia transition-colors"
            aria-label="Zamknij"
          >
            <Xmark className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body with Controls and Preview */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-6 space-y-4">
          {/* SVG Preview Box */}
          <div className="min-h-[220px] w-full min-w-0 flex items-center justify-center p-2 sm:p-3 bg-kalka border border-linia overflow-hidden max-w-full">
            <CardSvg scene={scene} page={pagePreview} className="block w-full min-w-0 h-auto max-h-[38vh] md:max-h-[48vh]" />
          </div>

          <ShareControls
            availableKinds={availableKinds}
            activeKind={activeKind}
            onSelectKind={(k) => {
              setSelectedKind(k);
              cardSet.setPreviewId(null);
            }}
            selectedFormat={selectedFormat}
            onSelectFormat={setSelectedFormat}
            selectedTheme={selectedTheme}
            onSelectTheme={setSelectedTheme}
            scale={scale}
            onSelectScale={setScale}
          />

          <CardSetList
            set={cardSet.set}
            positions={cardSet.positions}
            previewId={cardSet.previewId}
            onPreview={cardSet.setPreviewId}
            onRemove={cardSet.remove}
            onMove={cardSet.move}
            onReset={cardSet.reset}
          />

          <p className="text-xs text-olowek text-center md:text-left">
            Możesz używać i udostępniać, podając źródło: Faktografia Atlas, dane GUS.
          </p>
        </div>

        {/* Stały dolny pasek: treść nad nim przewija się, a pasek sam przewija się, gdy jest za wysoki */}
        <div data-testid="share-actions" className="z-10 bg-arkusz border-t border-linia p-3 md:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0 max-h-[40dvh] overflow-y-auto flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full max-w-full">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadPng}
              className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold whitespace-normal break-words text-center leading-tight bg-tusz text-kalka hover:opacity-90 transition-opacity grow basis-32 sm:grow-0 sm:basis-auto"
            >
              Pobierz obraz
            </button>

            {canNativeShare && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleShare}
                className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold whitespace-normal break-words text-center leading-tight bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors grow basis-32 sm:grow-0 sm:basis-auto"
              >
                Udostępnij
              </button>
            )}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleShareSet}
              className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold whitespace-normal break-words text-center leading-tight bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors grow basis-32 sm:grow-0 sm:basis-auto"
            >
              Udostępnij zestaw
            </button>

            <button
              type="button"
              disabled={isProcessing || cardSet.pages.length === 0}
              onClick={handleDownloadAll}
              className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold whitespace-normal break-words text-center leading-tight bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors grow basis-32 sm:grow-0 sm:basis-auto"
            >
              Pobierz wszystkie
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadCsv}
              className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-semibold whitespace-normal break-words text-center leading-tight bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors grow basis-32 sm:grow-0 sm:basis-auto"
            >
              Pobierz dane (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;

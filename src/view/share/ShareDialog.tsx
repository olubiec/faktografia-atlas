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
  type VersusCardData,
} from '../../core/share/card';
import { addPage, removePage, movePage, updatePage, numbering, getPage, type DeckPage, type PageKind } from '../../core/share/deck';
import { deckCsv } from '../../core/share/deck-csv';
import type { ShareFormatKey } from '../../core/share/formats';
import { shareFileName } from '../../core/share/csv';
import type { UnitProfile, Indicator, IndicatorValues } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { CompareRow } from '../../core/compare/compare';
import { CardSvg } from './CardSvg';
import { createMeasureFn, renderPng } from './render-png';
import { shareFiles, downloadFile } from './share-file';
import { ShareControls } from './ShareControls';
import { DeckStrip } from './DeckStrip';
import { AddPageMenu } from './AddPageMenu';
import { initialDeck, deckCsvSections, dataForPage, singleCsv } from './useShareData';

export type ShareDialogData = {
  map?: MapCardData;
  ranking?: RankingCardData;
  profile?: ProfileCardData;
  compare?: CompareCardData;
  versus?: VersusCardData;
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
    if (data.versus) kinds.push('versus');
    if (kinds.length === 0) kinds.push('map');
    return kinds;
  }, [data]);

  const [deck, setDeck] = useState(() => initialDeck(data));
  const [currentId, setCurrentId] = useState(
    () => (initialDeck(data).pages.find((p) => p.kind === defaultKind) ?? initialDeck(data).pages[0]).id,
  );
  const [selectedFormat, setSelectedFormat] = useState<ShareFormatKey>('post');
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('light');
  const [isProcessing, setIsProcessing] = useState(false);

  const current = getPage(deck, currentId) ?? deck.pages[0];
  const activeKind = availableKinds.includes(current.kind as CardKind)
    ? (current.kind as CardKind)
    : availableKinds[0] || 'map';
  const labels = useMemo(() => numbering(deck), [deck]);
  const pageLabel = labels.find((l) => l.id === current.id)?.label ?? '';

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
    const found = dataForPage(data, activeKind, current.options?.side);
    if (found) return found;

    return (
      data.map || {
        indicator: { name: 'Gęstość zaludnienia', unit: 'os./km²', year: 2025 },
        year: 2025,
      }
    );
  }, [activeKind, data, current.options?.side]);

  const scene = useMemo(() => {
    return cardScene(activeKind, activeCardData, selectedFormat, selectedTheme, {
      measure,
      pageLabel,
    });
  }, [activeKind, activeCardData, selectedFormat, selectedTheme, measure, pageLabel]);

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    typeof navigator.share === 'function';

  const handleDownloadPng = async () => {
    setIsProcessing(true);
    try {
      const blob = await renderPng(scene);
      const year = 'year' in activeCardData ? activeCardData.year : 2025;
      const fileName = shareFileName('faktografia', [activeKind, selectedFormat, year], 'png');
      const file = new File([blob], fileName, { type: 'image/png' });
      downloadFile(file);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    setIsProcessing(true);
    try {
      const blob = await renderPng(scene);
      const year = 'year' in activeCardData ? activeCardData.year : 2025;
      const fileName = shareFileName('faktografia', [activeKind, selectedFormat, year], 'png');
      const file = new File([blob], fileName, { type: 'image/png' });
      await shareFiles([file], 'Faktografia Atlas');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShareSet = async () => {
    setIsProcessing(true);
    try {
      const files: File[] = [];
      for (const page of deck.pages) {
        const k = page.kind as CardKind;
        const cData = dataForPage(data, k, page.options?.side);
        if (!cData) continue;
        const pageLabelText = labels.find((l) => l.id === page.id)?.label ?? '';
        const cScene = cardScene(k, cData, selectedFormat, selectedTheme, { measure, pageLabel: pageLabelText });
        const blob = await renderPng(cScene);
        const year = 'year' in cData ? cData.year : 2025;
        const fileName = shareFileName('faktografia', [k, selectedFormat, year, page.id], 'png');
        files.push(new File([blob], fileName, { type: 'image/png' }));
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

  const handleDownloadCsv = () => {
    const { csv, fileName } = singleCsv(data, activeKind);
    downloadFile(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), fileName);
  };

  const csvSections = useMemo(() => deckCsvSections(deck, data), [deck, data]);

  const handleDownloadDeckCsv = () => {
    const csv = deckCsv(csvSections);
    downloadFile(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), shareFileName('faktografia', ['zestaw', deck.pages.length], 'csv'));
  };

  const handleAddPage = (kind: PageKind, options?: DeckPage['options']) => {
    const next = addPage(deck, { kind, indicatorIds: current.indicatorIds, options }, current.id);
    const created = next.pages.find((p) => !deck.pages.some((q) => q.id === p.id));
    setDeck(next);
    if (created) setCurrentId(created.id);
  };

  const handleRemovePage = (id: string) => {
    const next = removePage(deck, id);
    setDeck(next);
    if (id === currentId) setCurrentId((next.pages[Math.min(deck.pages.findIndex((p) => p.id === id), next.pages.length - 1)] ?? next.pages[0]).id);
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
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
          {/* SVG Preview Box */}
          <div className="min-h-[220px] w-full min-w-0 flex items-center justify-center p-2 sm:p-3 bg-kalka border border-linia overflow-hidden max-w-full">
            <CardSvg scene={scene} className="block w-full min-w-0 h-auto max-h-[38vh] md:max-h-[48vh]" />
          </div>

          <DeckStrip
            pages={deck.pages.map((p) => ({
              id: p.id,
              kind: p.kind,
              label: labels.find((l) => l.id === p.id)?.label ?? '',
              title: p.kind === 'ranking' ? (p.options?.side === 'bottom' ? 'Ranking – najniżej' : 'Ranking – najwyżej') : '',
            }))}
            currentId={current.id}
            onSelect={setCurrentId}
            onRemove={handleRemovePage}
            onMove={(id, dir, steps = 1) => {
              let next = deck;
              for (let i = 0; i < steps; i++) next = movePage(next, id, dir);
              setDeck(next);
            }}
            onAdd={() => {}}
            canRemove={deck.pages.length > 1}
            addSlot={
              <AddPageMenu
                onAdd={handleAddPage}
                onSplit={() => {}}
                hasUnit={!!data.profile}
                hasPair={!!data.compare || !!data.versus}
                canSplitCurrent={false}
                allowed={availableKinds}
              />
            }
          />

          <ShareControls
            availableKinds={availableKinds}
            activeKind={activeKind}
            onSelectKind={(k) => setDeck(updatePage(deck, current.id, { kind: k }))}
            selectedFormat={selectedFormat}
            onSelectFormat={setSelectedFormat}
            selectedTheme={selectedTheme}
            onSelectTheme={setSelectedTheme}
          />

          <p className="text-xs text-olowek text-center md:text-left">
            Możesz używać i udostępniać, podając źródło: Faktografia Atlas, dane GUS.
          </p>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="sticky bottom-0 z-10 bg-arkusz border-t border-linia p-3 md:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0 flex flex-wrap gap-2 items-center justify-between">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full max-w-full">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadPng}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold text-center leading-tight bg-tusz text-kalka hover:opacity-90 transition-opacity col-span-2 sm:flex-none"
            >
              Pobierz obraz
            </button>

            {canNativeShare && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleShare}
                className="min-h-[44px] px-4 py-2 text-sm font-semibold text-center leading-tight bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors sm:flex-none"
              >
                Udostępnij
              </button>
            )}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleShareSet}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold text-center leading-tight bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors sm:flex-none"
            >
              Udostępnij zestaw
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadCsv}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold text-center leading-tight bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors sm:flex-none"
            >
              Pobierz dane (CSV)
            </button>

            {deck.pages.length > 1 && csvSections.length > 0 && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDownloadDeckCsv}
                className="min-h-[44px] px-4 py-2 text-sm font-semibold text-center leading-tight bg-arkusz text-tusz border border-linia hover:bg-kalka transition-colors sm:flex-none"
              >
                Pobierz CSV zestawu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;

// Kalendarz tematów (W26-F05, KONCEPT-ODKRYCIA §7, §7a p.4): miesiąc → grupa wskaźników (mnożnik calendarBoost)
// i coroczne daty szczytów zainteresowania. Właściciel dopisuje temat w config/facts.json bez kodu
// (miesiąc może mieć jedną grupę albo listę grup). Kalendarz zmienia tylko kolejność prawdziwych faktów.
import type { FactsConfig } from './types';

/** Coroczny szczyt zainteresowania tematem, np. publikacja GUS o płacach. */
export interface CalendarPeak {
  /** Dzień w roku „MM-DD”. */
  date: string;
  /** Grupa wskaźników (jak w config/indicators.json). */
  group: string;
  label: string;
}

export type CalendarConfig = Pick<FactsConfig, 'calendar' | 'calendarBoost'> & { calendarPeaks?: readonly CalendarPeak[] };

/** Grupy tematu miesiąca (1–12); brak wpisu = brak tematu. */
export function monthGroups(config: Pick<FactsConfig, 'calendar'>, month: number): string[] {
  const v = config.calendar[String(month)];
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

/** Mnożnik siły faktu z grupy `group` w miesiącu `month`. */
export function monthBoost(config: Pick<FactsConfig, 'calendar' | 'calendarBoost'>, group: string, month: number): number {
  return monthGroups(config, month).includes(group) ? config.calendarBoost : 1;
}

export interface UpcomingPeak extends CalendarPeak {
  /** Data szczytu w najbliższym roku (ISO, bez czasu). */
  on: string;
  /** Ile dni do szczytu. */
  inDays: number;
}

const DAY = 86_400_000;

/**
 * Szczyty za `from`–`to` dni (domyślnie 14–28): w tym oknie stronę tematu trzeba odświeżyć,
 * bo wyszukiwarka potrzebuje czasu na ponowne odczytanie (§7a p.4). Najbliższe pierwsze.
 */
export function upcomingPeaks(config: Pick<CalendarConfig, 'calendarPeaks'>, now: Date, from = 14, to = 28): UpcomingPeak[] {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const out: UpcomingPeak[] = [];
  for (const peak of config.calendarPeaks ?? []) {
    const m = /^(\d{2})-(\d{2})$/.exec(peak.date);
    if (!m) continue;
    for (const year of [now.getUTCFullYear(), now.getUTCFullYear() + 1]) {
      const at = Date.UTC(year, Number(m[1]) - 1, Number(m[2]));
      const inDays = Math.round((at - today) / DAY);
      if (inDays >= from && inDays <= to) out.push({ ...peak, on: new Date(at).toISOString().slice(0, 10), inDays });
    }
  }
  return out.sort((a, b) => a.inDays - b.inDays || a.group.localeCompare(b.group, 'pl'));
}

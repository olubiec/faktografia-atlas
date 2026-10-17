import type MiniSearch from 'minisearch';
import type { Unit, UnitLevel } from '../units/types';

export type SearchResultKind = 'unit' | 'locality';

export type Locality = {
  simc: string;
  name: string;
  gminaTeryt: string;
  lon: number;
  lat: number;
  approx?: boolean;
};

export type SearchResult = {
  kind: SearchResultKind;
  teryt: string;
  name: string;
  level?: UnitLevel;
  label: string;
  context: string;
  score: number;
};

export type SearchOptions = {
  limit?: number;
};

export type SearchDoc = {
  id: string;
  teryt: string;
  kind: SearchResultKind;
  name: string;
  cleanName: string;
  normName: string;
  normClean: string;
  level?: UnitLevel;
  label: string;
  context: string;
  unit?: Unit;
  locality?: Locality;
};

export type SearchIndex = {
  ms: MiniSearch<SearchDoc>;
  unitsMap: Map<string, Unit>;
};

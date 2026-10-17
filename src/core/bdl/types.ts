import type { z } from 'zod';
import type {
  bdlPaginationLinksSchema,
  unitResultSchema,
  unitsResponseSchema,
  variableSearchResultSchema,
  variablesSearchResponseSchema,
  dataValueSchema,
  dataByVariableResultSchema,
  dataByVariableResponseSchema,
} from './schemas';

// Typy wynikające ze schematów Zod
export type BdlPaginationLinks = z.infer<typeof bdlPaginationLinksSchema>;

export type UnitResult = z.infer<typeof unitResultSchema>;
export type UnitsResponse = z.infer<typeof unitsResponseSchema>;

export type VariableSearchResult = z.infer<typeof variableSearchResultSchema>;
export type VariablesSearchResponse = z.infer<typeof variablesSearchResponseSchema>;

export type DataValue = z.infer<typeof dataValueSchema>;
export type DataByVariableResult = z.infer<typeof dataByVariableResultSchema>;
export type DataByVariableResponse = z.infer<typeof dataByVariableResponseSchema>;

// Parametry zapytania HTTP do API BDL
export interface BdlRequestParams {
  [key: string]: string | number | boolean | undefined;
}

// Opcje konfiguracyjne klienta BDL
export interface BdlClientOptions {
  baseUrl?: string;
  clientId?: string;
  maxRetries?: number;
  initialDelayMs?: number;
  fetchFn?: typeof fetch;
}

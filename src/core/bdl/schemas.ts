import { z } from 'zod';

// Schemat linków stronicowania API BDL
export const bdlPaginationLinksSchema = z.object({
  first: z.string().optional(),
  self: z.string().optional(),
  next: z.string().optional(),
  prev: z.string().optional(),
  last: z.string().optional(),
});

// Schemat pojedynczej jednostki TERYT z API BDL
export const unitResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable().optional(),
  level: z.number(),
  hasDescription: z.boolean().optional(),
});

// Schemat odpowiedzi endpointu /units
export const unitsResponseSchema = z.object({
  totalRecords: z.number(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  links: bdlPaginationLinksSchema.optional(),
  results: z.array(unitResultSchema),
});

// Schemat pojedynczego wyniku wyszukiwania zmiennych
export const variableSearchResultSchema = z.object({
  id: z.number(),
  subjectId: z.string(),
  n1: z.string(),
  n2: z.string().optional(),
  n3: z.string().optional(),
  n4: z.string().optional(),
  n5: z.string().optional(),
  level: z.number(),
  measureUnitId: z.number(),
  measureUnitName: z.string(),
});

// Schemat odpowiedzi endpointu /variables/search
export const variablesSearchResponseSchema = z.object({
  totalRecords: z.number(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  links: bdlPaginationLinksSchema.optional(),
  results: z.array(variableSearchResultSchema),
});

// Schemat wartości w szeregu czasowym
export const dataValueSchema = z.object({
  year: z.string(),
  val: z.number().nullable(),
  attrId: z.number().optional(),
});

// Schemat rekordu danych dla jednostki w zapytaniu o zmienną
export const dataByVariableResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.array(dataValueSchema),
});

// Schemat odpowiedzi endpointu /data/by-variable/{id}
export const dataByVariableResponseSchema = z.object({
  totalRecords: z.number(),
  variableId: z.number().optional(),
  measureUnitId: z.number().optional(),
  aggregateId: z.number().optional(),
  lastUpdate: z.string().nullable().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  links: bdlPaginationLinksSchema.optional(),
  results: z.array(dataByVariableResultSchema),
});

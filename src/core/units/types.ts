export type UnitLevel = 'woj' | 'pow' | 'gmi';

export type Unit = {
  teryt: string;
  bdlId: string | null;
  name: string;
  level: UnitLevel;
  parent: string | null;
  bbox: [number, number, number, number];
  centroid: [number, number];
};

export type UnitIndex = {
  byTeryt: Map<string, Unit>;
  childrenByParent: Map<string, Unit[]>;
};

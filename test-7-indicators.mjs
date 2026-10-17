const vars = [
  { id: 'unemployed-share-working-age', varId: 1613094, minLevel: 'pow' },
  { id: 'avg-wage', varId: 64428, minLevel: 'pow' },
  { id: 'income-per-capita', varId: 76973, minLevel: 'gmi' },
  { id: 'spending-per-capita', varId: 76964, minLevel: 'gmi' },
  { id: 'dwellings-per-1000', varId: 747060, minLevel: 'gmi' },
  { id: 'sewerage-share', varId: 79130, minLevel: 'gmi' },
  { id: 'preschool-3-6', varId: 1617169, minLevel: 'gmi' },
];

async function getVarDetails(varId) {
  const res = await fetch(`https://bdl.stat.gov.pl/api/v1/variables/${varId}?format=json&lang=pl`);
  return await res.json();
}

async function getValueForUnit(varId, unitId) {
  const res = await fetch(`https://bdl.stat.gov.pl/api/v1/data/by-unit/${unitId}?var-id=${varId}&format=json&lang=pl`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || !data.results || data.results.length === 0) return null;
  const vals = data.results[0].values;
  if (!vals || vals.length === 0) return null;
  const sorted = [...vals].sort((a, b) => Number(b.year) - Number(a.year));
  return sorted[0];
}

async function getCoverage(varId, year) {
  const gmiRes = await fetch(`https://bdl.stat.gov.pl/api/v1/data/by-variable/${varId}?unit-level=6&year=${year}&page-size=1&format=json&lang=pl`);
  const gmiData = await gmiRes.json();
  const powRes = await fetch(`https://bdl.stat.gov.pl/api/v1/data/by-variable/${varId}?unit-level=5&year=${year}&page-size=1&format=json&lang=pl`);
  const powData = await powRes.json();
  return {
    gmiCount: gmiData?.totalRecords ?? 0,
    powCount: powData?.totalRecords ?? 0,
  };
}

async function main() {
  for (const v of vars) {
    const details = await getVarDetails(v.varId);
    const years = details.years || [];
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const coverage = await getCoverage(v.varId, maxYear);

    const malopolska = await getValueForUnit(v.varId, '011200000000'); // woj małopolskie
    const zakopaneGmi = await getValueForUnit(v.varId, '011216917011'); // gmina Zakopane
    const powTatrzanski = await getValueForUnit(v.varId, '011216917000'); // pow. tatrzański

    console.log(`\n=== ${v.id} (Var ID: ${v.varId}) ===`);
    console.log(`Name: ${[details.n1, details.n2, details.n3, details.n4, details.n5].filter(Boolean).join(' -> ')}`);
    console.log(`Level: ${details.level} (${v.minLevel}) | Unit: ${details.measureUnitName} (${details.measureUnitId})`);
    console.log(`Years: ${minYear}-${maxYear} (${years.length} years)`);
    console.log(`Coverage (${maxYear}): Gmi: ${coverage.gmiCount}, Pow: ${coverage.powCount}`);
    console.log(`Małopolska (${maxYear}): ${malopolska ? malopolska.val : 'null'}`);
    if (zakopaneGmi) console.log(`Zakopane gmi (${maxYear}): ${zakopaneGmi.val}`);
    if (powTatrzanski) console.log(`Powiat Tatrzański (${maxYear}): ${powTatrzanski.val}`);
  }
}
main();

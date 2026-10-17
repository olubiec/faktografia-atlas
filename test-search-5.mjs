async function searchVarsBySubject(subjectId) {
  const url = 'https://bdl.stat.gov.pl/api/v1/variables?subject-id=' + subjectId + '&page-size=100&format=json&lang=pl';
  const res = await fetch(url);
  const data = await res.json();
  console.log('=== Variables for Subject:', subjectId, 'Total:', data.totalRecords);
  if (data.results) {
    for (const r of data.results) {
      const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
      console.log(`Var ID: ${r.id} | Level: ${r.level} | Unit: ${r.measureUnitName} (${r.measureUnitId}) | ${name}`);
    }
  }
}

async function main() {
  console.log('--- 1. Sewerage share (P2433) ---');
  await searchVarsBySubject('P2433');

  console.log('--- 2. Samorząd - Dochody / Wydatki ---');
  // Let's find subjects for GMINY in K2
  const res = await fetch('https://bdl.stat.gov.pl/api/v1/subjects?parent-id=G199&page-size=100&format=json&lang=pl');
  const d = await res.json();
  if (d.results) {
    for (const s of d.results) {
      console.log(`Sub-subject G199: ${s.id} | ${s.name}`);
      await searchVarsBySubject(s.id);
    }
  }
}
main();

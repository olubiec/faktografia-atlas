async function searchSubjects(phrase) {
  const url = 'https://bdl.stat.gov.pl/api/v1/subjects?name=' + encodeURIComponent(phrase) + '&page-size=50&format=json&lang=pl';
  const res = await fetch(url);
  const data = await res.json();
  console.log('=== Subjects for:', phrase, 'Total:', data.totalRecords);
  if (data.results) {
    for (const r of data.results) {
      console.log(`Subject ID: ${r.id} | ${r.name}`);
    }
  }
}

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
  await searchSubjects('bezrobotn');
  await searchSubjects('wynagrodzen');
  await searchSubjects('dochód');
  await searchSubjects('dochody');
  await searchSubjects('wydatek');
  await searchSubjects('wydatki');
  await searchSubjects('kanalizacj');
}
main();

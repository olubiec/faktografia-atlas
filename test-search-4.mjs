async function searchSubjectsByParent(parentId) {
  const url = 'https://bdl.stat.gov.pl/api/v1/subjects?parent-id=' + parentId + '&page-size=100&format=json&lang=pl';
  const res = await fetch(url);
  const data = await res.json();
  console.log('=== Sub-subjects for:', parentId, 'Total:', data.totalRecords);
  if (data.results) {
    for (const r of data.results) {
      console.log(`Sub Subject ID: ${r.id} | ${r.name}`);
      // Search sub-sub subjects
      const res2 = await fetch('https://bdl.stat.gov.pl/api/v1/subjects?parent-id=' + r.id + '&page-size=100&format=json&lang=pl');
      const data2 = await res2.json();
      if (data2.results) {
        for (const r2 of data2.results) {
          console.log(`  -> Sub Sub Subject ID: ${r2.id} | ${r2.name}`);
        }
      }
    }
  }
}

async function main() {
  await searchSubjectsByParent('K4'); // Rynek pracy
  await searchSubjectsByParent('K40'); // Wynagrodzenia
  await searchSubjectsByParent('K2'); // Samorząd terytorialny
  await searchSubjectsByParent('K27'); // Finanse publiczne
  await searchSubjectsByParent('K11'); // Gospodarka mieszkaniowa i komunalna
}
main();

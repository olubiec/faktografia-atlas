async function searchSubSubjects(parentId, depth = 0) {
  const url = 'https://bdl.stat.gov.pl/api/v1/subjects?parent-id=' + parentId + '&page-size=100&format=json&lang=pl';
  const res = await fetch(url);
  const data = await res.json();
  if (data.results) {
    for (const r of data.results) {
      console.log('  '.repeat(depth) + `Subject: ${r.id} | ${r.name}`);
      if (r.hasVariables) {
        const vres = await fetch('https://bdl.stat.gov.pl/api/v1/variables?subject-id=' + r.id + '&page-size=100&format=json&lang=pl');
        const vdata = await vres.json();
        if (vdata.results) {
          for (const vr of vdata.results) {
            const vname = [vr.n1, vr.n2, vr.n3, vr.n4, vr.n5].filter(Boolean).join(' -> ');
            console.log('  '.repeat(depth + 1) + `Var: ${vr.id} | Level: ${vr.level} | Unit: ${vr.measureUnitName} (${vr.measureUnitId}) | ${vname}`);
          }
        }
      }
      await searchSubSubjects(r.id, depth + 1);
    }
  }
}

async function main() {
  console.log('=== G499 WSKAŹNIKI SAMORZĄDU ===');
  await searchSubSubjects('G499');
  console.log('=== K27 FINANSE PUBLICZNE ===');
  await searchSubSubjects('K27');
}
main();

async function testVar(id) {
  try {
    const res = await fetch(`https://bdl.stat.gov.pl/api/v1/variables/${id}?format=json&lang=pl`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.id) return data;
  } catch {}
  return null;
}

async function main() {
  console.log('Sweeping IDs 76071..76447 for P2627 and P2644...');
  for (let id = 76071; id <= 76447; id++) {
    const v = await testVar(id);
    if (v) {
      const name = [v.n1, v.n2, v.n3, v.n4, v.n5].filter(Boolean).join(' -> ');
      if (v.subjectId === 'P2627' || v.subjectId === 'P2644' || name.includes('mieszkańca')) {
        console.log(`ID: ${v.id} | Subject: ${v.subjectId} | Level: ${v.level} | Unit: ${v.measureUnitName} | ${name}`);
      }
    }
  }
}
main();

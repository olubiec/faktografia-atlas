const fs = require('fs');
let code = fs.readFileSync('src/view/legend/Legend.tsx', 'utf-8');

code = code.replace(
  'style={{ backgroundColor: `var(${item.token})` }}',
  'style={item.token === \'--no-data\' ? { background: \'repeating-linear-gradient(45deg, var(--linia) 0, var(--linia) 1px, var(--no-data) 1px, var(--no-data) 5px)\' } : { backgroundColor: `var(${item.token})` }}'
);

fs.writeFileSync('src/view/legend/Legend.tsx', code);

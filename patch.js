const fs = require('fs');
let content = fs.readFileSync('docs/STAN.md', 'utf8');
content = content.replace(/<<<<<<< HEAD[\s\S]*?=======\n/g, '');
content = content.replace(/>>>>>>> origin\/main\n/g, '');
content = content.replace('W1.4 kamera · W1.5 kafelki', '**W1.4 kamera (ZROBIONE)** · W1.5 kafelki');
fs.writeFileSync('docs/STAN.md', content);

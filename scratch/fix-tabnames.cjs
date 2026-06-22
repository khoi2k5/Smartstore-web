const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

content = content.replace(
  /if \(data\.tabNames\) setTabNames\(data\.tabNames\);/,
  "if (data.tabNames) setTabNames(prev => ({...prev, ...data.tabNames}));"
);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Fixed tabNames merge');

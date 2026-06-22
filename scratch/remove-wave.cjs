const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// Remove the wavy SVG background from anywhere in the file
const svgStyleRegex = / style=\{\{ backgroundImage: "url\('data:image\/svg\+xml,[^}]*\}\}/g;
content = content.replace(svgStyleRegex, '');

// Also remove bg-[#e0f2fe] and replace with the Macchiato cream bg-[#f4ebe1]
content = content.replace(/bg-\[#e0f2fe\]/g, 'bg-[#f4ebe1]');

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Removed blue wavy background');

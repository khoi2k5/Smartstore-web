const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// Soften text colors to prevent eye strain on dark abstract background
content = content.replace(/text-slate-400/g, 'text-slate-500');
content = content.replace(/text-slate-300/g, 'text-slate-400');
content = content.replace(/text-slate-200/g, 'text-slate-300');
content = content.replace(/text-white/g, 'text-slate-200');

// Keep buttons bright
content = content.replace(/bg-blue-600\/70 backdrop-blur-md border border-blue-400\/30 shadow-\[0_0_15px_rgba\(37,99,235,0\.3\)\] hover:shadow-\[0_0_25px_rgba\(37,99,235,0\.5\)\] text-slate-200/g, 'bg-blue-600/70 backdrop-blur-md border border-blue-400/30 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] text-white');

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Softened text colors');

const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Invert Text Colors to White/Light Gray
content = content.replace(/text-\[#4a3f35\]/g, 'text-white');
content = content.replace(/text-\[#3e342b\]/g, 'text-white');
content = content.replace(/text-\[#5c4f42\]/g, 'text-slate-200');
content = content.replace(/text-\[#756658\]/g, 'text-slate-300');
content = content.replace(/text-\[#8c7b6c\]/g, 'text-slate-400');

// 2. Convert Backgrounds to Dark Glass
content = content.replace(/bg-\[#fdfbf7\]\/95 backdrop-blur-md/g, 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl');
content = content.replace(/bg-\[#fdfbf7\]/g, 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg');
content = content.replace(/bg-\[#f4ebe1\]/g, 'bg-transparent'); // Root background should be totally transparent to let image through
content = content.replace(/bg-\[#f9f5f0\]/g, 'bg-white/5');
content = content.replace(/bg-\[#f0e8df\]/g, 'bg-white/10 hover:bg-white/20'); // often used for hover states
content = content.replace(/bg-\[#e6dacb\]/g, 'bg-white/20');
content = content.replace(/bg-\[#fdf8f3\]/g, 'bg-blue-500/10');
content = content.replace(/bg-\[#f5eade\]/g, 'bg-blue-500/20');

// 3. Convert Borders to Subtle Glass
content = content.replace(/border-\[#e8dcc7\]/g, 'border-white/10');
content = content.replace(/border-\[#e6dacb\]/g, 'border-white/10');
content = content.replace(/border-\[#d6c5b3\]/g, 'border-white/20');
content = content.replace(/border-\[#c4af9a\]/g, 'border-white/30');

// 4. Convert Coffee/Brown Accents to Neon Blue/Purple Glass
content = content.replace(/bg-\[#8b5e34\]/g, 'bg-blue-600/70 backdrop-blur-md border border-blue-400/30 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]');
content = content.replace(/bg-\[#704b29\]/g, 'bg-blue-700/70 backdrop-blur-md');
content = content.replace(/bg-\[#5c3e23\]/g, 'bg-blue-800/70 backdrop-blur-md');
content = content.replace(/text-\[#8b5e34\]/g, 'text-blue-400');
content = content.replace(/border-\[#8b5e34\]/g, 'border-blue-500');
content = content.replace(/border-\[#5c3e23\]/g, 'border-blue-700');
content = content.replace(/from-\[#8b5e34\] to-\[#a67c52\]/g, 'from-cyan-400 to-purple-500');
content = content.replace(/shadow-\[#8b5e34\]\/30/g, 'shadow-blue-500/40');
content = content.replace(/shadow-\[#8b5e34\]\/20/g, 'shadow-blue-500/30');

// 5. Special Fixes for POS
// The cart grid text color needs to be white
content = content.replace(/text-slate-800/g, 'text-white');
content = content.replace(/text-slate-900/g, 'text-white');
content = content.replace(/text-slate-700/g, 'text-slate-200');
content = content.replace(/text-slate-600/g, 'text-slate-300');
content = content.replace(/text-slate-500/g, 'text-slate-400');
// Keypad buttons
content = content.replace(/bg-slate-100 hover:bg-slate-200/g, 'bg-white/10 hover:bg-white/20');
content = content.replace(/bg-slate-200 active:bg-slate-300/g, 'bg-white/20 active:bg-white/30');
// Inputs should have a glassy look
content = content.replace(/bg-white border-slate-300/g, 'bg-black/50 border-white/20 text-white placeholder-slate-400');

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Applied Dark Glassmorphism Theme');

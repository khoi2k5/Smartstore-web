const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  // Skip the root and login backgrounds that we just carefully set
  if (line.includes('min-h-screen') && line.includes('bg-[#e0f2fe]')) continue;
  
  // Make large white areas glass
  if (line.includes('<div') || line.includes('<nav') || line.includes('<aside') || line.includes('<section')) {
    // Replace bg-white (but not bg-white/xx)
    if (line.match(/bg-white(?!\/)/)) {
      line = line.replace(/bg-white(?!\/)/g, 'bg-white/40 backdrop-blur-md');
    }
    
    // Replace bg-white/80 with bg-white/40
    if (line.includes('bg-white/80')) {
      line = line.replace(/bg-white\/80/g, 'bg-white/40');
    }

    // Replace bg-slate-50 with bg-white/30
    if (line.match(/bg-slate-50(?!\/)/)) {
      line = line.replace(/bg-slate-50(?!\/)/g, 'bg-white/30 backdrop-blur-sm');
    }
  }

  // Soften borders
  if (line.includes('border-slate-200')) {
    line = line.replace(/border-slate-200/g, 'border-white/50');
  }
  if (line.includes('border-slate-300')) {
    line = line.replace(/border-slate-300/g, 'border-white/60');
  }
  if (line.includes('border-slate-400')) {
    line = line.replace(/border-slate-400/g, 'border-white/70');
  }

  lines[i] = line;
}

// Special fixes for buttons and inputs inside the POS
// The keypad buttons need to remain visible, maybe bg-white/60
const newContent = lines.join('\n');
fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', newContent, 'utf8');
console.log('Applied Glassmorphism Theme');

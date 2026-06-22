const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Revert global backgrounds and replace with Soft Earth Background
const rootRegex = /<div className="min-h-screen[^>]*>/;
const newRoot = `<div className="min-h-screen text-[#4a3f35] font-sans flex flex-col md:flex-row p-0 md:p-4 md:gap-4 bg-[#f4ebe1]">`;
content = content.replace(rootRegex, newRoot);

const loginRegex = /<div className="min-h-screen[^>]*flex items-center justify-center p-4[^>]*>/;
const newLogin = `<div className="min-h-screen text-[#4a3f35] flex items-center justify-center p-4 bg-[#f4ebe1]">`;
content = content.replace(loginRegex, newLogin);

// 2. Replace Glassmorphism back to solid warm white
content = content.replace(/bg-white\/40 backdrop-blur-md/g, 'bg-[#fdfbf7]');
content = content.replace(/bg-white\/30 backdrop-blur-sm/g, 'bg-[#fdfbf7]');
content = content.replace(/border-white\/40/g, 'border-[#e8dcc7]');
content = content.replace(/border-white\/50/g, 'border-[#e8dcc7]');
content = content.replace(/border-white\/60/g, 'border-[#e8dcc7]');
content = content.replace(/border-white\/70/g, 'border-[#e8dcc7]');

// 3. Replace Blues with Coffee/Caramel
content = content.replace(/bg-blue-600/g, 'bg-[#8b5e34]');
content = content.replace(/bg-blue-700/g, 'bg-[#704b29]');
content = content.replace(/bg-blue-800/g, 'bg-[#5c3e23]');
content = content.replace(/text-blue-600/g, 'text-[#8b5e34]');
content = content.replace(/text-blue-700/g, 'text-[#8b5e34]');
content = content.replace(/border-blue-600/g, 'border-[#8b5e34]');
content = content.replace(/border-blue-800/g, 'border-[#5c3e23]');
content = content.replace(/bg-blue-50/g, 'bg-[#fdf8f3]');
content = content.replace(/bg-blue-100/g, 'bg-[#f5eade]');
content = content.replace(/from-blue-600 to-indigo-600/g, 'from-[#8b5e34] to-[#a67c52]');
content = content.replace(/shadow-blue-600\/30/g, 'shadow-[#8b5e34]/30');
content = content.replace(/shadow-blue-600\/20/g, 'shadow-[#8b5e34]/20');

// 4. Replace Slate text with Warm Dark Brown
content = content.replace(/text-slate-800/g, 'text-[#4a3f35]');
content = content.replace(/text-slate-900/g, 'text-[#3e342b]');
content = content.replace(/text-slate-700/g, 'text-[#5c4f42]');
content = content.replace(/text-slate-600/g, 'text-[#756658]');
content = content.replace(/text-slate-500/g, 'text-[#8c7b6c]');

// 5. Replace Slate backgrounds/borders with Warm Beiges
content = content.replace(/bg-slate-50(?!\/)/g, 'bg-[#f9f5f0]');
content = content.replace(/bg-slate-100/g, 'bg-[#f0e8df]');
content = content.replace(/bg-slate-200/g, 'bg-[#e6dacb]');
content = content.replace(/border-slate-200/g, 'border-[#e6dacb]');
content = content.replace(/border-slate-300/g, 'border-[#d6c5b3]');
content = content.replace(/border-slate-400/g, 'border-[#c4af9a]');

// Fix any leftover bg-white to warm white
content = content.replace(/bg-white(?!\/)/g, 'bg-[#fdfbf7]');

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Applied Macchiato Theme');

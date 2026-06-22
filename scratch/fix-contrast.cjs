const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Force all text to be pure white or very light gray for high contrast
content = content.replace(/text-slate-500/g, 'text-white font-medium drop-shadow-md');
content = content.replace(/text-slate-400/g, 'text-white font-medium drop-shadow-md');
content = content.replace(/text-slate-300/g, 'text-white font-medium');
content = content.replace(/text-slate-200/g, 'text-white font-medium');

// 2. Fix the green login button to match the Neon Blue theme
content = content.replace(/from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500/g, 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]');

// 3. Fix the "Đăng nhập để vào hệ thống" specific text (was slate-400, now white, let's make it more vibrant)
// Actually we already replaced text-slate-400 with text-white font-medium drop-shadow-md. That's good.

// 4. Fix input text for autofill issues. 
// We will add a placeholder class if missing, and ensure inputs have dark background without double borders.
content = content.replace(/border border-white\/10 shadow-2xl border border-white\/10/g, 'border border-white/20');

// 5. Some text like Demo Accounts was slate-400, it's now white.
// Let's remove the opacity classes on texts to ensure they pop
content = content.replace(/text-slate-600/g, 'text-white font-medium');

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Fixed text contrast');

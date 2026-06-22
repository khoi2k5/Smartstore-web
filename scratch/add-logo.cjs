const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// Login screen replacement
const loginHeaderRegex = /<h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">\s*SmartStore\s*<\/h1>/;
const loginLogoHtml = `<div className="flex justify-center mb-6">\n              <img src="/logo.png" alt="SmartStore Logo" className="h-32 object-contain drop-shadow-lg" />\n            </div>`;
content = content.replace(loginHeaderRegex, loginLogoHtml);

// Sidebar replacement
const sidebarHeaderRegex = /<h1 className="text-2xl font-extrabold text-white mb-1">\s*SmartStore\s*<\/h1>/;
const sidebarLogoHtml = `<img src="/logo.png" alt="SmartStore Logo" className="h-16 object-contain mb-2 drop-shadow-md" />`;
content = content.replace(sidebarHeaderRegex, sidebarLogoHtml);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Added Logo');

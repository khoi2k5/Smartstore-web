const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// The main app root
const appRegex = /<div className="min-h-screen text-\[#4a3f35\] font-sans flex flex-col md:flex-row p-0 md:p-4 md:gap-4 bg-\[#f4ebe1\]">/;
const newAppRoot = `<div className="min-h-screen text-[#4a3f35] font-sans flex flex-col md:flex-row p-0 md:p-4 md:gap-4" style={{ backgroundImage: "url('/bg-abstract.jpg')", backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' }}>`;

// The login root
const loginRegex = /<div className="min-h-screen text-\[#4a3f35\] flex items-center justify-center p-4 bg-\[#f4ebe1\]">/;
const newLoginRoot = `<div className="min-h-screen text-[#4a3f35] flex items-center justify-center p-4" style={{ backgroundImage: "url('/bg-abstract.jpg')", backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' }}>`;

content = content.replace(appRegex, newAppRoot);
content = content.replace(loginRegex, newLoginRoot);

// Make the cards slightly translucent so the background can be seen better
content = content.replace(/bg-\[#fdfbf7\]/g, 'bg-[#fdfbf7]/95 backdrop-blur-md');

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Applied abstract background');

const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// Fix the Login Root
content = content.replace(
  '<div className="min-h-screen text-[#4a3f35] font-sans flex flex-col md:flex-row p-0 md:p-4 md:gap-4 bg-[#f4ebe1]">',
  '<div className="min-h-screen text-[#4a3f35] flex items-center justify-center p-4 bg-[#f4ebe1]">'
);

// Fix the Login Card
content = content.replace(
  '<div className="bg-white/40 backdrop-blur-xl border border-white shadow-sm rounded-md p-10 max-w-md w-full">',
  '<div className="bg-[#fdfbf7] border border-[#e8dcc7] shadow-xl rounded-2xl p-10 max-w-md w-full">'
);

// One more check to make sure the main root wasn't accidentally broken
// The main root is at the bottom:
// <div className="min-h-screen text-[#4a3f35] font-sans flex flex-col md:flex-row p-0 md:p-4 md:gap-4 bg-[#f4ebe1]">
// Since we only replaced the FIRST occurrence (which was the login), the main root is still correct!
// Oh wait! If we replaced the first occurrence, the main root is intact.

// Let's also check if there are any other bg-white/xx left
content = content.replace(/bg-white\/\d+ backdrop-blur-xl/g, 'bg-[#fdfbf7]');
content = content.replace(/border-white/g, 'border-[#e8dcc7]');

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Fixed Login Macchiato');

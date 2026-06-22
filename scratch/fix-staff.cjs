const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

const regex1 = /\{\/\*\s*Mobile View Mockup for Staff\s*\*\/\}\s*<div className="w-\[400px\] bg-slate-50 border-\[8px\] border-gray-800 rounded-\[3rem\] p-6 shadow-md border border-slate-200 relative overflow-y-auto">\s*\{\/\*\s*Fake Notch\s*\*\/\}\s*<div className="absolute top-0 left-1\/2 -translate-x-1\/2 w-32 h-6 bg-white rounded-b-3xl"><\/div>/;

const newStr = `{/* Mobile View for Staff */}
            <div className="w-full bg-slate-50 md:rounded-3xl p-4 md:p-6 pb-24 shadow-md md:border border-slate-200 relative overflow-y-auto max-w-lg mx-auto h-full md:h-auto">`;

if (regex1.test(content)) {
    content = content.replace(regex1, newStr);
    fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
    console.log('Fixed staff UI correctly');
} else {
    console.log('Regex did not match');
}

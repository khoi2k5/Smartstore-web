const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Fix POS flex container
content = content.replace(
  '<div className="flex gap-2 h-full animate-in slide-in-from-right-8 duration-300 min-h-0 bg-slate-100 p-2 rounded-sm border border-slate-300 relative">',
  '<div className="flex flex-col-reverse md:flex-row gap-2 h-full animate-in slide-in-from-right-8 duration-300 min-h-0 bg-slate-100 p-2 rounded-sm border border-slate-300 relative overflow-y-auto md:overflow-hidden">'
);

// 2. Fix Cart width
content = content.replace(
  '<div className="w-[450px] flex flex-col bg-white border border-slate-400 shrink-0 shadow-sm rounded-sm">',
  '<div className="w-full md:w-[450px] flex flex-col bg-white border border-slate-400 shrink-0 shadow-sm rounded-sm h-[60vh] md:h-auto min-h-[400px]">'
);

// 3. Add Back Button to Header
content = content.replace(
  '<div className="bg-blue-700 text-white p-2 flex justify-between items-center shrink-0">',
  `<div className="bg-blue-700 text-white p-2 flex justify-between items-center shrink-0 gap-2">
                  {posConfig.layout !== 'retail' && (
                    <button onClick={() => setSelectedTable(null)} className="md:hidden text-white border border-white/30 px-2 py-1 rounded text-xs font-bold whitespace-nowrap bg-blue-800">
                      &lt; Quay lại
                    </button>
                  )}`
);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Fixed POS Layout.');

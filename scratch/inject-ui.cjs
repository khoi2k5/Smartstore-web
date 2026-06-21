const fs = require('fs');

let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// For Notes Management
content = content.replace(
  /<div className="flex gap-2 mb-6 h-\[46px\]">\s*<input type="text" placeholder="Nhập ghi chú mới\.\.\." value=\{newNote\} onChange=\{e => setNewNote\(e\.target\.value\)\} onKeyDown=\{\(e\) => e\.key === 'Enter' && handleAddNewNote\(\)\} className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 text-slate-800 text-sm h-full" \/>\s*<button onClick=\{handleAddNewNote\} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-bold transition-colors h-full flex items-center justify-center">Thêm<\/button>\s*<\/div>/,
  `<div className="flex flex-col gap-2 mb-6">
                  <input type="text" placeholder="Nhập ghi chú mới..." value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNewNote()} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 text-sm" />
                  <button onClick={handleAddNewNote} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-colors">Thêm</button>
                </div>`
);

// For Size Management
content = content.replace(
  /<div className="flex flex-col gap-2 mb-6">\s*<input type="text" placeholder="Tên \(VD: Size L\)" value=\{newSizeName\} onChange=\{e => setNewSizeName\(e\.target\.value\)\} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 text-slate-800 text-sm h-\[40px\]" \/>\s*<div className="flex gap-2 h-\[40px\]">\s*<input type="number" placeholder="\+Giá \(VNĐ\)" value=\{newSizePrice\} onChange=\{e => setNewSizePrice\(e\.target\.value\)\} className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 text-slate-800 text-sm h-full" \/>\s*<button onClick=\{handleAddNewSize\} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-bold transition-colors text-sm whitespace-nowrap h-full flex items-center justify-center">Thêm<\/button>\s*<\/div>\s*<\/div>/,
  `<div className="flex flex-col gap-2 mb-6">
                  <input type="text" placeholder="Tên (VD: Size L)" value={newSizeName} onChange={e => setNewSizeName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 text-sm" />
                  <input type="number" placeholder="+Giá (VNĐ)" value={newSizePrice} onChange={e => setNewSizePrice(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 text-sm" />
                  <button onClick={handleAddNewSize} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-colors">Thêm</button>
                </div>`
);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Fixed UI alignments correctly without fuzzy matching destroying the file.');

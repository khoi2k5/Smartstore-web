const fs = require('fs');

let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

const regex = /<div className="flex flex-col gap-2 mb-6">\s*<button onClick=\{handleAddNewSize\} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg font-bold transition-colors text-sm whitespace-nowrap">Thêm<\/button>\s*<\/div>\s*<\/div>/;

const replacementStr = `<div className="flex flex-col gap-2 mb-6">
                  <input type="text" placeholder="Tên (VD: Size L)" value={newSizeName} onChange={e => setNewSizeName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 text-slate-800 text-sm h-[40px]" />
                  <div className="flex gap-2 h-[40px]">
                    <input type="number" placeholder="+Giá (VNĐ)" value={newSizePrice} onChange={e => setNewSizePrice(e.target.value)} className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 text-slate-800 text-sm h-full" />
                    <button onClick={handleAddNewSize} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-bold transition-colors text-sm whitespace-nowrap h-full flex items-center justify-center">Thêm</button>
                  </div>
                </div>`;

if (regex.test(content)) {
  content = content.replace(regex, replacementStr);
  fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
  console.log('Fixed Size Management inputs');
} else {
  console.log('Target string not found via regex.');
}

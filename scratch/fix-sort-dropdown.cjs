const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Remove productSort state
content = content.replace(/const \[productSort, setProductSort\] = useState\('name_asc'\);\s*\n/g, '');

// 2. Remove the <select> dropdown and the wrapping <div className="flex gap-3">
const selectRegex = /<div className="flex gap-3">\s*<select value=\{productSort\}.*?<\/select>\s*(<button onClick=\{\(\) => \{[\s\S]*?\+ Thêm Sản Phẩm Mới\s*<\/button>)\s*<\/div>/;
// Wait, the regex might fail if there are line breaks I didn't account for.
// Let's use a simpler replace or substring logic if needed.
// Actually, I can just replace the whole block by finding the start of the div and end of it.

const startIdx = content.indexOf('<div className="flex gap-3">');
if(startIdx !== -1) {
    const endBtnStr = '+ Thêm Sản Phẩm Mới\n                        </button>\n                      </div>';
    const endIdx = content.indexOf(endBtnStr);
    if(endIdx !== -1) {
        const fullStr = content.substring(startIdx, endIdx + endBtnStr.length);
        const buttonOnly = `<button onClick={() => {
                          setEditingProduct(null);
                          setProductForm({ name: '', price: '', image: null, icon: '📦', category: '', status: 'not_ready', recipe: [] });
                          setShowProductModal(true);
                        }} className="bg-blue-600/70 backdrop-blur-md border border-blue-400/30 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:bg-blue-700/70 backdrop-blur-md text-white font-medium px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
                          + Thêm Sản Phẩm Mới
                        </button>`;
        content = content.replace(fullStr, buttonOnly);
    }
}

// 3. Update the sorting logic to always sort by category
const mapRegex = /\{products\.slice\(\)\.sort\(\(a,b\) => \{[\s\S]*?\}\)\.map\(p => \(/;
const newMap = `{products.slice().sort((a,b) => {
                          const catA = categories.find(c => c.id === a.category)?.name || '';
                          const catB = categories.find(c => c.id === b.category)?.name || '';
                          if (catA !== catB) return catA.localeCompare(catB);
                          return a.name.localeCompare(b.name);
                        }).map(p => (`;
content = content.replace(mapRegex, newMap);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Removed sort dropdown and fixed wrapping button');

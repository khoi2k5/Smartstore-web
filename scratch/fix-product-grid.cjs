const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Add state
if(!content.includes("const [productSort, setProductSort] = useState('name_asc');")) {
    content = content.replace(
        "const [scanResult, setScanResult] = useState('');",
        "const [scanResult, setScanResult] = useState('');\n  const [productSort, setProductSort] = useState('name_asc');"
    );
}

// 2. Add Sort Dropdown next to 'Thêm Sản Phẩm Mới' button
const btnRegex = /<button onClick=\{\(\) => \{\s*setEditingProduct\(null\);\s*setProductForm\(\{ name: '', price: '', image: null, icon: '📦', category: '', status: 'not_ready', recipe: \[\] \}\);\s*setShowProductModal\(true\);\s*\}\} className="bg-blue-600\/70 backdrop-blur-md border border-blue-400\/30 shadow-\[0_0_15px_rgba\(37,99,235,0\.3\)\] hover:shadow-\[0_0_25px_rgba\(37,99,235,0\.5\)\] hover:bg-blue-700\/70 backdrop-blur-md text-white font-medium px-5 py-2\.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2">\s*\+ Thêm Sản Phẩm Mới\s*<\/button>/;

const newBtn = `<div className="flex gap-3">
                        <select value={productSort} onChange={e => setProductSort(e.target.value)} className="bg-black/40 backdrop-blur-xl border border-white/20 text-white font-medium px-3 py-2 rounded-lg outline-none font-bold">
                          <option value="name_asc" className="text-black">Tên A-Z</option>
                          <option value="name_desc" className="text-black">Tên Z-A</option>
                          <option value="price_asc" className="text-black">Giá tăng dần</option>
                          <option value="price_desc" className="text-black">Giá giảm dần</option>
                        </select>
                        <button onClick={() => {
                          setEditingProduct(null);
                          setProductForm({ name: '', price: '', image: null, icon: '📦', category: '', status: 'not_ready', recipe: [] });
                          setShowProductModal(true);
                        }} className="bg-blue-600/70 backdrop-blur-md border border-blue-400/30 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:bg-blue-700/70 backdrop-blur-md text-white font-medium px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2">
                          + Thêm Sản Phẩm Mới
                        </button>
                      </div>`;
content = content.replace(btnRegex, newBtn);

// 3. Fix grid cols to prevent overflow
content = content.replace(
    /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">/g,
    '<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">'
);

// 4. Implement sort logic
const mapRegex = /\{products\.map\(p => \(/;
const newMap = `{products.slice().sort((a,b) => {
                          if (productSort === 'name_asc') return a.name.localeCompare(b.name);
                          if (productSort === 'name_desc') return b.name.localeCompare(a.name);
                          if (productSort === 'price_asc') return a.price - b.price;
                          if (productSort === 'price_desc') return b.price - a.price;
                          return 0;
                        }).map(p => (`;
content = content.replace(mapRegex, newMap);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Fixed Product Grid and Added Sort');

const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Add options to the <select>
const selectOptionRegex = /<option value="price_desc" className="text-black">Giá giảm dần<\/option>/;
const newOptions = `<option value="price_desc" className="text-black">Giá giảm dần</option>
                          <option value="category_asc" className="text-black">Danh mục (A-Z)</option>
                          <option value="category_desc" className="text-black">Danh mục (Z-A)</option>`;
content = content.replace(selectOptionRegex, newOptions);

// 2. Add sorting logic
const sortLogicRegex = /if \(productSort === 'price_desc'\) return b\.price - a\.price;/;
const newSortLogic = `if (productSort === 'price_desc') return b.price - a.price;
                          if (productSort === 'category_asc') {
                            const catA = categories.find(c => c.id === a.category)?.name || '';
                            const catB = categories.find(c => c.id === b.category)?.name || '';
                            return catA.localeCompare(catB);
                          }
                          if (productSort === 'category_desc') {
                            const catA = categories.find(c => c.id === a.category)?.name || '';
                            const catB = categories.find(c => c.id === b.category)?.name || '';
                            return catB.localeCompare(catA);
                          }`;
content = content.replace(sortLogicRegex, newSortLogic);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Added category sort');

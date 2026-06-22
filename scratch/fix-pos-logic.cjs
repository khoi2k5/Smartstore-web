const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

const switchTableLogic = `  const [selectedTable, setSelectedTable] = useState(null);

  const switchTable = (tableName) => {
    // Save current cart if any
    if (selectedTable && cart.length > 0) {
      setHoldOrders(prev => {
        const filtered = prev.filter(o => o.table !== selectedTable);
        return [...filtered, { table: selectedTable, cart: [...cart], time: new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) }];
      });
    }
    
    // Clear current cart for the transition
    setCart([]);

    // If opening a new table, load its held order if it exists
    if (tableName) {
      setHoldOrders(prev => {
        const found = prev.find(o => o.table === tableName);
        if (found) {
          setTimeout(() => setCart(found.cart), 0);
          return prev.filter(o => o.table !== tableName);
        }
        return prev;
      });
    }

    setSelectedTable(tableName);
  };`;

// Insert switchTable Logic
content = content.replace(`  const [selectedTable, setSelectedTable] = useState(null);`, switchTableLogic);

// Replace setSelectedTable(posConfig.takeawayName)
content = content.replace(`onClick={() => setSelectedTable(posConfig.takeawayName)}`, `onClick={() => switchTable(posConfig.takeawayName)}`);

// Replace setSelectedTable(\`\${posConfig.entityName} \${idx}\`)
content = content.replace('onClick={() => setSelectedTable(`${posConfig.entityName} ${idx}`)}', 'onClick={() => switchTable(`${posConfig.entityName} ${idx}`)}');

// Replace the `< Sơ đồ bàn` button's onClick
content = content.replace(`onClick={() => setSelectedTable(null)} className="text-white border border-white/30 hover:bg-blue-800`, `onClick={() => switchTable(null)} className="text-white border border-white/30 hover:bg-blue-800`);

// Replace the `Quay lại` button inside the Keypad
content = content.replace(`onClick={() => posConfig.layout !== 'retail' && setSelectedTable(null)} className="flex-1 bg-white border border-slate-400 hover:bg-slate-200 font-bold text-sm text-slate-800 rounded-sm">`, `onClick={() => posConfig.layout !== 'retail' && switchTable(null)} className="flex-1 bg-white border border-slate-400 hover:bg-slate-200 font-bold text-sm text-slate-800 rounded-sm">`);

// Replace Mở button in Held Orders Quick View
// Before: onClick={() => { setCart(held.cart); setSelectedTable(held.table); setHoldOrders(prev => prev.filter((_, i) => i !== idx)); }}
// After: onClick={() => switchTable(held.table)}
content = content.replace(`onClick={() => { setCart(held.cart); setSelectedTable(held.table); setHoldOrders(prev => prev.filter((_, i) => i !== idx)); }} className="text-blue-700 hover:underline mr-2">Mở</button>`, `onClick={() => switchTable(held.table)} className="text-blue-700 hover:underline mr-2">Mở</button>`);

// When completing payment, we clear cart and selectedTable.
// No need to use switchTable here because cart is empty anyway and we are just returning to map.
// content = content.replace(`if (posConfig.layout !== 'retail') setSelectedTable(null);`, ...) -> Leave as is

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Fixed POS Table Switching logic');

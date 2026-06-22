const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// Update imports
content = content.replace(
    /import \{ collection, addDoc, serverTimestamp \} from 'firebase\/firestore';/,
    "import { collection, addDoc, serverTimestamp, doc, setDoc, onSnapshot } from 'firebase/firestore';"
);

// Global replace setters
content = content.replace(/setCategories\(/g, 'updateCategories(');
content = content.replace(/const \[categories, updateCategories\] = useState\(/g, 'const [categories, setCategories] = useState(');

content = content.replace(/setIngredients\(/g, 'updateIngredients(');
content = content.replace(/const \[ingredients, updateIngredients\] = useState\(/g, 'const [ingredients, setIngredients] = useState(');

content = content.replace(/setProducts\(/g, 'updateProducts(');
content = content.replace(/const \[products, updateProducts\] = useState\(/g, 'const [products, setProducts] = useState(');

content = content.replace(/setPredefinedNotes\(/g, 'updatePredefinedNotes(');
content = content.replace(/const \[predefinedNotes, updatePredefinedNotes\] = useState\(/g, 'const [predefinedNotes, setPredefinedNotes] = useState(');

content = content.replace(/setPredefinedSizes\(/g, 'updatePredefinedSizes(');
content = content.replace(/const \[predefinedSizes, updatePredefinedSizes\] = useState\(/g, 'const [predefinedSizes, setPredefinedSizes] = useState(');

content = content.replace(/setPosConfig\(/g, 'updatePosConfig(');
content = content.replace(/const \[posConfig, updatePosConfig\] = useState\(/g, 'const [posConfig, setPosConfig] = useState(');

content = content.replace(/setTabNames\(/g, 'updateTabNames(');
content = content.replace(/const \[tabNames, updateTabNames\] = useState\(/g, 'const [tabNames, setTabNames] = useState(');

// Add Sync Logic (with raw setters to avoid loop)
const syncLogic = `
  // FIREBASE SYNC LOGIC
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'storeConfig', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.categories) setCategories(data.categories);
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.products) setProducts(data.products);
        if (data.predefinedNotes) setPredefinedNotes(data.predefinedNotes);
        if (data.predefinedSizes) setPredefinedSizes(data.predefinedSizes);
        if (data.posConfig) setPosConfig(data.posConfig);
        if (data.tabNames) setTabNames(data.tabNames);
      } else {
        // Init default data on firebase if missing
        setDoc(doc(db, 'storeConfig', 'main'), {
          categories, ingredients, products, predefinedNotes, predefinedSizes, posConfig, tabNames
        }, { merge: true });
      }
      isInitialLoad.current = false;
    });
    return () => unsub();
  }, []);

  const syncToFirestore = (key, value) => {
    if (!isInitialLoad.current) {
      setDoc(doc(db, 'storeConfig', 'main'), { [key]: value }, { merge: true }).catch(err => console.error("Firestore Error:", err));
    }
  };

  const updateCategories = (val) => { const newVal = typeof val === 'function' ? val(categories) : val; setCategories(newVal); syncToFirestore('categories', newVal); };
  const updateIngredients = (val) => { const newVal = typeof val === 'function' ? val(ingredients) : val; setIngredients(newVal); syncToFirestore('ingredients', newVal); };
  const updateProducts = (val) => { const newVal = typeof val === 'function' ? val(products) : val; setProducts(newVal); syncToFirestore('products', newVal); };
  const updatePredefinedNotes = (val) => { const newVal = typeof val === 'function' ? val(predefinedNotes) : val; setPredefinedNotes(newVal); syncToFirestore('predefinedNotes', newVal); };
  const updatePredefinedSizes = (val) => { const newVal = typeof val === 'function' ? val(predefinedSizes) : val; setPredefinedSizes(newVal); syncToFirestore('predefinedSizes', newVal); };
  const updatePosConfig = (val) => { const newVal = typeof val === 'function' ? val(posConfig) : val; setPosConfig(newVal); syncToFirestore('posConfig', newVal); };
  const updateTabNames = (val) => { const newVal = typeof val === 'function' ? val(tabNames) : val; setTabNames(newVal); syncToFirestore('tabNames', newVal); };
`;

content = content.replace(
    /useEffect\(\(\) => \{[\s\S]*?const timer = setInterval/,
    syncLogic + '\n  useEffect(() => {\n    const timer = setInterval'
);

// Dynamic POS Categories Fix
content = content.replace(
    /\{\[\s*\{id: 'all', label: 'TẤT CẢ'\},[\s\S]*?\{id: 'food', label: 'ĐỒ ĂN'\},\s*\]\.map\(cat => \([\s\S]*?\{cat\.label\}[\s\S]*?<\/button>\s*\)\)\}/,
    `{[{id: 'all', name: 'TẤT CẢ'}, ...categories].map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={\`px-6 py-3 text-sm font-bold whitespace-nowrap border rounded-xl \${selectedCategory === cat.id ? 'bg-blue-600/70 backdrop-blur-md border border-blue-400/30 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] text-white border-blue-700' : 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl text-white font-medium border-white/10 hover:bg-white/10 hover:bg-white/20'}\`}>
                      {cat.name.toUpperCase()}
                    </button>
                  ))}`
);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Firebase sync added and POS categories made dynamic');

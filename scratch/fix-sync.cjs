const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

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

// Insert it right after the auth listener
content = content.replace(
    /localStorage\.setItem\('activeTab', activeTab\);\n    \}\n  \}, \[activeTab\]\);\n/,
    `localStorage.setItem('activeTab', activeTab);\n    }\n  }, [activeTab]);\n${syncLogic}`
);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Inserted syncLogic successfully');

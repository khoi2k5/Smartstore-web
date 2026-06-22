const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Add onAuthStateChanged import
content = content.replace(
    /import \{ signInWithEmailAndPassword, signOut \} from 'firebase\/auth';/,
    "import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';"
);

// 2. Add auth state listener inside the component (maybe after const [role, setRole] = useState(null))
const authListenerCode = `
  // AUTHENTICATION PERSISTENCE
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        let selectedRole = 'staff';
        if (user.email.includes('chuquan')) selectedRole = 'owner';
        else if (user.email.includes('pos')) selectedRole = 'pos';
        setRole(selectedRole);
        
        // Restore active tab if saved, otherwise default
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab) {
          setActiveTab(savedTab);
        } else {
          if (selectedRole === 'owner') setActiveTab('dashboard');
          if (selectedRole === 'pos') setActiveTab('pos');
          if (selectedRole === 'staff') setActiveTab('salary');
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubAuth();
  }, []);

  // Save activeTab to localStorage when it changes
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]);
`;

content = content.replace(
    /const \[role, setRole\] = useState\(null\);[\s\S]*?const \[activeTab, setActiveTab\] = useState\('pos'\);/,
    `const [role, setRole] = useState(null);\n  const [activeTab, setActiveTab] = useState('pos');\n${authListenerCode}`
);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Firebase auth persistence added.');

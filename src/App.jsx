import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';

function App() {
  // Role & Config State
  const [role, setRole] = useState(null); // 'owner', 'pos', 'staff'
  const [activeTab, setActiveTab] = useState('pos');
  
  const [tabNames, setTabNames] = useState({
    dashboard: '📊 Báo cáo Lợi nhuận',
    pos: '🛒 POS & Orders',
    inventory: '📦 Kiểm kho',
    recipes: '🍔 Quản lý Sản phẩm',
    shifts: '👥 Kiểm soát ca',
    hr: '⏱️ Staff Check-in',
    salary: '💰 Theo dõi Lương',
    settings: '⚙️ Cài đặt hệ thống'
  });

  const [recipeTab, setRecipeTab] = useState('products'); // products, categories, ingredients
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', image: null, icon: '📦', category: '', status: 'not_ready', recipe: [] });
  const [newCategory, setNewCategory] = useState({ id: '', name: '' });
  const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'gram', cost: 0, stock: 0 });
  const [categories, setCategories] = useState([
    { id: 'coffee', name: 'Cà phê' },
    { id: 'tea', name: 'Trà' },
    { id: 'food', name: 'Đồ ăn' },
    { id: 'smoothie', name: 'Sinh tố' }
  ]);
  const [ingredients, setIngredients] = useState([
    { id: 'ing1', name: 'Trà đen', unit: 'gram', cost: 200, stock: 5000 },
    { id: 'ing2', name: 'Sữa tươi', unit: 'ml', cost: 40, stock: 10000 },
    { id: 'ing3', name: 'Đường', unit: 'ml', cost: 10, stock: 5000 },
    { id: 'ing4', name: 'Cà phê bột', unit: 'gram', cost: 300, stock: 2000 }
  ]);

  const [products, setProducts] = useState([
    { id: 1, name: 'Cà phê sữa đá', price: 29000, icon: '☕', category: 'coffee', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 2, name: 'Trà đào cam sả', price: 35000, icon: '🍹', category: 'tea', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 3, name: 'Bánh mì chả lụa', price: 25000, icon: '🥖', category: 'food', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 4, name: 'Bạc xỉu', price: 29000, icon: '🥛', category: 'coffee', image: 'https://images.unsplash.com/photo-1551834925-5f9038abccce?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 5, name: 'Sinh tố bơ', price: 40000, icon: '🥑', category: 'smoothie', image: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 6, name: 'Trà vải thiều', price: 35000, icon: '🥤', category: 'tea', image: 'https://images.unsplash.com/photo-1623868772027-e4358a9e0f2f?auto=format&fit=crop&q=80&w=200&h=200' },
  ]);

  const [predefinedNotes, setPredefinedNotes] = useState([
    'Ít đá', 'Nhiều đá', 'Không đá', 
    'Ít ngọt', 'Không đường', 
    'Không hành', 'Thêm cay'
  ]);
  const [predefinedSizes, setPredefinedSizes] = useState([
    { name: 'Cơ bản', priceAdd: 0 },
    { name: 'Lớn', priceAdd: 10000 }
  ]);
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizePrice, setNewSizePrice] = useState('');

  const [posConfig, setPosConfig] = useState({
    layout: 'table', // 'table', 'retail', 'room'
    title: 'Sơ đồ Bàn / Bán hàng',
    entityName: 'Bàn',
    entityIcon: '🪑',
    takeawayName: 'Mua trực tiếp / Mang đi',
    takeawayIcon: '🥡'
  });

  // Settings State
  const [editTabNames, setEditTabNames] = useState({...tabNames});
  const [editPosConfig, setEditPosConfig] = useState({...posConfig});
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: null, icon: '📦' });
  const [newNote, setNewNote] = useState('');
  const [isSettingsDirty, setIsSettingsDirty] = useState(false);

  // POS State
  const [selectedTable, setSelectedTable] = useState(null);

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
  };
  const [cart, setCart] = useState([]);
  const [keypadBuffer, setKeypadBuffer] = useState('');
  const [selectedItemForTopping, setSelectedItemForTopping] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedCartItemDetail, setSelectedCartItemDetail] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [amountGiven, setAmountGiven] = useState(0);
  const [holdOrders, setHoldOrders] = useState([]);
  const [qrCodeData, setQrCodeData] = useState('INIT_CODE');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null, onCancel: null });
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');

  useEffect(() => {
    let interval;
    if (activeTab === 'hr') {
      const updateCode = () => setQrCodeData(`SMARTSTORE_CHECKIN_${Date.now()}`);
      updateCode();
      interval = setInterval(updateCode, 10000); // 10 seconds for demo
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    let scanner;
    if (isScanning) {
      // Delay initialization slightly to allow DOM to render the "reader" div
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner("reader", { qrbox: { width: 250, height: 250 }, fps: 5 }, false);
        scanner.render((result) => {
          scanner.clear();
          setIsScanning(false);
          setScanResult(result);
          if (result.startsWith('SMARTSTORE_CHECKIN_')) {
            alert(`Quét thành công! Đã ghi nhận giờ làm.`);
          } else {
            alert(`Mã QR không hợp lệ!`);
          }
        }, (err) => {});
      }, 100);
      return () => {
        clearTimeout(timer);
        if (scanner) scanner.clear().catch(e => console.error(e));
      };
    }
  }, [isScanning]);
  
  // Handlers
  const handleTabNameEdit = (key, value) => {
    setEditTabNames({...editTabNames, [key]: value});
    setIsSettingsDirty(true);
  };

  const handlePosConfigEdit = (updates) => {
    setEditPosConfig({...editPosConfig, ...updates});
    setIsSettingsDirty(true);
  };

  const handleTabClick = (tabKey) => {
    if (activeTab === 'settings' && tabKey !== 'settings' && isSettingsDirty) {
      setConfirmDialog({
        isOpen: true,
        message: "Bạn đang có thay đổi chưa lưu. Bấm Đồng ý để ở lại trang và lưu, bấm Hủy để bỏ qua thay đổi và chuyển trang.",
        onConfirm: () => { /* Stay */ },
        onCancel: () => { setIsSettingsDirty(false); setActiveTab(tabKey); }
      });
      if (false) {
        return; // User wants to stay
      } else {
        // Discard changes
        setEditTabNames({...tabNames});
        setEditPosConfig({...posConfig});
        setIsSettingsDirty(false);
      }
    }
    setActiveTab(tabKey);
  };

  const handleLogoutClick = async () => {
    const performLogout = async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Lỗi đăng xuất:", error);
      }
      setRole(null);
      setSelectedTable(null);
      setCart([]);
      setEditTabNames({...tabNames});
      setEditPosConfig({...posConfig});
      setIsSettingsDirty(false);
    };

    if (activeTab === 'settings' && isSettingsDirty) {
      setConfirmDialog({
        isOpen: true,
        message: "Bạn đang có thay đổi chưa lưu. Bấm Đồng ý để ở lại trang và lưu, bấm Hủy để tiếp tục đăng xuất.",
        onConfirm: () => { /* Stay */ },
        onCancel: performLogout
      });
      return;
    }
    setConfirmDialog({
        isOpen: true,
        message: "Bạn có chắc chắn muốn đăng xuất không?",
        onConfirm: performLogout
    });
  };

  const toggleTopping = (topping) => {
    setSelectedToppings(prev => prev.includes(topping) ? prev.filter(t => t !== topping) : [...prev, topping]);
  };

  const addQuickNote = (note) => {
    setNoteText(prev => {
      const notesArray = prev.split(',').map(n => n.trim()).filter(n => n);
      if (notesArray.includes(note)) {
        return notesArray.filter(n => n !== note).join(', ');
      } else {
        return [...notesArray, note].join(', ');
      }
    });
  };
  
  const handleAddItem = (item) => {
    let qtyToAdd = 1;
    if (keypadBuffer) {
      if (keypadBuffer.startsWith('*')) {
         const num = parseFloat(keypadBuffer.substring(1));
         if (!isNaN(num) && num > 0) qtyToAdd = num;
      } else {
         const num = parseFloat(keypadBuffer);
         if (!isNaN(num) && num > 0) qtyToAdd = num;
      }
    }
    
    // calculate final price based on selected size
    let finalPrice = item.price;
    if (item.size) {
      const sizeConfig = predefinedSizes.find(s => s.name === item.size);
      if (sizeConfig) finalPrice += sizeConfig.priceAdd;
    }
    const finalItem = { ...item, price: finalPrice };

    setCart(prev => {
      const exist = prev.find(i => 
        i.id === finalItem.id && 
        i.size === finalItem.size && 
        i.note === finalItem.note && 
        JSON.stringify(i.toppings) === JSON.stringify(finalItem.toppings)
      );
      if (exist) {
        return prev.map(i => i === exist ? {...i, qty: i.qty + qtyToAdd} : i);
      }
      return [...prev, {...finalItem, qty: qtyToAdd}];

    });
    setKeypadBuffer('');
  };

  const handleKeypad = (val) => {
    if (val === 'C') setKeypadBuffer('');
    else if (val === 'DEL') setKeypadBuffer(prev => prev.slice(0, -1));
    else if (val === ',') setKeypadBuffer(prev => prev + '.');
    else setKeypadBuffer(prev => prev + val);
  };

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const userEmail = userCredential.user.email.toLowerCase();
      let selectedRole = 'staff';
      if (userEmail.includes('chuquan')) selectedRole = 'owner';
      else if (userEmail.includes('pos')) selectedRole = 'pos';
      
      setRole(selectedRole);
      if (selectedRole === 'owner') setActiveTab('dashboard');
      if (selectedRole === 'pos') setActiveTab('pos');
      if (selectedRole === 'staff') setActiveTab('salary');
    } catch (error) {
      setLoginError('Sai email hoặc mật khẩu!');
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const saveSettings = () => {
    setConfirmDialog({
      isOpen: true,
      message: "Bạn có chắc chắn muốn lưu toàn bộ cài đặt không?",
      onConfirm: () => {
        setTabNames(editTabNames);
        setPosConfig(editPosConfig);
        setIsSettingsDirty(false);
        if (editPosConfig.layout === 'retail') {
          setSelectedTable('Bán Lẻ');
        } else {
          setSelectedTable(null);
        }
        alert('Đã lưu cấu hình hệ thống!');
      }
    });
    if (false) {
      setTabNames(editTabNames);
      setPosConfig(editPosConfig);
      setIsSettingsDirty(false);
      // Nếu đổi sang retail thì xoá selectedTable để vào thẳng giỏ hàng
      if (editPosConfig.layout === 'retail') {
        setSelectedTable('Bán Lẻ');
      } else {
        setSelectedTable(null);
      }
      alert('Đã lưu cấu hình hệ thống!');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file); // Convert image to Base64
    }
  };

  const addProduct = () => {
    if (newProduct.name && newProduct.price) {
      setProducts([...products, { ...newProduct, id: Date.now(), price: parseInt(newProduct.price) }]);
      setNewProduct({ name: '', price: '', image: null, icon: '📦' });
    } else {
      alert('Vui lòng nhập Tên và Giá sản phẩm!');
    }
  };

  const deleteProduct = (id) => {
    setConfirmDialog({
      isOpen: true,
      message: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      onConfirm: () => { setProducts(products.filter(p => p.id !== id)); }
    });
    if (false) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAddNewNote = () => {
    if (newNote.trim() && !predefinedNotes.includes(newNote.trim())) {
      setPredefinedNotes([...predefinedNotes, newNote.trim()]);
      setNewNote('');
    }
  };

  const deletePredefinedNote = (noteToDelete) => {
    setPredefinedNotes(predefinedNotes.filter(n => n !== noteToDelete));
  };

  const handleAddNewSize = () => {
    if (newSizeName.trim()) {
      setPredefinedSizes([...predefinedSizes, { name: newSizeName.trim(), priceAdd: parseInt(newSizePrice) || 0 }]);
      setNewSizeName('');
      setNewSizePrice('');
    }
  };

  const deletePredefinedSize = (idx) => {
    setPredefinedSizes(predefinedSizes.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setQrCodeData(Math.random().toString(36).substring(2, 10).toUpperCase());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!role) {
    return (
      <div className="min-h-screen text-[#4a3f35] font-sans flex flex-col md:flex-row p-0 md:p-4 md:gap-4 bg-[#f4ebe1]">
        <div className="bg-white/40 backdrop-blur-xl border border-white shadow-sm rounded-md p-10 max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5e34] to-[#a67c52] mb-2">
              SmartStore
            </h1>
            <p className="text-[#8c7b6c]">Đăng nhập để vào hệ thống</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-[#8c7b6c] text-sm mb-2">Email</label>
              <input 
                type="email" 
                required 
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="VD: chuquan@gmail.com"
                className="w-full bg-[#fdfbf7] border border-[#e8dcc7] rounded-md p-4 text-[#4a3f35] focus:outline-none focus:border-[#8b5e34] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#8c7b6c] text-sm mb-2">Mật khẩu</label>
              <input 
                type="password" 
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#fdfbf7] border border-[#e8dcc7] rounded-md p-4 text-[#4a3f35] focus:outline-none focus:border-[#8b5e34] transition-colors"
              />
            </div>

            {loginError && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                {loginError}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-[#8c7b6c] text-white py-4 rounded-md font-bold transition-all shadow-sm shadow-[#8b5e34]/20 text-lg">
              {isLoggingIn ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Demo Accounts: <br/>chuquan@gmail.com | nhanvienpos@gmail.com | nhanvien@gmail.com<br/>Password: 123456
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN APP SCREEN
  // -------------------------------------------------------------
  const visibleTabs = [];
  if (role === 'owner') {
    visibleTabs.push('dashboard', 'pos', 'inventory', 'recipes', 'shifts', 'hr', 'settings');
  } else if (role === 'pos') {
    visibleTabs.push('pos', 'hr');
  } else if (role === 'staff') {
    visibleTabs.push('salary');
  }

  return (
    <div className="min-h-screen text-[#4a3f35] font-sans flex flex-col md:flex-row p-0 md:p-4 md:gap-4 bg-[#e0f2fe]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\' opacity=\'0.4\'%3E%3Cpath fill=\'%237dd3fc\' fill-opacity=\'1\' d=\'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z\'%3E%3C/path%3E%3C/svg%3E')", backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center bottom' }}>
      
      {/* Sidebar */}
      <div className="w-64 bg-white/40 backdrop-blur-xl border border-white shadow-sm rounded-lg p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5e34] to-[#a67c52] mb-8">
            SmartStore
            <span className="block text-xs text-[#8c7b6c] font-normal mt-1">
              Role: {role === 'owner' ? '👑 Chủ quán' : role === 'pos' ? '🛒 Thu ngân' : '🧑‍🍳 Nhân viên'}
            </span>
          </h1>
          <nav className="space-y-3">
            {visibleTabs.map(tabKey => (
              <button 
                key={tabKey}
                onClick={() => handleTabClick(tabKey)}
                className={`w-full text-left px-4 py-3 rounded-md transition-all ${
                  activeTab === tabKey 
                    ? tabKey === 'dashboard' ? 'bg-gradient-to-r from-[#8b5e34] to-[#a67c52] text-white font-bold shadow-sm shadow-[#8b5e34]/30' 
                      : 'bg-gradient-to-r from-blue-100 to-blue-50 text-[#8b5e34] font-bold' 
                    : 'hover:bg-[#fdfbf7] text-[#8c7b6c]'
                }`}>
                {tabNames[tabKey]}
              </button>
            ))}
          </nav>
        </div>
        
        <div>
          <button 
            onClick={handleLogoutClick}
            className="w-full mt-8 bg-[#fdfbf7] hover:bg-red-500/20 hover:text-red-400 text-[#8c7b6c] py-3 rounded-md font-bold transition-colors border border-[#e8dcc7] hover:border-red-500/50">
            🚪 Đăng xuất
          </button>
          <div className="text-sm text-slate-400 mt-4 text-center">
            Night Owl Team © 2026
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white/40 backdrop-blur-xl border border-white shadow-sm rounded-lg p-8 overflow-y-auto relative">
        
        {/* ========================================================= */}
        {/* TAB: DASHBOARD (OWNER)                                    */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' ? (
          <div className="animate-in fade-in duration-500 relative">
            {role === 'owner' && (
              <button 
                onClick={() => setActiveTab('settings')} 
                className="absolute top-0 right-0 bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 z-50 shadow-md transition-all hover:scale-105"
              >
                ⚙️ Sửa giao diện
              </button>
            )}
            <h2 className="text-3xl font-bold mb-6">{tabNames.dashboard}</h2>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#fdfbf7] rounded-lg p-6 border border-[#8b5e34]/30 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#8b5e34]/20 rounded-full blur-xl group-hover:bg-[#8b5e34]/30 transition-all"></div>
                <h3 className="text-[#8c7b6c] font-bold mb-2 flex items-center gap-2"><span>📈</span> Tổng Doanh Thu</h3>
                <div className="text-3xl font-bold text-[#8b5e34]">5,450,000 đ</div>
                <p className="text-sm text-[#8b5e34] mt-2">↑ 12% so với hôm qua</p>
              </div>
              
              <div className="bg-[#fdfbf7] rounded-lg p-6 border border-orange-500/30 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/30 transition-all"></div>
                <h3 className="text-[#8c7b6c] font-bold mb-2 flex items-center gap-2"><span>👥</span> Chi phí Nhân sự</h3>
                <div className="text-3xl font-bold text-orange-400">1,200,000 đ</div>
                <p className="text-sm text-[#8c7b6c] mt-2">Dựa trên 34 giờ làm việc</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg p-6 border border-blue-200 shadow-[0_0_30px_rgba(168,85,247,0.2)] relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl"></div>
                <h3 className="text-purple-200 font-bold mb-2 flex items-center gap-2"><span>💎</span> Lợi Nhuận Ròng</h3>
                <div className="text-4xl font-extrabold text-[#4a3f35]">4,250,000 đ</div>
                <div className="mt-3 bg-white/10 rounded-full px-3 py-1 inline-block text-sm text-purple-200 border border-white/20">
                  Biên lợi nhuận: 78%
                </div>
              </div>
            </div>

            {/* Charts & Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 bg-[#fdfbf7] rounded-lg p-6 border border-[#e8dcc7]">
                <h3 className="text-xl font-bold mb-6">Tăng trưởng Lợi nhuận trong ngày</h3>
                <div className="h-64 flex items-end gap-4 mt-8">
                  {[
                    { time: '08:00', rev: 40, cost: 10 },
                    { time: '12:00', rev: 100, cost: 25 },
                    { time: '16:00', rev: 70, cost: 40 },
                    { time: '20:00', rev: 120, cost: 55 },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full relative flex justify-center items-end h-48 bg-[#f0e8df] rounded-lg p-2 gap-1">
                        <div className="w-1/2 bg-[#8b5e34] rounded-t-md relative group-hover:opacity-80 transition-opacity" style={{ height: `${bar.rev}%` }}></div>
                        <div className="w-1/2 bg-orange-500 rounded-t-md relative group-hover:opacity-80 transition-opacity" style={{ height: `${bar.cost}%` }}></div>
                      </div>
                      <span className="text-[#8c7b6c] text-sm font-mono">{bar.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#fdfbf7] rounded-lg p-6 border border-[#e8dcc7]">
                <h3 className="text-xl font-bold mb-6">Chi tiết Nhân sự hôm nay</h3>
                <div className="space-y-4">
                  <div className="bg-slate-50/80 rounded-md p-4 border border-[#e8dcc7]">
                    <div className="flex justify-between items-center mb-2"><span className="font-bold">Nguyễn Văn A</span><span className="text-[#8b5e34] font-mono">8 giờ</span></div>
                    <div className="flex justify-between text-sm"><span className="text-[#8c7b6c]">25,000đ/h</span><span className="text-orange-600 font-bold">200,000 đ</span></div>
                  </div>
                  <div className="bg-slate-50/80 rounded-md p-4 border border-[#e8dcc7]">
                    <div className="flex justify-between items-center mb-2"><span className="font-bold">Trần Thị B</span><span className="text-[#8b5e34] font-mono">6 giờ</span></div>
                    <div className="flex justify-between text-sm"><span className="text-[#8c7b6c]">22,000đ/h</span><span className="text-orange-600 font-bold">132,000 đ</span></div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        ) : 

        /* ========================================================= */
        /* TAB: RECIPES / QUẢN LÝ SẢN PHẨM (OWNER ONLY)               */
        /* ========================================================= */
        activeTab === 'recipes' ? (
          <div className="animate-in fade-in duration-500 h-full flex flex-col relative">
            {role === 'owner' && (
              <button 
                onClick={() => setActiveTab('settings')} 
                className="absolute top-0 right-0 bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 z-50 shadow-md transition-all hover:scale-105"
              >
                ⚙️ Sửa giao diện
              </button>
            )}
            <h2 className="text-3xl font-bold mb-6">{tabNames.recipes}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
              {/* Product Management */}
              <div className="col-span-2 bg-[#fdfbf7] rounded-2xl p-6 border border-[#e8dcc7] shadow-sm flex flex-col h-full min-h-0">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🏷️ Quản lý Danh mục Sản phẩm</h3>
                <p className="text-sm text-[#8c7b6c] mb-6">Thêm, sửa, xóa các mặt hàng sẽ xuất hiện trên màn hình thu ngân.</p>
                
                {/* Sub-tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-[#e8dcc7] pb-4">
                  <button onClick={() => setRecipeTab('products')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${recipeTab === 'products' ? 'bg-[#8b5e34] text-white' : 'bg-[#f0e8df] text-[#756658] hover:bg-[#e6dacb]'}`}>Sản Phẩm</button>
                  <button onClick={() => setRecipeTab('categories')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${recipeTab === 'categories' ? 'bg-[#8b5e34] text-white' : 'bg-[#f0e8df] text-[#756658] hover:bg-[#e6dacb]'}`}>Danh Mục</button>
                  <button onClick={() => setRecipeTab('ingredients')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${recipeTab === 'ingredients' ? 'bg-[#8b5e34] text-white' : 'bg-[#f0e8df] text-[#756658] hover:bg-[#e6dacb]'}`}>Nguyên Liệu</button>
                </div>

                {recipeTab === 'products' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-sm text-[#8c7b6c]">Quản lý và cập nhật danh sách các mặt hàng xuất hiện trên POS.</p>
                      <button onClick={() => {
                        setEditingProduct(null);
                        setProductForm({ name: '', price: '', image: null, icon: '📦', category: '', status: 'not_ready', recipe: [] });
                        setShowProductModal(true);
                      }} className="bg-[#8b5e34] hover:bg-[#704b29] text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2">
                        + Thêm Sản Phẩm Mới
                      </button>
                    </div>

                <div className="flex-1 overflow-y-auto bg-[#fdfbf7] rounded-2xl p-6 border-2 border-[#e8dcc7] shadow-inner">
                  {products.length === 0 ? (
                    <p className="text-slate-400 text-center mt-10">Chưa có sản phẩm nào. Hãy thêm ở trên.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-[#fdfbf7] border border-[#e8dcc7] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-[#f0e8df] flex items-center justify-center overflow-hidden shrink-0">
                              {p.image ? (
                                <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                              ) : (
                                <span className="text-2xl">{p.icon || '📦'}</span>
                              )}
                            </div>
                            <div className="flex-1 w-full min-w-0 pr-2">
                              <p className="font-bold text-sm line-clamp-1 w-full truncate">{p.name}</p>
                              <div className="mb-3"><span className="text-xs text-[#8b5e34] font-mono font-bold bg-[#fdf8f3] px-2.5 py-1 rounded-md border border-blue-200">{p.price.toLocaleString()} đ</span></div>
                              
                              <div className="flex gap-2 w-full">
                                <button onClick={() => {
                                  setEditingProduct(p);
                                  setProductForm({ ...p, status: p.status || 'ready', recipe: p.recipe || [] });
                                  setShowProductModal(true);
                                }} className="text-[#8b5e34] hover:text-blue-800 text-xs font-bold bg-[#fdf8f3] hover:bg-[#f5eade] px-3 py-1.5 rounded-md transition-colors text-center flex-1 whitespace-nowrap">Sửa</button>
                                <button onClick={() => { setConfirmDialog({ isOpen: true, message: 'Bạn có chắc chắn muốn xóa sản phẩm này?', onConfirm: () => deleteProduct(p.id) }); }} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors text-center flex-1 whitespace-nowrap">Xóa</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                </>)}

                {recipeTab === 'categories' && (
                  <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-300">
                    <div className="flex gap-2 mb-4">
                      <input type="text" placeholder="Tên danh mục mới..." value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="flex-1 bg-[#f9f5f0] border border-[#e8dcc7] rounded-lg p-2 text-[#4a3f35]" />
                      <button onClick={() => {
                        if(newCategory.name) {
                          setCategories([...categories, { id: 'cat' + Date.now(), name: newCategory.name }]);
                          setNewCategory({ id: '', name: '' });
                        }
                      }} className="bg-[#8b5e34] hover:bg-[#704b29] text-white px-4 rounded-lg font-bold">Thêm</button>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-[#fdfbf7] rounded-2xl p-6 border-2 border-[#e8dcc7] shadow-inner space-y-2">
                      {categories.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center bg-[#fdfbf7] p-4 rounded-xl border border-[#e8dcc7] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
                          <span className="font-bold">{cat.name}</span>
                          <button onClick={() => { setConfirmDialog({ isOpen: true, message: 'Bạn có chắc chắn muốn xóa danh mục này?', onConfirm: () => setCategories(categories.filter(c => c.id !== cat.id)) }); }} className="text-red-400 hover:text-red-600 font-bold">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recipeTab === 'ingredients' && (
                  <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-300">
                    <div className="flex gap-2 mb-4 bg-[#fdfbf7] p-3 rounded-lg border border-[#e8dcc7] flex-wrap items-end">
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-bold text-[#8c7b6c] mb-1 block">Tên NL</label>
                        <input type="text" value={newIngredient.name} onChange={e => setNewIngredient({...newIngredient, name: e.target.value})} className="w-full border border-[#e8dcc7] rounded-lg p-2 text-sm" />
                      </div>
                      <div className="w-24">
                        <label className="text-xs font-bold text-[#8c7b6c] mb-1 block">Đơn vị</label>
                        <select value={newIngredient.unit} onChange={e => setNewIngredient({...newIngredient, unit: e.target.value})} className="w-full border border-[#e8dcc7] rounded-lg p-2 text-sm">
                          <option value="gram">gram</option>
                          <option value="ml">ml</option>
                          <option value="cái">cái</option>
                        </select>
                      </div>
                      <div className="w-28">
                        <label className="text-xs font-bold text-[#8c7b6c] mb-1 block">Giá vốn</label>
                        <input type="number" value={newIngredient.cost} onChange={e => setNewIngredient({...newIngredient, cost: e.target.value})} className="w-full border border-[#e8dcc7] rounded-lg p-2 text-sm" />
                      </div>
                      <button onClick={() => {
                        if(newIngredient.name) {
                          setIngredients([...ingredients, { ...newIngredient, id: 'ing' + Date.now(), cost: parseFloat(newIngredient.cost)||0 }]);
                          setNewIngredient({ name: '', unit: 'gram', cost: 0, stock: 0 });
                        }
                      }} className="bg-[#8b5e34] hover:bg-[#704b29] text-white px-4 h-[38px] rounded-lg font-bold">Thêm</button>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-[#fdfbf7] rounded-2xl p-6 border-2 border-[#e8dcc7] shadow-inner space-y-2">
                      {ingredients.map(ing => (
                        <div key={ing.id} className="flex justify-between items-center bg-[#fdfbf7] p-4 rounded-xl border border-[#e8dcc7] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
                          <div>
                            <div className="font-bold">{ing.name}</div>
                            <div className="text-xs text-[#8c7b6c]">{ing.cost} đ / {ing.unit}</div>
                          </div>
                          <button onClick={() => { setConfirmDialog({ isOpen: true, message: 'Bạn có chắc chắn muốn xóa nguyên liệu này?', onConfirm: () => setIngredients(ingredients.filter(i => i.id !== ing.id)) }); }} className="text-red-400 hover:text-red-600 font-bold">✕ Xóa</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Management */}
              <div className="col-span-1 bg-[#fdfbf7] rounded-2xl p-6 border border-[#e8dcc7] shadow-sm flex flex-col h-full min-h-0">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📝 Quản lý Ghi chú nhanh</h3>
                <p className="text-sm text-[#8c7b6c] mb-6">Thiết lập các ghi chú thường dùng để thu ngân chọn nhanh khi order.</p>

                <div className="flex flex-col gap-2 mb-6">
                  <input type="text" placeholder="Nhập ghi chú mới..." value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNewNote()} className="w-full bg-[#f9f5f0] border border-[#e8dcc7] rounded-lg p-3 text-[#4a3f35] text-sm" />
                  <button onClick={handleAddNewNote} className="w-full bg-[#8b5e34] hover:bg-[#704b29] text-white p-3 rounded-lg font-bold transition-colors">Thêm</button>
                </div>

                <div className="flex-1 overflow-y-auto bg-[#fdfbf7] rounded-2xl p-6 border-2 border-[#e8dcc7] shadow-inner flex flex-col gap-2">
                  {predefinedNotes.map((note, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#fdfbf7] p-4 rounded-xl border border-[#e8dcc7] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
                      <span className="font-bold text-sm">{note}</span>
                      <button onClick={() => { setConfirmDialog({ isOpen: true, message: 'Bạn có chắc chắn muốn xóa ghi chú này?', onConfirm: () => deletePredefinedNote(note) }); }} className="text-[#8c7b6c] hover:text-red-400 transition-colors">✕</button>
                    </div>
                  ))}
                  {predefinedNotes.length === 0 && (
                    <p className="text-slate-400 text-center text-sm mt-4">Chưa có ghi chú nhanh nào.</p>
                  )}
                </div>
              </div>


              {/* Size Management */}
              <div className="col-span-1 bg-[#fdfbf7] rounded-2xl p-6 border border-[#e8dcc7] shadow-sm flex flex-col h-full min-h-0">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📏 Quản lý Kích cỡ / Phân loại</h3>
                <p className="text-sm text-[#8c7b6c] mb-6">Thiết lập các biến thể kích thước (S, M, L, XL...) và giá cộng thêm.</p>

                <div className="flex flex-col gap-2 mb-6">
                  <input type="text" placeholder="Tên (VD: Size L)" value={newSizeName} onChange={e => setNewSizeName(e.target.value)} className="w-full bg-[#f9f5f0] border border-[#e8dcc7] rounded-lg p-3 text-[#4a3f35] text-sm" />
                  <input type="number" placeholder="+Giá (VNĐ)" value={newSizePrice} onChange={e => setNewSizePrice(e.target.value)} className="w-full bg-[#f9f5f0] border border-[#e8dcc7] rounded-lg p-3 text-[#4a3f35] text-sm" />
                  <button onClick={handleAddNewSize} className="w-full bg-[#8b5e34] hover:bg-[#704b29] text-white p-3 rounded-lg font-bold transition-colors">Thêm</button>
                </div>

                <div className="flex-1 overflow-y-auto bg-[#fdfbf7] rounded-2xl p-6 border-2 border-[#e8dcc7] shadow-inner flex flex-col gap-2">
                  {predefinedSizes.map((sz, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#fdfbf7] p-4 rounded-xl border border-[#e8dcc7] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
                      <div>
                        <span className="font-bold text-sm block">{sz.name}</span>
                        <span className="text-xs text-[#8b5e34]">+{sz.priceAdd.toLocaleString()} đ</span>
                      </div>
                      <button onClick={() => { setConfirmDialog({ isOpen: true, message: 'Bạn có chắc chắn muốn xóa kích cỡ này?', onConfirm: () => deletePredefinedSize(idx) }); }} className="text-[#8c7b6c] hover:text-red-400 transition-colors">✕</button>
                    </div>
                  ))}
                  {predefinedSizes.length === 0 && (
                    <p className="text-slate-400 text-center text-sm mt-4">Chưa có kích cỡ nào.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) :

        /* ========================================================= */
        /* TAB: SETTINGS (OWNER ONLY)                                */
        /* ========================================================= */
        activeTab === 'settings' ? (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{tabNames.settings}</h2>
              <p className="text-[#8c7b6c]">Tùy biến SmartStore cho phù hợp với mô hình kinh doanh của bạn.</p>
              {isSettingsDirty && (
                <div className="text-orange-400 text-sm mt-2 font-bold animate-pulse">
                  ⚠️ Có thay đổi chưa được lưu!
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Renaming Tabs */}
              <div className="bg-[#fdfbf7] rounded-lg p-6 border border-[#e8dcc7] flex flex-col">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📝 Đổi tên Menu Sidebar</h3>
                <p className="text-sm text-[#8c7b6c] mb-6">Đổi tên các chức năng theo đúng ngôn ngữ của quán (ví dụ: Quản lý Sản phẩm -&gt; Quần áo).</p>
                <div className="grid grid-cols-3 gap-4 flex-1">
                  {Object.keys(editTabNames).filter(k => k !== 'settings').map(key => (
                    <div key={key}>
                      <label className="block text-slate-400 text-xs mb-1 uppercase tracking-wider">{key}</label>
                      <input 
                        type="text" 
                        value={editTabNames[key]}
                        onChange={(e) => handleTabNameEdit(key, e.target.value)}
                        className="w-full bg-[#f9f5f0] border border-[#e8dcc7] rounded-lg p-2 text-[#4a3f35] focus:outline-none focus:border-[#8b5e34]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* POS Layout Config */}
              <div className="bg-[#fdfbf7] rounded-lg p-6 border border-[#e8dcc7]">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🎨 Tùy chỉnh Giao diện POS</h3>
                <p className="text-sm text-[#8c7b6c] mb-6">Chọn mô hình bán hàng và tùy biến tên gọi các khu vực (Ví dụ: Đổi "Bàn" thành "Phòng thử đồ" hoặc "Ghế").</p>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Layout 1 */}
                  <div 
                    onClick={() => handlePosConfigEdit({ layout: 'table', title: 'Sơ đồ Bàn / Bán hàng', entityName: 'Bàn', entityIcon: '🪑'})}
                    className={`p-4 rounded-md border cursor-pointer transition-all ${editPosConfig.layout === 'table' ? 'bg-[#8b5e34]/20 border-[#8b5e34] shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-[#f9f5f0] border-[#e8dcc7] hover:border-[#e8dcc7]'}`}>
                    <div className="text-3xl mb-2">🪑</div>
                    <h4 className="font-bold text-[#4a3f35]">Quản lý Bàn</h4>
                    <p className="text-xs text-[#8c7b6c] mt-1">Dành cho Cafe, Quán ăn (Có sơ đồ Bàn)</p>
                  </div>
                  {/* Layout 2 */}
                  <div 
                    onClick={() => handlePosConfigEdit({ layout: 'retail', title: 'Bán hàng nhanh', entityName: '', entityIcon: ''})}
                    className={`p-4 rounded-md border cursor-pointer transition-all ${editPosConfig.layout === 'retail' ? 'bg-[#8b5e34]/20 border-[#8b5e34] shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-[#f9f5f0] border-[#e8dcc7] hover:border-[#e8dcc7]'}`}>
                    <div className="text-3xl mb-2">🛒</div>
                    <h4 className="font-bold text-[#4a3f35]">Bán lẻ (Nhanh)</h4>
                    <p className="text-xs text-[#8c7b6c] mt-1">Dành cho Shop quần áo, Take-away (Vào thẳng chọn món)</p>
                  </div>
                  {/* Layout 3 */}
                  <div 
                    onClick={() => handlePosConfigEdit({ layout: 'room', title: 'Sơ đồ Phòng / Dịch vụ', entityName: 'Phòng', entityIcon: '🚪'})}
                    className={`p-4 rounded-md border cursor-pointer transition-all ${editPosConfig.layout === 'room' ? 'bg-[#8b5e34]/20 border-[#8b5e34] shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-[#f9f5f0] border-[#e8dcc7] hover:border-[#e8dcc7]'}`}>
                    <div className="text-3xl mb-2">🚪</div>
                    <h4 className="font-bold text-[#4a3f35]">Phòng / Dịch vụ</h4>
                    <p className="text-xs text-[#8c7b6c] mt-1">Dành cho Spa, Bida, Phòng thử đồ</p>
                  </div>
                </div>

                {/* Text Overrides */}
                {editPosConfig.layout !== 'retail' && (
                  <div className="grid grid-cols-3 gap-4 border-t border-[#e8dcc7] pt-6">
                    <div>
                      <label className="block text-slate-400 text-sm mb-1 uppercase">Tiêu đề màn hình POS</label>
                      <input type="text" value={editPosConfig.title} onChange={e => handlePosConfigEdit({title: e.target.value})} className="w-full bg-[#f9f5f0] border border-[#e8dcc7] rounded-lg p-3 text-[#4a3f35] focus:outline-none focus:border-[#8b5e34]" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1 uppercase">Tên gọi từng ô (VD: Bàn, Ghế)</label>
                      <input type="text" value={editPosConfig.entityName} onChange={e => handlePosConfigEdit({entityName: e.target.value})} className="w-full bg-[#f9f5f0] border border-[#e8dcc7] rounded-lg p-3 text-[#4a3f35] focus:outline-none focus:border-[#8b5e34]" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1 uppercase">Icon Emoji cho từng ô</label>
                      <input type="text" value={editPosConfig.entityIcon} onChange={e => handlePosConfigEdit({entityIcon: e.target.value})} className="w-full bg-[#f9f5f0] border border-[#e8dcc7] rounded-lg p-3 text-[#4a3f35] focus:outline-none focus:border-[#8b5e34]" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={saveSettings} className={`w-full font-bold py-4 rounded-md transition-colors shadow-sm text-lg ${isSettingsDirty ? 'bg-orange-500 hover:bg-orange-600 text-[#4a3f35] shadow-orange-500/30' : 'bg-[#8b5e34] hover:bg-[#704b29] text-white shadow-[#8b5e34]/20'}`}>
              💾 Lưu toàn bộ Cài đặt {isSettingsDirty && "(Có thay đổi mới)"}
            </button>
          </div>
        ) :

        /* ========================================================= */
        /* TAB: POS                                                  */
        /* ========================================================= */
        activeTab === 'pos' ? (
          (posConfig.layout !== 'retail' && !selectedTable) ? (
            <div className="animate-in fade-in relative">
              {role === 'owner' && (
                <button 
                  onClick={() => setActiveTab('settings')} 
                  className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#8b5e34] text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 z-50 shadow-md transition-all hover:scale-105 border border-blue-400"
                >
                  ⚙️ Tuỳ chỉnh giao diện POS
                </button>
              )}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">{posConfig.title}</h2>
              </div>
              <p className="text-[#8c7b6c] mb-6">Vui lòng chọn {posConfig.entityName.toLowerCase()} hoặc chọn "{posConfig.takeawayName}".</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <div 
                  onClick={() => switchTable(posConfig.takeawayName)}
                  className="border border-[#8b5e34] rounded-md cursor-pointer transition-all overflow-hidden relative h-28 group"
                  style={{ backgroundImage: "url('/takeaway_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0 bg-blue-900/60 group-hover:bg-blue-900/40 transition-colors"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-3">
                    <span className="font-bold text-white text-center text-sm">{posConfig.takeawayName}</span>
                  </div>
                </div>
                {[1,2,3,4,5,6,7,8].map((idx) => (
                  <div 
                    key={idx}
                    onClick={() => switchTable(`${posConfig.entityName} ${idx}`)}
                    className="border border-[#e8dcc7] hover:border-blue-400 rounded-md cursor-pointer transition-all overflow-hidden relative h-28 group"
                    style={{ backgroundImage: "url('/cafe_table_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0 bg-slate-900/50 group-hover:bg-slate-900/30 transition-colors"></div>
                    <div className="relative h-full flex flex-col items-center justify-center p-3">
                      <span className="font-bold text-white text-lg">{posConfig.entityName} {idx}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col-reverse md:flex-row gap-2 h-full animate-in slide-in-from-right-8 duration-300 min-h-0 bg-[#f0e8df] p-2 rounded-sm border border-[#e8dcc7] relative overflow-y-auto md:overflow-hidden">
              {role === 'owner' && (
                <button 
                  onClick={() => setActiveTab('settings')} 
                  className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#8b5e34] text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 z-50 shadow-md transition-all hover:scale-105 border border-blue-400"
                >
                  ⚙️ Tuỳ chỉnh giao diện POS
                </button>
              )}
              {/* Left Side: Cart & Keypad (High Density) */}
              <div className="w-full md:w-[450px] flex flex-col bg-[#fdfbf7] border border-[#e8dcc7] shrink-0 shadow-sm rounded-sm h-[60vh] md:h-auto min-h-[400px]">
                {/* Header */}
                <div className="bg-[#704b29] text-white p-2 flex justify-between items-center shrink-0 gap-2">
                  {posConfig.layout !== 'retail' && (
                    <button onClick={() => switchTable(null)} className="text-white border border-white/30 hover:bg-[#5c3e23] px-3 py-1.5 rounded-md text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1 shadow-sm">
                      <span className="text-lg leading-none">&lsaquo;</span> Sơ đồ bàn
                    </button>
                  )}
                  <h3 className="font-bold text-sm uppercase">Hóa đơn: {selectedTable !== posConfig.takeawayName ? selectedTable : 'Mua mang đi'}</h3>
                  {cart.length > 0 && (
                    <button 
                      onClick={() => {
                        setHoldOrders(prev => [...prev, { table: selectedTable, cart: [...cart], time: new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) }]);
                        setCart([]);
                      }}
                      className="text-xs bg-yellow-500 hover:bg-yellow-400 text-[#3e342b] px-2 py-1 font-bold transition-colors shadow-sm">
                      [F3] Lưu tạm
                    </button>
                  )}
                </div>

                {/* Cart Table Data */}
                <div className="flex-1 overflow-y-auto bg-[#fdfbf7] border-b border-[#e8dcc7]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#e6dacb] sticky top-0 border-b border-[#e8dcc7] z-10 shadow-sm">
                      <tr>
                        <th className="p-1 border-r border-[#e8dcc7] w-8 text-center text-[#756658]">Xóa</th>
                        <th className="p-1 border-r border-[#e8dcc7] text-[#4a3f35]">Tên hàng</th>
                        <th className="p-1 border-r border-[#e8dcc7] w-10 text-center text-[#4a3f35]">SL</th>
                        <th className="p-1 border-r border-[#e8dcc7] w-20 text-right text-[#4a3f35]">Đơn giá</th>
                        <th className="p-1 w-24 text-right text-[#4a3f35]">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.length === 0 ? (
                        <tr><td colSpan="5" className="p-4 text-center text-slate-400 italic">Chưa có món</td></tr>
                      ) : (
                        cart.map((c, i) => (
                          <tr key={i} onClick={() => setSelectedCartItemDetail(c)} className="border-b border-[#e8dcc7] hover:bg-[#fdf8f3] cursor-pointer text-[#4a3f35]">
                            <td className="p-1 border-r border-[#e8dcc7] text-center">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setCart(cart.filter((_, idx) => idx !== i)); }} 
                                className="text-red-600 hover:text-red-800 font-bold px-1"
                              >✕</button>
                            </td>
                            <td className="p-1 border-r border-[#e8dcc7] font-medium truncate max-w-[120px]">
                              {c.name}
                              {c.note && <div className="text-[10px] text-[#8c7b6c] italic block truncate">{c.note}</div>}
                            </td>
                            <td className="p-1 border-r border-[#e8dcc7] text-center font-bold text-[#8b5e34]">{c.qty}</td>
                            <td className="p-1 border-r border-[#e8dcc7] text-right font-mono">{c.price.toLocaleString()}</td>
                            <td className="p-1 text-right font-mono font-bold text-[#3e342b]">{(c.price * c.qty).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Held Orders Quick View */}
                {holdOrders.length > 0 && (
                  <div className="bg-yellow-50 border-b border-[#e8dcc7] p-1 flex gap-1 overflow-x-auto shrink-0 hide-scrollbar">
                    {holdOrders.map((held, idx) => (
                      <div key={idx} className="flex shrink-0 items-center bg-[#fdfbf7] border border-yellow-400 px-2 py-1 text-xs">
                        <span className="font-bold text-[#4a3f35] mr-2">{held.table}</span>
                        <button onClick={() => switchTable(held.table)} className="text-[#8b5e34] hover:underline mr-2">Mở</button>
                        <button onClick={() => setHoldOrders(prev => prev.filter((_, i) => i !== idx))} className="text-red-600 hover:underline">Hủy</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Tools & Totals */}
                <div className="bg-[#f0e8df] p-2 shrink-0">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex-1 border border-[#e8dcc7] bg-[#fdfbf7] p-2">
                      <div className="flex justify-between text-sm mb-1 text-[#756658]"><span>Tiền hàng:</span> <span className="font-mono">{cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm mb-1 text-[#756658]"><span>Chiết khấu:</span> <span className="font-mono">0</span></div>
                      <div className="flex justify-between font-bold text-lg text-[#3e342b] border-t border-[#e8dcc7] pt-1 mt-1">
                        <span>Khách Cần Trả:</span> <span className="font-mono text-red-600">{cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-1">
                    <div className="col-span-3 grid grid-cols-4 gap-1">
                      {['7','8','9','*','4','5','6','000','1','2','3','DEL','C','0',',','+'].map((btn) => (
                        <button key={btn} onClick={() => handleKeypad(btn)} className="bg-[#fdfbf7] border border-[#e8dcc7] hover:bg-[#e6dacb] active:bg-slate-300 py-2 font-mono font-bold text-sm text-[#4a3f35] rounded-sm">
                          {btn}
                        </button>
                      ))}
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <div className="bg-[#fdfbf7] border border-[#e8dcc7] p-1 text-right font-mono font-bold text-emerald-700 h-8 flex items-center justify-end rounded-sm text-sm">
                        {keypadBuffer || '0'}
                      </div>
                      <button onClick={() => posConfig.layout !== 'retail' && switchTable(null)} className="flex-1 bg-[#fdfbf7] border border-[#e8dcc7] hover:bg-[#e6dacb] font-bold text-sm text-[#4a3f35] rounded-sm">
                        Quay lại
                      </button>
                      <button onClick={() => setShowPaymentModal(true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-sm uppercase rounded-sm border border-green-800 shadow-sm">
                        Thanh toán
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Products Grid (High Density) */}
              <div className="flex-1 flex flex-col h-full min-h-0 border border-[#e8dcc7] bg-[#fdfbf7] rounded-sm overflow-hidden">
                {/* Category Pills - Square styling */}
                <div className="flex bg-[#e6dacb] border-b border-[#e8dcc7] overflow-x-auto shrink-0 hide-scrollbar p-1 gap-1">
                  {[
                    {id: 'all', label: 'TẤT CẢ'},
                    {id: 'coffee', label: 'CÀ PHÊ'},
                    {id: 'tea', label: 'TRÀ TRÁI CÂY'},
                    {id: 'smoothie', label: 'SINH TỐ'},
                    {id: 'food', label: 'ĐỒ ĂN'},
                  ].map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap border rounded-sm ${selectedCategory === cat.id ? 'bg-[#8b5e34] text-white border-[#5c3e23]' : 'bg-[#fdfbf7] text-[#5c4f42] border-[#e8dcc7] hover:bg-[#f0e8df]'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-1">
                  <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1">
                    {products.filter(item => (selectedCategory === 'all' || item.category === selectedCategory) && item.status !== 'not_ready').map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => { setSelectedItemForTopping(item); setNoteText(''); setSelectedSize(predefinedSizes[0]?.name || ''); setSelectedToppings([]); }} 
                        className={`bg-[#fdfbf7] border hover:border-[#8b5e34] cursor-pointer group flex flex-col relative h-24 overflow-hidden rounded-sm ${item.status === 'low_stock' ? 'border-yellow-400 border-2 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'border-[#e8dcc7]'}`}
                      >
                        {item.status === 'low_stock' && <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1 py-0.5 rounded-bl-md shadow-md z-20 animate-pulse">Sắp Hết</div>}
                        {item.image ? (
                          <div className="absolute inset-0 bg-[#f0e8df]">
                            <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" alt={item.name} />
                            <div className="absolute inset-0 bg-slate-900/40"></div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-4xl bg-[#f0e8df] opacity-50">{item.icon || '📦'}</div>
                        )}
                        <div className="relative z-10 flex flex-col h-full justify-between p-1">
                          <h3 className={`font-bold text-xs leading-tight line-clamp-2 ${item.image ? 'text-white drop-shadow-md' : 'text-[#4a3f35]'}`}>{item.name}</h3>
                          <div className={`text-right text-xs font-mono font-bold mt-1 ${item.image ? 'text-yellow-400 drop-shadow-md' : 'text-[#8b5e34]'}`}>
                            {item.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        ) : 

        /* ========================================================= */
        /* TAB: SALARY TRACKING (STAFF ONLY)                         */
        /* ========================================================= */
        activeTab === 'salary' ? (
          <div className="flex justify-center h-full animate-in fade-in relative w-full">
            {role === 'owner' && (
              <button 
                onClick={() => setActiveTab('settings')} 
                className="absolute top-0 right-0 bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 z-50 shadow-md transition-all hover:scale-105"
              >
                ⚙️ Sửa giao diện
              </button>
            )}
            {/* Mobile View for Staff */}
            <div className="w-full bg-[#fdfbf7] md:rounded-3xl p-4 md:p-6 pb-24 shadow-md md:border border-[#e8dcc7] relative overflow-y-auto max-w-lg mx-auto h-full md:h-auto">
              
              <div className="mt-6 mb-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-orange-400 to-amber-300 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-sm shadow-orange-500/30">
                  🧑‍🍳
                </div>
                <h2 className="text-xl font-bold">Xin chào, Nguyễn Văn A</h2>
                <p className="text-[#8c7b6c] text-sm">Nhân viên phục vụ (Part-time)</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-lg p-5 border border-[#e8dcc7] shadow-sm mb-6">
                <p className="text-[#8c7b6c] text-sm mb-1">Lương tích lũy tháng này</p>
                <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
                  3,450,000 đ
                </h3>
                <div className="mt-4 flex items-center gap-4 border-t border-[#e8dcc7] pt-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Tổng giờ làm</p>
                    <p className="font-bold text-lg">138h</p>
                  </div>
                  <div className="w-px h-8 bg-[#f0e8df]"></div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Mức lương</p>
                    <p className="font-bold text-lg text-[#8b5e34]">25k/h</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">Lịch sử Check-in gần nhất</h4>
                <button 
                  onClick={() => setIsScanning(!isScanning)} 
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm ${isScanning ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-[#8b5e34] text-white hover:bg-[#704b29]'}`}
                >
                  {isScanning ? 'Hủy quét' : '📷 Quét QR'}
                </button>
              </div>

              {isScanning && (
                <div className="mb-6 bg-[#f0e8df] p-2 rounded-lg border border-[#e8dcc7] shadow-inner overflow-hidden animate-in fade-in slide-in-from-top-4">
                  <div id="reader" className="w-full rounded-md overflow-hidden bg-black min-h-[250px]"></div>
                </div>
              )}
              <div className="space-y-3">
                {[
                  { date: 'Hôm nay, 19/06', in: '05:58', out: 'Đang làm', hours: 'N/A', status: 'active' },
                  { date: 'Hôm qua, 18/06', in: '14:00', out: '22:05', hours: '8h 5m', status: 'done' },
                  { date: 'Thứ 2, 17/06', in: '06:02', out: '14:00', hours: '7h 58m', status: 'done' },
                ].map((log, i) => (
                  <div key={i} className={`p-4 rounded-md border ${log.status === 'active' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-[#fdfbf7] border-[#e8dcc7]'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm">{log.date}</span>
                      {log.status === 'active' && <span className="text-xs bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">ĐANG CA</span>}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#8c7b6c]">In: {log.in} - Out: {log.out}</span>
                      <span className="text-orange-600 font-bold">{log.hours}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : 

        /* ========================================================= */
        /* OTHER TABS                                                */
        /* ========================================================= */
        activeTab === 'hr' ? (
          <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-300 relative w-full">
            {role === 'owner' && (
              <button 
                onClick={() => setActiveTab('settings')} 
                className="absolute top-0 right-0 bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 z-50 shadow-md transition-all hover:scale-105"
              >
                ⚙️ Sửa giao diện
              </button>
            )}
            <h2 className="text-3xl font-bold mb-2">Anti-Fraud Check-in</h2>
            <p className="text-[#8c7b6c] mb-8">Hiển thị mã QR này cho nhân viên quét bằng App SmartStore để Check-in.</p>
            
            <div className="relative p-1 bg-gradient-to-r from-purple-500 to-green-400 rounded-md shadow-[0_0_50px_rgba(74,222,128,0.2)]">
              <div className="bg-[#fdfbf7] p-6 rounded-[22px]">
                <div className="w-64 h-64 border border-[#e8dcc7] flex items-center justify-center bg-[#fdfbf7] rounded-md p-2">
                  <QRCode value={qrCodeData} size={240} />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-[#8b5e34]">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
              <span>Mã QR tự động làm mới mỗi 10 giây</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <span className="text-6xl mb-4">🚧</span>
            <h2 className="text-2xl font-bold text-[#8c7b6c]">Chưa được kích hoạt</h2>
            <p>Trang {tabNames[activeTab]} đang được phát triển.</p>
          </div>
        )}
      </div>

      
      
      {/* Custom Confirm Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#fdfbf7] rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-2xl shrink-0">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold text-[#4a3f35]">Xác nhận</h3>
              </div>
              <p className="text-[#756658] mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => {
                    if (confirmDialog.onCancel) confirmDialog.onCancel();
                    setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null });
                  }}
                  className="px-4 py-2 rounded-lg font-bold text-[#756658] hover:bg-[#f0e8df] transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                    setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null });
                  }}
                  className="px-4 py-2 rounded-lg font-bold bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-[#fdfbf7] rounded-xl shadow-2xl w-[800px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-[#e8dcc7] flex justify-between items-center bg-[#fdfbf7]">
              <h2 className="text-2xl font-bold text-[#4a3f35]">{editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
              <button onClick={() => setShowProductModal(false)} className="text-[#8c7b6c] hover:text-red-500 text-xl font-bold">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-[#f0e8df]/50">
              {/* CATEGORY SELECTION */}
              <div className="bg-[#fdfbf7] p-6 rounded-lg border border-[#e8dcc7] shadow-sm mb-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><span className="bg-[#f5eade] text-[#8b5e34] w-6 h-6 flex items-center justify-center rounded-full text-sm">1</span> Chọn Danh Mục</h3>
                <div className="flex gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setProductForm({...productForm, category: cat.id})}
                      className={`px-4 py-2 rounded-lg font-bold transition-colors border ${productForm.category === cat.id ? 'bg-[#8b5e34] text-white border-[#8b5e34] shadow-md' : 'bg-[#fdfbf7] text-[#756658] border-[#e8dcc7] hover:bg-[#f9f5f0]'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                  {categories.length === 0 && <span className="text-red-500 text-sm italic">Vui lòng tạo Danh mục.</span>}
                </div>
              </div>

              {/* PRODUCT DETAILS */}
              <div className={`transition-opacity duration-300 ${!productForm.category ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                <div className="bg-[#fdfbf7] p-6 rounded-lg border border-[#e8dcc7] shadow-sm mb-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><span className="bg-[#f5eade] text-[#8b5e34] w-6 h-6 flex items-center justify-center rounded-full text-sm">2</span> Thông tin cơ bản</h3>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1 flex flex-col items-center justify-center border-2 border-dashed border-[#e8dcc7] rounded-lg p-4 bg-[#fdfbf7] relative group cursor-pointer hover:bg-[#f0e8df] transition-colors">
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setProductForm({ ...productForm, image: reader.result });
                          reader.readAsDataURL(file);
                        }
                      }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {productForm.image ? (
                        <img src={productForm.image} className="w-full h-full object-cover rounded-md" alt="preview" />
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl mb-2">📷</div>
                          <div className="text-xs text-[#8c7b6c] font-bold">Thêm ảnh (Tùy chọn)</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="col-span-2 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-[#5c4f42] mb-1">Tên Sản Phẩm <span className="text-red-500">*</span></label>
                        <input type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="VD: Trà Đào Cam Sả" className="w-full bg-[#f9f5f0] border border-[#e8dcc7] rounded-lg p-3 text-[#4a3f35]" />
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-[#5c4f42] mb-1">Giá bán (VNĐ) {editingProduct && <span className="text-red-500">*</span>}</label>
                          <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} disabled={!editingProduct} placeholder={!editingProduct ? 'Chỉnh sửa sau khi tạo' : 'VD: 35000'} className={`w-full border rounded-lg p-3 font-bold ${!editingProduct ? 'bg-[#e6dacb] text-[#8c7b6c] cursor-not-allowed border-[#e8dcc7]' : 'bg-[#f9f5f0] border-[#e8dcc7] text-[#4a3f35]'}`} />
                          {editingProduct && <p className="text-xs text-[#8c7b6c] mt-1">Giá vốn: <span className="font-bold text-[#8b5e34]">{productForm.recipe.reduce((total, req) => { const ing = ingredients.find(i => i.id === req.ingredientId); return total + (ing ? ing.cost * req.qty : 0); }, 0).toLocaleString()} đ</span></p>}
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-[#5c4f42] mb-1">Trạng thái</label>
                          <select value={productForm.status} onChange={e => setProductForm({...productForm, status: e.target.value})} disabled={!editingProduct} className={`w-full border rounded-lg p-3 font-bold ${!editingProduct ? 'bg-[#e6dacb] text-[#8c7b6c] cursor-not-allowed border-[#e8dcc7]' : 'bg-[#f9f5f0] border-[#e8dcc7] text-[#4a3f35]'}`}>
                            <option value="ready">🟢 Đang bán</option>
                            <option value="not_ready">⚫ Chưa sẵn sàng</option>
                            <option value="low_stock">🟡 Sắp hết hàng</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INGREDIENTS */}
                <div className="bg-[#fdfbf7] p-6 rounded-lg border border-[#e8dcc7] shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2"><span className="bg-[#f5eade] text-[#8b5e34] w-6 h-6 flex items-center justify-center rounded-full text-sm">3</span> Công thức Nguyên liệu</h3>
                    <button onClick={() => setProductForm({...productForm, recipe: [...productForm.recipe, {ingredientId: '', qty: 0}]})} className="text-[#8b5e34] hover:text-blue-800 font-bold text-sm bg-[#fdf8f3] px-3 py-1 rounded-md transition-colors">+ Thêm NL</button>
                  </div>
                  
                  {productForm.recipe.length === 0 ? (
                    <div className="text-center py-6 bg-[#fdfbf7] border border-dashed border-[#e8dcc7] rounded-lg">
                      <p className="text-[#8c7b6c] text-sm">Món này chưa thiết lập công thức.</p>
                      <button onClick={() => setProductForm({...productForm, recipe: [{ingredientId: '', qty: 0}]})} className="mt-2 text-[#8b5e34] font-bold text-sm">Thiết lập ngay</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {productForm.recipe.map((req, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-[#fdfbf7] p-3 rounded-lg border border-[#e8dcc7]">
                          <select 
                            value={req.ingredientId} 
                            onChange={(e) => {
                              const newRecipe = [...productForm.recipe];
                              newRecipe[idx].ingredientId = e.target.value;
                              setProductForm({...productForm, recipe: newRecipe});
                            }}
                            className="flex-1 bg-[#fdfbf7] border border-[#e8dcc7] rounded-md p-2 text-sm"
                          >
                            <option value="">-- Chọn Nguyên Liệu --</option>
                            {ingredients.map(ing => (
                              <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                            ))}
                          </select>
                          <input 
                            type="number" 
                            placeholder="Số lượng" 
                            value={req.qty}
                            onChange={(e) => {
                              const newRecipe = [...productForm.recipe];
                              newRecipe[idx].qty = parseFloat(e.target.value) || 0;
                              setProductForm({...productForm, recipe: newRecipe});
                            }}
                            className="w-24 bg-[#fdfbf7] border border-[#e8dcc7] rounded-md p-2 text-sm"
                          />
                          <button onClick={() => {
                            const newRecipe = productForm.recipe.filter((_, i) => i !== idx);
                            setProductForm({...productForm, recipe: newRecipe});
                          }} className="text-red-400 hover:text-red-600 p-2 font-bold">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-[#e8dcc7] bg-[#fdfbf7] flex justify-end gap-3">
              <button onClick={() => setShowProductModal(false)} className="px-6 py-2 rounded-lg font-bold text-[#756658] hover:bg-[#f0e8df]">Hủy</button>
              <button 
                disabled={!productForm.category}
                onClick={() => {
                  if(!productForm.name) {
                    alert('Vui lòng điền Tên sản phẩm!');
                    return;
                  }
                  if (editingProduct && !productForm.price) {
                    alert('Vui lòng điền Giá bán sản phẩm!');
                    return;
                  }
                  
                  const validRecipe = productForm.recipe.filter(r => r.ingredientId && r.qty > 0);
                  if (validRecipe.length === 0) {
                    alert('Sản phẩm phải có ít nhất 1 nguyên liệu hợp lệ trong công thức!');
                    return;
                  }

                  if (editingProduct) {
                    const referencePrice = validRecipe.reduce((total, req) => {
                      const ing = ingredients.find(i => i.id === req.ingredientId);
                      return total + (ing ? ing.cost * req.qty : 0);
                    }, 0);
                    
                    if (parseInt(productForm.price) < referencePrice) {
                      alert('Giá bán (' + parseInt(productForm.price).toLocaleString() + ' đ) không được thấp hơn Giá vốn tham khảo (' + referencePrice.toLocaleString() + ' đ)!');
                      return;
                    }
                  }

                  if(editingProduct) {
                    setProducts(products.map(p => p.id === editingProduct.id ? {...productForm, id: editingProduct.id, price: parseInt(productForm.price), recipe: validRecipe} : p));
                  } else {
                    setProducts([...products, {...productForm, id: Date.now(), price: 0, status: 'not_ready', recipe: validRecipe}]);
                  }
                  setShowProductModal(false);
                }} 
                className={`px-6 py-2 rounded-lg font-bold shadow-sm ${!productForm.category ? 'bg-slate-300 text-[#8c7b6c] cursor-not-allowed' : 'bg-[#8b5e34] hover:bg-[#704b29] text-white'}`}
              >
                {editingProduct ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Topping / Note Modal (Keep existing logic) */}
      {selectedItemForTopping && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#fdfbf7] border border-[#e8dcc7] rounded-lg p-6 w-[500px] shadow-md border border-[#e8dcc7] animate-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-2">Tùy chọn: {selectedItemForTopping.name}</h2>
            <p className="text-[#8b5e34] font-bold mb-6">{selectedItemForTopping.price.toLocaleString()} đ</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[#8c7b6c] mb-2">Kích cỡ / Phân loại</label>
                <div className="flex flex-wrap gap-2">
                  {predefinedSizes.map((sz, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedSize(sz.name)} 
                      className={`px-4 py-2 border rounded-sm font-bold transition-all text-sm ${selectedSize === sz.name ? 'border-[#8b5e34] bg-[#8b5e34] text-white' : 'border-[#e8dcc7] bg-[#fdfbf7] text-[#5c4f42] hover:bg-[#f0e8df]'}`}
                    >
                      {sz.name} {sz.priceAdd > 0 && `(+${sz.priceAdd.toLocaleString()}đ)`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#8c7b6c] mb-2">Ghi chú nhanh</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {predefinedNotes.map((note, idx) => {
                    const isSelected = noteText.split(',').map(n => n.trim()).includes(note);
                    return (
                      <button 
                        key={idx} 
                        onClick={() => addQuickNote(note)}
                        className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${isSelected ? 'bg-[#8b5e34] text-white' : 'bg-[#f0e8df] text-[#756658] hover:bg-[#e6dacb]'}`}
                      >
                        {note}
                      </button>
                    )
                  })}
                </div>
                <textarea 
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Hoặc nhập ghi chú khác..."
                  className="w-full bg-[#f9f5f0] border border-[#e8dcc7] rounded-lg p-3 text-[#4a3f35] placeholder-gray-500 focus:outline-none focus:border-[#8b5e34]"
                  rows="2"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setSelectedItemForTopping(null)} className="flex-1 bg-[#f0e8df] hover:bg-[#e6dacb] py-3 rounded-md font-bold transition-colors">Hủy</button>
              <button onClick={() => { handleAddItem({...selectedItemForTopping, size: selectedSize, note: noteText.trim(), toppings: selectedToppings}); setSelectedItemForTopping(null); }} className="flex-1 bg-[#8b5e34] hover:bg-[#704b29] text-white py-3 rounded-md font-bold transition-colors shadow-sm shadow-[#8b5e34]/20">Thêm vào giỏ</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Payment Modal */}
      {showPaymentModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#fdfbf7] border border-[#e8dcc7] rounded-lg p-6 w-[500px] shadow-md border border-[#e8dcc7]">
            <h2 className="text-2xl font-bold mb-6 text-center border-b border-[#e8dcc7] pb-4">Thanh toán Bill</h2>
            
            <div className="flex justify-between items-center mb-6 bg-[#fdfbf7] p-4 rounded-md border border-[#e8dcc7]">
              <span className="text-[#8c7b6c] text-lg">Tổng tiền thanh toán:</span>
              <span className="text-3xl font-bold text-[#8b5e34]">
                {cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()} đ
              </span>
            </div>

            <div className="mb-6">
              <label className="block text-[#8c7b6c] mb-2 font-bold">Khách đưa (Nhập tay):</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amountGiven || ''} 
                  onChange={(e) => setAmountGiven(Number(e.target.value))}
                  placeholder="Nhập số tiền..."
                  className="w-full text-2xl font-bold text-[#8b5e34] p-3 pr-12 border-2 border-[#e8dcc7] rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">VNĐ</span>
              </div>
            </div>
            
            <label className="block text-[#8c7b6c] mb-3">Hoặc chọn nhanh:</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[50000, 100000, 200000, 500000].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setAmountGiven(amt)}
                  className={`py-2 rounded-lg font-bold transition-all ${amountGiven === amt ? 'bg-[#8b5e34] text-white shadow-md shadow-[#8b5e34]/30' : 'bg-[#f0e8df] hover:bg-[#e6dacb] text-[#5c4f42] border border-[#e8dcc7]'}`}>
                  {amt.toLocaleString()} đ
                </button>
              ))}
              <button 
                onClick={() => setAmountGiven(cart.reduce((sum, item) => sum + (item.price * item.qty), 0))}
                className={`py-2 rounded-lg font-bold transition-all ${amountGiven === cart.reduce((sum, item) => sum + (item.price * item.qty), 0) ? 'bg-[#8b5e34] text-white shadow-md shadow-[#8b5e34]/30' : 'bg-[#f0e8df] hover:bg-[#e6dacb] text-[#5c4f42] border border-[#e8dcc7]'}`}>
                Khách đưa đủ
              </button>
              <button 
                className="py-2 rounded-lg font-bold transition-all bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30">
                Momo / Thẻ
              </button>
            </div>

            {amountGiven > 0 && amountGiven >= cart.reduce((sum, item) => sum + (item.price * item.qty), 0) && (
              <div className="flex justify-between items-center mb-6 bg-[#8b5e34]/10 border border-[#8b5e34]/30 p-4 rounded-md">
                <span className="text-[#8b5e34] text-lg">Tiền thối lại:</span>
                <span className="text-3xl font-bold text-[#8b5e34]">
                  {(amountGiven - cart.reduce((sum, item) => sum + (item.price * item.qty), 0)).toLocaleString()} đ
                </span>
              </div>
            )}
            
            {amountGiven > 0 && amountGiven < cart.reduce((sum, item) => sum + (item.price * item.qty), 0) && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 p-4 rounded-md text-red-400 text-center font-bold">
                Khách đưa thiếu tiền!
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => { setShowPaymentModal(false); setAmountGiven(0); }}
                className="flex-1 bg-[#f0e8df] hover:bg-[#e6dacb] py-4 rounded-md font-bold transition-colors text-lg">
                Hủy
              </button>
              <button 
                onClick={async () => {
                  try {
                    await addDoc(collection(db, "orders"), {
                      items: cart,
                      total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
                      amountGiven: amountGiven,
                      table: posConfig.layout !== 'retail' ? selectedTable : 'N/A',
                      timestamp: serverTimestamp()
                    });
                    alert("Đã hoàn tất thanh toán & Lưu Hóa đơn lên Firebase thành công!");
                    setCart([]);
                    setShowPaymentModal(false);
                    setAmountGiven(0);
                    if (posConfig.layout !== 'retail') setSelectedTable(null);
                  } catch (error) {
                    console.error("Lỗi khi lưu Firebase:", error);
                    alert("Có lỗi xảy ra khi lưu lên Cloud!");
                  }
                }}
                disabled={amountGiven < cart.reduce((sum, item) => sum + (item.price * item.qty), 0)}
                className="flex-1 bg-[#8b5e34] hover:bg-[#704b29] disabled:bg-[#e6dacb] disabled:text-[#8c7b6c] text-white py-4 rounded-md font-bold transition-colors shadow-sm shadow-[#8b5e34]/20 text-lg">
                Hoàn tất & In Bill
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-[#fdfbf7] rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold text-[#4a3f35] mb-2">Xác nhận</h3>
            <p className="text-[#756658] mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  if(confirmDialog.onCancel) confirmDialog.onCancel();
                  setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null });
                }} 
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-[#756658] bg-[#f0e8df] hover:bg-[#e6dacb] transition-colors">
                Hủy
              </button>
              <button 
                onClick={() => {
                  if(confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null });
                }} 
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-[#8b5e34] hover:bg-[#704b29] transition-colors shadow-sm shadow-[#8b5e34]/20">
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fdfbf7] border-t border-[#e8dcc7] flex justify-around items-center pb-safe pt-2 px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-[90]">
        {Object.entries(tabNames).filter(([key]) => visibleTabs.includes(key)).slice(0, 5).map(([key, name]) => {
          const isActive = activeTab === key;
          const icon = name.split(' ')[0];
          const label = name.replace(icon, '').trim();
          return (
            <button
              key={key}
              onClick={() => handleTabClick(key)}
              className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all ${isActive ? 'text-[#8b5e34]' : 'text-slate-400 hover:text-[#756658]'}`}
            >
              <span className={`text-xl mb-1 ${isActive ? 'scale-110' : ''} transition-transform`}>{icon}</span>
              <span className={`text-[10px] font-bold text-center leading-tight truncate w-full px-1 ${isActive ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;

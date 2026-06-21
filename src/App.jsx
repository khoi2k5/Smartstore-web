import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from './firebase';

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
      if (window.confirm("Bạn đang có thay đổi chưa lưu. Bấm OK để ở lại trang và lưu, bấm Cancel để bỏ qua thay đổi và chuyển trang.")) {
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
    if (activeTab === 'settings' && isSettingsDirty) {
      if (window.confirm("Bạn đang có thay đổi chưa lưu. Bấm OK để ở lại trang và lưu, bấm Cancel để bỏ qua và tiếp tục đăng xuất.")) {
        return;
      }
    }
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
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
    }
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
    if (window.confirm("Bạn có chắc chắn muốn lưu toàn bộ cài đặt không?")) {
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
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
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
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-sm rounded-md p-10 max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              SmartStore
            </h1>
            <p className="text-slate-500">Đăng nhập để vào hệ thống</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-500 text-sm mb-2">Email</label>
              <input 
                type="email" 
                required 
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="VD: chuquan@gmail.com"
                className="w-full bg-white border border-slate-200 rounded-md p-4 text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-sm mb-2">Mật khẩu</label>
              <input 
                type="password" 
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-white border border-slate-200 rounded-md p-4 text-slate-800 focus:outline-none focus:border-blue-600 transition-colors"
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
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-slate-500 text-white py-4 rounded-md font-bold transition-all shadow-sm shadow-blue-600/20 text-lg">
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex p-4 gap-4">
      
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-xl border border-white shadow-sm rounded-lg p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-8">
            SmartStore
            <span className="block text-xs text-slate-500 font-normal mt-1">
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
                    ? tabKey === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-sm shadow-blue-600/30' 
                      : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-bold' 
                    : 'hover:bg-white text-slate-500'
                }`}>
                {tabNames[tabKey]}
              </button>
            ))}
          </nav>
        </div>
        
        <div>
          <button 
            onClick={handleLogoutClick}
            className="w-full mt-8 bg-white hover:bg-red-500/20 hover:text-red-400 text-slate-500 py-3 rounded-md font-bold transition-colors border border-slate-200 hover:border-red-500/50">
            🚪 Đăng xuất
          </button>
          <div className="text-sm text-slate-400 mt-4 text-center">
            Night Owl Team © 2026
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white/80 backdrop-blur-xl border border-white shadow-sm rounded-lg p-8 overflow-y-auto relative">
        
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
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 border border-blue-600/30 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-600/20 rounded-full blur-xl group-hover:bg-blue-600/30 transition-all"></div>
                <h3 className="text-slate-500 font-bold mb-2 flex items-center gap-2"><span>📈</span> Tổng Doanh Thu</h3>
                <div className="text-3xl font-bold text-blue-600">5,450,000 đ</div>
                <p className="text-sm text-blue-600 mt-2">↑ 12% so với hôm qua</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-orange-500/30 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/30 transition-all"></div>
                <h3 className="text-slate-500 font-bold mb-2 flex items-center gap-2"><span>👥</span> Chi phí Nhân sự</h3>
                <div className="text-3xl font-bold text-orange-400">1,200,000 đ</div>
                <p className="text-sm text-slate-500 mt-2">Dựa trên 34 giờ làm việc</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg p-6 border border-blue-200 shadow-[0_0_30px_rgba(168,85,247,0.2)] relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl"></div>
                <h3 className="text-purple-200 font-bold mb-2 flex items-center gap-2"><span>💎</span> Lợi Nhuận Ròng</h3>
                <div className="text-4xl font-extrabold text-slate-800">4,250,000 đ</div>
                <div className="mt-3 bg-white/10 rounded-full px-3 py-1 inline-block text-sm text-purple-200 border border-white/20">
                  Biên lợi nhuận: 78%
                </div>
              </div>
            </div>

            {/* Charts & Breakdown */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="text-xl font-bold mb-6">Tăng trưởng Lợi nhuận trong ngày</h3>
                <div className="h-64 flex items-end gap-4 mt-8">
                  {[
                    { time: '08:00', rev: 40, cost: 10 },
                    { time: '12:00', rev: 100, cost: 25 },
                    { time: '16:00', rev: 70, cost: 40 },
                    { time: '20:00', rev: 120, cost: 55 },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full relative flex justify-center items-end h-48 bg-slate-50/50 rounded-lg p-2 gap-1">
                        <div className="w-1/2 bg-blue-600 rounded-t-md relative group-hover:opacity-80 transition-opacity" style={{ height: `${bar.rev}%` }}></div>
                        <div className="w-1/2 bg-orange-500 rounded-t-md relative group-hover:opacity-80 transition-opacity" style={{ height: `${bar.cost}%` }}></div>
                      </div>
                      <span className="text-slate-500 text-sm font-mono">{bar.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="text-xl font-bold mb-6">Chi tiết Nhân sự hôm nay</h3>
                <div className="space-y-4">
                  <div className="bg-slate-50/80 rounded-md p-4 border border-slate-200">
                    <div className="flex justify-between items-center mb-2"><span className="font-bold">Nguyễn Văn A</span><span className="text-blue-600 font-mono">8 giờ</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">25,000đ/h</span><span className="text-orange-600 font-bold">200,000 đ</span></div>
                  </div>
                  <div className="bg-slate-50/80 rounded-md p-4 border border-slate-200">
                    <div className="flex justify-between items-center mb-2"><span className="font-bold">Trần Thị B</span><span className="text-blue-600 font-mono">6 giờ</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">22,000đ/h</span><span className="text-orange-600 font-bold">132,000 đ</span></div>
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
            
            <div className="grid grid-cols-4 gap-6 flex-1 min-h-0">
              {/* Product Management */}
              <div className="col-span-2 bg-white rounded-lg p-6 border border-slate-200 flex flex-col h-full min-h-0">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🏷️ Quản lý Danh mục Sản phẩm</h3>
                <p className="text-sm text-slate-500 mb-6">Thêm, sửa, xóa các mặt hàng sẽ xuất hiện trên màn hình thu ngân.</p>
                
                <div className="flex gap-4 mb-6 items-end">
                  {/* Cột Upload Hình Ảnh */}
                  <div className="flex flex-col items-center justify-center">
                    <label className="text-xs text-slate-500 mb-1">Ảnh (Tùy chọn)</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                    <label 
                      htmlFor="image-upload" 
                      className="w-16 h-16 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden relative group"
                    >
                      {newProduct.image ? (
                        <>
                          <img src={newProduct.image} className="w-full h-full object-cover" alt="preview" />
                          <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-xs">Sửa</div>
                        </>
                      ) : (
                        <span className="text-2xl text-slate-400">📷</span>
                      )}
                    </label>
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">Tên sản phẩm</label>
                    <input type="text" placeholder="VD: Trà đào" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800" />
                  </div>
                  
                  <div className="w-40">
                    <label className="text-xs text-slate-500 mb-1 block">Giá tiền (VND)</label>
                    <input type="number" placeholder="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800" />
                  </div>
                  
                  <button onClick={addProduct} className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-[50px] rounded-lg font-bold transition-colors">Thêm</button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 rounded-md p-4 border border-slate-200">
                  {products.length === 0 ? (
                    <p className="text-slate-400 text-center mt-10">Chưa có sản phẩm nào. Hãy thêm ở trên.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {products.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-md hover:border-slate-300 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                              {p.image ? (
                                <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                              ) : (
                                <span className="text-2xl">{p.icon || '📦'}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm line-clamp-1">{p.name}</p>
                              <p className="text-sm text-blue-600 font-mono">{p.price.toLocaleString()} đ</p>
                            </div>
                          </div>
                          <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-slate-800 px-3 py-1 bg-red-500/10 hover:bg-red-500/80 rounded-lg transition-colors font-bold text-sm">Xóa</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Management */}
              <div className="col-span-1 bg-white rounded-lg p-6 border border-slate-200 flex flex-col h-full min-h-0">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📝 Quản lý Ghi chú nhanh</h3>
                <p className="text-sm text-slate-500 mb-6">Thiết lập các ghi chú thường dùng để thu ngân chọn nhanh khi order.</p>

                <div className="flex gap-2 mb-6">
                  <input type="text" placeholder="Nhập ghi chú mới..." value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNewNote()} className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 text-sm" />
                  <button onClick={handleAddNewNote} className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-lg font-bold transition-colors">Thêm</button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 rounded-md p-4 border border-slate-200 flex flex-col gap-2">
                  {predefinedNotes.map((note, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-sm">{note}</span>
                      <button onClick={() => deletePredefinedNote(note)} className="text-slate-500 hover:text-red-400 transition-colors">✕</button>
                    </div>
                  ))}
                  {predefinedNotes.length === 0 && (
                    <p className="text-slate-400 text-center text-sm mt-4">Chưa có ghi chú nhanh nào.</p>
                  )}
                </div>
              </div>


              {/* Size Management */}
              <div className="col-span-1 bg-white rounded-lg p-6 border border-slate-200 flex flex-col h-full min-h-0">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📏 Quản lý Kích cỡ / Phân loại</h3>
                <p className="text-sm text-slate-500 mb-6">Thiết lập các biến thể kích thước (S, M, L, XL...) và giá cộng thêm.</p>

                <div className="flex gap-2 mb-6">
                  <input type="text" placeholder="Tên (VD: Size L)" value={newSizeName} onChange={e => setNewSizeName(e.target.value)} className="flex-1 bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 text-sm" />
                  <input type="number" placeholder="+Giá (VNĐ)" value={newSizePrice} onChange={e => setNewSizePrice(e.target.value)} className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 text-sm" />
                  <button onClick={handleAddNewSize} className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-lg font-bold transition-colors text-sm">Thêm</button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 rounded-md p-4 border border-slate-200 flex flex-col gap-2">
                  {predefinedSizes.map((sz, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-bold text-sm block">{sz.name}</span>
                        <span className="text-xs text-blue-600">+{sz.priceAdd.toLocaleString()} đ</span>
                      </div>
                      <button onClick={() => deletePredefinedSize(idx)} className="text-slate-500 hover:text-red-400 transition-colors">✕</button>
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
              <p className="text-slate-500">Tùy biến SmartStore cho phù hợp với mô hình kinh doanh của bạn.</p>
              {isSettingsDirty && (
                <div className="text-orange-400 text-sm mt-2 font-bold animate-pulse">
                  ⚠️ Có thay đổi chưa được lưu!
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Renaming Tabs */}
              <div className="bg-white rounded-lg p-6 border border-slate-200 flex flex-col">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📝 Đổi tên Menu Sidebar</h3>
                <p className="text-sm text-slate-500 mb-6">Đổi tên các chức năng theo đúng ngôn ngữ của quán (ví dụ: Quản lý Sản phẩm -&gt; Quần áo).</p>
                <div className="grid grid-cols-3 gap-4 flex-1">
                  {Object.keys(editTabNames).filter(k => k !== 'settings').map(key => (
                    <div key={key}>
                      <label className="block text-slate-400 text-xs mb-1 uppercase tracking-wider">{key}</label>
                      <input 
                        type="text" 
                        value={editTabNames[key]}
                        onChange={(e) => handleTabNameEdit(key, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* POS Layout Config */}
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🎨 Tùy chỉnh Giao diện POS</h3>
                <p className="text-sm text-slate-500 mb-6">Chọn mô hình bán hàng và tùy biến tên gọi các khu vực (Ví dụ: Đổi "Bàn" thành "Phòng thử đồ" hoặc "Ghế").</p>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Layout 1 */}
                  <div 
                    onClick={() => handlePosConfigEdit({ layout: 'table', title: 'Sơ đồ Bàn / Bán hàng', entityName: 'Bàn', entityIcon: '🪑'})}
                    className={`p-4 rounded-md border cursor-pointer transition-all ${editPosConfig.layout === 'table' ? 'bg-blue-600/20 border-blue-600 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                    <div className="text-3xl mb-2">🪑</div>
                    <h4 className="font-bold text-slate-800">Quản lý Bàn</h4>
                    <p className="text-xs text-slate-500 mt-1">Dành cho Cafe, Quán ăn (Có sơ đồ Bàn)</p>
                  </div>
                  {/* Layout 2 */}
                  <div 
                    onClick={() => handlePosConfigEdit({ layout: 'retail', title: 'Bán hàng nhanh', entityName: '', entityIcon: ''})}
                    className={`p-4 rounded-md border cursor-pointer transition-all ${editPosConfig.layout === 'retail' ? 'bg-blue-600/20 border-blue-600 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                    <div className="text-3xl mb-2">🛒</div>
                    <h4 className="font-bold text-slate-800">Bán lẻ (Nhanh)</h4>
                    <p className="text-xs text-slate-500 mt-1">Dành cho Shop quần áo, Take-away (Vào thẳng chọn món)</p>
                  </div>
                  {/* Layout 3 */}
                  <div 
                    onClick={() => handlePosConfigEdit({ layout: 'room', title: 'Sơ đồ Phòng / Dịch vụ', entityName: 'Phòng', entityIcon: '🚪'})}
                    className={`p-4 rounded-md border cursor-pointer transition-all ${editPosConfig.layout === 'room' ? 'bg-blue-600/20 border-blue-600 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                    <div className="text-3xl mb-2">🚪</div>
                    <h4 className="font-bold text-slate-800">Phòng / Dịch vụ</h4>
                    <p className="text-xs text-slate-500 mt-1">Dành cho Spa, Bida, Phòng thử đồ</p>
                  </div>
                </div>

                {/* Text Overrides */}
                {editPosConfig.layout !== 'retail' && (
                  <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
                    <div>
                      <label className="block text-slate-400 text-sm mb-1 uppercase">Tiêu đề màn hình POS</label>
                      <input type="text" value={editPosConfig.title} onChange={e => handlePosConfigEdit({title: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-blue-600" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1 uppercase">Tên gọi từng ô (VD: Bàn, Ghế)</label>
                      <input type="text" value={editPosConfig.entityName} onChange={e => handlePosConfigEdit({entityName: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-blue-600" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1 uppercase">Icon Emoji cho từng ô</label>
                      <input type="text" value={editPosConfig.entityIcon} onChange={e => handlePosConfigEdit({entityIcon: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-blue-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={saveSettings} className={`w-full font-bold py-4 rounded-md transition-colors shadow-sm text-lg ${isSettingsDirty ? 'bg-orange-500 hover:bg-orange-600 text-slate-800 shadow-orange-500/30' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'}`}>
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
                  className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 z-50 shadow-md transition-all hover:scale-105 border border-blue-400"
                >
                  ⚙️ Tuỳ chỉnh giao diện POS
                </button>
              )}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">{posConfig.title}</h2>
              </div>
              <p className="text-slate-500 mb-6">Vui lòng chọn {posConfig.entityName.toLowerCase()} hoặc chọn "{posConfig.takeawayName}".</p>
              
              <div className="grid grid-cols-4 lg:grid-cols-5 gap-3">
                <div 
                  onClick={() => setSelectedTable(posConfig.takeawayName)}
                  className="border border-blue-600 rounded-md cursor-pointer transition-all overflow-hidden relative h-28 group"
                  style={{ backgroundImage: "url('/takeaway_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0 bg-blue-900/60 group-hover:bg-blue-900/40 transition-colors"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-3">
                    <span className="font-bold text-white text-center text-sm">{posConfig.takeawayName}</span>
                  </div>
                </div>
                {[1,2,3,4,5,6,7,8].map((idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedTable(`${posConfig.entityName} ${idx}`)}
                    className="border border-slate-200 hover:border-blue-400 rounded-md cursor-pointer transition-all overflow-hidden relative h-28 group"
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
            <div className="flex gap-2 h-full animate-in slide-in-from-right-8 duration-300 min-h-0 bg-slate-100 p-2 rounded-sm border border-slate-300 relative">
              {role === 'owner' && (
                <button 
                  onClick={() => setActiveTab('settings')} 
                  className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 z-50 shadow-md transition-all hover:scale-105 border border-blue-400"
                >
                  ⚙️ Tuỳ chỉnh giao diện POS
                </button>
              )}
              {/* Left Side: Cart & Keypad (High Density) */}
              <div className="w-[450px] flex flex-col bg-white border border-slate-400 shrink-0 shadow-sm rounded-sm">
                {/* Header */}
                <div className="bg-blue-700 text-white p-2 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-sm uppercase">Hóa đơn: {selectedTable !== posConfig.takeawayName ? selectedTable : 'Mua mang đi'}</h3>
                  {cart.length > 0 && (
                    <button 
                      onClick={() => {
                        setHoldOrders(prev => [...prev, { table: selectedTable, cart: [...cart], time: new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) }]);
                        setCart([]);
                      }}
                      className="text-xs bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-2 py-1 font-bold transition-colors shadow-sm">
                      [F3] Lưu tạm
                    </button>
                  )}
                </div>

                {/* Cart Table Data */}
                <div className="flex-1 overflow-y-auto bg-white border-b border-slate-400">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-200 sticky top-0 border-b border-slate-400 z-10 shadow-sm">
                      <tr>
                        <th className="p-1 border-r border-slate-300 w-8 text-center text-slate-600">Xóa</th>
                        <th className="p-1 border-r border-slate-300 text-slate-800">Tên hàng</th>
                        <th className="p-1 border-r border-slate-300 w-10 text-center text-slate-800">SL</th>
                        <th className="p-1 border-r border-slate-300 w-20 text-right text-slate-800">Đơn giá</th>
                        <th className="p-1 w-24 text-right text-slate-800">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.length === 0 ? (
                        <tr><td colSpan="5" className="p-4 text-center text-slate-400 italic">Chưa có món</td></tr>
                      ) : (
                        cart.map((c, i) => (
                          <tr key={i} onClick={() => setSelectedCartItemDetail(c)} className="border-b border-slate-200 hover:bg-blue-50 cursor-pointer text-slate-800">
                            <td className="p-1 border-r border-slate-300 text-center">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setCart(cart.filter((_, idx) => idx !== i)); }} 
                                className="text-red-600 hover:text-red-800 font-bold px-1"
                              >✕</button>
                            </td>
                            <td className="p-1 border-r border-slate-300 font-medium truncate max-w-[120px]">
                              {c.name}
                              {c.note && <div className="text-[10px] text-slate-500 italic block truncate">{c.note}</div>}
                            </td>
                            <td className="p-1 border-r border-slate-300 text-center font-bold text-blue-700">{c.qty}</td>
                            <td className="p-1 border-r border-slate-300 text-right font-mono">{c.price.toLocaleString()}</td>
                            <td className="p-1 text-right font-mono font-bold text-slate-900">{(c.price * c.qty).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Held Orders Quick View */}
                {holdOrders.length > 0 && (
                  <div className="bg-yellow-50 border-b border-slate-400 p-1 flex gap-1 overflow-x-auto shrink-0 hide-scrollbar">
                    {holdOrders.map((held, idx) => (
                      <div key={idx} className="flex shrink-0 items-center bg-white border border-yellow-400 px-2 py-1 text-xs">
                        <span className="font-bold text-slate-800 mr-2">{held.table}</span>
                        <button onClick={() => { setCart(held.cart); setSelectedTable(held.table); setHoldOrders(prev => prev.filter((_, i) => i !== idx)); }} className="text-blue-700 hover:underline mr-2">Mở</button>
                        <button onClick={() => setHoldOrders(prev => prev.filter((_, i) => i !== idx))} className="text-red-600 hover:underline">Hủy</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Tools & Totals */}
                <div className="bg-slate-100 p-2 shrink-0">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex-1 border border-slate-400 bg-white p-2">
                      <div className="flex justify-between text-sm mb-1 text-slate-600"><span>Tiền hàng:</span> <span className="font-mono">{cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm mb-1 text-slate-600"><span>Chiết khấu:</span> <span className="font-mono">0</span></div>
                      <div className="flex justify-between font-bold text-lg text-slate-900 border-t border-slate-300 pt-1 mt-1">
                        <span>Khách Cần Trả:</span> <span className="font-mono text-red-600">{cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-1">
                    <div className="col-span-3 grid grid-cols-4 gap-1">
                      {['7','8','9','*','4','5','6','000','1','2','3','DEL','C','0',',','+'].map((btn) => (
                        <button key={btn} onClick={() => handleKeypad(btn)} className="bg-white border border-slate-400 hover:bg-slate-200 active:bg-slate-300 py-2 font-mono font-bold text-sm text-slate-800 rounded-sm">
                          {btn}
                        </button>
                      ))}
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <div className="bg-white border border-slate-400 p-1 text-right font-mono font-bold text-emerald-700 h-8 flex items-center justify-end rounded-sm text-sm">
                        {keypadBuffer || '0'}
                      </div>
                      <button onClick={() => posConfig.layout !== 'retail' && setSelectedTable(null)} className="flex-1 bg-white border border-slate-400 hover:bg-slate-200 font-bold text-sm text-slate-800 rounded-sm">
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
              <div className="flex-1 flex flex-col h-full min-h-0 border border-slate-400 bg-slate-50 rounded-sm overflow-hidden">
                {/* Category Pills - Square styling */}
                <div className="flex bg-slate-200 border-b border-slate-400 overflow-x-auto shrink-0 hide-scrollbar p-1 gap-1">
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
                      className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap border rounded-sm ${selectedCategory === cat.id ? 'bg-blue-600 text-white border-blue-800' : 'bg-white text-slate-700 border-slate-400 hover:bg-slate-100'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-1">
                  <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1">
                    {products.filter(item => selectedCategory === 'all' || item.category === selectedCategory).map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => { setSelectedItemForTopping(item); setNoteText(''); setSelectedSize(predefinedSizes[0]?.name || ''); setSelectedToppings([]); }} 
                        className="bg-white border border-slate-400 hover:border-blue-600 cursor-pointer group flex flex-col relative h-24 overflow-hidden rounded-sm"
                      >
                        {item.image ? (
                          <div className="absolute inset-0 bg-slate-100">
                            <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" alt={item.name} />
                            <div className="absolute inset-0 bg-slate-900/40"></div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-4xl bg-slate-100 opacity-50">{item.icon || '📦'}</div>
                        )}
                        <div className="relative z-10 flex flex-col h-full justify-between p-1">
                          <h3 className={`font-bold text-xs leading-tight line-clamp-2 ${item.image ? 'text-white drop-shadow-md' : 'text-slate-800'}`}>{item.name}</h3>
                          <div className={`text-right text-xs font-mono font-bold mt-1 ${item.image ? 'text-yellow-400 drop-shadow-md' : 'text-blue-700'}`}>
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
            {/* Mobile View Mockup for Staff */}
            <div className="w-[400px] bg-slate-50 border-[8px] border-gray-800 rounded-[3rem] p-6 shadow-md border border-slate-200 relative overflow-y-auto">
              {/* Fake Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-white rounded-b-3xl"></div>
              
              <div className="mt-6 mb-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-orange-400 to-amber-300 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-sm shadow-orange-500/30">
                  🧑‍🍳
                </div>
                <h2 className="text-xl font-bold">Xin chào, Nguyễn Văn A</h2>
                <p className="text-slate-500 text-sm">Nhân viên phục vụ (Part-time)</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-lg p-5 border border-slate-200 shadow-sm mb-6">
                <p className="text-slate-500 text-sm mb-1">Lương tích lũy tháng này</p>
                <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
                  3,450,000 đ
                </h3>
                <div className="mt-4 flex items-center gap-4 border-t border-slate-200 pt-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Tổng giờ làm</p>
                    <p className="font-bold text-lg">138h</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100"></div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Mức lương</p>
                    <p className="font-bold text-lg text-blue-600">25k/h</p>
                  </div>
                </div>
              </div>

              <h4 className="font-bold mb-4">Lịch sử Check-in gần nhất</h4>
              <div className="space-y-3">
                {[
                  { date: 'Hôm nay, 19/06', in: '05:58', out: 'Đang làm', hours: 'N/A', status: 'active' },
                  { date: 'Hôm qua, 18/06', in: '14:00', out: '22:05', hours: '8h 5m', status: 'done' },
                  { date: 'Thứ 2, 17/06', in: '06:02', out: '14:00', hours: '7h 58m', status: 'done' },
                ].map((log, i) => (
                  <div key={i} className={`p-4 rounded-md border ${log.status === 'active' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm">{log.date}</span>
                      {log.status === 'active' && <span className="text-xs bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">ĐANG CA</span>}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">In: {log.in} - Out: {log.out}</span>
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
            <p className="text-slate-500 mb-8">Hiển thị mã QR này cho nhân viên quét bằng App SmartStore để Check-in.</p>
            
            <div className="relative p-1 bg-gradient-to-r from-purple-500 to-green-400 rounded-md shadow-[0_0_50px_rgba(74,222,128,0.2)]">
              <div className="bg-white p-6 rounded-[22px]">
                <div className="w-64 h-64 border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-100 rounded-md relative overflow-hidden">
                  <span className="text-slate-500 font-mono font-bold text-2xl">{qrCodeData}</span>
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_20px_#4ade80] animate-[scan_2s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-blue-600">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
              <span>Mã QR tự động làm mới mỗi 10 giây</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <span className="text-6xl mb-4">🚧</span>
            <h2 className="text-2xl font-bold text-slate-500">Chưa được kích hoạt</h2>
            <p>Trang {tabNames[activeTab]} đang được phát triển.</p>
          </div>
        )}
      </div>

      {/* Topping / Note Modal (Keep existing logic) */}
      {selectedItemForTopping && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white border border-slate-300 rounded-lg p-6 w-[500px] shadow-md border border-slate-200 animate-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-2">Tùy chọn: {selectedItemForTopping.name}</h2>
            <p className="text-blue-600 font-bold mb-6">{selectedItemForTopping.price.toLocaleString()} đ</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-slate-500 mb-2">Kích cỡ / Phân loại</label>
                <div className="flex flex-wrap gap-2">
                  {predefinedSizes.map((sz, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedSize(sz.name)} 
                      className={`px-4 py-2 border rounded-sm font-bold transition-all text-sm ${selectedSize === sz.name ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400 bg-white text-slate-700 hover:bg-slate-100'}`}
                    >
                      {sz.name} {sz.priceAdd > 0 && `(+${sz.priceAdd.toLocaleString()}đ)`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-2">Ghi chú nhanh</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {predefinedNotes.map((note, idx) => {
                    const isSelected = noteText.split(',').map(n => n.trim()).includes(note);
                    return (
                      <button 
                        key={idx} 
                        onClick={() => addQuickNote(note)}
                        className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-gray-500 focus:outline-none focus:border-blue-600"
                  rows="2"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setSelectedItemForTopping(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-3 rounded-md font-bold transition-colors">Hủy</button>
              <button onClick={() => { handleAddItem({...selectedItemForTopping, size: selectedSize, note: noteText.trim(), toppings: selectedToppings}); setSelectedItemForTopping(null); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-bold transition-colors shadow-sm shadow-blue-600/20">Thêm vào giỏ</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Payment Modal */}
      {showPaymentModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white border border-slate-300 rounded-lg p-6 w-[500px] shadow-md border border-slate-200">
            <h2 className="text-2xl font-bold mb-6 text-center border-b border-slate-200 pb-4">Thanh toán Bill</h2>
            
            <div className="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded-md border border-slate-200">
              <span className="text-slate-500 text-lg">Tổng tiền thanh toán:</span>
              <span className="text-3xl font-bold text-blue-600">
                {cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString()} đ
              </span>
            </div>

            <label className="block text-slate-500 mb-3">Khách đưa nhanh:</label>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[50000, 100000, 200000, 500000].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setAmountGiven(amt)}
                  className={`py-3 rounded-md font-bold transition-colors ${amountGiven === amt ? 'bg-blue-500 text-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                  {amt.toLocaleString()} đ
                </button>
              ))}
              <button 
                onClick={() => setAmountGiven(cart.reduce((sum, item) => sum + (item.price * item.qty), 0))}
                className={`py-3 rounded-md font-bold transition-colors ${amountGiven === cart.reduce((sum, item) => sum + (item.price * item.qty), 0) ? 'bg-blue-500 text-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                Khách đưa đủ
              </button>
              <button 
                className="py-3 rounded-md font-bold transition-colors bg-purple-600 hover:bg-purple-500 text-slate-800 shadow-sm shadow-purple-600/20">
                Momo / Thẻ
              </button>
            </div>

            {amountGiven > 0 && amountGiven >= cart.reduce((sum, item) => sum + (item.price * item.qty), 0) && (
              <div className="flex justify-between items-center mb-6 bg-blue-600/10 border border-blue-600/30 p-4 rounded-md">
                <span className="text-blue-600 text-lg">Tiền thối lại:</span>
                <span className="text-3xl font-bold text-blue-600">
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
                className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-md font-bold transition-colors text-lg">
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 text-white py-4 rounded-md font-bold transition-colors shadow-sm shadow-blue-600/20 text-lg">
                Hoàn tất & In Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

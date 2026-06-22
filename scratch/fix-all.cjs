const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Fix Logout
const targetLogout = `  const handleLogoutClick = async () => {
    if (activeTab === 'settings' && isSettingsDirty) {
      setConfirmDialog({
        isOpen: true,
        message: "Bạn đang có thay đổi chưa lưu. Bấm Đồng ý để ở lại trang và lưu, bấm Hủy để tiếp tục đăng xuất.",
        onConfirm: () => { /* Stay */ },
        onCancel: () => { signOut(auth); }
      });
      if (false) {
        return;
      }
    }
    setConfirmDialog({
        isOpen: true,
        message: "Bạn có chắc chắn muốn đăng xuất không?",
        onConfirm: () => { signOut(auth); }
      });
      if (false) {
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
  };`;

const newLogout = `  const handleLogoutClick = async () => {
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
  };`;

content = content.replace(targetLogout.replace(/\r/g, ''), newLogout.replace(/\r/g, ''));


// 2. Fix POS Back Button
const posBtnRegex = /<button onClick=\{\(\) => setSelectedTable\(null\)\} className="md:hidden text-white border border-white\/30 px-2 py-1 rounded text-xs font-bold whitespace-nowrap bg-blue-800">\s*&lt; Quay lại\s*<\/button>/;

const newPosBtn = `<button onClick={() => setSelectedTable(null)} className="text-white border border-white/30 hover:bg-blue-800 px-3 py-1.5 rounded-md text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1 shadow-sm">
                      <span className="text-lg leading-none">&lsaquo;</span> Sơ đồ bàn
                    </button>`;

content = content.replace(posBtnRegex, newPosBtn.replace(/\r/g, ''));

// 3. Fix Global Background to Wavy SVG
const targetBg = `<div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">`;
const newBg = `<div className="flex-1 flex flex-col min-w-0 relative bg-[#f0f9ff]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 1440 320\\' opacity=\\'0.3\\'%3E%3Cpath fill=\\'%23bae6fd\\' fill-opacity=\\'1\\' d=\\'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z\\'%3E%3C/path%3E%3C/svg%3E')", backgroundSize: 'cover', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>`;

content = content.replace(targetBg, newBg);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Applied fixes');

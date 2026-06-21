const fs = require('fs');

let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Add confirmDialog state
if (!content.includes('const [confirmDialog, setConfirmDialog]')) {
  content = content.replace(
    "const [qrCodeData, setQrCodeData] = useState('INIT_CODE');",
    "const [qrCodeData, setQrCodeData] = useState('INIT_CODE');\n  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null, onCancel: null });"
  );
}

// 2. Add ConfirmDialog component to render
const confirmDialogJSX = `
      {/* Custom Confirm Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-2xl shrink-0">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold text-slate-800">Xác nhận</h3>
              </div>
              <p className="text-slate-600 mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => {
                    if (confirmDialog.onCancel) confirmDialog.onCancel();
                    setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null });
                  }}
                  className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
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
`;

if (!content.includes('Custom Confirm Modal')) {
  content = content.replace(
    "{/* Product Modal */}",
    confirmDialogJSX + "\n      {/* Product Modal */}"
  );
}

// 3. Replace window.confirm occurrences

// 144: if (window.confirm("Bạn đang có thay đổi chưa lưu. Bấm OK để ở lại trang và lưu, bấm Cancel để bỏ qua thay đổi và chuyển trang.")) {
content = content.replace(
  `if (window.confirm("Bạn đang có thay đổi chưa lưu. Bấm OK để ở lại trang và lưu, bấm Cancel để bỏ qua thay đổi và chuyển trang.")) {`,
  `setConfirmDialog({
        isOpen: true,
        message: "Bạn đang có thay đổi chưa lưu. Bấm Đồng ý để ở lại trang và lưu, bấm Hủy để bỏ qua thay đổi và chuyển trang.",
        onConfirm: () => { /* Stay */ },
        onCancel: () => { setIsSettingsDirty(false); setActiveTab(tabKey); }
      });
      if (false) {`
);

// 158: if (window.confirm("Bạn đang có thay đổi chưa lưu. Bấm OK để ở lại trang và lưu, bấm Cancel để bỏ qua và tiếp tục đăng xuất.")) {
content = content.replace(
  `if (window.confirm("Bạn đang có thay đổi chưa lưu. Bấm OK để ở lại trang và lưu, bấm Cancel để bỏ qua và tiếp tục đăng xuất.")) {`,
  `setConfirmDialog({
        isOpen: true,
        message: "Bạn đang có thay đổi chưa lưu. Bấm Đồng ý để ở lại trang và lưu, bấm Hủy để tiếp tục đăng xuất.",
        onConfirm: () => { /* Stay */ },
        onCancel: () => { signOut(auth); }
      });
      if (false) {`
);

// 162: if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
content = content.replace(
  `if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {`,
  `setConfirmDialog({
        isOpen: true,
        message: "Bạn có chắc chắn muốn đăng xuất không?",
        onConfirm: () => { signOut(auth); }
      });
      if (false) {`
);

// 264: if (window.confirm("Bạn có chắc chắn muốn lưu toàn bộ cài đặt không?")) {
content = content.replace(
  `if (window.confirm("Bạn có chắc chắn muốn lưu toàn bộ cài đặt không?")) {`,
  `setConfirmDialog({
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
    if (false) {`
);

// 299: if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
content = content.replace(
  `if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {`,
  `setConfirmDialog({
      isOpen: true,
      message: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      onConfirm: () => { setProducts(products.filter(p => p.id !== id)); }
    });
    if (false) {`
);

// 598: <button onClick={() => { if(window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) deleteProduct(p.id); }} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors text-center flex-1 whitespace-nowrap">Xóa</button>
content = content.replace(
  `if(window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) deleteProduct(p.id);`,
  `setConfirmDialog({ isOpen: true, message: 'Bạn có chắc chắn muốn xóa sản phẩm này?', onConfirm: () => deleteProduct(p.id) });`
);

// 624: <button onClick={() => { if(window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) setCategories(categories.filter(c => c.id !== cat.id)); }} className="text-red-400 hover:text-red-600 font-bold">✕</button>
content = content.replace(
  `if(window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) setCategories(categories.filter(c => c.id !== cat.id));`,
  `setConfirmDialog({ isOpen: true, message: 'Bạn có chắc chắn muốn xóa danh mục này?', onConfirm: () => setCategories(categories.filter(c => c.id !== cat.id)) });`
);

// 664: <button onClick={() => { if(window.confirm('Bạn có chắc chắn muốn xóa nguyên liệu này?')) setIngredients(ingredients.filter(i => i.id !== ing.id)); }} className="text-red-400 hover:text-red-600 font-bold">✕ Xóa</button>
content = content.replace(
  `if(window.confirm('Bạn có chắc chắn muốn xóa nguyên liệu này?')) setIngredients(ingredients.filter(i => i.id !== ing.id));`,
  `setConfirmDialog({ isOpen: true, message: 'Bạn có chắc chắn muốn xóa nguyên liệu này?', onConfirm: () => setIngredients(ingredients.filter(i => i.id !== ing.id)) });`
);

// 686: <button onClick={() => { if(window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) deletePredefinedNote(note); }} className="text-slate-500 hover:text-red-400 transition-colors">✕</button>
content = content.replace(
  `if(window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) deletePredefinedNote(note);`,
  `setConfirmDialog({ isOpen: true, message: 'Bạn có chắc chắn muốn xóa ghi chú này?', onConfirm: () => deletePredefinedNote(note) });`
);

// 716: <button onClick={() => { if(window.confirm('Bạn có chắc chắn muốn xóa kích cỡ này?')) deletePredefinedSize(idx); }} className="text-slate-500 hover:text-red-400 transition-colors">✕</button>
content = content.replace(
  `if(window.confirm('Bạn có chắc chắn muốn xóa kích cỡ này?')) deletePredefinedSize(idx);`,
  `setConfirmDialog({ isOpen: true, message: 'Bạn có chắc chắn muốn xóa kích cỡ này?', onConfirm: () => deletePredefinedSize(idx) });`
);

// 4. Update UI styling for cards (Product, Category, Ingredients, Notes, Size cards)
// Old product card: className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-md hover:border-slate-300 transition-colors"
content = content.replace(
  /className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-md hover:border-slate-300 transition-colors"/g,
  'className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-300"'
);

// Category, Ingredients, Notes, Size cards: 
// className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200"
content = content.replace(
  /className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200"/g,
  'className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300"'
);

// Container backgrounds: bg-slate-50/50 -> bg-slate-100/80
content = content.replace(
  /bg-slate-50\/50/g,
  'bg-slate-100'
);

// 5. Enhance the main container box shadow (Product Management columns)
// className="col-span-2 bg-white rounded-lg p-6 border border-slate-200 flex flex-col h-full min-h-0"
content = content.replace(
  /className="col-span-2 bg-white rounded-lg p-6 border border-slate-200 flex flex-col h-full min-h-0"/g,
  'className="col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full min-h-0"'
);

content = content.replace(
  /className="col-span-1 bg-white rounded-lg p-6 border border-slate-200 flex flex-col h-full min-h-0"/g,
  'className="col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full min-h-0"'
);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Successfully updated App.jsx');

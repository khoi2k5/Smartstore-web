const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Add notes to tabNames
content = content.replace(
  /inventory: '📦 Kiểm kho',\n\s*recipes: '🍔 Quản lý Sản phẩm',/,
  "inventory: '📦 Kiểm kho',\n    recipes: '🍔 Quản lý Sản phẩm',\n    notes: '📝 Quản lý Ghi chú',"
);

// 2. Add 'notes' to visibleTabs for pos
content = content.replace(
  /\} else if \(role === 'pos'\) \{\n\s*visibleTabs\.push\('pos', 'hr'\);/,
  "} else if (role === 'pos') {\n    visibleTabs.push('pos', 'notes', 'hr');"
);

// 3. Add the activeTab === 'notes' block
// I'll insert it right before activeTab === 'salary'
const notesTabJSX = `
        {/* ========================================================= */}
        {/* TAB: NOTES (POS STAFF)                                    */}
        {/* ========================================================= */}
        {activeTab === 'notes' ? (
          <div className="animate-in fade-in duration-500 relative max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">{tabNames.notes}</h2>
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 shadow-sm flex flex-col h-full min-h-[500px]">
              <p className="text-sm text-white font-medium drop-shadow-md mb-8">Thiết lập các ghi chú thường dùng để thu ngân chọn nhanh khi order.</p>

              <div className="flex gap-4 mb-8">
                <input 
                  type="text" 
                  placeholder="Nhập ghi chú mới..." 
                  value={newNote} 
                  onChange={e => setNewNote(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNewNote()} 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium text-lg focus:outline-none focus:border-blue-500 transition-colors" 
                />
                <button 
                  onClick={handleAddNewNote} 
                  className="bg-blue-600/70 backdrop-blur-md border border-blue-400/30 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:bg-blue-700/70 backdrop-blur-md text-white font-medium px-8 rounded-xl font-bold transition-colors text-lg"
                >
                  Thêm
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 border-2 border-white/10 shadow-inner flex flex-col gap-3">
                {predefinedNotes.map((note, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl p-5 rounded-xl border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
                    <span className="font-bold text-lg">{note}</span>
                    <button 
                      onClick={() => { 
                        setConfirmDialog({ 
                          isOpen: true, 
                          message: 'Bạn có chắc chắn muốn xóa ghi chú này?', 
                          onConfirm: () => deletePredefinedNote(note) 
                        }); 
                      }} 
                      className="text-white font-medium drop-shadow-md hover:text-red-400 transition-colors font-bold text-xl px-4 py-2 hover:bg-red-500/10 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {predefinedNotes.length === 0 && (
                  <p className="text-white font-medium drop-shadow-md text-center text-lg mt-8">Chưa có ghi chú nhanh nào.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
`;

content = content.replace(
  /\{activeTab === 'salary' \? \(/,
  notesTabJSX + '\n        {activeTab === \'salary\' ? ('
);

// We need to define newNote state if it doesn't exist globally. 
// Wait! newNote was used in the previous Note UI, let's check if it's defined globally.
// In the previous Note UI it was: value={newNote} onChange={e => setNewNote(e.target.value)}
// This implies [newNote, setNewNote] = useState(''); is in App.jsx.

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/scratch/add-notes-tab.js', content, 'utf8');
console.log('Script written');

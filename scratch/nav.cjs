const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

const targetStr = `      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận</h3>
            <p className="text-slate-600 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  if(confirmDialog.onCancel) confirmDialog.onCancel();
                  setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null });
                }} 
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                Hủy
              </button>
              <button 
                onClick={() => {
                  if(confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null });
                }} 
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>`;

const newStr = `      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận</h3>
            <p className="text-slate-600 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  if(confirmDialog.onCancel) confirmDialog.onCancel();
                  setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null });
                }} 
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                Hủy
              </button>
              <button 
                onClick={() => {
                  if(confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ isOpen: false, message: '', onConfirm: null, onCancel: null });
                }} 
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center pb-safe pt-2 px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-[90]">
        {Object.entries(tabNames).filter(([key]) => visibleTabs.includes(key)).slice(0, 5).map(([key, name]) => {
          const isActive = activeTab === key;
          const icon = name.split(' ')[0];
          const label = name.replace(icon, '').trim();
          return (
            <button
              key={key}
              onClick={() => handleTabClick(key)}
              className={\`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all \${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}\`}
            >
              <span className={\`text-xl mb-1 \${isActive ? 'scale-110' : ''} transition-transform\`}>{icon}</span>
              <span className={\`text-[10px] font-bold text-center leading-tight truncate w-full px-1 \${isActive ? 'opacity-100' : 'opacity-70'}\`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>`;

const cleanTarget = targetStr.replace(/\r/g, '');
const cleanNew = newStr.replace(/\r/g, '');
const cleanContent = content.replace(/\r/g, '');

if (cleanContent.includes(cleanTarget)) {
  const finalContent = cleanContent.replace(cleanTarget, cleanNew);
  fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', finalContent, 'utf8');
  console.log('Injected Bottom Nav');
} else {
  console.log('Target string not found');
}

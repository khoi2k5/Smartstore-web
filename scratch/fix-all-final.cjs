const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Fix Background
const rootRegex = /<div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex p-4 gap-4">/g;
const loginRegex = /<div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4">/g;

const newRoot = `<div className="min-h-screen text-slate-800 font-sans flex flex-col md:flex-row p-0 md:p-4 md:gap-4 bg-[#e0f2fe]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 1440 320\\' opacity=\\'0.4\\'%3E%3Cpath fill=\\'%237dd3fc\\' fill-opacity=\\'1\\' d=\\'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z\\'%3E%3C/path%3E%3C/svg%3E')", backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center bottom' }}>`;
const newLogin = `<div className="min-h-screen text-slate-800 flex items-center justify-center p-4 bg-[#e0f2fe]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 1440 320\\' opacity=\\'0.5\\'%3E%3Cpath fill=\\'%2338bdf8\\' fill-opacity=\\'1\\' d=\\'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z\\'%3E%3C/path%3E%3C/svg%3E')", backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center bottom' }}>`;

if (rootRegex.test(content)) {
    content = content.replace(rootRegex, newRoot);
    console.log('Fixed root background');
}
if (loginRegex.test(content)) {
    content = content.replace(loginRegex, newLogin);
    console.log('Fixed login background');
}

// 2. Fix Payment Modal
const paymentRegex = /<label className="block text-slate-500 mb-3">Khách đưa nhanh:<\/label>\s*<div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">\s*\{\[50000, 100000, 200000, 500000\]\.map\(amt => \(\s*<button[\s\S]*?Momo \/ Thẻ\s*<\/button>\s*<\/div>/;

const newPayment = `<div className="mb-6">
              <label className="block text-slate-500 mb-2 font-bold">Khách đưa (Nhập tay):</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amountGiven || ''} 
                  onChange={(e) => setAmountGiven(Number(e.target.value))}
                  placeholder="Nhập số tiền..."
                  className="w-full text-2xl font-bold text-blue-600 p-3 pr-12 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">VNĐ</span>
              </div>
            </div>
            
            <label className="block text-slate-500 mb-3">Hoặc chọn nhanh:</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[50000, 100000, 200000, 500000].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setAmountGiven(amt)}
                  className={\`py-2 rounded-lg font-bold transition-all \${amountGiven === amt ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'}\`}>
                  {amt.toLocaleString()} đ
                </button>
              ))}
              <button 
                onClick={() => setAmountGiven(cart.reduce((sum, item) => sum + (item.price * item.qty), 0))}
                className={\`py-2 rounded-lg font-bold transition-all \${amountGiven === cart.reduce((sum, item) => sum + (item.price * item.qty), 0) ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'}\`}>
                Khách đưa đủ
              </button>
              <button 
                className="py-2 rounded-lg font-bold transition-all bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30">
                Momo / Thẻ
              </button>
            </div>`;

if (paymentRegex.test(content)) {
    content = content.replace(paymentRegex, newPayment);
    console.log('Fixed payment modal');
}

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');

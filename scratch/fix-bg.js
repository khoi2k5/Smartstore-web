const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

const targetRoot = '<div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex p-4 gap-4">';
const newRoot = `<div className="min-h-screen text-slate-800 font-sans flex flex-col md:flex-row p-0 md:p-4 md:gap-4 bg-[#e0f2fe]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 1440 320\\' opacity=\\'0.4\\'%3E%3Cpath fill=\\'%237dd3fc\\' fill-opacity=\\'1\\' d=\\'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z\\'%3E%3C/path%3E%3C/svg%3E')", backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center bottom' }}>`;

if (content.includes(targetRoot)) {
    content = content.replace(targetRoot, newRoot);
    
    // Also let's check the Login screen root
    const loginTarget = '<div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4">';
    const newLogin = `<div className="min-h-screen text-slate-800 flex items-center justify-center p-4 bg-[#e0f2fe]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 1440 320\\' opacity=\\'0.5\\'%3E%3Cpath fill=\\'%2338bdf8\\' fill-opacity=\\'1\\' d=\\'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z\\'%3E%3C/path%3E%3C/svg%3E')", backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center bottom' }}>`;
    content = content.replace(loginTarget, newLogin);

    fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
    console.log('Fixed background.');
} else {
    console.log('Background root not found in App.jsx');
}

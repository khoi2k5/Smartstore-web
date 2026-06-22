const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Conditionally render the takeaway card
const takeawayRegex = /<div\s+onClick=\{\(\) => switchTable\(posConfig\.takeawayName\)\}[\s\S]*?<span className="font-bold text-white text-center text-sm">\{posConfig\.takeawayName\}<\/span>\s*<\/div>\s*<\/div>/;

const newTakeaway = `{['cafe', 'restaurant'].includes(posConfig.layout) && (
                <div 
                  onClick={() => switchTable(posConfig.takeawayName)}
                  className="bg-blue-600/30 backdrop-blur-md border border-blue-400/50 hover:bg-blue-500/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-xl cursor-pointer transition-all relative h-28 group flex flex-col items-center justify-center p-3">
                  <span className="font-bold text-white text-center text-sm">{posConfig.takeawayName}</span>
                </div>
              )}`;

content = content.replace(takeawayRegex, newTakeaway);

// 2. Fix the Table/Room cards to be glass glowing instead of using hardcoded cafe images
const tableRegex = /<div\s+key=\{idx\}\s+onClick=\{\(\) => switchTable\(\`\$\{posConfig\.entityName\} \$\{idx\}\`\)\}[\s\S]*?<span className="font-bold text-white text-lg">\{posConfig\.entityName\} \{idx\}<\/span>\s*<\/div>\s*<\/div>/g;

const newTable = `<div 
                    key={idx}
                    onClick={() => switchTable(\`\${posConfig.entityName} \${idx}\`)}
                    className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-blue-400 hover:bg-blue-900/40 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] rounded-xl cursor-pointer transition-all relative h-28 flex flex-col items-center justify-center p-3">
                    <span className="font-bold text-white text-lg">{posConfig.entityName} {idx}</span>
                  </div>`;

content = content.replace(tableRegex, newTable);

// Fix the subtitle
content = content.replace(
  /<p className="text-slate-400 mb-6">Vui lòng chọn \{posConfig\.entityName\.toLowerCase\(\)\} hoặc chọn "\{posConfig\.takeawayName\}"\.<\/p>/,
  `{['cafe', 'restaurant'].includes(posConfig.layout) ? (
                <p className="text-slate-400 mb-6">Vui lòng chọn {posConfig.entityName.toLowerCase()} hoặc chọn "{posConfig.takeawayName}".</p>
              ) : (
                <p className="text-slate-400 mb-6">Vui lòng chọn {posConfig.entityName.toLowerCase()} để tiến hành dịch vụ.</p>
              )}`
);

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Fixed Table Map layout');

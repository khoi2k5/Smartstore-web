const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

const replacements = [
  {
    target: '<div className="grid grid-cols-3 gap-6 mb-8">',
    newStr: '<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">'
  },
  {
    target: '<div className="grid grid-cols-3 gap-6">',
    newStr: '<div className="grid grid-cols-1 md:grid-cols-3 gap-6">'
  },
  {
    target: '<div className="grid grid-cols-4 gap-6 flex-1 min-h-0">',
    newStr: '<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">'
  },
  {
    target: '<div className="grid grid-cols-2 gap-4">',
    newStr: '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">'
  },
  {
    target: '<div className="grid grid-cols-4 lg:grid-cols-5 gap-3">',
    newStr: '<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">'
  },
  {
    target: '<div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1">',
    newStr: '<div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1">'
  },
  {
    target: '<div className="grid grid-cols-3 gap-3 mb-6">',
    newStr: '<div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">'
  }
];

let changed = false;
replacements.forEach(r => {
  if (content.includes(r.target)) {
    content = content.replace(r.target, r.newStr);
    changed = true;
    console.log('Replaced:', r.target);
  }
});

if (changed) {
  fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
  console.log('Responsive grid classes updated.');
} else {
  console.log('No matches found for responsive classes.');
}

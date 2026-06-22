const fs = require('fs');
let content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

// 1. Fix POS Category Tabs (Make them spacious and scrollable horizontally)
// Old: <div className="flex bg-white/20 border-b border-white/10 overflow-x-auto shrink-0 hide-scrollbar p-1 gap-1">
const catContainerRegex = /<div className="flex bg-white\/20 border-b border-white\/10 overflow-x-auto shrink-0 hide-scrollbar p-1 gap-1">/;
const newCatContainer = `<div className="flex bg-black/40 backdrop-blur-md border-b border-white/10 overflow-x-auto shrink-0 hide-scrollbar p-4 gap-4">`;
content = content.replace(catContainerRegex, newCatContainer);

// Old buttons: px-3 py-1.5 text-xs font-bold whitespace-nowrap border rounded-sm
const catButtonRegex = /px-3 py-1\.5 text-xs font-bold whitespace-nowrap border rounded-sm/g;
content = content.replace(catButtonRegex, 'px-6 py-3 text-sm font-bold whitespace-nowrap border rounded-xl');

// 2. Fix Products Grid (Make it spacious)
// Old: <div className="flex-1 flex flex-col h-full min-h-0 border border-white/10 bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-sm overflow-hidden">
content = content.replace(/border border-white\/10 bg-black\/40 backdrop-blur-xl border border-white\/10 shadow-2xl rounded-sm/g, 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl');

// Old: <div className="flex-1 overflow-y-auto p-1">
content = content.replace(/<div className="flex-1 overflow-y-auto p-1">/g, '<div className="flex-1 overflow-y-auto p-4">');

// Old: <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1">
content = content.replace(/grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1/g, 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4');

// 3. Fix Product Cards
// Old: className={`... rounded-sm ${item.status === 'low_stock' ? 'border-yellow-400 border-2 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'border-white/10'}`}
// and relative h-24
content = content.replace(/relative h-24 overflow-hidden rounded-sm/g, 'relative h-36 overflow-hidden rounded-xl');
content = content.replace(/rounded-bl-md/g, 'rounded-bl-xl');

// 4. Fix Invoice area (left side) density
// Old: className="w-96 flex flex-col h-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl border border-white/10 rounded-sm overflow-hidden"
content = content.replace(/className="w-96 flex flex-col h-full bg-black\/40 backdrop-blur-xl border border-white\/10 shadow-2xl border border-white\/10 rounded-sm overflow-hidden"/g, 'className="w-[400px] flex flex-col h-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden"');

// Old: p-1 gap-1 or p-2 gap-2 in invoice?
// Let's just make sure invoice padding is slightly bigger
content = content.replace(/<div className="flex-1 overflow-y-auto bg-black\/20 p-1">/g, '<div className="flex-1 overflow-y-auto bg-black/20 p-2">');
content = content.replace(/<div className="p-3 bg-black\/40 border-t border-white\/10 shrink-0">/g, '<div className="p-4 bg-black/40 border-t border-white/10 shrink-0">');
content = content.replace(/<div className="grid grid-cols-4 gap-1 mb-3">/g, '<div className="grid grid-cols-4 gap-2 mb-4">');

fs.writeFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', content, 'utf8');
console.log('Fixed density layout');

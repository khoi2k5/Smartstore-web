const fs = require('fs');
const content = fs.readFileSync('e:/HOCHANH/EXE101/EXE101/CP3/smartstore-web/src/App.jsx', 'utf8');

console.log('Has salary:', content.includes('activeTab === \'salary\''));
console.log('Has notes:', content.includes('activeTab === \'notes\''));
console.log('Has newNote state:', content.includes('newNote'));

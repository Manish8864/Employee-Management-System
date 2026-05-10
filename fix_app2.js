const fs = require('fs');
const path = require('path');

// Read the base64 encoded file
const b64Path = path.join(__dirname, 'clean.txt');
const b64Content = fs.readFileSync(b64Path, 'utf8').trim();

// Decode base64 to UTF-8
const decodedContent = Buffer.from(b64Content, 'base64').toString('utf8');

// Write to App.jsx
const outputPath = path.join(__dirname, 'ems-client/src/App.jsx');
fs.writeFileSync(outputPath, decodedContent, 'utf8');

console.log('App.jsx fixed successfully from clean.txt!');

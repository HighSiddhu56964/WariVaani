const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = 'd:/WariVanni/warivaani/scratch_stitch';
const outDir = 'd:/WariVanni/warivaani/frontend/public/stitch';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const urls = new Set();

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const matches = content.match(/https:\/\/[^'"\>\)\s]+/g) || [];
  matches.forEach(u => {
    if (u.includes('googleusercontent.com')) {
      urls.add(u);
    }
  });
});

console.log('Found image/asset URLs count:', urls.size);
let idx = 1;
urls.forEach(url => {
  const ext = url.includes('png') ? '.png' : url.includes('webp') ? '.webp' : '.jpg';
  const filePath = path.join(outDir, `asset_${idx}${ext}`);
  console.log(`Downloading ${url} -> asset_${idx}${ext}`);
  const file = fs.createWriteStream(filePath);
  https.get(url, (res) => {
    res.pipe(file);
  });
  idx++;
});

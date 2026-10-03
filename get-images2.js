const https = require('https');

https.get('https://build-kart-in-is6v.vercel.app/assets/main-DRAThW2w.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const regex = /(https?:\/\/[^\s"'`]+\.(?:jpg|jpeg|png|webp|avif)[^\s"'`]*)/gi;
    let match;
    const urls = new Set();
    while ((match = regex.exec(data)) !== null) {
      urls.add(match[1]);
    }
    console.log(Array.from(urls).join('\n'));
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});

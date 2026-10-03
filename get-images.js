const https = require('https');

https.get('https://build-kart-in-is6v.vercel.app/', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const regex = /<img[^>]*src=["']([^"']+)["']/gi;
    let match;
    const urls = new Set();
    while ((match = regex.exec(data)) !== null) {
      let url = match[1];
      if (!url.startsWith('http')) {
        url = 'https://build-kart-in-is6v.vercel.app' + (url.startsWith('/') ? '' : '/') + url;
      }
      urls.add(url);
    }
    console.log(Array.from(urls).join('\n'));
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});

import express from 'express';
import http from 'http';
import { createBareServer } from '@tomphttp/bare-server-node';
import path from 'path';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';

const app = express();
const server = http.createServer(app);
const bare = createBareServer('/bare/');
const __dirname = path.resolve();

app.use('/uv/', express.static(uvPath));

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Clover Proxy</title>
  <script src="/uv/uv.bundle.js"></script>
  <style>
    body { margin: 0; display: flex; flex-direction: column; height: 100vh; background: #0d1117; font-family: sans-serif; color: #e6edf3; }
    #navbar { padding: 12px 20px; background: #161b22; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #30363d; }
    h1 { margin: 0; color: #56d364; font-size: 24px; font-weight: 800; }
    input { flex-grow: 1; max-width: 600px; padding: 10px 15px; border-radius: 8px; border: 1px solid #30363d; background: #0d1117; color: white; outline: none; font-size: 14px; }
    iframe { flex-grow: 1; border: none; width: 100%; background: white; }
  </style>
</head>
<body>
  <div id="navbar">
    <h1>Clover</h1>
    <input type="text" id="address" placeholder="Search DuckDuckGo or enter URL..." autofocus>
  </div>
  <iframe id="frame" src=""></iframe>
  <script src="/uv.config.js"></script>
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
    const input = document.getElementById('address');
    const frame = document.getElementById('frame');
    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        let url = input.value.trim();
        if (!url) return;
        if (!url.startsWith('http') && !url.includes('.')) {
          url = 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
        } else if (!url.startsWith('http')) {
          url = 'https://' + url;
        }
        await navigator.serviceWorker.ready;
        frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
      }
    });
  </script>
</body>
</html>`);
});

app.get('/uv.config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    self.__uv$config = {
        prefix: '/uv/service/',
        bare: '/bare/',
        encodeUrl: Ultraviolet.codec.xor.encode,
        decodeUrl: Ultraviolet.codec.xor.decode,
        handler: '/uv/uv.handler.js',
        client: '/uv/uv.client.js',
        bundle: '/uv/uv.bundle.js',
        config: '/uv.config.js',
        sw: '/uv/uv.sw.js',
    };
  `);
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    importScripts('/uv/uv.bundle.js');
    importScripts('/uv.config.js');
    importScripts('/uv/uv.sw.js');
    const sw = new UVServiceWorker();
    self.addEventListener('fetch', event => {
        event.respondWith(sw.route(event));
    });
  `);
});

server.on('request', (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('Clover proxy running on port ' + PORT);
});

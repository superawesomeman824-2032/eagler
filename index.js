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
    #status { font-size: 12px; color: #8b949e; margin-left: auto; }
    iframe { flex-grow: 1; border: none; width: 100%; background: white; }
  </style>
</head>
<body>
  <div id="navbar">
    <h1>Clover</h1>
    <input type="text" id="address" placeholder="Search DuckDuckGo or enter URL..." autofocus>
    <div id="status">Ready</div>
  </div>
  <iframe id="frame" src=""></iframe>
  
  <script>
    // Bulletproof inline fallback config
    window.__uv$config = {
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

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(err => console.log('SW registration failed', err));
    }

    const input = document.getElementById('address');
    const frame = document.getElementById('frame');
    const status = document.getElementById('status');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        let url = input.value.trim();
        if (!url) return;

        status.innerText = "Loading...";

        // Smart formatting backup
        if (!url.startsWith('http') && !url.includes('.')) {
          url = 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
        } else if (!url.startsWith('http')) {
          url = 'https://' + url;
        }

        try {
          frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
          frame.onload = () => { status.innerText = "Ready"; };
        } catch (err) {
          status.innerText = "Error loading site";
          console.error(err);
        }
      }
    });
  </script>
</body>
</html>`);
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    importScripts('/uv/uv.bundle.js');
    importScripts('/uv/uv.sw.js');
    const sw = new UVServiceWorker();
    self.addEventListener('fetch', event => {
        event.respondsw.route(event) ? event.respondWith(sw.route(event)) : null;
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
  console.log('Clover proxy running safely on port ' + PORT);
});

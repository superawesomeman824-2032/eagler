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
    body { margin: 0; display: flex; flex-direction: column; height: 100vh; background: #0d1117; font-family: sans-serif; color: #e6edf3; overflow: hidden; }
    #navbar { padding: 10px 20px; background: #161b22; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #30363d; flex-shrink: 0; }
    h1 { margin: 0; color: #56d364; font-size: 22px; font-weight: 800; cursor: pointer; }
    #search-form { display: flex; flex-grow: 1; max-width: 650px; }
    input { width: 100%; padding: 10px 15px; border-radius: 8px; border: 1px solid #30363d; background: #0d1117; color: white; outline: none; font-size: 14px; }
    input:focus { border-color: #56d364; }
    #status { font-size: 12px; color: #8b949e; margin-left: auto; }
    iframe { flex-grow: 1; border: none; width: 100%; height: 100%; background: white; }
  </style>
</head>
<body>
  <div id="navbar">
    <h1 onclick="goHome()">Clover</h1>
    <form id="search-form" onsubmit="handleSearch(event)">
      <input type="text" id="address" placeholder="Search DuckDuckGo or enter URL..." autofocus autocomplete="off">
    </form>
    <div id="status">Ready</div>
  </div>
  <iframe id="frame" src=""></iframe>
  
  <script>
    // Triple-redundant Ultraviolet Configuration Backup
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

    // Service Worker Registration with silent recovery
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(() => console.log('UV Service Worker Active'))
        .catch(err => console.error('SW Error:', err));
    }

    const input = document.getElementById('address');
    const frame = document.getElementById('frame');
    const status = document.getElementById('status');

    function goHome() {
      input.value = '';
      frame.src = '';
      status.innerText = 'Ready';
    }

    function handleSearch(e) {
      if (e) e.preventDefault();
      let query = input.value.trim();
      if (!query) return;

      status.innerText = "Searching...";

      let targetUrl = query;
      
      // Smart search engine routing using DuckDuckGo HTML (Bulletproof for proxies)
      if (!query.startsWith('http://') && !query.startsWith('https://')) {
        if (query.includes('.') && !query.includes(' ')) {
          targetUrl = 'https://' + query;
        } else {
          targetUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
        }
      }

      try {
        // Encode via Ultraviolet XOR codec and load into iframe
        const encoded = __uv$config.prefix + __uv$config.encodeUrl(targetUrl);
        frame.src = encoded;
        
        frame.onload = () => {
          status.innerText = "Ready";
        };
      } catch (err) {
        status.innerText = "Error loading";
        console.error("Proxy Load Error:", err);
      }
    }

    // Double trigger safety: Form submit AND explicit Enter keydown listener
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSearch(e);
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
        try {
            event.respondWith(sw.route(event));
        } catch (e) {
            console.error(e);
        }
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
  console.log('Clover S-Tier Proxy running on port ' + PORT);
});
